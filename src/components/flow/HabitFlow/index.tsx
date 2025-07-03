import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import type { Connection, NodeProps } from 'reactflow';
import { ClickableHabitNode, TriggerNode, ConditionalNode } from '../../nodes';
import type { ClickableHabitNodeProps } from '../../nodes/ClickableHabitNode';
import InsertableHabitEdge from '../../edges/InsertableHabitEdge';
import FlowControls from '../../common/FlowControls';
import HabitFlowCanvas from '../HabitFlowCanvas';
import NodeCreator from '../NodeCreator';
import NodeEditor from '../NodeEditor';
import NodeInfoPanel from '../NodeInfoPanel';
import InsertNodeModal from '../InsertNodeModal';
import { useFlowPersistence } from '../../../hooks/useFlowPersistence';
import { useFlowAnimations } from '../../../hooks/useFlowAnimations';
import { useHabitReset } from '../../../hooks/useHabitReset';
import { useFlowKeyboardShortcuts } from '../../../hooks/useFlowKeyboardShortcuts';
import { useConnectionValidation } from '../../../hooks/useConnectionValidation';
import { initialNodes, initialEdges } from '../../../data/sampleFlow';
import type { FlowNode, FlowEdge, HabitNode as HabitNodeType, HabitNodeData } from '../../../types';
import { nodeTypes } from './nodeTypes';
import { edgeTypes } from './edgeTypes';
import { NodeEditorProvider } from '../../../contexts/NodeEditorContext';


function HabitFlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowName, setFlowName] = useState('朝のルーティン');
  const [savedFlows, setSavedFlows] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingNode, setEditingNode] = useState<HabitNodeType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [insertingEdge, setInsertingEdge] = useState<{ edgeId: string; position: { x: number; y: number } } | null>(null);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const lastSavedNodes = useRef(initialNodes);
  const lastSavedEdges = useRef(initialEdges);
  
  // Custom hooks
  const { saveFlow, loadFlow, exportFlow, importFlow, listFlows, deleteFlow } = useFlowPersistence();
  const { nodes: baseAnimatedNodes, edges: animatedEdges } = useFlowAnimations(nodes, edges);
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

  // Edge insertion handler
  const handleInsertNode = useCallback((edgeId: string, position: { x: number; y: number }) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;
    
    setInsertingEdge({ edgeId, position });
    setIsInsertModalOpen(true);
  }, [edges]);

  // Handle node creation from edge insertion
  const handleInsertNodeCreate = useCallback((nodeData: {
    label: string;
    description?: string;
    icon?: string;
    timing?: string;
  }) => {
    if (!insertingEdge) return;
    
    const edge = edges.find(e => e.id === insertingEdge.edgeId);
    if (!edge) return;
    
    const nodeId = `habit-${Date.now()}`;
    
    // Create new node at the insertion position
    const newNode: HabitNodeType = {
      id: nodeId,
      type: 'habit',
      position: insertingEdge.position,
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
    
    // Add the new node
    setNodes((nds) => [...nds, newNode]);
    
    // Remove the old edge and create two new edges
    setEdges((eds) => {
      const filteredEdges = eds.filter(e => e.id !== insertingEdge.edgeId);
      
      const newEdge1: FlowEdge = {
        id: `edge-${Date.now()}-1`,
        source: edge.source,
        sourceHandle: edge.sourceHandle, // sourceHandleを保持
        target: nodeId,
        type: 'habit',
        data: edge.data,
      };
      
      const newEdge2: FlowEdge = {
        id: `edge-${Date.now()}-2`,
        source: nodeId,
        target: edge.target,
        type: 'habit',
        data: {
          trigger: 'after',
          condition: null,
        },
      };
      
      return [...filteredEdges, newEdge1, newEdge2];
    });
    
    setHasUnsavedChanges(true);
    setIsInsertModalOpen(false);
    setInsertingEdge(null);
  }, [insertingEdge, edges, setNodes, setEdges]);

  // Node editing handlers (only for Shift+double click)
  const handleNodeEdit = useCallback((nodeId: string) => {
    setNodes((currentNodes) => {
      const node = currentNodes.find(n => n.id === nodeId && n.type === 'habit') as HabitNodeType | undefined;
      if (node) {
        setEditingNode(node);
        setIsEditModalOpen(true);
      }
      return currentNodes; // 変更なし
    });
  }, [setNodes]);

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

  // 削除可否をチェックする関数
  const checkNodeDeletability = useCallback((nodeId: string): { canDelete: boolean; reason?: string } => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.type !== 'habit') {
      return { canDelete: false, reason: '習慣ノードのみ削除可能です' };
    }

    // Find incoming edges
    const incomingEdges = edges.filter(e => e.target === nodeId);
    
    // マージポイント（複数の入力を持つノード）は削除できない
    const incomingEdgeCount = incomingEdges.length;
    const isMergePoint = incomingEdgeCount > 1;
    
    if (isMergePoint) {
      return { canDelete: false, reason: 'マージポイント（複数の入力を持つノード）は削除できません' };
    }
    
    // 削除しようとしているノードが条件分岐に属しているかチェック
    const isPartOfConditionalPath = (nodeId: string): { isConditionalPath: boolean; conditionalId?: string; handle?: string } => {
      const visited = new Set<string>();
      const queue: string[] = [nodeId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        
        // このノードへの入力エッジを辿る
        const incomingEdges = edges.filter(e => e.target === currentId);
        
        for (const edge of incomingEdges) {
          const sourceNode = nodes.find(n => n.id === edge.source);
          if (sourceNode?.type === 'conditional') {
            return {
              isConditionalPath: true,
              conditionalId: edge.source,
              handle: edge.sourceHandle
            };
          }
          // さらに上流を探索
          queue.push(edge.source);
        }
      }
      
      return { isConditionalPath: false };
    };
    
    // 削除しようとしているノードが条件分岐のパスに属しているかチェック
    const pathInfo = isPartOfConditionalPath(nodeId);
    
    if (pathInfo.isConditionalPath && pathInfo.conditionalId && pathInfo.handle) {
      // 同じ条件分岐の同じハンドルから始まるパス上のhabitノードを数える
      const countHabitNodesInConditionalPath = (): number => {
        let count = 0;
        const visited = new Set<string>();
        
        // 条件分岐から特定のハンドルで出ているエッジを見つける
        const startEdge = edges.find(e => 
          e.source === pathInfo.conditionalId && 
          e.sourceHandle === pathInfo.handle
        );
        
        if (!startEdge) return 0;
        
        // そのパス上のノードを辿る（合流点は含めない）
        const traverse = (nodeId: string) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);
          
          const node = nodes.find(n => n.id === nodeId);
          
          // このノードへの入力エッジ数をチェック（合流点の検出）
          const incomingEdgeCount = edges.filter(e => e.target === nodeId).length;
          
          // 合流点（複数の入力を持つノード）に到達したら、それ以降は数えない
          if (incomingEdgeCount > 1) {
            return;
          }
          
          if (node?.type === 'habit') {
            count++;
          }
          
          // 下流のノードを辿る（ただし他の条件分岐は越えない）
          const outgoingEdges = edges.filter(e => e.source === nodeId);
          for (const edge of outgoingEdges) {
            const targetNode = nodes.find(n => n.id === edge.target);
            if (targetNode && targetNode.type !== 'conditional') {
              traverse(edge.target);
            }
          }
        };
        
        traverse(startEdge.target);
        return count;
      };
      
      const habitNodeCount = countHabitNodesInConditionalPath();
      
      if (habitNodeCount <= 1) {
        return { canDelete: false, reason: '条件分岐の各パスには最低1つのノードが必要です' };
      }
    }

    return { canDelete: true };
  }, [nodes, edges]);

  // Custom onNodesChange handler that also tracks selection
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    
    // Check for selection changes
    const selectionChanges = changes.filter(change => change.type === 'select');
    
    if (selectionChanges.length > 0) {
      // Find the most recent selection
      const selectedChange = selectionChanges.find(change => change.selected);
      
      if (selectedChange) {
        const node = nodes.find(n => n.id === selectedChange.id);
        setSelectedNode(node || null);
      } else {
        // All nodes were deselected
        const anySelected = nodes.some(n => 
          !selectionChanges.some(c => c.id === n.id) && n.selected
        );
        if (!anySelected) {
          setSelectedNode(null);
        }
      }
    }
  }, [onNodesChange, nodes]);

  // Node deletion handler
  const handleNodeDelete = useCallback((nodeId: string) => {
    // 削除するノードに接続されているエッジを取得
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    
    // 条件分岐のパスチェック用の関数
    const isPartOfConditionalPath = (nodeId: string): { isConditionalPath: boolean; conditionalId?: string; handle?: string } => {
      // このノードに至るまでのパスを遡って条件分岐を探す
      const visited = new Set<string>();
      const queue: string[] = [nodeId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        
        // このノードへの入力エッジを取得
        const incomingEdges = edges.filter(e => e.target === currentId);
        
        for (const edge of incomingEdges) {
          const sourceNode = nodes.find(n => n.id === edge.source);
          if (sourceNode?.type === 'conditional') {
            return {
              isConditionalPath: true,
              conditionalId: edge.source,
              handle: edge.sourceHandle
            };
          }
          // さらに上流を探索
          queue.push(edge.source);
        }
      }
      
      return { isConditionalPath: false };
    };
    
    // マージポイント（複数の入力を持つノード）は条件分岐の制約から除外
    const incomingEdgeCount = incomingEdges.length;
    const isMergePoint = incomingEdgeCount > 1;
    
    // 削除しようとしているノードが条件分岐のパスに属しているかチェック
    const pathInfo = isPartOfConditionalPath(nodeId);
    
    if (!isMergePoint && pathInfo.isConditionalPath && pathInfo.conditionalId && pathInfo.handle) {
      // 同じ条件分岐の同じハンドルから始まるパス上のhabitノードを数える
      const countHabitNodesInConditionalPath = (): number => {
        let count = 0;
        const visited = new Set<string>();
        
        // 条件分岐から特定のハンドルで出ているエッジを見つける
        const startEdge = edges.find(e => 
          e.source === pathInfo.conditionalId && 
          e.sourceHandle === pathInfo.handle
        );
        
        if (!startEdge) return 0;
        
        // そのパス上のノードを辿る（合流点は含めない）
        const traverse = (nodeId: string) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);
          
          const node = nodes.find(n => n.id === nodeId);
          
          // このノードへの入力エッジ数をチェック（合流点の検出）
          const incomingEdgeCount = edges.filter(e => e.target === nodeId).length;
          
          // 合流点（複数の入力を持つノード）に到達したら、それ以降は数えない
          if (incomingEdgeCount > 1) {
            return;
          }
          
          if (node?.type === 'habit') {
            count++;
          }
          
          // 下流のノードを辿る（ただし他の条件分岐は越えない）
          const outgoingEdges = edges.filter(e => e.source === nodeId);
          for (const edge of outgoingEdges) {
            const targetNode = nodes.find(n => n.id === edge.target);
            if (targetNode && targetNode.type !== 'conditional') {
              traverse(edge.target);
            }
          }
        };
        
        traverse(startEdge.target);
        return count;
      };
      
      const habitNodeCount = countHabitNodesInConditionalPath();
      
      if (habitNodeCount <= 1) {
        alert('条件分岐の各パスには最低1つのノードが必要です。このノードは削除できません。');
        return;
      }
    }
    
    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    
    // Remove edges connected to this node and create new connections
    setEdges((eds) => {
      // 削除するノードに関連するエッジを除外
      const filteredEdges = eds.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      );
      
      // 前後のノードを再接続する新しいエッジを作成
      const newEdges: FlowEdge[] = [];
      
      // 削除するノードが中間にある場合の処理
      if (incomingEdges.length > 0 && outgoingEdges.length > 0) {
        // 各入力エッジに対して処理
        incomingEdges.forEach(inEdge => {
          const sourceNode = nodes.find(n => n.id === inEdge.source);
          
          // 入力元が条件分岐ノードの場合、sourceHandleを保持する必要がある
          if (sourceNode?.type === 'conditional') {
            outgoingEdges.forEach(outEdge => {
              const newEdge: FlowEdge = {
                id: `edge-${Date.now()}-${Math.random()}`,
                source: inEdge.source,
                sourceHandle: inEdge.sourceHandle, // 条件分岐のハンドルを保持
                target: outEdge.target,
                type: 'habit',
                data: inEdge.data, // 元のエッジのデータ（条件など）を保持
              };
              newEdges.push(newEdge);
            });
          } else {
            // 通常のノードからの接続
            outgoingEdges.forEach(outEdge => {
              const newEdge: FlowEdge = {
                id: `edge-${Date.now()}-${Math.random()}`,
                source: inEdge.source,
                target: outEdge.target,
                type: 'habit',
                data: {
                  trigger: 'after',
                  condition: null,
                },
              };
              newEdges.push(newEdge);
            });
          }
        });
      }
      
      return [...filteredEdges, ...newEdges];
    });
    
    setHasUnsavedChanges(true);
    setSelectedNode(null);
  }, [nodes, edges, setNodes, setEdges]);
  
  // 選択されたノードに削除可否情報を付加
  const animatedNodes = useMemo(() => {
    return baseAnimatedNodes.map(node => {
      if (node.id === selectedNode?.id && node.type === 'habit') {
        const { canDelete } = checkNodeDeletability(node.id);
        return {
          ...node,
          data: {
            ...node.data,
            canDelete,
          }
        };
      }
      return node;
    });
  }, [baseAnimatedNodes, selectedNode, checkNodeDeletability]);

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
    <NodeEditorProvider onEditNode={handleNodeEdit} onInsertNode={handleInsertNode}>
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
      </div>
      <div className="relative">
        <HabitFlowCanvas
          nodes={animatedNodes}
          edges={animatedEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={() => {}}
          isValidConnection={isValidConnection}
        />
        {selectedNode && (() => {
          const deletability = selectedNode.type === 'habit' 
            ? checkNodeDeletability(selectedNode.id) 
            : { canDelete: false, reason: '習慣ノードのみ削除可能です' };
          
          // ノードの位置を取得
          const nodePosition = selectedNode.position;
          const nodeWidth = 200; // ノードの幅の推定値
          const panelWidth = 288; // パネルの幅 (w-72 = 18rem = 288px)
          const canvasElement = document.querySelector('.react-flow');
          const canvasRect = canvasElement?.getBoundingClientRect();
          const canvasWidth = canvasRect?.width || window.innerWidth;
          
          // ノードの中心位置がキャンバスの右側1/3にある場合は左側に表示
          const nodeCenter = nodePosition.x + nodeWidth / 2;
          const isRightSide = nodeCenter > (canvasWidth * 2) / 3;
          
          return (
            <NodeInfoPanel
              selectedNode={selectedNode}
              canDelete={deletability.canDelete}
              deleteReason={deletability.reason}
              onDelete={() => handleNodeDelete(selectedNode.id)}
              position={isRightSide ? 'left' : 'right'}
              nodePosition={{
                x: nodePosition.x,
                y: nodePosition.y,
                width: nodeWidth,
                height: 80 // ノードの高さの推定値
              }}
            />
          );
        })()}
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
      <InsertNodeModal
        isOpen={isInsertModalOpen}
        onClose={() => {
          setIsInsertModalOpen(false);
          setInsertingEdge(null);
        }}
        onCreateNode={handleInsertNodeCreate}
        sourceNodeLabel={
          insertingEdge 
            ? nodes.find(n => n.id === edges.find(e => e.id === insertingEdge.edgeId)?.source)?.data.label
            : undefined
        }
        targetNodeLabel={
          insertingEdge
            ? nodes.find(n => n.id === edges.find(e => e.id === insertingEdge.edgeId)?.target)?.data.label
            : undefined
        }
        />
      </div>
    </NodeEditorProvider>
  );
}

export default function HabitFlow() {
  return (
    <ReactFlowProvider>
      <HabitFlowInner />
    </ReactFlowProvider>
  );
}