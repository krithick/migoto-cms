import React, { useRef, useState, useEffect } from "react";
import styles from "./CreateCourse.module.css";
import BulkIcon from "../../Icons/BulkIcon";
import { Button } from "antd";
import ReloadIcon from "../../Icons/ReloadIcon";
import axios from "../../service";
import { useLOIData, usePreviewStore, useUserPopupStore } from "../../store";
import { useNavigate } from "react-router-dom";
import PdfIcon from "../../Icons/PdfIcon";
import SupportDocUpload from "./AIScenario/SupportDocUpload/SupportDocUpload";
import { Navcontent } from "../Sidebar/SidebarPopUpContent";
import { setSessionStorage } from "../../sessionHelper";

function CourseForm({ setUploadPage }) {
  const pdfInputRef = useRef();
  let navigate = useNavigate();
  const { message, setMessage } = useUserPopupStore();
  let path = window.location.pathname;
  let [pdfFile, setPdfFile] = useState(null);
  let [pdfFileData, setPdfFileData] = useState(null);
  let flow = localStorage.getItem("flow");
  let { selectedData, setSelectedData } = useLOIData();
  const [loading, setLoading] = useState(false);
  let submissionData = new FormData();
  
  const handleSubmitDocs = async (e) => {
    const token = localStorage.getItem("migoto-cms-token");

    submissionData.append("template_file", pdfFileData);

    selectedData["supportDocs"]?.forEach((doc) => {
      submissionData.append("supporting_docs", doc);
    });
    submissionData.append("template_name", pdfFile);

    try {
      setLoading(true);
      const res = await axios.post(
        `scenario/analyze-template-with-optional-docs`,
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: token,
          },
        }
      );
      setSelectedData("template_id", res?.data?.template_id);
      setSessionStorage("template_id", res?.data?.template_id);
      setSelectedData("scenarioData",{
        title: res.data?.template_data?.context_overview?.scenario_title,
        description: res.data?.template_data?.context_overview?.purpose_of_scenario,
      })
      // setSelectedData("templateResponse", res.data?.template_data);
      setSelectedData("supportDocs", null);
      // handleSaveInDB(res.data?.template_data,res?.data?.template_id)
      setLoading(false);
      setUploadPage("confirmationPage");
    } catch (err) {
      setLoading(false);
      console.error("Upload failed:", err);
      setMessage({
        enable: true,
        msg: "Something Went Wrong",
        state: false,
      });
    }
  };

  const handlePDFUpload = (e) => {
    if (e.target.files) {
      setPdfFile(e.target.files[0]?.name);
      setPdfFileData(e.target.files[0]);
      setSelectedData("template_name", e.target?.files[0]?.name);
    } else {
      setPdfFile(null);
      setPdfFileData(null);
    }
  };


  const { isPreview, setIsPreview } = usePreviewStore();

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
        flow == "CourseManagement flow" && setSelectedData("showModule", null),
          setSelectedData("moduleId", null);
        setSelectedData("showCourse", null), setSelectedData("courseId", null);
        const cleanedPath = path?.replace("/createScenario", "");
        navigate(cleanedPath);
      }
    });
  };

  return (
    <>
      {/* {loading && <Loader />} */}
      <div className={styles.formContainer}>
        <div className={styles.mainContainer}>
          {/* PDF Upload Section */}
          {
            <div className={`${styles.inputDiv} ${styles.largerInput}`}>
              <label>
                Base Document <span>*</span>
              </label>
              <div
                className={styles.uploadContainer}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (
                    e.dataTransfer.files &&
                    e.dataTransfer.files?.length > 0
                  ) {
                    handlePDFUpload({
                      target: { files: e.dataTransfer.files },
                    });
                    e.dataTransfer.clearData();
                  }
                }}
              >
                <div className={styles.fileContainer}>
                  <label
                    htmlFor="pdf-upload"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                      opacity: 0,
                      zIndex: 1,
                    }}
                  >
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf, .doc, .docx"
                      style={{ display: "none" }}
                      onChange={handlePDFUpload}
                      ref={pdfInputRef}
                    />
                  </label>
                  {pdfFile && (
                    <>
                      <PdfIcon />
                      <button
                        className={styles.reloadIcon}
                        onClick={() => pdfInputRef.current.click()}
                      >
                        Re-upload <ReloadIcon />
                      </button>
                    </>
                  )}
                  {!pdfFile && (
                    <div className={styles.iconContainer}>{<BulkIcon />}</div>
                  )}
                  <h3 className={styles.title}>
                    {pdfFile ? pdfFile : "Upload Document from files"}
                  </h3>
                  {!pdfFile && (
                    <p className={styles.subtitle}>Drag and drop here</p>
                  )}
                </div>
              </div>
            </div>
          }

          {/* ----------------------------------------------------   */}
          {/* Support Doc Upload */}
          {
            <div className={styles.fRow}>
              <SupportDocUpload />
            </div>
          }

          {/* Footer Buttons */}
          <div className={styles.footer}>
            {
              <Button // cancel for navigate
                className={styles.cancelBtn}
                onClick={() => {
                  checkNavigation();
                }}
              >
                {"Cancel"}
              </Button>
            }

            {
              <Button
                className={styles.primaryBtn}
                type="primary"
                disabled={!pdfFile}
                onClick={() => {
                  handleSubmitDocs();
                }}
              >
                {"Next"}
              </Button>
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseForm;
