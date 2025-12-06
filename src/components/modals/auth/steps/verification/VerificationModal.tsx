import { useEffect, useRef, useState, type JSX } from "react"

import RequiredHint from "@/components/hints/RequiredHint"

import { isOnlyDigit } from "@/utils/utils"
import { useNavigate } from "react-router-dom"
import { useAsync } from "@/hooks/useAsync"
import { userService } from "@/services/userService"

import authStyles from "../../AuthModal.module.css"
import styles from "./VerificationModal.module.css"

type VerificationModalProps = {
  email: string
}

export function VerificationModal({ email }: VerificationModalProps): JSX.Element {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [verify, isLoading] = useAsync(userService.verifyEmail)
  const codeInRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    codeInRef?.current?.focus()
  }, [])

  const codeTypeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim()
    if (val.length < 6 || isOnlyDigit(val)) {
      setCode(val)
    }
  }

  // We are not using React Hook form here, I mean, its just 1 field XD
  const verifyHandler = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await verify({ code: code, email: email })

    console.log('Hit')
    if (!response.success) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [_, messages] of Object.entries(response.errors)) {
        setError(messages.join(", "))
      }
      console.log('Got an error')
      return
    }
    console.log('Trying to redirect')
    navigate('/login')
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
          {error && (
            <span className={authStyles.authInputError}>{error}</span>
          )}
        </div>
        <footer className={styles.verifyFooter}>
          <button disabled={isLoading} className={authStyles.submitButton} type="submit">
            Verificar
            {isLoading && (
              <div className={authStyles.loaderContainer}>
                <div className={`loader ${authStyles.loader}`}></div>
              </div>
            )}
          </button>
        </footer>
      </form>
    </div>
  )
}