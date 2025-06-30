import { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Connection,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { HabitNode, TriggerNode } from './nodes';
import { HabitEdge } from './edges';
import type { FlowNode, FlowEdge, HabitNode as HabitNodeType } from '../types';

// サンプルデータ
const initialNodes: FlowNode[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 50, y: 150 },
    data: {
      label: '朝7時',
      triggerType: 'time',
      icon: '⏰',
    },
  },
  {
    id: 'habit-1',
    type: 'habit',
    position: { x: 250, y: 150 },
    data: {
      habitId: 'habit-1',
      label: '水を飲む',
      icon: '💧',
      isCompleted: false,
      completedAt: null,
    },
  } as HabitNodeType,
  {
    id: 'habit-2',
    type: 'habit',
    position: { x: 450, y: 150 },
    data: {
      habitId: 'habit-2',
      label: 'ストレッチ',
      icon: '🧘',
      isCompleted: false,
      completedAt: null,
    },
  } as HabitNodeType,
];

const initialEdges: FlowEdge[] = [
  {
    id: 'edge-1',
    source: 'trigger-1',
    target: 'habit-1',
    type: 'habit',
    data: {
      trigger: 'after',
      condition: null,
    },
  },
  {
    id: 'edge-2',
    source: 'habit-1',
    target: 'habit-2',
    type: 'habit',
    label: '5分後',
    data: {
      trigger: 'after',
      condition: null,
    },
  },
];

const nodeTypes = {
  habit: HabitNode,
  trigger: TriggerNode,
};

const edgeTypes = {
  habit: HabitEdge,
};

function HabitFlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: FlowEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'habit',
        data: {
          trigger: 'after',
          condition: null,
        },
      } as FlowEdge;
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      if (node.type === 'habit') {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id && n.type === 'habit') {
              const habitNode = n as HabitNodeType;
              return {
                ...habitNode,
                data: {
                  ...habitNode.data,
                  isCompleted: !habitNode.data.isCompleted,
                  completedAt: !habitNode.data.isCompleted ? new Date() : null,
                },
              };
            }
            return n;
          })
        );
      }
    },
    [setNodes]
  );

  return (
    <div className="w-full h-[600px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default function HabitFlow() {
  return (
    <ReactFlowProvider>
      <HabitFlowInner />
    </ReactFlowProvider>
  );
}