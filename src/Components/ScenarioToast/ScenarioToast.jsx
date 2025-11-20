import React, { useEffect, useState } from 'react'
import styles from './ScenarioToast.module.css'
import { usePreviewStore } from '../../store'
import axios from '../../service'

function ScenarioToast() {
  const { isPreview, setIsPreview } = usePreviewStore()
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (isPreview.enable && isPreview.value === "scenarioToast" && isPreview.msg) {
      setProgress(0)
      setIsCompleted(false)
      
      const makeApiCall = async () => {
        try {
          const res = await axios.get(isPreview?.msg?.url, {loaderType: isPreview?.msg?.loader})
          console.log("----> completed");
          
          setProgress(100)
          setIsCompleted(true)
          
          setTimeout(() => {
            if (isPreview?.resolve) {
              isPreview?.resolve(res.data)
            }
            setIsPreview({ enable: false, msg: "", value: "", resolve: null })
          }, 1000)
        } catch (error) {
          setIsCompleted(true)
          setTimeout(() => {
            if (isPreview?.resolve) {
              isPreview?.resolve(false)
            }
            setIsPreview({ enable: false, msg: "", value: "", resolve: null })
          }, 1000)
        }
      }

      // Simulate progress during API call
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95
          return prev + Math.random() * 8
        })
      }, 1000)

      makeApiCall().finally(() => {
        clearInterval(progressInterval)
      })

      return () => clearInterval(progressInterval)
    }
  }, [isPreview.enable, isPreview.value, isPreview.msg])

  if (!isPreview.enable || isPreview.value !== "scenarioToast") {
    return null
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.toast}>
        <div className={styles.header}>
          <h3>{isCompleted ? "✅ Scenario Created Successfully" : "⏳ Scenario is being generated"}</h3>
        </div>
        
        <div className={styles.content}>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {/* <span className={styles.progressText}>{Math.round(progress)}%</span> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScenarioToast