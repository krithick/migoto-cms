import React from "react";
import styles from "../PopUps/ContentPopUp.module.css"; 
import CloseRedIcon from "../../Icons/CloseRed";
import UsersIcon from "../../Icons/UsersIcon";
import { useLOIData, usePreviewStore } from "../../store";
import { useNavigate } from "react-router-dom";

function ConfirmationPopUp() {
  const { isPreview, setIsPreview } = usePreviewStore();
  const { selectedData, setSelectedData } = useLOIData();
  let navigate = useNavigate()

  let suitableName = {
    bulkPopUpUser:{
      current:"Course",
      color: "blue",
      header: "Bulk Assign",
      content:"Course will be assigned to all users uploaded from the document. Please double-check the data before proceeding with the Process",
      image:`${import.meta.env.VITE_APP_URL}popupContent1.png`,
      onClick:`${import.meta.env.VITE_APP_URL}createUser/assignCourse/bulkAssign`,
      subTitle: "Selected User",
      msg: isPreview?.msg ? isPreview.msg[0] : ""
    },
    deletePopUpUser:{
      current:"Module",
      color: "red",
      header: "Delete",
      content:"Are you sure you want to permanently delete this user from your assigned list? This action cannot be undone. The user’s course access and progress data will be lost. ",
      image:`${import.meta.env.VITE_APP_URL}deletePopUp.png`,
      onClick:"createModule",
      subTitle: "Selected User",
      msg: isPreview?.msg ? isPreview.msg[0] : ""
    },
    unAssignPopUp:{
      current:"Module",
      color: "blue",
      header: "Unassign",
      content:"Are you sure you want to unassign this user from Admin 1 assigned list? They will still have access to their courses and progress will be retained",
      image:`${import.meta.env.VITE_APP_URL}UnassignPopUp.png`,
      onClick:"createModule",
      subTitle: "Selected User",
      msg: isPreview?.msg ? isPreview.msg[0] : ""

    },
    UserCourseUnassign:{
      current:"Module",
      color: "red",
      header: "Unassign",
      content:"Are you sure you want to unassign this Course for this user ?",
      image:`${import.meta.env.VITE_APP_URL}UnassignPopUp.png`,
      onClick:"createModule",
      subTitle: "Selected Course",
      msg: isPreview?.msg ? isPreview.msg?.slice(0, 30)?.replaceAll(/[_-]/g, " ") + "..." : ""
    },
    UserModuleUnassign:{
      current:"Module",
      color: "red",
      header: "Unassign",
      content:"Are you sure you want to unassign this Module for this user ?",
      image:`${import.meta.env.VITE_APP_URL}UnassignPopUp.png`,
      onClick:"createModule",
      subTitle: "Selected Module",
      msg: isPreview?.msg ? isPreview.msg?.slice(0, 30)?.replaceAll(/[_-]/g, " ") + "..." : ""
    },
    UserScenarioUnassign:{
      current:"Module",
      color: "red",
      header: "Unassign",
      content:"Are you sure you want to unassign this Scenario for this user ?",
      image:`${import.meta.env.VITE_APP_URL}UnassignPopUp.png`,
      onClick:"createModule",
      subTitle: "Selected Scenario",
      msg: isPreview?.msg ? isPreview.msg?.slice(0, 30)?.replaceAll(/[_-]/g, " ") + "..." : ""
    },
    deleteAvatar:{
      color: "red",
      header: "Delete",
      content:"Are you sure you want to delete the avatar from this scenario ? This action cannot be undone.",
      image:`${import.meta.env.VITE_APP_URL}deletePopUp.png`,
      onClick:"createModule",
      subTitle: "Selected Avatar",
      msg: isPreview?.msg ? isPreview.msg[0] : ""
    },
  }

  // if(){
  //   return null;
  // }

  return (
    <div className={styles.bgContainer}>
    <div className={styles.bulkPopup}>
      <div
        className={styles.PopupHeader}
        onClick={() => {
          if (isPreview.resolve) isPreview.resolve(false);
          setIsPreview({ enable: false, msg: {}, value: "", resolve: null });
        }}
      >
        <div>
        <CloseRedIcon />
        </div>
      </div>
      <div className={styles.popUpImg}>
        <img src={suitableName[isPreview.value]?.image} alt="" />
      </div>

      <div className={styles.PopupContent}>
        <div className={styles[suitableName[isPreview.value]?.color]}>{suitableName[isPreview.value]?.header}</div>
        <p>
          {suitableName[isPreview.value]?.content}
        </p>
      </div>
      <div className={styles.PopupUser}>
        <div className={styles.leftContent}>
          <div>{suitableName[isPreview.value]?.subTitle} :</div>
          <p className={styles.Count}>{suitableName[isPreview.value]?.msg}</p>
        </div>
        <div className={styles.rightContent}>
          <UsersIcon />
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button
          className={styles.cancelButton}
          onClick={() => {
            if (isPreview.resolve) isPreview.resolve(false);
            setIsPreview({ enable: false, msg: {}, value: "", resolve: null });
          }}
        >
          Cancel
        </button>
        <button
          className={styles.submitButton}
          onClick={() => {
            if (isPreview.resolve) isPreview.resolve(true);
            setIsPreview({ enable: false, msg: {}, value: "", resolve: null });
          }}
        >
          Confirm
        </button>
      </div>
    </div>
    </div>
  );
}

export default ConfirmationPopUp;
