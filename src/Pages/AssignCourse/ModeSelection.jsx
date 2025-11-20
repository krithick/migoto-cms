import React, { useState } from "react";
import ChatBotIcon from "../../Icons/ChatBotIcon";
import VideoIcon from "../../Icons/VideoIcon";
import SmallPdfIcon from "../../Icons/SmallPdfIcon";
import LearnModeIcon from "../../Icons/LearnModeIcon";
import TryModeIcon from "../../Icons/TryModeIcon";
import AccessModeIcon from "../../Icons/AccessModeIcon";
import styles from "../AssignCourse/ModeSelection.module.css";

function ModeSelection({setCurrentPage, assign}) {
  const [selectedModes, setSelectedModes] = useState(["learn_mode", "try_mode", "assess_mode"]);
  console.log('selectedModes: ', selectedModes);
  let mapData = [
    {
      key: "learn_mode",
      icon: <LearnModeIcon />,
      title: "Learn Mode",
      description:
        "Learn Mode allows you to engage with course content at your own pace, offering a focused and interactive experience to master new skills and knowledge.",
      features: [
        { icon: <ChatBotIcon />, title: "Bot Conversation" },
        { icon: <VideoIcon />, title: "Video" },
        { icon: <SmallPdfIcon />, title: "Document" },
      ],
    },
    {
      key:"try_mode",
      icon: <TryModeIcon />,
      title: "Try Mode",
      description:
        "Try Mode gives you a hands-on learning experience, allowing you to apply concepts in a practical setting and build confidence through real-time practice at your own pace.",
      features: [{ icon: <ChatBotIcon />, title: "Bot Conversation" }],
    },
    {
      key:"assess_mode",
      icon: <AccessModeIcon />,
      title: "Assess Mode",
      description:
        "Assess Mode lets you evaluate your understanding through real-world scenarios, providing instant feedback to measure progress and refine your skills",
      features: [{ icon: <ChatBotIcon />, title: "Bot Conversation" }],
    },
  ];
  return (
    <div className={styles.container}>
      <div className={styles.header}>Select Mode</div>
      <div className={styles.body}>
        {mapData?.map((item, index) => (
          <div 
            key={index} 
            className={`${styles.LTSCard} ${selectedModes.includes(item.key) ? styles.selected : ''}`}
            // onClick={() => {
            //   setSelectedModes(prev => 
            //     prev.includes(item.key) 
            //       ? prev.filter(mode => mode !== item.key)
            //       : [...prev, item.key]
            //   );
            // }}
          >
            <div className={styles.iconContainer}>{item.icon}</div>
            <div className={styles.title}>{item.title}</div>
            <p className={styles.descri}>{item.description}</p>
            <div className={styles.contentContainer}>
              {item.features.map((i, idx) => (
                <span key={idx} className={styles.icons}>
                  <span>{i.icon}</span>
                  <span>{i.title}</span>
                </span>
              ))}
            </div>

            <div className={styles.checkBoxContainer}>
              <input 
                type="checkbox" 
                checked={selectedModes.includes(item.key)}
                onChange={(e) => {
                  e.stopPropagation();
                  setSelectedModes(prev => 
                    prev.includes(item.key) 
                      ? prev.filter(mode => mode !== item.key)
                      : [...prev, item.key]
                  );
                }}
              />
              <label onClick={() => {
                setSelectedModes(prev => 
                  prev.includes(item.key) 
                    ? prev.filter(mode => mode !== item.key)
                    : [...prev, item.key]
                );
              }}>
                {selectedModes.includes(item.key) ? `${item.title} Selected` : `Click to select ${item.title}`}
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.buttons}>
        <button className={styles.cancelBtn} onClick={()=>setCurrentPage("CMS")}>Cancel</button>
        <button
          className={styles.nextBtn}
          onClick={() => {
            if (selectedModes.length > 0) {
              assign(selectedModes);
            }
          }}
          disabled={selectedModes.length === 0}
        >
          Assign Course
        </button>
      </div>
    </div>
  );
}

export default ModeSelection;
