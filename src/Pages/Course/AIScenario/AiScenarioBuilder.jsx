import React, { useEffect, useRef, useState } from "react";
import styles from "../AIScenario/AiScenarioBuilder.module.css";
import BackIcon from "../../../Icons/BackIcon";
import AIicon from "../../../Icons/AIicon";
import LinkIcon from "../../../Icons/LinkIcon";
import { useNavigate } from "react-router-dom";
import axios from "../../../service";
import { useLOIData, useUserPopupStore } from "../../../store";
import ReloadIcon from "../../../Icons/ReloadIcon";
import BulkIcon from "../../../Icons/BulkIcon";
import Loader from "../../../Components/Loader/Loader";
import Radio from "antd/es/radio/radio";
import SupportDocUpload from "./SupportDocUpload/SupportDocUpload";
import { setSessionStorage } from "../../../sessionHelper";

function AiScenarioBuilder({ setUploadPage }) {
  const { message, setMessage } = useUserPopupStore();                                                             
  const [selected, setSelected] = useState(1);
  let navigate = useNavigate();
  const { selectedData, setSelectedData } = useLOIData();
  const [selectedImage, setSelectedImage] = useState();
  const [imagePreview, setImagePreview] = useState();
  const imageInputRef = useRef();
  let [imageFile, setImageFile] = useState();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(
    selectedData["Layout"] ? selectedData["Layout"] : 1
  );

  let [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    layout:1
  });

  const handleSubmitImage = () => {
    const token = localStorage.getItem("migoto-cms-token");

    if (typeof selectedImage === "object") {
      const submissionData = new FormData();

      submissionData.append("file", selectedImage);
      submissionData.append("file_type", "image");

      axios
        .post(import.meta.env.VITE_UPLOAD_URL, submissionData, {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: token,
          },
        })
        .then((res) => {
          // pdfFile = res.data.live_url;
          imageFile = res.data.live_url;
          formData["thumbnail_url"] = res.data.live_url;
          setFormData(formData);
          handleGenerate();
        })
        .catch((err) => {
          setMessage({
            enable: true,
            msg: "Uploading Image Failed",
            state: false,
          });
        });
    } else {
      // handleSubmitDetails(selectedImage)
      formData["thumbnail_url"] = selectedImage;
      setFormData(formData);
      handleGenerate();
    }
  }; //uplaod image in server

  const handleGenerate = async () => {
    let submissionData = new FormData();
    // const data = {
    //   scenario_document: formData.description,
    // };
    submissionData.append("scenario_document", formData.description);
    submissionData.append("template_name", formData.title);
    selectedData["supportDocs"]?.forEach((doc) => {
      submissionData.append("supporting_docs", doc);
    });
    setSelectedData("template_name", formData.title);
    setSelectedData("scenarioData", formData);
    try {
      const res = await axios.post(
        `scenario/analyze-scenario-enhanced`,
        submissionData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // setSelectedData("templateResponse", res.data.template_data);
      setSelectedData("scenarioData",{
        title: res.data?.template_data?.context_overview?.scenario_title,
        description: res.data?.template_data?.context_overview?.purpose_of_scenario,
      })
      setSessionStorage("scenarioData", {
        title: res.data?.template_data?.context_overview?.scenario_title,
        description: res.data?.template_data?.context_overview?.purpose_of_scenario,
      });
      setSelectedData("template_id", res?.data?.template_id);
      setSessionStorage("template_id", res?.data?.template_id);
      setSessionStorage("Layout", value);
      setUploadPage("confirmationPage")
      // setUploadPage("DataEdition");
    } catch (err) {
      console.log("err: ", err);
      setLoading(false);
      setMessage({
        enable: true,
        msg: "Generating Scenario Failed",
        state: false,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function isValid() {
    if (formData.title && formData.description) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <>
      {/* {loading && <Loader />} */}
      <div className={styles.mainBox}>
        <div className={styles.mainHeader}>
          <BackIcon
            onClick={() => {
              setUploadPage("Image Upload");
            }}
          />
          <p>Create Scenario with AI</p>
        </div>
        <div className={styles.mainSection1}>
          <div className={styles.sectionContent}>
            <div className={styles.contentHeader}>
              <div className={styles.contentHeading}>
                AI Driven Scenario Generation
              </div>
              <p>
                Let AI help you build amazing scenarios in minutes — smarter,
                faster, and effortlessly.
              </p>
            </div>

            <div className={styles.singleColumnBox}>
              <div>
                Scenario Title<sup>*</sup>
              </div>
              <input
                type="text"
                name="title"
                placeholder="Enter Scenario Title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.singleColumnLargeBox}>
              <div>
                Scenario Description <sup>*</sup>
              </div>
              {/* <input type="text" placeholder="Scenario Description" /> */}
              <textarea
                name="description"
                placeholder="Scenario Description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            {
              <div className={styles.fRow}>
                <SupportDocUpload />
              </div>
            }
          </div>
        </div>
        <div
          className={styles.generateBtn}
          onClick={() => {
            isValid() && handleSubmitImage();
          }}
        >
          <div className={styles.aiIcon}>
            <AIicon />
          </div>
          <div className={styles.generateBtnSub}>Generate</div>
        </div>
      </div>
    </>
  );
}

export default AiScenarioBuilder;
