import { useCallback } from 'react'
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Controls,
  Background,
} from 'reactflow'
import type { Node, Edge, Connection } from 'reactflow'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'トリガー: 朝起きる' },
    position: { x: 100, y: 150 },
    sourcePosition: 'right' as const,
  },
  {
    id: '2',
    type: 'default',
    data: { label: 'アクション: 水を飲む' },
    position: { x: 350, y: 150 },
    sourcePosition: 'right' as const,
    targetPosition: 'left' as const,
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'アクション: ストレッチする' },
    position: { x: 600, y: 150 },
    targetPosition: 'left' as const,
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
  },
]

export default function FlowDemo() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  return (
    <ReactFlowProvider>
      <div className="w-full h-[400px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  )
}
