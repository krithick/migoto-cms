import React, { useEffect, useRef, useState } from "react";
import { useLOIData, useUserPopupStore } from "../../store";
import styles from "../Course/CreateCourse.module.css";
import { Button, Input, Radio } from "antd";
import TextArea from "antd/es/input/TextArea";
import ReloadIcon from "../../Icons/ReloadIcon";
import BulkIcon from "../../Icons/BulkIcon";
import axios from '../../service.js'
import { setSessionStorage } from "../../sessionHelper.js";
import { useNavigate } from "react-router-dom";
function ScenarioConfirmation({ setUploadPage }) {
  const imageInputRef = useRef();
  let [imageFile, setImageFile] = useState();
  const [selectedImage, setSelectedImage] = useState();
  const [imagePreview, setImagePreview] = useState();
  const [selectedPDF, setSelectedPDF] = useState();
  const [docs, setDocs] = useState();
  const [pdfPreview] = useState("");
  let { selectedData, setSelectedData } = useLOIData();
  const { message, setMessage } = useUserPopupStore();
  const [value, setValue] = useState(
    selectedData["Layout"] ? selectedData["Layout"] : 1
  );
  const [scenarioData, setScenarioData] = useState({
    title: selectedData["scenarioData"]?.title,
    description: selectedData["scenarioData"]?.description,
  });
  let navigate = useNavigate();

  const isFormValid =
    scenarioData?.title?.trim() !== "" &&
    scenarioData?.description?.trim() !== "" &&
    imagePreview;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScenarioData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    if (!e.target.files || e.target.files?.length === 0) {
      setSelectedImage(undefined);
      return;
    }
    const file = e.target.files[0];
    setSelectedImage(file);
  }; //upload image

  useEffect(() => {
    setImagePreview(
      import.meta.env.VITE_SCENARIO_PREVIEW
    );
    setSelectedImage(
      import.meta.env.VITE_SCENARIO_PREVIEW
    );
  }, []);

  // setUploadPage();
  const token = localStorage.getItem("migoto-cms-token");


useEffect(() => {
  if (!selectedImage) return;

  if (typeof selectedImage === "object") {
    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }
}, [selectedImage]); //preview link of uploaded image

const handleSubmitDetails = (img) => {
  let payload = { ...scenarioData, thumbnail_url: img };
  setSelectedData("scenarioData", payload);
  setSessionStorage("scenarioData", payload);
  setSessionStorage("Layout", value);
  // setUploadPage("DataEdition");
  navigate("editContent");
};

const handleSubmitImage = () => {
    // setUploadPage();
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
        handleSubmitDetails(imageFile);
      })
      .catch((err) => {
        console.error("Upload failed:", err);
        setMessage({
          enable: true,
          msg: "Something went wrong",
          state: false,
        });
      });
    }else{
      handleSubmitDetails(selectedImage)
    }
  }; //uplaod image in server

return (
  <>
    <div className={styles.formContainer}>
      <div className={styles.mainContainer}>
        <div className={styles.inputContainer}>
          <div className={styles.inputs}>
            <div className={styles.inputDiv}>
              <label>
                Scenario Title <span>*</span>
              </label>
              <Input
                type="text"
                name="title"
                disabled={selectedPDF}
                value={scenarioData.title}
                className={styles.input}
                placeholder="Enter Scenario Title"
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.inputDiv}>
              <label>
                Scenario Description <span>*</span>
              </label>
              <TextArea
                name="description"
                disabled={selectedPDF}
                value={scenarioData.description}
                className={styles.input}
                placeholder="Enter Description here"
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className={styles.imgContainer}>
            <div className={styles.fileContainer}>
              <label
                htmlFor="image-upload"
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
                  id="image-upload"
                  disabled={selectedPDF}
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                  ref={imageInputRef}
                />
              </label>
              {imagePreview && (
                <>
                  <img
                    className={styles.previewImage}
                    src={imagePreview}
                    alt="Image Preview"
                  />
                  <button
                    className={styles.reloadIcon}
                    onClick={() => imageInputRef.current.click()}
                  >
                    Re-upload <ReloadIcon />
                  </button>
                </>
              )}
              {!imagePreview && (
                <div className={styles.iconContainer}>
                  <BulkIcon />
                </div>
              )}
              {!imagePreview && (
                <h3 className={styles.title}>
                  Upload Cover Picture from files
                </h3>
              )}
              {!imagePreview && (
                <p className={styles.subtitle}>Drag and drop here</p>
              )}
            </div>
          </div>
        </div>
        {/* Layout Selection */}
        <div className={styles.layoutSection}>
          Assign Layout
          <div className={styles.layoutContainer}>
            <div className={styles.leftSection}>
              <Radio.Group
                className={styles.radioGroup}
                onChange={(e) => {
                  setValue(e.target.value),
                    setSelectedData("Layout", e.target.value);
                }}
                value={value}
              >
                <Radio className={styles.radioBtn} value={1}>
                  Layout 01
                </Radio>
                <Radio className={styles.radioBtn} value={2}>
                  Layout 02
                </Radio>
                <Radio className={styles.radioBtn} value={3}>
                  Layout 03
                </Radio>
              </Radio.Group>
            </div>
            <div className={styles.rightSection}>
              {value == 1 && (
                <img
                  src={
                    import.meta.env.VITE_LAYOUT1
                  }
                  alt={`Layout ${value}`}
                />
              )}
              {value == 2 && (
                <img
                  src={
                    import.meta.env.VITE_LAYOUT2
                  }
                  alt={`Layout ${value}`}
                />
              )}
              {value == 3 && (
                <img
                  src={
                    import.meta.env.VITE_LAYOUT3
                  }
                  alt={`Layout ${value}`}
                />
              )}
            </div>
          </div>
        </div>
        {/* ----------------------------------------------------   */}
        {/* Footer Buttons */}
        <div className={styles.footer}>
          {
            <Button // cancel for navigate
              className={styles.cancelBtn}
              onClick={() => {
                setUploadPage()
              }}
            >
              {"Cancel"}
            </Button>
          }
          <Button
            className={styles.primaryBtn}
            type="primary"
            disabled={!isFormValid}
            onClick={() => {
              handleSubmitImage();
            }}
          >
            {"Submit"}
          </Button>
        </div>
      </div>
    </div>
  </>
);
}
export default ScenarioConfirmation;

