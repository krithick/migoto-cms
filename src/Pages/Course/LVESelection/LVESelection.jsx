import React, { useEffect, useState } from "react";
import styles from '../LVESelection/LVESelection.module.css';
import { useNavigate } from "react-router-dom";
import PersonaSelection from "../../AvatarCreation/PersonaSelection";
import Voice from "../../AvatarCreation/Voice";
import Environment from "../LVESelection/Environment";
import Language from "./Language";
import { useLangStore, useLOIData, useModeData, usePreviewStore, useUserPopupStore } from "../../../store";
import axios from '../../../service';
import LVEVoice from "./LVEVoice";
import { clearAllData, clearScenarioData, getSessionStorage, setSessionStorage } from "../../../sessionHelper";


function LVESelection({}) {
  const { message, setMessage } = useUserPopupStore();
  const { selectedData, setSelectedData } = useLOIData();
  let {userPopup,setUserPopup} = useUserPopupStore()
  let [activeState, setActiveState] = useState("Language");
  let [datas, setDatas] = useState([]);
  let [data, setData] = useState(datas);
  let [overallData, setOverallData] = useState([]);
  let [voiceData, setVoiceData] = useState([])
  let [languageData, setLanguageData] = useState([])
  let [environmentData, setEnvironmentData] = useState([])
  let navigate = useNavigate()
  let flow = localStorage.getItem("flow")
  const { localLang, setLocalLang } = useLangStore();
  const { isPreview, setIsPreview } = usePreviewStore();

  function filterVoicesByAllowedLanguages(voices, allowedLanguages) {
    return voices.filter(voice => allowedLanguages?.includes(voice.language_code));
  }
  
    const fetchLanguage = () => {
    axios
    .get(`/languages/`)
    .then((res) => {
      setLanguageData(res.data,"languages")
      setSelectedData("Language",[res.data[0].code]);
      setLocalLang([res.data[0].id])
    })
    .catch((err) => {
      console.log("err: ", err);
    });
    axios
    .get(`/environments/`)
    .then((res) => {
      setEnvironmentData(res.data,"environments")
      setSelectedData("Environment",res.data.map((item)=>item.id));

    })
    .catch((err) => {
      console.log("err: ", err);
    });

    }

    const fetchVoice = () => {
      axios
      .get(`/bot-voices/`)
      .then((res) => {
        const allowedLanguages = selectedData["Language"]; // An array of allowed language codes
        const filteredVoices = filterVoicesByAllowedLanguages(res.data, allowedLanguages);    
        setVoiceData(filteredVoices);
        setSelectedData("Voice",filteredVoices.map((item)=>item.id));
      })
      .catch((err) => {
        console.log("err:", err);
      });

    }    

    useEffect(()=>{
      if(selectedData["Language"]?.length>0){
        fetchVoice()
      }else{
        setSelectedData("Voice",[])
      }
    },[selectedData["Language"]])

    useEffect(()=>{
        fetchLanguage()
    },[])

    const createModePayloads = (basePayload) => {
    const modes = ["learn_mode", "try_mode", "assess_mode"];
    return modes.map((mode) => ({
    ...basePayload,
    mode,
    }));
    };
        
    const handleAssignCourseToUser = async(id,userId) => {

      let finalUserIds;
      if(userId && userId?.length>0) {
        finalUserIds = userId; 
      }else{
        finalUserIds = getSessionStorage("createdUser");
      }

      if (!finalUserIds || finalUserIds?.length === 0) {
        setMessage({
          enable: true,
          msg: "No users selected",
          state: false,
        });
        return;
      }
    
      const courseId = selectedData["courseId"]?selectedData["courseId"]:sessionStorage.getItem("courseId");
      const moduleId = selectedData["moduleId"]?selectedData["moduleId"]:sessionStorage.getItem("moduleId");
      const scenarioId = id;
    
      const getEnabledModes = () => {
        const modes = [];

        modes.push("learn_mode");
        modes.push("try_mode");
        modes.push("assess_mode");

        return modes;
      };

      const payload = {
        user_ids: finalUserIds,
        include_all_modules: false,
        include_all_scenarios: false,
        module_ids: [moduleId],
        scenario_mapping: {
          [moduleId]: [id]
        },
        mode_mapping: {
          [id]: getEnabledModes()
        }
      };

      try {
        const response = await axios.post(
          `/course-assignments/course/${courseId}/assign-with-content`,
          payload
        );
        setMessage({
          enable: true,
          msg: "Course Assigned Successfully",
          state: true,
        })
        localStorage.setItem("currentPathLocation", "Dashboard");
        setSelectedData("createdUser",null)
        navigate(`${import.meta.env.VITE_APP_URL}dashboard`);
        // window.location.reload()
      } catch (error) {
        console.error("Assignment failed:", error.response?.data || error.message);
        setMessage({
          enable: true,
          msg: "Assigning Course Failed",
          state: false,
        })
      }
    }

    const getLearnPrompt = async() => {

      if(!getSessionStorage('template_id') || getSessionStorage('selectedPersona')?.length==0){
        setMessage({
          enable: true,
          msg: "Missing TemplateID or PersonaID.",
          state: false,
        });
        return null
      }
       let learnpayload={
        template_id: getSessionStorage('template_id'),
        persona_ids: getSessionStorage('selectedPersona')
    }
    console.log('learnpayload: ', learnpayload);

    // return
      try {
        const res = await axios.post("/scenario/v2/generate-final-prompts", learnpayload)

        return res?.data;

      } catch (err) {
        setMessage({
          enable: true,
          msg: "Generating Prompt Failed",
          state: false,
        });
    }
  }

    const handleAssignCourse = async (userId) => {
      
      if(!isValid){
        setMessage({
          enable: true,
          msg: "Kindly Provide Valid data of Language and Environment",
          state: false,
        })
        return
      }

      let learn_prompt = await getLearnPrompt()

      setIsPreview({
        enable: true,
        msg: {"url":learn_prompt?.sse_endpoint,"loader":"none"},
        value: "scenarioToast",
      });

     
      // return
      // if(learn_prompt){
      //   setMessage({
      //     enable: true,
      //     msg: "System Prompt is missing",
      //     state: false,
      //   })
      //   return
      // }

        let payloads = [];
          // Scenario title exists, create mode-specific payloads          
          const base = {
            avatars: getSessionStorage("avatarSelection"),
            languages: localLang,
            bot_voices: selectedData["Voice"],
            environments: selectedData["Environment"],
            layout: getSessionStorage("Layout")?getSessionStorage("Layout"):1,
            assigned_documents: Array.isArray(getSessionStorage("Document")) 
            ? getSessionStorage("Document") 
            : [],
          
          assigned_videos: Array.isArray(getSessionStorage("Video")) 
            ? getSessionStorage("Video") 
            : [],
                      content: {}
          };

          const learnPayload = {
            ...base,
            bot_role: "trainer",
            bot_role_alt: "employee",
            system_prompt: learn_prompt?.learn_prompt,
            mode: "learn_mode",

          };
      
          const tryPayload = {
            ...base,
            bot_role: "employee",
            bot_role_alt: "evaluatee",
            system_prompt: getSessionStorage("scenarioResponse")?.try_mode||null,
            mode: "try_mode",
          };
      
          const assessPayload = {
            ...base,
            bot_role: "employee",
            bot_role_alt: "evaluatee",
            system_prompt: getSessionStorage("scenarioResponse")?.assess_mode||null,
            mode: "assess_mode",
          };
      
          payloads = [learnPayload, tryPayload, assessPayload];
        
        const collectedIds = [];

        const tempSelectedData = {
            scenarioData: selectedData["scenarioData"],
            "moduleId": getSessionStorage("moduleId")
          };

        for (const payload of payloads) {
          try {
            const res = await axios.post("/avatar-interactions/", payload)
            const id = res.data.id;

            // Store each interaction id under appropriate mode key
            if (payload.mode) {
                tempSelectedData[`${payload.mode}Id`] = id;
                setSelectedData(
                  `${payload.mode}Id`, id
                );
              }

            collectedIds.push(id);
          } catch (err) {
            setMessage({
              enable: true,
              msg: "AvatarInteraction Creation Failed",
              state: false,
            });
      }
        }

        // Final scenario creation
        if (collectedIds.length == 3) {
          const finalPayload = {
            title: getSessionStorage("scenarioData")?.title,
            description: getSessionStorage("scenarioData")?.description,
            thumbnail_url: getSessionStorage("scenarioData")?.thumbnail_url,
            template_id:getSessionStorage("template_id"),
            learn_mode: {
              avatar_interaction: collectedIds[0]
            },
            try_mode: {
              avatar_interaction: collectedIds[1]
            },
            assess_mode: {
              avatar_interaction: collectedIds[2]
            }
          };

          try {
            const scenarioRes = await axios.post(`modules/${tempSelectedData["moduleId"]}/scenarios`, finalPayload)
              setMessage({
                enable: true,
                msg: "Scenario Created Successfully",
                state: true,
              })
              setSelectedData("scenarioId",scenarioRes.data?.id);
              setSelectedData("showCourse",null)
              setSelectedData("showModule",null)
              setSelectedData("showScenario",null)
              setSelectedData("courseId",null)
              setSelectedData("moduleId",null)
              if(flow == "Create Course flow" || flow == "Create User and Course flow"){
                 handleAssignCourseToUser(scenarioRes.data.id, userId)
              }
              if(flow == "CourseManagement flow"){ // courseManagement Flow
                navigate(`${import.meta.env.VITE_APP_URL}courseManagement`)
                console.log("scenario created");
                clearScenarioData()
                sessionStorage.removeItem("showCourse");
                sessionStorage.removeItem("showModule");
                sessionStorage.removeItem("showScenario");
          
              }
              clearAllData()
          } catch (err) {
            setMessage({
              enable: true,
              msg: "Scenario Creation Failed",
              state: false,
            })
          }
        }
        // if (flow === "Create Course flow") {
        //   navigate("users");
        // }
    };

    let isValid = (selectedData["Language"]?.length>0 && selectedData["Voice"]?.length>0 && selectedData["Environment"]?.length>0)

    const handlePopUp = () => {
      if(!isValid){
        setMessage({
          enable: true,
          msg: "Kindly Provide Valid data of Language and Environment",
          state: false,
        })
        return
      }
        let result = new Promise((resolve) => {
          setIsPreview({
            enable: true,
            msg: ``,
            value: "userListPopUp",
            resolve,
          });
        });
        result.then((res) => {
          let aRes = res
          if (!aRes || aRes === false) return;
          setSessionStorage("createdUser", aRes)
          setSelectedData("createdUser", aRes);
          // use res directly here instead of waiting for Zustand update
          handleAssignCourse(aRes);
        });
    } 

  return (
    <div className={styles.avatarContainer}>
      <div className={styles.avatarHeader1}>
        <div className={styles.avatarHeaderLeft}>
          <p>Avatar Details</p>
        </div>
      </div>
      {/* -------------------Body--------------- */}
      {/*  sidebar */}
      <div className={styles.OverallContainer}>
      <div className={styles.sideBar}>
        <div
          className={`${styles.unselected} ${
            activeState == "Language"|| activeState =="Language" ? styles.selected : ""
          }`}
          onClick={() => {
            setActiveState("Language");
          }}
        >
          Language
        </div>
        {/* <div
          className={`${styles.unselected} ${
            activeState == "Voice" ? styles.selected : ""
          }`}
          onClick={() => {
            setActiveState("Voice");
          }}
        >
          Voice
        </div> */}
        <div
          className={`${styles.unselected} ${
            activeState == "Environment" ? styles.selected : ""
          }`}
          onClick={() => {
            setActiveState("Environment");
          }}
        >
          Environment
        </div>
      </div>

    <div className={styles.ContainerContent}>
      {activeState == "Language" && <Language data={languageData}/>}
      {activeState == "Environment" && <Environment data={environmentData} />}
      {/* {activeState == "Voice" && <LVEVoice data={voiceData}/>} */}
    </div>
      </div>
      <div className={styles.BtnGroup}>
        {<button className={styles.nextBtn} onClick={()=>{navigate(-1)}}>Cancel</button>}
        {flow !="Create Course flow"&&<button className={styles.nextBtn} onClick={()=>{handleAssignCourse()}}>Assign Course</button>}
        {flow =="Create Course flow" && selectedData["createdUser"]?.length>0 &&<button className={styles.nextBtn} onClick={()=>{handleAssignCourse()}}>Assign Course to User</button>}
        {/* {!selectedData["createdUser"]?.length>0 &&<button className={styles.nextBtn} onClick={()=>{handlePopUp()}}>Select User</button>} */}
        {flow =="Create Course flow"&& !selectedData["createdUser"]?.length>0 &&<button className={styles.nextBtn} onClick={()=>{handlePopUp()}}>Select User</button>}
      </div>
    </div>
  );
}

export default LVESelection;
