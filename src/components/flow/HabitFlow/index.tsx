import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import type { Connection, NodeProps } from 'reactflow';
import { ClickableHabitNode, TriggerNode, ConditionalNode } from '../../nodes';
import type { ClickableHabitNodeProps } from '../../nodes/ClickableHabitNode';
import AnimatedHabitEdge from '../../edges/AnimatedHabitEdge';
import FlowControls from '../../common/FlowControls';
import HabitFlowCanvas from '../HabitFlowCanvas';
import NodeCreator from '../NodeCreator';
import NodeEditor from '../NodeEditor';
import NodeDeletion from '../NodeDeletion';
import { useFlowPersistence } from '../../../hooks/useFlowPersistence';
import { useFlowAnimations } from '../../../hooks/useFlowAnimations';
import { useHabitReset } from '../../../hooks/useHabitReset';
import { useFlowKeyboardShortcuts } from '../../../hooks/useFlowKeyboardShortcuts';
import { useConnectionValidation } from '../../../hooks/useConnectionValidation';
import { initialNodes, initialEdges } from '../../../data/sampleFlow';
import type { FlowNode, FlowEdge, HabitNode as HabitNodeType, HabitNodeData } from '../../../types';

const edgeTypes = {
  habit: AnimatedHabitEdge,
};

function HabitFlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowName, setFlowName] = useState('朝のルーティン');
  const [savedFlows, setSavedFlows] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingNode, setEditingNode] = useState<HabitNodeType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const lastSavedNodes = useRef(initialNodes);
  const lastSavedEdges = useRef(initialEdges);
  
  // Custom hooks
  const { saveFlow, loadFlow, exportFlow, importFlow, listFlows, deleteFlow } = useFlowPersistence();
  const { nodes: animatedNodes, edges: animatedEdges } = useFlowAnimations(nodes, edges);
  const { handleResetHabits } = useHabitReset(nodes, setNodes);
  const { isValidConnection } = useConnectionValidation(nodes, edges);

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

  // Connection handler with validation
  const onConnect = useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) {
        return;
      }
      
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
      setHasUnsavedChanges(true);
    },
    [setEdges, isValidConnection]
  );

  // Node creation handler
  const handleCreateNode = useCallback((nodeData: {
    label: string;
    description?: string;
    icon?: string;
    timing?: string;
    parentNodeId?: string;
  }) => {
    const nodeId = `habit-${Date.now()}`;
    
    // Calculate position based on parent node or center of canvas
    let position = { x: 400, y: 300 }; // Default center position
    
    if (nodeData.parentNodeId) {
      const parentNode = nodes.find(n => n.id === nodeData.parentNodeId);
      if (parentNode) {
        // Position new node to the right of parent
        position = {
          x: parentNode.position.x + 200,
          y: parentNode.position.y,
        };
      }
    }
    
    const newNode: HabitNodeType = {
      id: nodeId,
      type: 'habit',
      position,
      data: {
        habitId: nodeId,
        label: nodeData.label,
        description: nodeData.description,
        icon: nodeData.icon || '📝',
        isCompleted: false,
        completedAt: null,
        timing: nodeData.timing,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // If there's a parent node, create an edge
    if (nodeData.parentNodeId) {
      const newEdge: FlowEdge = {
        id: `edge-${Date.now()}`,
        source: nodeData.parentNodeId,
        target: nodeId,
        type: 'habit',
        data: {
          trigger: 'after',
          condition: null,
        },
      };
      setEdges((eds) => [...eds, newEdge]);
    }
    
    setHasUnsavedChanges(true);
  }, [nodes, setNodes, setEdges]);

  // Node editing handlers
  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId && n.type === 'habit') as HabitNodeType | undefined;
    if (node) {
      setEditingNode(node);
      setIsEditModalOpen(true);
    }
  }, [nodes]);

  const handleNodeEditSave = useCallback((updatedNode: HabitNodeType) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === updatedNode.id ? updatedNode : node
      )
    );
    setHasUnsavedChanges(true);
    setIsEditModalOpen(false);
    setEditingNode(null);
  }, [setNodes]);

  const handleNodeEditClose = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingNode(null);
  }, []);

  // Custom onNodesChange handler that also tracks selection
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    
    // Check for selection changes
    const selectionChange = changes.find(change => change.type === 'select');
    if (selectionChange) {
      if (selectionChange.selected) {
        const node = nodes.find(n => n.id === selectionChange.id);
        setSelectedNode(node || null);
      } else {
        setSelectedNode(null);
      }
    }
  }, [onNodesChange, nodes]);

  // Node deletion handler
  const handleNodeDelete = useCallback((nodeId: string) => {
    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    
    // Remove edges connected to this node
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    
    setHasUnsavedChanges(true);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

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

  // Create node types with double-click handler
  const nodeTypes = useMemo(() => ({
    habit: (props: NodeProps<HabitNodeData>) => (
      <ClickableHabitNode {...props} onDoubleClick={handleNodeDoubleClick} />
    ),
    trigger: TriggerNode,
    conditional: ConditionalNode,
  }), [handleNodeDoubleClick]);

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4 items-center">
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
        {nodes.length > 0 && (
          <NodeCreator 
            onCreateNode={handleCreateNode} 
            nodes={nodes}
            selectedNode={selectedNode}
          />
        )}
        {selectedNode && (
          <NodeDeletion
            selectedNode={selectedNode}
            onDelete={handleNodeDelete}
          />
        )}
      </div>
      <div className="relative">
        <HabitFlowCanvas
          nodes={animatedNodes}
          edges={animatedEdges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={() => {}}
          isValidConnection={isValidConnection}
        />
        {nodes.length === 0 && (
          <NodeCreator 
            onCreateNode={handleCreateNode} 
            nodes={nodes}
            selectedNode={selectedNode}
          />
        )}
      </div>
      <NodeEditor
        node={editingNode}
        isOpen={isEditModalOpen}
        onClose={handleNodeEditClose}
        onSave={handleNodeEditSave}
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