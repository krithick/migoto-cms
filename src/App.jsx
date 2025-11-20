import {Suspense } from "react";
import React from "react";
import "./App.css";
import Background from "./Pages/Background/Background";
import Sidebar from "./Pages/Sidebar/Sidebar";
import HeroPage from "./Pages/HeroPage/HeroPage";
import { usePreviewStore, useUserPopupStore } from "./store";
import Message from "./Utils/Message/Message";
import MigotoLoader from "./Components/Loader/MigotoLoader";
import PersonaEditorPopUp from "./Components/PopUps/PersonaEditorPopUp";
import NotFound from "./Utils/NotFound/NotFound";
import UserSelect from "./Pages/User/UserSelect/UserSelect";
import ReportCard from "./Components/Report/ReportCard";
import ScenarioToast from "./Components/ScenarioToast/ScenarioToast";

const PersonaPromptPopUp = React.lazy(() =>import("./Components/PopUps/PersonaPromptPopUp"));
const ConfirmationPopUp = React.lazy(() =>import("./Components/PopUps/ConfirmationPopUp"));
const ALVEPopUp = React.lazy(() =>import("./Components/AssignALVEPopup/ALVEPopUp"));
const OkCancelPopUp = React.lazy(() => import("./Components/PopUps/OkCancelPopUp"));

function App() {
  const { isPreview, setIsPreview } = usePreviewStore();
  const { message, setMessage } = useUserPopupStore();

  return (
    <>
      <Suspense fallback={""}>
        {isPreview.enable && isPreview.value == "NotFound" && <NotFound />}
        {isPreview.enable && isPreview.value == "PersonaPrompt" && (<PersonaPromptPopUp />)} {/* this popUp is used for persona generation before asking Prompt */}
        {isPreview.enable && isPreview.value == "userListPopUp" && (<UserSelect />)} {/* this popUp is used for User selection before asigning course to user for dasboard create Course button */}
        {isPreview.enable && isPreview.value == "UserReport" && <ReportCard />} {/* this popUp is used for User report of certain scenario in userManagement*/}
        {isPreview.enable &&isPreview.msg &&isPreview.value == "AvatarPopUp" && <PersonaEditorPopUp />} {/* this popUp is used for persona Editor in the course Management */}
        <ConfirmationPopUp /> {/* this popUp is used for conformation of delete, assign (User,Avatar) */}
        <ALVEPopUp /> {/* this popUp is used for scenario data to edit such as (lang,env,voice) in courseManagement */}
        <OkCancelPopUp /> {/* this popUp is used for Confirmation while Navigating back */}
        {/* <AILoader /> */}
        <MigotoLoader /> {/* this is Loader */}
        <Background /> 
        <Sidebar />
        <div className="mainContainer">
          <HeroPage />
        </div>
        {/* {isPreview.enable && isPreview.msg && isPreview.value=="AvatarPopUp"&&
          <div className="PopUpContainer">
            <AvatarPreview />
            <div className="bgDark"></div>
            </div>
      } */}
        {message.enable && <Message />} {/* this popUp is used for showing response such as error msg or suceess msg */}
        <ScenarioToast /> {/* this toast is used for showing API progress during scenario generation */}
      </Suspense>
    </>
  );
}

export default App;
