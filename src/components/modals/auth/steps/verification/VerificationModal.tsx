import { useEffect, useRef, useState, type JSX } from "react"

import RequiredHint from "../../../../hints/RequiredHint"
import { isOnlyDigit } from "../../../../../utils/utils"

import styles from "./VerificationModal.module.css"

type VerificationModalProps = {
  email: string
}

export function VerificationModal({ email }: VerificationModalProps): JSX.Element {
  const [code, setCode] = useState('')
  const codeInRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    codeInRef?.current?.focus()
  }, [])

  const codeTypeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim()
    if (val.length > 6) return

    if (val === '' || isOnlyDigit(val)) {
      setCode(val)
    }
  }

  const verifyHandler = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className={styles.modalWrapper}>
      <header className={styles.verifyHeader}>
        <h2 className={styles.verifyTitle}>Verificação de Email</h2>
        <p className={styles.verifySubtitle}>Insira o código de verificação que foi enviado para o seu email.</p>
      </header>
      <div className={styles.division}></div>
      <form className={styles.verifyForm} onSubmit={verifyHandler}>
        <div className={styles.verifyFormControl}>
          <label className={styles.verifyFormLabel} htmlFor="email-input">Email<RequiredHint /></label>
          <input disabled className={styles.verifyFormInput} id="email-input" type="email" value={email} />
        </div>
        <div className={styles.verifyFormControl}>
          <label className={styles.verifyFormLabel} htmlFor="code-input">Código<RequiredHint /></label>
          <input className={styles.verifyFormInput} ref={codeInRef} id="code-input" type="text" onChange={codeTypeHandler} value={code} />
        </div>
        <footer className={styles.verifyFooter}>
          <button className={styles.verifyConfirm}>Verificar</button>
        </footer>
      </form>
    </div>
  )
}