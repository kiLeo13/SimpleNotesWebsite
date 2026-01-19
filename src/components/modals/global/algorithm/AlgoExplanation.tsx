import type { JSX } from "react"

import clsx from "clsx"

import { MarkdownDisplay } from "@/components/displays/markdowns/MarkdownDisplay"
import { IoWarning } from "react-icons/io5"
import { BsFillInfoCircleFill } from "react-icons/bs"
import { useTranslation } from "react-i18next"

import styles from "./AlgoExplanation.module.css"

export function AlgoExplanation(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.explanation}>
      <h2 className={styles.title}>
        {t('modals.algoCalc.expl.title')}
      </h2>

      <div className={styles.division} />

      <div className={styles.contents}>
        <p className={styles.intro}>
          {t('modals.algoCalc.expl.intro')}
        </p>
        <ul className={styles.stepList}>
          <li>{t('modals.algoCalc.expl.step1')}</li>
          <li>{t('modals.algoCalc.expl.step2')}</li>
          <li>{t('modals.algoCalc.expl.step3')}</li>
          <li>{t('modals.algoCalc.expl.roundingNote')}</li>
        </ul>
      </div>

      <div className={clsx(styles.commonWarn, styles.important)}>
        <p className={clsx(styles.commonTitle, styles.importantTitle)}>
          <IoWarning size={"1.2em"} />
          {t('modals.algoCalc.expl.importantNoteTitle')}
        </p>
        <p className={styles.explCommonBody}>
          {t('modals.algoCalc.expl.importantNoteBody')}
        </p>
      </div>
      <div className={clsx(styles.commonWarn, styles.reference)}>
        <p className={clsx(styles.commonTitle, styles.referenceTitle)}>
          <BsFillInfoCircleFill size={"1.1em"} />
          {t('modals.algoCalc.expl.referencesTitle')}
        </p>
        <div className={styles.explCommonBody}>
          <MarkdownDisplay content={t('modals.algoCalc.expl.referencesBody')} />
        </div>
      </div>
    </div>
  )
}