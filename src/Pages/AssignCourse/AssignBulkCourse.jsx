import React, { useEffect, useState } from "react";
import styles from "../AssignCourse/AssignBulkCourse.module.css";
import CourseList from "../../Components/AssignBulkCourseComp/CourseList";
import ModuleList from "../../Components/AssignBulkCourseComp/ModuleList";
import LoiHeader from "../../Components/AssignBulkCourseComp/LoiHeader";
import ModeSelection from "../AssignCourse/ModeSelection.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useLOIData, useUserPopupStore } from "../../store.js";
import { setSessionStorage } from "../../sessionHelper.js";
import { UpdateTimeline } from "../../Components/Timeline/UpdateTImeLine.js";
import axios from "../../service.js";

function AssignBulkCourse() {
  let [datas, setDatas] = useState([]);
  let [data, setData] = useState([]);
  let [activeCourse, setActiveCourse] = useState("all");
  let [filterData, setFilterData] = useState("");
  let [currentPage, setCurrentPage] = useState("CMS");
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [payload, setPayload] = useState([]);
  const { id } = useParams();
  const { selectedData, setSelectedData } = useLOIData();
  let [flow, setFlow] = useState(localStorage.getItem("flow"));
  const navigate = useNavigate();
  const { message, setMessage } = useUserPopupStore();

  let payloadStructure = {
    user_ids: [],
    include_all_modules: true,
    include_all_scenarios: true,
    module_ids: [],
    scenario_mapping: {},
    mode_mapping: {},
  };


  // Handle module selection - sets include_all_modules to false
  const handleModuleSelection = (courseId, moduleId, isSelected) => {
    setPayload((prev) => {
      const coursePayload = prev.find((item) => item.courseId === courseId);
      if (!coursePayload) return prev;

      const updatedPayload = prev.map((item) => {
        if (item.courseId === courseId) {
          const newModuleIds = isSelected
            ? [...(item.module_ids || []), moduleId]
            : (item.module_ids || []).filter((id) => id !== moduleId);

          // If module is deselected, remove its scenario mappings and related mode mappings
          let newScenarioMapping = { ...item.scenario_mapping };
          let newModeMapping = { ...item.mode_mapping };

          if (!isSelected && newScenarioMapping[moduleId]) {
            // Get scenarios for this module and remove their mode mappings
            const scenariosToRemove = newScenarioMapping[moduleId];
            scenariosToRemove.forEach((scenarioId) => {
              delete newModeMapping[scenarioId];
            });
            // Remove the module's scenario mapping
            delete newScenarioMapping[moduleId];
          }

          return {
            ...item,
            include_all_modules: newModuleIds.length === 0,
            module_ids: newModuleIds,
            scenario_mapping: newScenarioMapping,
            mode_mapping: newModeMapping,
          };
        }
        return item;
      });

      return updatedPayload;
    });
  };

  // Handle scenario selection - sets include_all_scenarios to false
  const handleScenarioSelection = (courseId,moduleId,scenarioId,isSelected) => {
    setPayload((prev) => {
      return prev.map((item) => {
        if (item.courseId === courseId) {
          const currentScenarios = item.scenario_mapping[moduleId] || [];
          const newScenarios = isSelected
            ? [...currentScenarios, scenarioId]
            : currentScenarios.filter((id) => id !== scenarioId);

          let newModeMapping = { ...item.mode_mapping };
          let newScenarioMapping = {
            ...item.scenario_mapping,
            [moduleId]: newScenarios,
          };

          // If scenario is deselected, remove its mode mapping
          if (!isSelected) {
            delete newModeMapping[scenarioId];
          }

          // If no scenarios left, remove empty module mapping
          if (newScenarios.length === 0) {
            delete newScenarioMapping[moduleId];
          }

          // Check if any scenarios exist across all modules
          const totalScenarios = Object.values(newScenarioMapping).reduce(
            (sum, scenarios) => sum + scenarios.length,
            0
          );

          return {
            ...item,
            include_all_scenarios: totalScenarios === 0,
            scenario_mapping: newScenarioMapping,
            mode_mapping: newModeMapping,
          };
        }
        return item;
      });
    });
  };

  // Handle mode selection for scenarios
  const handleModeSelection = (courseId, scenarioId, modes) => {
    setPayload((prev) => {
      return prev.map((item) => {
        if (item.courseId === courseId) {
          return {
            ...item,
            mode_mapping: {
              ...item.mode_mapping,
              [scenarioId]: modes,
            },
          };
        }
        return item;
      });
    });
  };

  // Build final API payload for course assignment
  const buildApiPayload = (coursePayload, userIds, selectedModes) => {
    return {
      user_ids: userIds,
      include_all_modules: coursePayload.include_all_modules,
      include_all_scenarios: coursePayload.include_all_scenarios,
      module_ids: coursePayload.module_ids,
      scenario_mapping: coursePayload.scenario_mapping,
      mode_mapping: selectedModes
        ? Object.keys(coursePayload.scenario_mapping).reduce(
            (acc, moduleId) => {
              coursePayload.scenario_mapping[moduleId].forEach((scenarioId) => {
                acc[scenarioId] = selectedModes;
              });
              return acc;
            },
            {}
          )
        : coursePayload.mode_mapping,
    };
  };

  // Submit assignments for all selected courses
  const submitAssignments = async (globalModes = null) => {
    let userId;
    if (id == "bulkAssign") {
      userId = JSON.parse(sessionStorage.getItem("createdUser"));
      setSelectedData("createdUser", userId);
      setSessionStorage("createdUser", userId);
    } else {
      userId = [id];
      setSelectedData("createdUser", [id]);
      setSessionStorage("createdUser", [id]);
    }

    if (!userId || userId?.length == 0) {
      setMessage({
        enable: true,
        msg: "User ID is missing",
        state: false,
      });
      return;
    }
    try {
      for (const coursePayload of payload) {
        const apiPayload = buildApiPayload(coursePayload, userId, globalModes);
        await axios.post(
          `/course-assignments/course/${coursePayload.courseId}/assign-with-content`,
          apiPayload
        );
      }
      setMessage({
        enable: true,
        msg: "Course Assigned Successfully",
        state: true,
      });
      if (flow == "UserManagement flow") {
        localStorage.setItem("currentPathLocation", "User");
        navigate("/migoto-cms/users");
      } else {
        localStorage.setItem("currentPathLocation", "Dashboard");
        navigate("/migoto-cms/dashboard");
      }
    } catch (error) {
      console.error("Assignment failed:", error);
      setMessage({
        enable: true,
        msg: "Assignment Failed",
        state: false,
      });
    }
  };

  return (
    <>
      {currentPage == "CMS" && (
        <div className={styles.container}>
          <div className={styles.header}>
            <LoiHeader
              filterData={filterData}
              datas={datas}
              setData={setData}
              setDatas={setDatas}
              activeCourse={activeCourse}
              setActiveCourse={setActiveCourse}
              search={search}
              setSearch={setSearch}
            />
          </div>
          <div className={styles.body}>
            <div
              className={`${styles.courseListBox} ${
                selectedCourse?.length > 0 ? styles.small : ""
              }`}
            >
              <CourseList
                data={data}
                setDatas={setDatas}
                setData={setData}
                selectedCourse={selectedCourse}
                setSelectedCourse={setSelectedCourse}
                currentCourse={currentCourse}
                setCurrentCourse={(item) => setCurrentCourse(item)}
                payload={payload}
                setPayload={setPayload}
                search={search}
                datas={datas}
              />
            </div>
            <div
              className={`${styles.moduleListBox} ${
                selectedCourse?.length > 0 ? styles.open : ""
              }`}
            >
              <ModuleList
                selectedCourse={selectedCourse}
                payload={payload}
                currentCourse={currentCourse}
                onModuleSelect={handleModuleSelection}
                onScenarioSelect={handleScenarioSelection}
                onModeSelect={handleModeSelection}
                setCurrentPage={(item) => setCurrentPage(item)}
              />
            </div>
          </div>
        </div>
      )}
      {currentPage == "mode" && (
        <ModeSelection
          setCurrentPage={() => setCurrentPage("CMS")}
          assign={(selectedModes) => submitAssignments(selectedModes)}
        />
      )}
    </>
  );
}

export default AssignBulkCourse;
