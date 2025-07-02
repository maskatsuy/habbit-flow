import { memo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import type {
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ClickableHabitNode from '../nodes/ClickableHabitNode';
import TriggerNode from '../nodes/TriggerNode';
import ConditionalNode from '../nodes/ConditionalNode';
import AnimatedHabitEdge from '../edges/AnimatedHabitEdge';
import { FlowProvider } from '../../contexts/FlowContext';
import type { FlowNode, FlowEdge } from '../../types';

const nodeTypes = {
  habit: ClickableHabitNode,
  trigger: TriggerNode,
  conditional: ConditionalNode,
};

const edgeTypes = {
  habit: AnimatedHabitEdge,
};

interface HabitFlowCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: NodeMouseHandler;
}

const HabitFlowCanvas = memo(({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
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
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </FlowProvider>
  );
});

HabitFlowCanvas.displayName = 'HabitFlowCanvas';

export default HabitFlowCanvas;