import type { Edge } from "reactflow"

// We use type: 'default' for nice Bezier curves (rounded) instead of 'smoothstep' (squared)
export const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'n-input-prize',
    target: 'n-calc-div',
    type: 'default',
    animated: false,
    style: { stroke: '#786985', strokeWidth: 2 }
  },
  {
    id: 'e2',
    source: 'n-input-size',
    target: 'n-calc-div',
    type: 'default',
    animated: false,
    style: { stroke: '#786985', strokeWidth: 2 }
  },
  {
    id: 'e3',
    source: 'n-calc-div',
    target: 'n-calc-decimal',
    type: 'default',
    animated: false,
    style: { stroke: '#786985', strokeWidth: 2 }
  },
  {
    id: 'e4',
    source: 'n-calc-decimal',
    target: 'n-calc-mult',
    type: 'default',
    animated: false,
    style: { stroke: '#786985', strokeWidth: 2 }
  },
  {
    id: 'e5',
    source: 'n-calc-mult',
    target: 'n-result-final',
    type: 'default',
    animated: false,
    style: { stroke: '#786985', strokeWidth: 2 }
  }
]