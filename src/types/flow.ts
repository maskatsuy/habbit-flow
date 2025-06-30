import type { Node, NodeProps } from 'reactflow';
import type { HabitNode, HabitEdge, HabitNodeData } from './habit';

export type FlowNode = HabitNode | Node<unknown, 'trigger'>;
export type FlowEdge = HabitEdge;

export interface HabitFlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface HabitFlowActions {
  addNode: (node: FlowNode) => void;
  updateNode: (id: string, updates: Partial<FlowNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: FlowEdge) => void;
  deleteEdge: (id: string) => void;
  completeHabit: (nodeId: string) => void;
  resetDailyProgress: () => void;
}

export type HabitFlowStore = HabitFlowState & HabitFlowActions;

export type HabitNodeComponent = React.ComponentType<NodeProps<HabitNodeData>>;
export type TriggerNodeComponent = React.ComponentType<NodeProps<unknown>>;