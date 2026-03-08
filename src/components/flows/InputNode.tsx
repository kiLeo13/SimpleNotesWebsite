import { Handle, Position, type NodeProps } from "reactflow"

import clsx from "clsx"

import { useTranslation } from "react-i18next"

import styles from "./Nodes.module.css"

type InputNodeProps = {
  label: string
  value: number | ""
  onChange: (value: number | "") => void
  isError?: boolean
}

export function InputNode({
  data,
  isConnectable,
  selected
}: NodeProps<InputNodeProps>) {
  const { t } = useTranslation()

  return (
    <div
      className={clsx(
        styles.nodeBox,
        styles.inputNode,
        selected && styles.selected
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ opacity: 0 }}
      />

      <div className={styles.nodeLabel}>{data.label}</div>
      <input
        type="number"
        className={clsx(styles.nodeInput, "nopan", "nodrag")}
        value={data.value}
        name="algoInputNode"
        onChange={(evt) =>
          data.onChange(evt.target.value === "" ? "" : Number(evt.target.value))
        }
        placeholder={t("placeholders.typeHere")}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  )
}
