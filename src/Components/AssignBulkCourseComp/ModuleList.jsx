import React, { useEffect, useState } from "react";
import styles from "../AssignBulkCourseComp/ModuleList.module.css";
import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, Radio, theme } from "antd";
import axios from "../../service.js";
import { useUserPopupStore } from "../../store.js";
import { useNavigate } from "react-router-dom";
import { UpdateTimeline } from "../Timeline/UpdateTImeLine.js";
import { div } from "three/tsl";

function ModuleList({
  payload,
  selectedCourse,
  currentCourse,
  onModuleSelect,
  onScenarioSelect,
  onModeSelect,
  setCurrentPage,
}) {
  let [moduleData, setModuleData] = useState([]);
  let [scenarioData, setScenarioData] = useState([]);
  let [showModule, setShowModule] = useState();
  let [selectedModules, setSelectedModules] = useState(new Set());
  let [selectedScenarios, setSelectedScenarios] = useState(new Set());
  let [activeKeys, setActiveKeys] = useState([]);
  let [flow, setFlow] = useState(localStorage.getItem("flow"));
  const navigate = useNavigate();
  const { message, setMessage } = useUserPopupStore();
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [totalScenarios, setTotalScenarios] = useState(0);

  const { token } = theme.useToken();
  const panelStyle = {
    marginBottom: 20,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  useEffect(() => {
    if (currentCourse) {
      setActiveKeys([]); // Close all accordions
      axios
        .get(`/courses/${currentCourse}/modules`)
        .then((res) => {
          setModuleData(res.data);
        })
        .catch((err) => {
          console.log("err: ", err);
        });
    }
  }, [currentCourse]); // api of currentCourse moduleList

  useEffect(() => {
    if (showModule) {
      axios
        .get(`/modules/${showModule}/scenarios`)
        .then((res) => {
          setScenarioData(res.data);
        })
        .catch((err) => {
          console.log("err: ", err);
        });
    }
  }, [showModule]); // api for currentModule scenarioList

  useEffect(() => {
    let courseCount = payload.length;
    let moduleCount = 0;
    let scenarioCount = 0;

    for (const item of payload) {
      // Count modules
      moduleCount += item.module_ids?.length || 0;
      
      // Count scenarios from scenario_mapping
      if (item?.scenario_mapping) {
        for (const moduleId in item.scenario_mapping) {
          scenarioCount += item.scenario_mapping[moduleId]?.length || 0;
        }
      }
    }
    setTotalCourses(courseCount);
    setTotalModules(moduleCount);
    setTotalScenarios(scenarioCount);
  }, [payload])
  

  const handleCancel = () => {
    if(flow!="UserManagement flow"){
      localStorage.setItem("currentPathLocation", "Create User")
    }
    navigate(-1);
    UpdateTimeline(1, {
      status: "warning",
      description: ``
    },setSelectedData);
    UpdateTimeline("Assign Course", {
      status: "error",
      description: `In Progress`
    },setSelectedData);
  }


  const getItems = (panelStyle) =>
    moduleData?.map((item, index) => ({
      key: index,
      label: (
        <>
          <div
            className={styles.moduleList}
            onClick={(e) => {
              if (e.target.type !== "checkbox") {
                setShowModule(item.id);
                const isCurrentlySelected = selectedModules.has(item.id);
                setSelectedModules((prev) => {
                  const newSet = new Set(prev);
                  if (isCurrentlySelected) {
                    newSet.delete(item.id);
                  } else {
                    newSet.add(item.id);
                  }
                  return newSet;
                });
                
                // Clear scenarios for this module if deselecting
                if (isCurrentlySelected) {
                  setSelectedScenarios((prev) => {
                    const newSet = new Set(prev);
                    scenarioData.forEach(scenario => {
                      newSet.delete(scenario.id);
                    });
                    return newSet;
                  });
                }
                
                onModuleSelect(currentCourse, item.id, !isCurrentlySelected);
              }
            }}
          >
            <div className={styles.checkBoxContainer}>
              <input
                type="checkbox"
                checked={selectedModules.has(item.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  const isSelected = e.target.checked;
                  setSelectedModules((prev) => {
                    const newSet = new Set(prev);
                    if (isSelected) {
                      newSet.add(item.id);
                    } else {
                      newSet.delete(item.id);
                    }
                    return newSet;
                  });
                  
                  // Clear scenarios for this module if deselecting
                  if (!isSelected) {
                    setSelectedScenarios((prev) => {
                      const newSet = new Set(prev);
                      scenarioData.forEach(scenario => {
                        newSet.delete(scenario.id);
                      });
                      return newSet;
                    });
                  }
                  
                  onModuleSelect(currentCourse, item.id, isSelected);
                }}
              />
            </div>
            <div className={styles.image}>
              <img src={item?.thumbnail_url} alt="" />
            </div>
            <div className={styles.text}>
              <p>Module Title</p>
              {item.title || item.name || "Module"}
            </div>
          </div>
        </>
      ),
      children: ( //scenarios list 
        <>
          <p className={styles.heading}>List of Scenario</p>
          {scenarioData?.length>0 ? <div className={styles.scenarioList}>
            {scenarioData?.map((scenario, index) => (
              <div
                className={styles.scenario}
                key={index}
                onClick={(e) => {
                  if (e.target.type !== "checkbox") {
                    const isCurrentlySelected = selectedScenarios.has(
                      scenario.id
                    );
                    
                    // If selecting scenario and module is not selected, select the module
                    if (!isCurrentlySelected && !selectedModules.has(showModule)) {
                      setSelectedModules((prev) => {
                        const newSet = new Set(prev);
                        newSet.add(showModule);
                        return newSet;
                      });
                      onModuleSelect(currentCourse, showModule, true);
                    }
                    
                    setSelectedScenarios((prev) => {
                      const newSet = new Set(prev);
                      if (isCurrentlySelected) {
                        newSet.delete(scenario.id);
                      } else {
                        newSet.add(scenario.id);
                      }
                      return newSet;
                    });
                    onScenarioSelect(
                      currentCourse,
                      showModule,
                      scenario.id,
                      !isCurrentlySelected
                    );

                    // Handle mode mapping - extract avatar_interaction IDs
                    if (!isCurrentlySelected) {
                      const modes = [];
                      if (scenario.learn_mode?.avatar_interaction)
                        modes.push(scenario.learn_mode.avatar_interaction);
                      if (scenario.try_mode?.avatar_interaction)
                        modes.push(scenario.try_mode.avatar_interaction);
                      if (scenario.assess_mode?.avatar_interaction)
                        modes.push(scenario.assess_mode.avatar_interaction);
                      onModeSelect(currentCourse, scenario.id, modes);
                    }
                  }
                }}
              >
                <div className={styles.checkBocContainer}>
                  <input
                    type="checkbox"
                    checked={selectedScenarios.has(scenario.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      const isSelected = e.target.checked;
                      
                      // If selecting scenario and module is not selected, select the module
                      if (isSelected && !selectedModules.has(showModule)) {
                        setSelectedModules((prev) => {
                          const newSet = new Set(prev);
                          newSet.add(showModule);
                          return newSet;
                        });
                        onModuleSelect(currentCourse, showModule, true);
                      }
                      
                      setSelectedScenarios((prev) => {
                        const newSet = new Set(prev);
                        if (isSelected) {
                          newSet.add(scenario.id);
                        } else {
                          newSet.delete(scenario.id);
                        }
                        return newSet;
                      });
                      onScenarioSelect(
                        currentCourse,
                        showModule,
                        scenario.id,
                        isSelected
                      );

                      // Handle mode mapping - extract avatar_interaction IDs
                      if (isSelected) {
                        const modes = [];
                        if (scenario.learn_mode?.avatar_interaction)
                          modes.push(scenario.learn_mode.avatar_interaction);
                        if (scenario.try_mode?.avatar_interaction)
                          modes.push(scenario.try_mode.avatar_interaction);
                        if (scenario.assess_mode?.avatar_interaction)
                          modes.push(scenario.assess_mode.avatar_interaction);
                        onModeSelect(currentCourse, scenario.id, modes);
                      }
                    }}
                  />
                </div>
                <div className={styles.image}>
                  <img src={scenario.thumbnail_url} alt="" />
                </div>
                <div className={styles.text}>
                  <p>Scenario Title</p>
                  {scenario.title || scenario.name || "Scenario"}
                </div>
              </div>
            ))}
          </div>:(
            <div className={styles.alertScenario}>Scenarios Not Available </div>
          )}
        </>
      ),
      style: panelStyle,
    })) || [];

  return (
    <>
      <div className={styles.moduleBox}>
        <div className={styles.header}>
          <div>List of Module</div>
        </div>
        {moduleData?.length>0 ? <div className={styles.accordationContainer}>
          <Collapse
            accordion
            bordered={false}
            activeKey={activeKeys}
            onChange={setActiveKeys}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            style={{ background: token.colorBgContainer }}
            items={getItems(panelStyle)}
          />
        </div>:
          <div className={styles.alertScenario}>Modules Not Available</div>
        }
      </div>
      <div className={styles.footer}>
        <div className={styles.selectedData}>
          <div className={styles.selectionCount}>
            <div className={styles.selectionCount1}>
              <p>No of Course selected</p>
              <span>{totalCourses}</span>
            </div>
            <div className={styles.selectionCount1}>
              <p>No of Module Selected</p>
              <span>{totalModules}</span>
            </div>
            <div className={styles.selectionCount1}>
              <p>No of Scenario Selected</p>
              <span>{totalScenarios}</span>
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={() => handleCancel()}>
            Cancel
          </button>
          <button
            className={styles.nextBtn}
            disabled={selectedCourse.length == 0}
            onClick={() => setCurrentPage("mode")}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default ModuleList;
