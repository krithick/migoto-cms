import React, { useEffect, useState, useMemo } from "react";
import styles from "../PopUps/OkCancelPopUp.module.css";
import { useLOIData, usePreviewStore } from "../../store";
import { Collapse, Radio } from "antd";
import axios from "../../service.js";
import { useNavigate } from "react-router-dom";

export default function PersonaPromptPopUp() {
  const { isPreview, setIsPreview } = usePreviewStore();
  const { selectedData, setSelectedData } = useLOIData();
  let navigate = useNavigate()
  const [gender, setGender] = useState("female");
  const [promptText, setPromptText] = useState("");
  const [persona, setPersona] = useState([]);
  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState(0);
  const [activeKey, setActiveKey] = useState([0]);

  useEffect(() => {
    setGender("female");
    setPromptText("");
  }, []);

  useEffect(() => {
    axios
      .get(
        `scenario/load-template-from-db/${sessionStorage.getItem(
          "template_id"
        )}`
      )
      .then((res) => {
        setPersona(res?.data?.template_data?.persona_types);
      })
      .catch((err) => {
        console.error("Submission error:", err);
      });
  }, []);

  const handleCancel = () => {
    if (isPreview.resolve) isPreview.resolve(false);
    setIsPreview({ enable: false, msg: "", value: "", resolve: null });
    navigate(-1);
  };

  const handleProceed = () => {
    const data = {
      template_id: sessionStorage.getItem("template_id"),
      persona_type_index: selectedPersonaIndex,
      gender: gender,
      custom_prompt: promptText
    };
    if (isPreview.resolve) isPreview.resolve(data);
    setIsPreview({ enable: false, msg: "", value: "", resolve: null });
  };

  const items = useMemo(() => {
    return persona?.map((item, index) => ({
      key: index,
      label: (
        <div className={styles.persona}>
          <p>{item?.type}</p>
          <div>{item?.description}</div>
          <div>
            <span>Use case : </span> <span>{item?.use_case}</span>
          </div>
        </div>
      ),
      children: (
        <div className={styles.child}>
          <p><strong>Specialty:</strong> {item?.key_characteristics?.specialty}</p>
          <p><strong>Decision Style:</strong> {item?.key_characteristics?.decision_style}</p>
          <p><strong>Time Availability:</strong> {item?.key_characteristics?.time_availability}</p>
          <p><strong>Current Solution:</strong> {item?.key_characteristics?.current_solution}</p>
          <div>
            <strong>Pain Points:</strong>
            <ul>
              {item?.key_characteristics?.pain_points?.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    })) || [];
  }, [persona]);

  return (
    <div className={styles.popBg}>
      {persona&& <div className={styles.popupContainer}>
        <div className={styles.promptcontent}>
          <p>Configure Persona</p>
          <div className={styles.personaList}>
            <Collapse 
              accordion 
              items={items} 
              activeKey={activeKey}
              onChange={(key) => {
                const newKey = key || selectedPersonaIndex;
                setActiveKey([newKey]);
                setSelectedPersonaIndex(Number(newKey));
              }}
            />
          </div>
          <div className={styles.gender}>
            <Radio.Group
              onChange={(e) => setGender(e.target.value)}
              value={gender}
            >
              <Radio value="female">Female</Radio>
              <Radio value="male">Male</Radio>
            </Radio.Group>
          </div>
          <div className={styles.prompt}>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Type your prompt here..."
            ></textarea>
          </div>
        </div>
        <div className={styles.btnBox}>
          <div className={styles.cancelBtn} onClick={handleCancel}>
            Cancel
          </div>
          <div className={styles.saveBtn} onClick={handleProceed}>
            Proceed
          </div>
        </div>
      </div>}
    </div>
  );
}
