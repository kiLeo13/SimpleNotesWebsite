import type { JSX } from "react"
import type { Node, NodeTypes } from "reactflow"

import ReactFlow, { Controls, Background, useNodesState, useEdgesState } from "reactflow"
import { IoMdClose } from "react-icons/io"
import { InputNode } from "@/components/flows/InputNode"
import { AlgoExplanation } from "./AlgoExplanation"
import { ResultNode } from "@/components/flows/ResultNote"
import { useState, useEffect } from "react"
import { getDecimalPart, truncateDecimals } from "@/utils/mathUtils"
import { useTranslation } from "react-i18next"
import { initialEdges } from "./flowData"

import styles from "./AlgorithmCalculator.module.css"

import "reactflow/dist/style.css"

type AlgorithmCalculatorProps = {
  setShowAlgoCalc: (show: boolean) => void
}

const nodeTypes: NodeTypes = {
  inputNode: InputNode,
  resultNode: ResultNode,
}

export function AlgorithmCalculator({ setShowAlgoCalc }: AlgorithmCalculatorProps): JSX.Element {
  const { t } = useTranslation()
  const handleCloseModal = () => setShowAlgoCalc(false)

  // State
  const [lotteryPrize, setLotteryPrize] = useState<number | ''>(20282)
  const [groupSize, setGroupSize] = useState<number | ''>(600)

  // React Flow Hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  // Calculation Logic
  useEffect(() => {
    let step1_div: number | null = null
    let step1_div_formatted: string | null = null
    let step2_decimal: number | null = null
    let step3_mult: number | null = null
    let step4_final: number | null = null

    if (typeof lotteryPrize === 'number' && typeof groupSize === 'number' && groupSize > 0) {
      step1_div = lotteryPrize / groupSize
      step1_div_formatted = truncateDecimals(step1_div, 6).toFixed(6).replace('.', ',')
      step2_decimal = getDecimalPart(step1_div)
      step3_mult = step2_decimal * groupSize
      step4_final = Math.round(step3_mult)
    }

    const newNodes: Node[] = [
      {
        id: 'n-input-prize',
        type: 'inputNode',
        position: { x: 250, y: 0 },
        data: {
          label: t('modals.algoCalc.nodes.lotteryPrize'),
          value: lotteryPrize,
          onChange: setLotteryPrize
        },
      },
      {
        id: 'n-input-size',
        type: 'inputNode',
        position: { x: 550, y: 0 },
        data: {
          label: t('modals.algoCalc.nodes.groupSize'),
          value: groupSize,
          onChange: setGroupSize
        },
      },
      {
        id: 'n-calc-div',
        type: 'resultNode',
        position: { x: 400, y: 150 },
        data: {
          label: t('modals.algoCalc.nodes.initialDiv'),
          formula: `${lotteryPrize || '?'} ÷ ${groupSize || '?'}`,
          value: step1_div_formatted,
        },
      },
      {
        id: 'n-calc-decimal',
        type: 'resultNode',
        position: { x: 400, y: 300 },
        data: {
          label: t('modals.algoCalc.nodes.isolatingDecimal'),
          formula: t('modals.algoCalc.nodes.discardInteger'),
          value: step2_decimal ? step2_decimal.toFixed(6).replace('.', ',') : null,
        },
      },
      {
        id: 'n-calc-mult',
        type: 'resultNode',
        position: { x: 400, y: 450 },
        data: {
          label: t('modals.algoCalc.nodes.groupMult'),
          formula: `${step2_decimal ? step2_decimal.toFixed(6).replace('.', ',') : '?'} x ${groupSize || '?'}`,
          value: step3_mult ? step3_mult.toFixed(6).replace('.', ',') : null,
        },
      },
      {
        id: 'n-result-final',
        type: 'resultNode',
        position: { x: 400, y: 600 },
        data: {
          label: t('modals.algoCalc.nodes.keyStone'),
          formula: t('modals.algoCalc.nodes.roundingRule'),
          value: step4_final,
          highlight: true
        }
      }
    ]

    setNodes(newNodes)
  }, [lotteryPrize, groupSize, setNodes, t])

  return (
    <div className={styles.container}>
      <div className={styles.close} onClick={handleCloseModal}>
        <IoMdClose color="#786985" size={"3.3vh"} />
      </div>

      <div className={styles.contents}>
        <div className={styles.calculator}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            nodesConnectable={false}
            nodesDraggable={false}
            zoomOnDoubleClick={false}
          >
            <Controls className={styles.customControls} showInteractive={false} />
            <Background color="#403a56" gap={24} size={1} />
          </ReactFlow>
        </div>

        <div className={styles.wall} />

        <AlgoExplanation />
      </div>
    </div>
  )
}