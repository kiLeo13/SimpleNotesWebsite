import { Handle, Position, type NodeProps } from "reactflow"

import clsx from "clsx"

import styles from "./Nodes.module.css"

type InputNodeProps = {
  label: string
  value: number | ''
  onChange: (value: number | '') => void
  isError?: boolean
}

export function InputNode({ data, isConnectable, selected }: NodeProps<InputNodeProps>) {
  return (
    <div className={clsx(styles.nodeBox, styles.inputNode, selected && styles.selected)}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ opacity: 0 }} />

      <div className={styles.nodeLabel}>{data.label}</div>
      <input
        type="number"
        className={styles.nodeInput}
        value={data.value}
        onChange={(evt) => data.onChange(evt.target.value === '' ? '' : Number(evt.target.value))}
        placeholder="Digite aqui..."
      />

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  )
}