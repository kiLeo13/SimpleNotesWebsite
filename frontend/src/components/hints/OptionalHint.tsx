import { useTranslation } from "react-i18next"

import styles from "./HintStyles.module.css"

const OptionalHint = () => {
  const { t } = useTranslation()

  return <span className={styles.optionalHint}>({t("createNoteModal.hints.opt")})</span>
}

export default OptionalHint
