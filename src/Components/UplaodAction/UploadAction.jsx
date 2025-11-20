import { useState } from 'react'
// import viteLogo from '/vite.svg'
import styles from '../UplaodAction/UploadAction.module.css'
import ManualIcon from '../../Icons/ManualIcon'
import BulkIcon from '../../Icons/BulkIcon'
import Bulk from './Upload/Bulk'
import Manual from './Upload/Manual'

export default function UplaodAction() {
  const [file, setFile] = useState("Manual Upload")
  const [formData, setFormData] = useState({
    username: "",
    emp_id: "",
    email: "",
    password: "",
    is_active: true,
    role: "user",
  })

  return (
    <>
    <div className={styles.actionBox}>
      <div className={styles.actionBoxHeader}>
        <div className={`${styles.uploadBox} ${file == "Manual Upload" && styles.uploadBoxActive}`} onClick={()=>setFile("Manual Upload")}>
          <ManualIcon props="#0085DB" className={`${file == "Manual Upload" && styles.uploadManualIconActive}`}/>
          <p>Manual Upload</p>
        </div>
        <div className={`${styles.uploadBox} ${file == "Bulk Upload" && styles.uploadBoxActive}`} onClick={()=>{setFile("Bulk Upload")}
        }>
          <BulkIcon className={`${file == "Bulk Upload" && styles.uploadBulkIconActive}`}/>
          <p>Bulk Upload</p>
        </div>
      </div>
      <div className={styles.actionBoxBody}>
        {file == "Bulk Upload" ? <Bulk /> : <Manual formData={formData} setFormData={setFormData} />}
      </div>
    </div>
    </>
  )
}


