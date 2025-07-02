import { useCallback, useState, useEffect, useRef } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import type { Connection } from 'reactflow';
import { HabitNode, TriggerNode, ConditionalNode } from '../../nodes';
import AnimatedHabitEdge from '../../edges/AnimatedHabitEdge';
import FlowControls from '../../common/FlowControls';
import HabitFlowCanvas from '../HabitFlowCanvas';
import { useFlowPersistence } from '../../../hooks/useFlowPersistence';
import { useFlowAnimations } from '../../../hooks/useFlowAnimations';
import { useHabitReset } from '../../../hooks/useHabitReset';
import { useFlowKeyboardShortcuts } from '../../../hooks/useFlowKeyboardShortcuts';
import { initialNodes, initialEdges } from '../../../data/sampleFlow';
import type { FlowNode, FlowEdge } from '../../../types';

// Node types configuration
const nodeTypes = {
  habit: HabitNode,
  trigger: TriggerNode,
  conditional: ConditionalNode,
};

const edgeTypes = {
  habit: AnimatedHabitEdge,
};

function HabitFlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowName, setFlowName] = useState('朝のルーティン');
  const [savedFlows, setSavedFlows] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSavedNodes = useRef(initialNodes);
  const lastSavedEdges = useRef(initialEdges);
  
  // Custom hooks
  const { saveFlow, loadFlow, exportFlow, importFlow, listFlows, deleteFlow } = useFlowPersistence();
  const { nodes: animatedNodes, edges: animatedEdges } = useFlowAnimations(nodes, edges);
  const { handleResetHabits } = useHabitReset(nodes, setNodes);

  // Load saved flows
  useEffect(() => {
    const flows = listFlows();
    setSavedFlows(flows.map(f => f.name));
  }, [listFlows]);

  // Track unsaved changes
  useEffect(() => {
    const nodesChanged = JSON.stringify(nodes) !== JSON.stringify(lastSavedNodes.current);
    const edgesChanged = JSON.stringify(edges) !== JSON.stringify(lastSavedEdges.current);
    setHasUnsavedChanges(nodesChanged || edgesChanged);
  }, [nodes, edges]);

  // Connection handler
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

  // Save handlers
  const handleSave = useCallback(() => {
    const success = saveFlow(flowName, nodes, edges);
    if (success) {
      lastSavedNodes.current = nodes;
      lastSavedEdges.current = edges;
      setHasUnsavedChanges(false);
      const flows = listFlows();
      setSavedFlows(flows.map(f => f.name));
    }
  }, [saveFlow, flowName, nodes, edges, listFlows]);

  const handleSaveAs = useCallback(() => {
    const newName = window.prompt('新しいフロー名を入力してください', flowName);
    if (newName && newName.trim()) {
      const success = saveFlow(newName, nodes, edges);
      if (success) {
        setFlowName(newName);
        lastSavedNodes.current = nodes;
        lastSavedEdges.current = edges;
        setHasUnsavedChanges(false);
        const flows = listFlows();
        setSavedFlows(flows.map(f => f.name));
      }
    }
  }, [saveFlow, flowName, nodes, edges, listFlows]);

  // Flow management handlers
  const handleFlowChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFlow = e.target.value;
    
    if (hasUnsavedChanges && !window.confirm('未保存の変更があります。破棄して続行しますか？')) {
      return;
    }
    
    if (selectedFlow === '__new__') {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setFlowName(`新規フロー ${new Date().toLocaleTimeString('ja-JP')}`);
      lastSavedNodes.current = initialNodes;
      lastSavedEdges.current = initialEdges;
      setHasUnsavedChanges(false);
    } else if (selectedFlow !== flowName) {
      const flow = loadFlow(selectedFlow);
      if (flow) {
        setNodes(flow.nodes);
        setEdges(flow.edges);
        setFlowName(selectedFlow);
        lastSavedNodes.current = flow.nodes;
        lastSavedEdges.current = flow.edges;
        setHasUnsavedChanges(false);
      }
    }
  }, [flowName, loadFlow, setNodes, setEdges, hasUnsavedChanges]);

  const handleRename = useCallback(() => {
    const newName = window.prompt('新しいフロー名を入力してください', flowName);
    if (newName && newName.trim() && newName !== flowName) {
      deleteFlow(flowName);
      const success = saveFlow(newName, nodes, edges);
      if (success) {
        setFlowName(newName);
        lastSavedNodes.current = nodes;
        lastSavedEdges.current = edges;
        setHasUnsavedChanges(false);
        const flows = listFlows();
        setSavedFlows(flows.map(f => f.name));
      }
    }
  }, [flowName, nodes, edges, deleteFlow, saveFlow, listFlows]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`フロー「${flowName}」を削除しますか？`)) {
      deleteFlow(flowName);
      const flows = listFlows();
      setSavedFlows(flows.map(f => f.name));
      setNodes(initialNodes);
      setEdges(initialEdges);
      setFlowName(`新規フロー ${new Date().toLocaleTimeString('ja-JP')}`);
      lastSavedNodes.current = initialNodes;
      lastSavedEdges.current = initialEdges;
      setHasUnsavedChanges(false);
    }
  }, [flowName, deleteFlow, listFlows, setNodes, setEdges]);

  const handleExport = useCallback(() => {
    exportFlow(flowName, nodes, edges);
  }, [exportFlow, flowName, nodes, edges]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const flow = await importFlow(file);
        if (flow) {
          setNodes(flow.nodes);
          setEdges(flow.edges);
          setFlowName(flow.name);
          lastSavedNodes.current = flow.nodes;
          lastSavedEdges.current = flow.edges;
          setHasUnsavedChanges(false);
          const flows = listFlows();
          setSavedFlows(flows.map(f => f.name));
        }
      }
    };
    input.click();
  }, [importFlow, setNodes, setEdges, listFlows]);

  // Keyboard shortcuts
  useFlowKeyboardShortcuts({
    onSave: handleSave,
    onSaveAs: handleSaveAs,
  });

  return (
    <div className="w-full">
      <FlowControls
        flowName={flowName}
        savedFlows={savedFlows}
        hasUnsavedChanges={hasUnsavedChanges}
        canDelete={savedFlows.includes(flowName)}
        onFlowChange={handleFlowChange}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onRename={handleRename}
        onDelete={handleDelete}
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleResetHabits}
      />
      <HabitFlowCanvas
        nodes={animatedNodes}
        edges={animatedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={() => {}}
      />
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