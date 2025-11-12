import React, { useEffect, useState } from "react";
import styles from "../EditDocument/EditDocument.module.css";
import BackIcon from "../../../../Icons/BackIcon";
import AddIcon from "../../../../Icons/AddIcon";
import SectionCategoryPopup from "../../../User/SectionCategoryPopup/SectionCategoryPopup";
import {
  useLOIData,
  usePreviewStore,
  useUserPopupStore,
} from "../../../../store";
import { div } from "three/tsl";
import PlusIcon from "../../../../Icons/PlusIcon";
import axios from "../../../../service";
import Loader from "../../../../Components/Loader/Loader";
import { Navcontent } from "../../../Sidebar/SidebarPopUpContent";
import { UpdateTimeline } from "../../../../Components/Timeline/UpdateTImeLine";
import { useNavigate } from "react-router-dom";
import { getSessionStorage, setSessionStorage } from "../../../../sessionHelper";
import AddPrompt from "./AddPrompt";
import DeleteIcon from "../../../../Icons/DeleteIcon";

function EditDocument({ setEditPage, setCurrentPage }) {
  let { selectedData, setSelectedData } = useLOIData();
  const { message, setMessage } = useUserPopupStore();
  const { isPreview, setIsPreview } = usePreviewStore();
  let navigate = useNavigate();
  const [data, setData] = useState();
  let [selected, setSelected] = useState();
  let [answer, setAnswer] = useState();
  const [templateData, setTemplateData] = useState();
  const [templateName, setTemplateName] = useState();
  let path = window.location.pathname;

  useEffect(() => {
    axios
      .get(
        `scenario/load-template-from-db/${sessionStorage.getItem(
          "template_id"
        )}`
      )
      .then((res) => {
        setData(res?.data?.template_data);
        setTemplateName(res?.data?.name)
        setSelected(Object.keys(res?.data?.template_data)[0])
        setAnswer(Object.values(res?.data?.template_data)[0])
      })
      .catch((err) => {
        console.error("Submission error:", err);
      });
  }, []);

  const handleSaveInDB = async (data, id) => {
    const payload = {
      template_data: data,
      template_name: templateName,
    };

    try {
      const res = await axios.put(`scenario/update-template-in-db/${id}`, payload);
      const cleanedPath = path?.replace("editContent", "videoPdf");
      navigate(cleanedPath);
      setSelectedData("Document", []);
      setSelectedData("personaCreated", 0);
      setSelectedData("Video", []);
    } catch (err) {
      console.error("Failed to save:", err);
      setMessage({
        enable: true,
        msg: "Something Went Wrong",
        state: false,
      });
    }
  };

  const checkNavigation = () => {
    let result = new Promise((resolve) => {
      setIsPreview({
        enable: true,
        msg: `${
          Navcontent[window.location.pathname]
            ? Navcontent[window.location.pathname]
            : "Are you sure you want to proceed with this action?"
        }`,
        value: "ok/cancel",
        resolve,
      });
    });
    result.then((res) => {
      if (res) {
        // setUploadPage("Image Upload"),
        const cleanedPath = path?.replace("/editContent", "");
        navigate(cleanedPath);
        setSelectedData("supportDocs", null),
          setSelectedData("scenarioData", null);
        // setSelectedData("scenarioResponse", null);
      }
    });
  };

  function getType(value) {
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'object' && value !== null) return 'object';
    return 'unknown';
  }

  const handleEdit = (path, value) => {
    const newData = { ...data };
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setData(newData);
    setAnswer(newData[selected]);
  };

  const handleAdd = (path) => {
    const newData = { ...data };
    let current = newData;
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    const newIndex = current.length;
    current.push("");
    setData(newData);
    setAnswer(newData[selected]);
    
    setTimeout(() => {
      const newItem = document.querySelector(`[data-item-index="${newIndex}"]`);
      if (newItem) {
        newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = newItem.querySelector('input');
        if (input) input.focus();
      }
    }, 100);
  };

  const handleRemove = (path, index) => {
    const newData = { ...data };
    let current = newData;
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    current.splice(index, 1);
    setData(newData);
    setAnswer(newData[selected]);
  };

  const renderData = (data, path = [selected]) => {
    const type = getType(data);
    
    // Skip empty objects, null, undefined, or empty arrays
    if (data === null || data === undefined || 
        (type === 'object' && Object.keys(data).length === 0)) {
      return null;
    }
    
    if (type === 'object') {
      return Object.entries(data).map(([key, value]) => (
        <div key={key} className={styles.contentForm}>
          <div className={styles.formTop}>
            <div>{key?.replaceAll(/[_-]/g, " ")?.replace(/\b\w/g, (char) => char?.toUpperCase())}</div>
            {getType(value) === 'string' || getType(value) === 'number' || getType(value) === 'boolean' ? (
              <input 
                type="text" 
                value={value} 
                onChange={(e) => handleEdit([...path, key], e.target.value)}
                className={styles.input} 
              />
            ) : (
              <div className={styles.nestedData}>{renderData(value, [...path, key])}</div>
            )}
          </div>
        </div>
      ));
    }
    
    if (type === 'array') {
      return (
        <div>
          <button 
            onClick={() => handleAdd(path)}
            className={styles.addButton}
          >
            <PlusIcon /> Add Item
          </button>
          {data.map((item, index) => {
            const itemType = getType(item);

            if (itemType === 'string') {
              return (
                <div key={index} className={styles.contentForm} data-item-index={index}>
                  <div className={styles.formTop}>
                    <div>Item {index + 1}</div>
                    <div className={styles.deleteInput}>
                    <input 
                      type="text" 
                      value={item} 
                      onChange={(e) => handleEdit([...path, index], e.target.value)}
                      className={styles.input} 
                    />
                    <button
                      onClick={() => handleRemove(path, index)}
                      className={styles.removeButton}
                    >
                      <DeleteIcon />
                    </button>
                    </div>
                  </div>
                </div>
              );
            }
            
            if (itemType === 'object') {
              return (
                <div key={index} className={styles.card}>
                  <div className={styles.header}>
                    <h4 className={styles.title}>Item {index + 1}</h4>
                    {/* <button
                      onClick={() => handleRemove(path, index)}
                      className={styles.removeButton}
                    >
                      <DeleteIcon />
                    </button> */}
                  </div>
                  <div className={styles.nestedData}>{renderData(item, [...path, index])}</div>
                </div>
              );
            }
            
            if (itemType === 'array') {
              return (
                <div key={index} className={styles.card}>
                  <div className={styles.header}>
                    <h4 className={styles.title}>Array {index + 1}</h4>
                    <button
                      onClick={() => handleRemove(path, index)}
                      className={styles.removeButton}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                  <div className={styles.nestedData}>{renderData(item, [...path, index])}</div>
                </div>
              );
            }
            
            return null;
          })}
        </div>
      );
    }
    
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return (
        <div className={styles.contentForm}>
          <div className={styles.formTop}>
            <input 
              type="text" 
              value={data} 
              onChange={(e) => handleEdit(path, e.target.value)}
              className={styles.input} 
            />
          </div>
        </div>
      );
    }
    
    return <div></div>
  };

  let hiddenContent = ["extraction_timestamp","extraction_version"];

  const handlePutApi = async (promptData) => {
  try {
    const res = await axios.put(
      `scenario/scenarios-editor/${getSessionStorage("showScenario")}/template-data`,
      { ...promptData }
    );
    setEditPage("suportDocument")
    return
    handleEditData(res.data)
  } catch (err) {
    console.error("Prompt submission failed:", err);
    setMessage({
      enable: true,
      msg: "Something Went Wrong",
      state: false,
    })
  }
};

const handleEditData = async() => {
  let payload = {
    modes_to_regenerate: [
        "learn_mode",
        "assess_mode",
        "try_mode"
    ],
    regenerate_personas: true
}

  try {
    const res = await axios.post(
      `scenario/scenarios/${getSessionStorage("showScenario")}/regenerate`,
      { payload }
    );
    setSelectedData("updatedprompts", res.data.generated_prompts);
    handleAvatarInteraction(res.data.generated_prompts)
  } catch (err) {
    setLoading(false);
    console.error("Prompt submission failed:", err);
    setMessage({
      enable: true,
      msg: "Something Went Wrong",
      state: false,
    })
  }
}

const handleAvatarInteraction = async (data) => {
  const requests = [];

  if (selectedData["LearnModeAvatarInteractionId"]) {
    requests.push(
      axios.put(`/avatar-interactions/${getSessionStorage["LearnModeAvatarInteractionId"]}`, {
        system_prompt: data?.learn_mode,
      })
    );
  }

  if (selectedData["TryModeAvatarInteractionId"]) {
    requests.push(
      axios.put(`/avatar-interactions/${getSessionStorage["TryModeAvatarInteractionId"]}`, {
        system_prompt: data?.try_mode,
      })
    );
  }

  if (selectedData["AssessModeAvatarInteractionId"]) {
    requests.push(
      axios.put(`/avatar-interactions/${getSessionStorage["AssessModeAvatarInteractionId"]}`, {
        system_prompt: data?.assess_mode,
      })
    );
  }

  try {
    await Promise.all(requests);
    setEditPage("suportDocument")
  } catch (err) {
    console.error("Failed to update avatar interactions:", err);
  }
};

  return (
    <>
      {/* <AddPrompt /> */}
      <div className={styles.mainBox}>
        {
          <div className={styles.header}>
            <div className={styles.page}>
              <div className={styles.currentPage}>Create Scenario</div>
            </div>
          </div>
        }
        <div className={styles.mainHeader}>
          <p>Edit Document</p>
        </div>
        <div className={styles.mainSection}>
          <div className={styles.sectionSidebar}>
            {
              data && Object.entries(data||{})?.map(([key, value]) => {
                // Skip hidden content and empty/null/undefined values
                if (hiddenContent?.includes(key) || 
                    value === null || value === undefined ||
                    (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) ||
                    (Array.isArray(value) && value.length === 0)) {
                  return null;
                }
                return (
                <div
                  key={key}
                  className={`${styles.unselected} ${
                    selected == key ? styles.selected : ""
                  }`}
                  onClick={() => {
                    setSelected(key);
                    setAnswer(data[key])
                  }}
                >
                  {key
                    ?.replaceAll(/[_-]/g, " ")
                    ?.replace(/\b\w/g, (char) => char?.toUpperCase())}
                </div>
                );
              })
            }
          </div>
          {/* {----------------------------------------------} */}
          <div className={styles.sectionContent}>
            <div className={styles.contentHeader}>{selected?.replaceAll(/[_-]/g, " ")?.replace(/\b\w/g, (char) => char?.toUpperCase())}</div>
            <div className={styles.sectionWrapper}>
              {answer && renderData(answer)}
            </div>
          </div>
        </div>

        <div className={styles.btnBox}>
          <div
            className={styles.cancelBtn}
            onClick={() => {
              localStorage.getItem("flow")=="CourseManagement & editScenario flow"?
              (setSelectedData("showScenario",null),setCurrentPage()):
              checkNavigation();
            }}
          >
            Cancel
          </div>
          <div
            className={styles.saveBtn}
            onClick={() => {
              localStorage.getItem("flow")=="CourseManagement & editScenario flow"?
              handlePutApi(data,):
              handleSaveInDB(data,sessionStorage.getItem("template_id"));
            }}
          >
            Save & Upload
          </div>
        </div>
      </div>
    </>
  );
}

export default EditDocument;
