import React, { useEffect, useState } from 'react'
import SupportDocument from './SupportDocument';
import EditBase from './EditBase';
import AvatarCreation from '../../AvatarCreation/AvatarCreation';
import EditDocument from '../../Course/AIScenario/EditDocument/EditDocument';
import PersonaCreation from '../../PersonaPage/PersonaCreation/PersonaCreation';

function EditScenario({setCurrentPage,courseDetail,page}) {
    const [EditPage, setEditPage] = useState(page);


  return (
    <>
    {/* THIS IS USED TO EDIT BASE DOCUMENT DATA */}
    {EditPage == "baseDocument" && <EditDocument setEditPage={(item)=>{setEditPage(item)}} setCurrentPage={()=>{setCurrentPage("showAvatarInteraction")}}/>}
    
    {/* THIS IS USED TO EDIT SUPPORT DOCUMENT */}
    {EditPage == "suportDocument" && <SupportDocument setEditPage={()=>{setEditPage("baseDocument")}} setCurrentPage={()=>{setCurrentPage("showAvatarInteraction")}}/>}
    
    {/* THIS IS USED TO EDIT SCENARIO DETAIL */}
    {EditPage == "editBaseDetail" && <EditBase setEditPage={()=>{setCurrentPage("showAvatarInteraction")}} courseDetail={courseDetail}/>}
    
    {/* THIS IS USED TO CREATE PERSONA */}
    {EditPage == "personaPopUp" && <PersonaCreation setBack={()=>{setCurrentPage("showAvatarInteraction")}} setEditPage={()=>{setEditPage("ShowAvatarCreation")}}/>}
    
    {/* THIS IS USED TO CREATE AVATAR  */}
    {EditPage == "ShowAvatarCreation" &&<AvatarCreation setEditPage={()=>{setCurrentPage("showAvatarInteraction")}}/>}
    </>
  )
}

export default EditScenario