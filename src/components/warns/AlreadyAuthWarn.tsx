import { useEffect, useState } from "react"

import { DarkWrapper } from "../DarkWrapper"
import { IoIosWarning } from "react-icons/io"
import { Link } from "react-router-dom"
import { getTokenRemainingSeconds } from "@/utils/authutils"
import { formatTimeSeconds } from "@/utils/utils"
import { createPortal } from "react-dom"

import styles from "./AlreadyAuthWarn.module.css"

type AlreadyAuthWarnProps = {
  setShowWarn: (isLoggedIn: boolean) => void
}

export function AlreadyAuthWarn({ setShowWarn }: AlreadyAuthWarnProps): React.ReactPortal {
  const getTokenTime = () => {
    const idToken = localStorage.getItem('id_token')
    return !idToken ? 0 : getTokenRemainingSeconds(idToken)
  }
  const [remainingSeconds, setRemainingSeconds] = useState(getTokenTime)

  useEffect(() => {
    if (remainingSeconds <= 0) return

    const intervalId = setInterval(() => {
      setRemainingSeconds(prev => prev - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [remainingSeconds])

  const handleConfirmClick = () => setShowWarn(false)
  const prettyRemain = formatTimeSeconds(remainingSeconds)

  return createPortal(
    <DarkWrapper>
      <div className={styles.container}>
        <div className={styles.warningTitle}>
          <IoIosWarning className={styles.warnIcon} />
          Sessão já existente
        </div>

        <div className={styles.warnMessageBox}>
          <span>
            Você já está logado neste site, deseja mesmo prosseguir?
            <br />
            <span className={styles.disclaimer}>Nada será perdido, só não tem necessidade :D</span>
          </span>
          <span>Esta sessão ainda tem uma duração de <span className={styles.remainSession}>{prettyRemain}</span>.</span>
        </div>
        <div className={styles.division}></div>
        <div className={styles.warnFooter}>
          <div className={`${styles.loginButton} ${styles.button}`} onClick={handleConfirmClick}>Continuar Login</div>
          <Link className={`${styles.dropLoginButton} ${styles.button}`} to="/">Voltar ao Menu</Link>
        </div>
      </div>
    </DarkWrapper>,
    document.body
  )
}