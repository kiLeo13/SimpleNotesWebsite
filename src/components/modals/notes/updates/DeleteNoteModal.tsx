import { useState, type ChangeEvent, type JSX } from "react"
import type { FullNoteResponseData } from "@/types/api/notes"

import { IoIosWarning } from "react-icons/io"
import { BaseModalTextInput } from "../shared/inputs/BaseModalTextInput"
import { LoaderContainer } from "@/components/LoaderContainer"
import { useNoteStore } from "@/stores/useNotesStore"

import styles from "./DeleteNoteModal.module.css"

type DeleteNoteModalProps = {
  note: FullNoteResponseData
  setShowDelete: (show: boolean) => void
  setIsPatching: (flag: boolean) => void
}

export function DeleteNoteModal({ note, setShowDelete, setIsPatching }: DeleteNoteModalProps): JSX.Element {
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const deleteNoteAndRefresh = useNoteStore((state) => state.deleteNoteAndRefresh)
  const answerMatches = answer == note.name
  const canConfirm = answerMatches && !isLoading

  const handleAnswer = (e: ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value)
  }

  const handleClose = () => setShowDelete(false)

  const handleDeletion = async () => {
    setIsLoading(true)
    const success = await deleteNoteAndRefresh(note.id)
    setIsLoading(false)

    if (success) {
      setShowDelete(false)
      setIsPatching(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <IoIosWarning size={"1.6em"} color="#ff6161ff" />
        <h2 className={styles.title}>{`Apagar Nota #${note.id}?`}</h2>
      </div>
      <div className={styles.body}>
        <span className={styles.question}>
          Você tem certeza que deseja excluir esta nota?
          Esta decisão é <b><u>irreversível</u></b>.
        </span>

        <span className={styles.prompt}>
          {`Digite o nome da nota "${note.name}" para excluir.`}
        </span>
        <BaseModalTextInput value={answer} onChange={handleAnswer} />

        <div className={styles.footer}>
          <button className={styles.cancel} onClick={handleClose}>Cancelar</button>
          <button className={styles.confirm} disabled={!canConfirm} onClick={handleDeletion}>
            Excluir
            {isLoading && <LoaderContainer scale="0.7" />}
          </button>
        </div>
      </div>
    </div>
  )
}