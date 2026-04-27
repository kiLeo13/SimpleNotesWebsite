import type { ApiCallout, CalloutTone } from "./apiReferenceDocs"

import clsx from "clsx"

import { HiOutlineExclamationCircle } from "react-icons/hi"
import { BsPatchExclamationFill } from "react-icons/bs"
import { IoWarning } from "react-icons/io5"
import { renderInline } from "./ApiReferenceInline"

import styles from "./ApiReferenceCallout.module.css"

const calloutToneIcons: Record<CalloutTone, React.ReactNode> = {
  info: <HiOutlineExclamationCircle size={20} />,
  warning: <IoWarning size={20} />,
  danger: <BsPatchExclamationFill size={20} />
}

function calloutClass(tone: ApiCallout["tone"]) {
  if (tone === "danger") return styles.calloutDanger
  if (tone === "warning") return styles.calloutWarning
  return styles.calloutInfo
}

export function Callouts({ callouts }: { callouts?: ApiCallout[] }) {
  if (!callouts?.length) return null

  return (
    <>
      {callouts.map((callout, index) => (
        <aside key={index} className={clsx(styles.callout, calloutClass(callout.tone))}>
          <div>{calloutToneIcons[callout.tone]}</div>
          <p className={styles.text}>{renderInline(callout.text)}</p>
        </aside>
      ))}
    </>
  )
}
