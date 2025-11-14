import React, { useEffect, useState } from "react";
import styles from "../../Components/PopUps/PersonaEditorPopUp.module.css";
import BackIcon from "../../Icons/BackIcon";
import VoiceCard from "../Card/VoiceCard";
import { usePreviewStore } from "../../store";
import axios from "../../service";

function PersonaEditorPopUp() {
  const { isPreview, setIsPreview } = usePreviewStore();

  // Early return to prevent unnecessary mounting and API calls
  // if (!isPreview?.enable || isPreview.value !== "AvatarPopUp") return null;

  let [selected, setSelected] = useState("CharacterDescription");
  let [data, setData] = useState();
  let [thumbnail_url, setThumbnail_url] = useState();
  let [formData, setFormData] = useState({});
  let [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isPreview?.msg) {
      setData([]);
      axios
        .get(`/avatars/${isPreview.msg}`)
        .then((res) => {
          setThumbnail_url(res.data.thumbnail_url);
          handlePersonaChar(res.data.persona_id[0]);
        })
        .catch((err) => {
          console.log("err: ", err);
        });
    }
  }, [isPreview?.msg]);

  const handlePersonaChar = (id) => {
    axios
      .get(`/personas/v2/${id}`)
      .then((res) => {
        setData(res.data);
        setFormData(res.data);
      })
      .catch((err) => {
        console.log("err: ", err);
      });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  // Dynamic form renderer - similar to EditDocument.jsx structure
  const renderFormFields = (data, path = []) => {
    // Keys to exclude from editing
    const nonEditableKeys = ['_id', 'template_id', 'archetype_confidence', 'archetype_specific_data', 'updated_at', 'prompt_generated_at', 'prompt_mode', 'mode', 'id', 'name', 'gender', 'age', 'thumbnail_url', 'created_by', 'created_at', 'system_prompt'];
    
    if (!data || typeof data !== 'object') return null;
    
    return Object.entries(data).map(([key, value]) => {
      const currentPath = [...path, key];
      const pathKey = currentPath.join('.');
      
      // Skip non-editable keys and empty values
      if (nonEditableKeys.includes(key) || 
          value === null || value === undefined ||
          (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) ||
          (Array.isArray(value) && value.length === 0)) {
        return null;
      }
      
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Handle arrays - render each item as input using EditDocument CSS
      if (Array.isArray(value)) {
        return (
          <div key={pathKey}>
            <h3>{label}</h3>
            {value.map((item, index) => (
              <div key={`${pathKey}.${index}`} className={styles.inputWrapper}>
                <span className={styles.inputLabel}>{`${label} ${index + 1}`}</span>
                {typeof item === 'object' ? (
                  <div>{renderFormFields(item, [...currentPath, index])}</div>
                ) : (
                  <input
                    className={styles.customInput}
                    type="text"
                    value={item || ''}
                    onChange={(e) => {
                      const newArray = [...value];
                      newArray[index] = e.target.value;
                      handleNestedInputChange(currentPath, newArray);
                    }}
                    readOnly={!isEditing}
                  />
                )}
              </div>
            ))}
          </div>
        );
      }
      
      // Handle nested objects - render as section with nested fields
      if (typeof value === 'object' && value !== null) {
        const renderedFields = renderFormFields(value, currentPath);
        if (!renderedFields || renderedFields.every(field => field === null)) {
          return null;
        }
        return (
          <div key={pathKey}>
            <h3>{label}</h3>
            {renderedFields}
          </div>
        );
      }
      
      // Handle primitive values - render as input field using EditDocument CSS
      return (
        <div key={pathKey} className={styles.inputWrapper}>
          <span className={styles.inputLabel}>{label}</span>
          {typeof value === 'string' && value.length > 100 ? (
            <textarea
              className={styles.customInput}
              style={{resize: 'none'}}
              value={value || ''}
              onChange={(e) => handleNestedInputChange(currentPath, e.target.value)}
              readOnly={!isEditing}
            />
          ) : (
            <input
              className={styles.customInput}
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value || ''}
              onChange={(e) => {
                const val = typeof value === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
                handleNestedInputChange(currentPath, val);
              }}
              readOnly={!isEditing}
            />
          )}
        </div>
      );
    });
  };

  const handleSave = async () => {
    const { thumbnail_url, _id, template_id, archetype_confidence, archetype_specific_data, updated_at, prompt_generated_at, prompt_mode,system_prompt, ...updateData } = formData;
    
    try {
      const res = await axios.put(`/personas/v2/${formData.id}`, updateData);
      setData(res.data);
      
      // Call generate-persona-prompts API after saving persona
      try {
        await axios.post("/scenario/v2/generate-persona-prompts", {
          template_id: template_id || "default-template",
          persona_ids: [formData.id],
          mode: "assess_mode"
        });
      } catch (err) {
        console.log("Generate persona prompts failed:", err);
      }
      
      setIsEditing(false);
      setIsPreview({enable:false,msg:"",value:"AvatarPopUp"});
    } catch (err) {
      console.log("err: ", err);
    }
  };

  return (
    <div className={styles.PopUpContainer}>
      <div className={styles.avatarPreviewContainer}>
        <div className={styles.avatarPreviewHeader}>
          <div className={styles.page}>
            <div className={styles.currentPage}>Avatar Persona Details</div>
          </div>

          <div className={styles.page2}>
            <div
              className={styles.CloseIcon}
              onClick={() => {
                setIsPreview({ enable: false, msg: "", value: "AvatarPopUp" });
              }}
            >
              X{" "}
            </div>
          </div>
        </div>

        <div className={styles.avatarPreviewBody}>
          <div className={styles.mainContent}>
            {renderFormFields(formData)}
          </div>
          <div className={styles.advContent}>
            <div className={styles.imageSection}>
              <p>Preview</p>
              <div>
                <img src={thumbnail_url} alt="" />
              </div>
            </div>

            <div className={styles.smallInputs}>
              <div className={styles.inputWrapper}>
                <span className={styles.inputLabel}>Name</span>
                <input className={styles.customInput} readOnly type="text" value={formData?.name || ''} />
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputLabel}>Gender</span>
                <input className={styles.customInput} readOnly type="text" value={formData?.gender || ''} />
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputLabel}>Age</span>
                <input className={styles.customInput} type="number" value={formData?.age || ''} onChange={(e) => handleInputChange('age', parseInt(e.target.value))} readOnly={!isEditing} />
              </div>
              {formData?.role && (
                <div className={styles.inputWrapper}>
                  <span className={styles.inputLabel}>Role</span>
                  <input className={styles.customInput} type="text" value={formData?.role || ''} onChange={(e) => handleInputChange('role', e.target.value)} readOnly={!isEditing} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.avatarPreviewFooter}>
          {!isEditing ? (
            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>Edit</button>
          ) : (
            <>
              <button className={styles.editBtn} onClick={handleSave}>Save</button>
              <button className={styles.editBtn} onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonaEditorPopUp;
