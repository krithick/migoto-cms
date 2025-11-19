import React, { useEffect, useState } from "react";
import styles from "./CreateCourse.module.css";
import CourseForm from "./CourseForm";
import { useLOIData } from "../../store";
import AiScenarioBuilder from "./AIScenario/AiScenarioBuilder";
import { getSessionStorage, setSessionStorage } from "../../sessionHelper";
import ScenarioConfirmation from "./ScenarioConfirmation";

function CreateScenario({
  moveTo,
}) {
  const [uploadPage, setUploadPage] = useState("Image Upload");
  const [backTo, setBackTo] = useState("Image Upload");
  let { selectedData, setSelectedData } = useLOIData();
  let flow = localStorage.getItem("flow");


  // useEffect(() => {
  //   if (
  //     flow == "CourseManagement flow" &&
  //     getSessionStorage("showCourse") &&
  //     getSessionStorage("showModule")
  //   ) {
  //     setSelectedData("courseId", getSessionStorage("showCourse"));
  //     setSelectedData("moduleId", getSessionStorage("showModule"));
  //     sessionStorage.setItem("courseId", getSessionStorage("showCourse"));
  //     sessionStorage.setItem("moduleId", getSessionStorage("showModule"));
  //   }
  // }, []); //corseManagement flow creating module without creating course

  return (
    <>
      <div className={styles.createCourseContainer}>
        {uploadPage != "CreateAIScanario" && (
          <div className={styles.header}>
            <div className={styles.page}>
              <div className={styles.currentPage}>Create Scenario</div>
              {uploadPage == "Image Upload" && (
                <button
                  onClick={() => {
                    setUploadPage("CreateAIScanario"),
                    setBackTo("CreateAIScanario"),
                    setSelectedData("supportDocs", null),
                    setSelectedData("avatarSelection", null);
                    setSelectedData("ListofAvatars", null);
                    setSessionStorage("personaLimit",0)
                  }}
                  className={styles.gnrBtn}
                >
                  {" "}
                  Create scenario with AI
                </button>
              )}
            </div>
          </div>
        )}
        {uploadPage == "Image Upload" && (
          <CourseForm
            setUploadPage={(item) => {
              setUploadPage(item);
            }}
          />
        )}
        {uploadPage == "CreateAIScanario" && (
          <AiScenarioBuilder
            setUploadPage={(item) => {
              setUploadPage(item);
            }}
          />
        )}
        {uploadPage == "confirmationPage" && (
          <ScenarioConfirmation
            setUploadPage={() => {
              setUploadPage(backTo);
            }}
          />
        )}
        {/* {uploadPage=="DataEdition" && <EditDocument setUploadPage={(item)=>{setUploadPage(item)}} />}
        {uploadPage=="Document Upload" && <DocumentUploadFlow currentPage={"Course Doc Upload"} setCurrentPage={()=>{setCurrentPage("avatarSelection")}} setUploadPage={()=>{setUploadPage("DataEdition")}}/>} */}
      </div>
    </>
  );
}

export default CreateScenario;
