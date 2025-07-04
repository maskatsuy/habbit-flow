import { memo } from 'react'
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow'
import type {
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  NodeMouseHandler,
  Connection,
  NodeTypes,
  EdgeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { FlowProvider } from '../../contexts/FlowContext'
import type { FlowNode, FlowEdge } from '../../types'

interface HabitFlowCanvasProps {
  nodes: FlowNode[]
  edges: FlowEdge[]
  nodeTypes?: NodeTypes
  edgeTypes?: EdgeTypes
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onNodeClick: NodeMouseHandler
  isValidConnection?: (connection: Connection) => boolean
}

const HabitFlowCanvas = memo(
  ({
    nodes,
    edges,
    nodeTypes: customNodeTypes,
    edgeTypes: customEdgeTypes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick: _onNodeClick,
    isValidConnection,
  }: HabitFlowCanvasProps) => {
    return (
      <FlowProvider edges={edges}>
        <div className="w-full h-[600px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={customNodeTypes}
            edgeTypes={customEdgeTypes}
            isValidConnection={isValidConnection}
            fitView
            selectNodesOnDrag={false}
            multiSelectionKeyCode={null}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      </FlowProvider>
    )
  },
)

HabitFlowCanvas.displayName = 'HabitFlowCanvas'

export default HabitFlowCanvas
