import { Handle, Position, type NodeProps } from "reactflow"

import clsx from "clsx"

import styles from "./Nodes.module.css"

type ResultNodeProps = {
  label: string
  formula?: string
  value: string | number | null
  highlight?: boolean
}

export function ResultNode({ data, isConnectable, selected }: NodeProps<ResultNodeProps>) {
  return (
    <div className={clsx(styles.nodeBox, styles.resultNode, selected && styles.selected, data.highlight && styles.highlightNode)}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

      <div className={styles.nodeLabel}>{data.label}</div>
      {data.formula && <div className={styles.nodeFormula}>{data.formula}</div>}
      <div className={styles.nodeValue}>
        {data.value !== null ? data.value : '...'}
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  )
}