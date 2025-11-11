import React, { useState } from 'react'
import PersonaCreation from './PersonaCreation/PersonaCreation'
import PersonaBuilder from './PersonaBuilder/PersonaBuilder'

function PersonaPage({setEditPage, setBack}) {
  //setEditPage, setBack is only for editing the persona from courseManagement
    let [currentPage,setCurrentPage] = useState("Persona Creation")
  return (
    <>
        {currentPage=="Persona Creation" && <PersonaCreation currentPage={currentPage} setCurrentPage={()=>{setCurrentPage("Persona Builder")}} setEditPage={setEditPage} setBack={setBack} />}
        {currentPage=="Persona Builder"&& <PersonaBuilder currentPage={currentPage} setCurrentPage={()=>{setCurrentPage("Persona Creation")}}/>}
        
    </>
  )
}

export default PersonaPage