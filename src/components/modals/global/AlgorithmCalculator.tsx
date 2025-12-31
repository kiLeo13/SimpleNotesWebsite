import type { JSX } from "react"

import { IoMdClose } from "react-icons/io"

import styles from "./AlgorithmCalculator.module.css"

type AlgorithmCalculatorProps = {
  setShowAlgoCalc: (show: boolean) => void
}

export function AlgorithmCalculator({ setShowAlgoCalc }: AlgorithmCalculatorProps): JSX.Element {

  const handleCloseModal = () => {
    setShowAlgoCalc(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.close} onClick={handleCloseModal}>
        <IoMdClose color="rgba(94, 76, 121, 1)" size={"3.3vh"} />
      </div>
    </div>
  )
}