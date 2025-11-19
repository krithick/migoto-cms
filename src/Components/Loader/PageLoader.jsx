import React from 'react'
import styles from '../Loader/PageLoader.module.css'
import AIgradientIcon from '../../Icons/AIgradientIcon'
import AIicon from '../../Icons/AIicon'
function PageLoader() {
  return (
    <div className={styles.loadingPage}>
        <div className={styles.box}>
            <AIicon />
        </div>
    </div>
  )
}

export default PageLoader