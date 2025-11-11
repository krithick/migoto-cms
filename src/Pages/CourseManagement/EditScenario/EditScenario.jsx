import React, { useEffect, useState } from 'react'
import SupportDocument from './SupportDocument';
import EditBase from './EditBase';
import AvatarCreation from '../../AvatarCreation/AvatarCreation';
import { useLOIData, usePreviewStore } from '../../../store';
import EditDocument from '../../Course/AIScenario/EditDocument/EditDocument';
import PersonaCreation from '../../PersonaPage/PersonaCreation/PersonaCreation';

function EditScenario({setCurrentPage,courseDetail,page}) {
    const [EditPage, setEditPage] = useState(page);
  const {isPreview, setIsPreview} = usePreviewStore();
  const { selectedData, setSelectedData } = useLOIData();

    // useEffect(()=>{
    //     if(EditPage=="personaPopUp"){
    //       let prompt = new Promise((resolve)=>{setIsPreview({enable:true,msg:[],value:"PersonaPrompt",resolve})})
    //       prompt.then((result)=>{
    //         if(result){
    //           setSelectedData("personaCreated",1)
    //           setSelectedData("PersonaSelection",null)
    //           let modify = new Promise((resolve)=>{
    //             setIsPreview({enable:true,msg:result,value:"PersonaPopUp",resolve})})
    //           modify.then((result2)=>{
    //             if(!result2){
    //               setCurrentPage("showAvatarInteraction")    
    //             }else{
    //               setEditPage("ShowAvatarCreation")
    //             }
    //           })  
    //         }else{
    //           setCurrentPage("showAvatarInteraction")
    //         }
    //       })
    //       }
    // },[page])

  return (
    <>
    {EditPage == "baseDocument" && <EditDocument setEditPage={(item)=>{setEditPage(item)}} setCurrentPage={()=>{setCurrentPage("showAvatarInteraction")}}/>}
    {EditPage == "suportDocument" && <SupportDocument setEditPage={()=>{setEditPage("baseDocument")}} setCurrentPage={()=>{setCurrentPage("showAvatarInteraction")}}/>}
    {EditPage == "editBaseDetail" && <EditBase setEditPage={()=>{setCurrentPage("showAvatarInteraction")}} courseDetail={courseDetail}/>}
    {EditPage == "personaPopUp" && <PersonaCreation setBack={()=>{setCurrentPage("showAvatarInteraction")}} setEditPage={()=>{setEditPage("ShowAvatarCreation")}}/>}
    {EditPage == "ShowAvatarCreation" &&<AvatarCreation setEditPage={()=>{setCurrentPage("showAvatarInteraction")}}/>}
    </>
  )
}

export default EditScenario