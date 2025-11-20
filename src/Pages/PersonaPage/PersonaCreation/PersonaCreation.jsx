import React, { useEffect, useState } from "react";
import styles from "./PersonaCreation.module.css";
import BackIcon from "../../../Icons/BackIcon";
import axios from "../../../service";
import AIgradientIcon from "../../../Icons/AIgradientIcon";
import { useNavigate } from "react-router-dom";
import { useLOIData, usePreviewStore, useUserPopupStore } from "../../../store";
import { UpdateTimeline } from "../../../Components/Timeline/UpdateTImeLine";
import { getSessionStorage, setSessionStorage } from "../../../sessionHelper";

function PersonaCreation({setBack, setEditPage}) {
  const navigate = useNavigate();
  const { isPreview, setIsPreview } = usePreviewStore();
  const [count, setCount] = useState(getSessionStorage("personaLimit"));
  const [persona, setPersona] = useState();
  const { selectedData, setSelectedData } = useLOIData();

  useEffect(() => {
    CallPersonaPrompt() // this is for calling popUp
  }, []);

  const CallPersonaPrompt = () => {
    const currentLimit = getSessionStorage("personaLimit") || 0;
    
    if (currentLimit >= 2) {
      setMessage({
        enable: true,
        msg: "Persona Generation Limit exists",
        state: false,
      });
      return;
    }

    let modify = new Promise((resolve) => {
      setIsPreview({ enable: true, msg: "", value: "PersonaPrompt", resolve });
    });

    modify.then((result)=>{
      if(result){
        console.log("---->",result)
        generatePersona(result)
      }
    })
  }

  const generatePersona = (payload) => {
    axios
      .post("scenario/personas/v2/generate-and-save", { ...payload })
      .then((res) => {
        const currentLimit = getSessionStorage("personaLimit") || 0;
        setSessionStorage("personaLimit", currentLimit + 1);
        setCount(currentLimit + 1);
        setIsPreview({ enable: false, msg: "", value: "", resolve: null });
        setPersona(res?.data?.persona);
        setSessionStorage("personaId",res?.data?.persona_id);
      })
      .catch((err) => {
        console.log("err: ", err);
        setMessage({
          enable: true,
          msg: "Persona Generation Failed Try again",
          state: false,
        });
        setIsPreview({ enable: false, msg: "", value: "", resolve: null });
        CallPersonaPrompt()
      });
  };

  const { message, setMessage } = useUserPopupStore();
  const handleEdit = (path, value) => {
    const newData = { ...persona };
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setPersona(newData);
  };

  const handleArrayEdit = (path, index, value) => {
    const newData = { ...persona };
    let current = newData;
    for (let i = 0; i < path.length; i++) {
      if (!current[path[i]]) current[path[i]] = [];
      current = current[path[i]];
    }
    current[index] = value;
    setPersona(newData);
  };

  // Dynamic form renderer using PersonaCreation CSS
  const renderFormFields = (data, path = []) => {
    const nonEditableKeys = ['_id', 'template_id', 'archetype_confidence', 'archetype_specific_data', 'updated_at', 'prompt_generated_at', 'prompt_mode', 'mode', 'id', 'created_by', 'created_at', 'system_prompt'];
    
    if (!data || typeof data !== 'object') return null;
    
    return Object.entries(data).map(([key, value]) => {
      const currentPath = [...path, key];
      const pathKey = currentPath.join('.');
      
      if (nonEditableKeys.includes(key) || 
          value === null || value === undefined ||
          (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) ||
          (Array.isArray(value) && value.length === 0)) {
        return null;
      }
      
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (Array.isArray(value)) {
        return (
          <div key={pathKey}>
            <h3>{label}</h3>
            <div className={styles.singleColumnBox1}>
              <div>{label}</div>
              {value.map((item, index) => (
                <input
                  key={index}
                  type="text"
                  value={item || ''}
                  onChange={(e) => {
                    const newArray = [...value];
                    newArray[index] = e.target.value;
                    handleEdit(currentPath, newArray);
                  }}
                  placeholder={`${label} ${index + 1}`}
                />
              ))}
            </div>
          </div>
        );
      }
      
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
      
      // Special handling for basic fields
      if (['name', 'age', 'gender', 'persona_type', 'role'].includes(key)) {
        return (
          <div key={pathKey} className={styles.singleColumnBox1}>
            <div className={styles.alignItem}>
              <div>{label} <sup>*</sup></div>
              {key === 'gender' ? (
                <select
                  value={value || ''}
                  onChange={(e) => CallPersonaPrompt()}
                  // onChange={(e) => handleEdit(currentPath, e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              ) : (
                <input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value || ''}
                  onChange={(e) => {
                    const val = typeof value === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
                    handleEdit(currentPath, val);
                  }}
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              )}
            </div>
          </div>
        );
      }
      
      return (
        <div key={pathKey} className={styles.singleColumnBox1}>
          <div>{label}</div>
          {typeof value === 'string' && value.length > 100 ? (
            <textarea
              value={value || ''}
              onChange={(e) => handleEdit(currentPath, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value || ''}
              onChange={(e) => {
                const val = typeof value === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
                handleEdit(currentPath, val);
              }}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          )}
        </div>
      );
    });
  };

  const handleBack = () => {
    let path = window.location.pathname;
    let cleanedPath;
    if (localStorage.getItem("flow") == "Create Avatar flow") {
      const cleanedPath = path?.replace("/personaCreation", "");
      navigate(cleanedPath, { state: { myData: "List Of Modules" } });
      UpdateTimeline(
        "Scenario Selection",
        {
          status: "error",
          description: ``,
        },
        setSelectedData
      );
      UpdateTimeline(
        "Module Selection",
        {
          status: "warning",
          description: `In Progress`,
        },
        setSelectedData
      );
      UpdateTimeline(
        5,
        {
          status: "error",
          description: ``,
        },
        setSelectedData
      );
    } else {
      // const cleanedPath = path?.replace("/personaCreation", "");
      if (
        getSessionStorage("ListOfAvatar") &&
        getSessionStorage("ListOfAvatar")?.length > 0
      ) {
        cleanedPath = path?.replace("/personaCreation", "/avatarSelection");
      } else {
        cleanedPath = -1;
      }
      navigate(cleanedPath);
      // UpdateTimeline(5,{
      //     status: "error",
      //     description: ``,
      //   },setSelectedData
      // );
      // UpdateTimeline(4,{
      //     status: "warning",
      //     description: `In Progress`,},setSelectedData);
    }
  };

  const handleSubmit = () => {
    if (!persona) return;

    axios
      .put(`scenario/personas/v2/update/${persona.id}`, {persona_data: persona})
      .then((res) => {
        setSelectedData("personaName", res.data.name);
        setSelectedData("PersonaSelection", res.data.id);
        setSessionStorage("personaName", persona.name);
        setSessionStorage("personaGender",persona?.gender)
        setSessionStorage("PersonaSelection", persona.id);
        UpdateTimeline(
          5,
          {
            status: "success",
            description: `${res.data.name}`,
          },
          setSelectedData
        );
        UpdateTimeline(
          6,
          {
            status: "warning",
            description: `In Progress`,
          },
          setSelectedData
        );
        if(localStorage.getItem("flow")=="CourseManagement & editScenario flow"){
          setEditPage()
          return
        }
        let path = window.location.pathname;
        const cleanedPath = path?.replace("personaCreation", "createAvatar");
        navigate(cleanedPath);
      })
      .catch((err) => {
        console.log("err: ", err);
      });
  };

  return (
    <div className={styles.mainBox}>
      <div className={styles.headers}>
        <div className={styles.page}>
          <div className={styles.currentPage}>Create Scenario</div>
        </div>
      </div>
      <div className={styles.mainHeader}>
        <div className={styles.mainHeaderContent}>
          <BackIcon
            onClick={() => {
              handleBack();
            }}
          />
          <p>Persona Creation</p>
        </div>

        <button
          className={styles.createBtn}
          onClick={() => {
            CallPersonaPrompt();
          }}
          disabled={!(count < 2)}
        >
          {/* Replace with actual AI SVG */}
          <div>
            <AIgradientIcon />
          </div>
          <p>Regenerate Persona</p>
        </button>
        {/* <div
          className={styles.createBtn}
          onClick={() => {
            setCurrentPage();
          }}
        >
          <div>
            <AIgradientIcon />
          </div>
          <p>Create Persona with AI</p>
        </div> */}
      </div>
      {persona && (
        <div className={styles.mainSection}>
          <div className={styles.sectionContent}>
            {renderFormFields(persona)}
          </div>
        </div>
      )}
      {persona && <div className={styles.btnBox}>
        <div className={styles.cancelBtn} onClick={()=>
          localStorage.getItem("flow")=="CourseManagement & editScenario flow"?
          setBack():
          handleBack()}>
          Cancel
        </div>
        <div className={styles.saveBtn} onClick={handleSubmit}>
          Save & Use
        </div>
      </div>}
    </div>
  );
}
export default PersonaCreation;
