import { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
} from 'reactflow';
import type { Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { HabitNode, TriggerNode, ConditionalNode } from './nodes';
import { AnimatedHabitEdge } from './edges';
import FlowMenu from './FlowMenu';
import { useFlowPersistence } from '../hooks/useFlowPersistence';
import type { FlowNode, FlowEdge, HabitNode as HabitNodeType } from '../types';

// サンプルデータ
const initialNodes: FlowNode[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 50, y: 200 },
    data: {
      label: '朝7時',
      triggerType: 'time',
      icon: '⏰',
    },
  },
  {
    id: 'habit-1',
    type: 'habit',
    position: { x: 250, y: 200 },
    data: {
      habitId: 'habit-1',
      label: '水を飲む',
      icon: '💧',
      isCompleted: false,
      completedAt: null,
    },
  } as HabitNodeType,
  {
    id: 'conditional-1',
    type: 'conditional',
    position: { x: 450, y: 200 },
    data: {
      label: '天気をチェック',
      condition: '晴れている？',
      icon: '🌤️',
    },
  },
  {
    id: 'habit-2',
    type: 'habit',
    position: { x: 700, y: 100 },
    data: {
      habitId: 'habit-2',
      label: 'ジョギング',
      icon: '🏃',
      isCompleted: false,
      completedAt: null,
    },
  } as HabitNodeType,
  {
    id: 'habit-3',
    type: 'habit',
    position: { x: 700, y: 300 },
    data: {
      habitId: 'habit-3',
      label: 'エアロバイク',
      icon: '🚴',
      isCompleted: false,
      completedAt: null,
    },
  } as HabitNodeType,
  {
    id: 'habit-4',
    type: 'habit',
    position: { x: 900, y: 200 },
    data: {
      habitId: 'habit-4',
      label: 'コールドシャワー',
      icon: '🚿',
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
    target: 'conditional-1',
    type: 'habit',
    data: {
      trigger: 'after',
      condition: null,
    },
  },
  {
    id: 'edge-yes',
    source: 'conditional-1',
    sourceHandle: 'yes',
    target: 'habit-2',
    type: 'habit',
    label: '晴れ',
    data: {
      trigger: 'after',
      condition: 'sunny',
    },
  },
  {
    id: 'edge-no',
    source: 'conditional-1',
    sourceHandle: 'no',
    target: 'habit-3',
    type: 'habit',
    label: '雨/曇り',
    data: {
      trigger: 'after',
      condition: 'not_sunny',
    },
  },
  {
    id: 'edge-3',
    source: 'habit-2',
    target: 'habit-4',
    type: 'habit',
    label: '運動後',
    data: {
      trigger: 'after',
      condition: null,
    },
  },
  {
    id: 'edge-4',
    source: 'habit-3',
    target: 'habit-4',
    type: 'habit',
    label: '運動後',
    data: {
      trigger: 'after',
      condition: null,
    },
  },
];

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
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());
  const lastSavedNodes = useRef(initialNodes);
  const lastSavedEdges = useRef(initialEdges);
  const { saveFlow, loadFlow, exportFlow, importFlow, listFlows, deleteFlow } = useFlowPersistence();

  useEffect(() => {
    const flows = listFlows();
    setSavedFlows(flows.map(f => f.name));
  }, [listFlows]);

  // 日付変更を検知して自動リセット
  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastResetDate) {
        // 日付が変わったら全ての習慣をリセット
        resetAllHabits();
        setLastResetDate(currentDate);
      }
    };

    // 初回チェック
    checkDateChange();

    // 1分ごとにチェック
    const interval = setInterval(checkDateChange, 60000);

    return () => clearInterval(interval);
  }, [lastResetDate]);

  // 変更を検知
  useEffect(() => {
    const nodesChanged = JSON.stringify(nodes) !== JSON.stringify(lastSavedNodes.current);
    const edgesChanged = JSON.stringify(edges) !== JSON.stringify(lastSavedEdges.current);
    setHasUnsavedChanges(nodesChanged || edgesChanged);
  }, [nodes, edges]);

  // キーボードショートカットの実装
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAs();
        } else {
          handleSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [flowName, nodes, edges]);

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
        setNodes((nds) => {
          // 条件分岐後のノードかチェック
          const isAfterConditional = edges.some(e => 
            e.target === node.id && 
            nds.find(nd => nd.id === e.source)?.type === 'conditional'
          );
          
          return nds.map((n) => {
            if (n.type !== 'habit') return n;
            
            const habitNode = n as HabitNodeType;
            
            // クリックされたノードの処理
            if (n.id === node.id) {
              return {
                ...habitNode,
                data: {
                  ...habitNode.data,
                  isCompleted: !habitNode.data.isCompleted,
                  completedAt: !habitNode.data.isCompleted ? new Date() : null,
                },
              };
            }
            
            // 条件分岐後のノードで、クリックされたノードが完了に変わる場合
            if (isAfterConditional) {
              // クリックされたノードの元の状態を取得
              const clickedNode = nds.find(nd => nd.id === node.id && nd.type === 'habit') as HabitNodeType;
              const willBeCompleted = clickedNode && !clickedNode.data.isCompleted;
              
              // ジョギングがクリックされて完了になる場合、エアロバイクを未完了に
              if (node.id === 'habit-2' && n.id === 'habit-3' && willBeCompleted) {
                return {
                  ...habitNode,
                  data: {
                    ...habitNode.data,
                    isCompleted: false,
                    completedAt: null,
                  },
                };
              }
              // エアロバイクがクリックされて完了になる場合、ジョギングを未完了に
              if (node.id === 'habit-3' && n.id === 'habit-2' && willBeCompleted) {
                return {
                  ...habitNode,
                  data: {
                    ...habitNode.data,
                    isCompleted: false,
                    completedAt: null,
                  },
                };
              }
            }
            
            return n;
          });
        });
      }
    },
    [setNodes, edges]
  );

  const handleSave = useCallback(() => {
    const success = saveFlow(flowName, nodes, edges);
    if (success) {
      lastSavedNodes.current = nodes;
      lastSavedEdges.current = edges;
      setHasUnsavedChanges(false);
      // アラートの代わりにトーストを表示（実装は省略）
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

  const handleExport = useCallback(() => {
    exportFlow(flowName, nodes, edges);
  }, [exportFlow, flowName, nodes, edges]);

  const handleFlowChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFlow = e.target.value;
    
    // 未保存の変更がある場合は確認
    if (hasUnsavedChanges && !window.confirm('未保存の変更があります。破棄して続行しますか？')) {
      return;
    }
    
    if (selectedFlow === '__new__') {
      // 新規フロー作成
      setNodes(initialNodes);
      setEdges(initialEdges);
      setFlowName(`新規フロー ${new Date().toLocaleTimeString('ja-JP')}`);
      lastSavedNodes.current = initialNodes;
      lastSavedEdges.current = initialEdges;
      setHasUnsavedChanges(false);
    } else if (selectedFlow !== flowName) {
      // 既存フローを読み込み
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
      // 古い名前で削除して新しい名前で保存
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
      // 削除後は新規フローに切り替え
      setNodes(initialNodes);
      setEdges(initialEdges);
      setFlowName(`新規フロー ${new Date().toLocaleTimeString('ja-JP')}`);
      lastSavedNodes.current = initialNodes;
      lastSavedEdges.current = initialEdges;
      setHasUnsavedChanges(false);
    }
  }, [flowName, deleteFlow, listFlows, setNodes, setEdges]);

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

  // 全ての習慣の完了状態をリセット
  const resetAllHabits = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'habit') {
          const habitNode = node as HabitNodeType;
          return {
            ...habitNode,
            data: {
              ...habitNode.data,
              isCompleted: false,
              completedAt: null,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // 手動リセット
  const handleResetHabits = useCallback(() => {
    if (window.confirm('すべての習慣の完了状態をリセットしますか？')) {
      resetAllHabits();
      setLastResetDate(new Date().toDateString());
    }
  }, [resetAllHabits]);

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <select
            value={flowName}
            onChange={handleFlowChange}
            className="px-3 py-2 border border-gray-300 rounded-md min-w-[200px] font-medium"
          >
            <optgroup label="現在のフロー">
              <option value={flowName}>{flowName}</option>
            </optgroup>
            {savedFlows.filter(name => name !== flowName).length > 0 && (
              <optgroup label="保存済みフロー">
                {savedFlows
                  .filter(name => name !== flowName)
                  .map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))
                }
              </optgroup>
            )}
            <option value="__new__">➕ 新規フロー作成</option>
          </select>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-500 font-medium">● 未保存</span>
          )}
        </div>
        
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
            hasUnsavedChanges 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!hasUnsavedChanges}
          title={hasUnsavedChanges ? '保存 (Cmd/Ctrl + S)' : '変更なし'}
        >
          💾 保存
        </button>
        
        <FlowMenu
          onSaveAs={handleSaveAs}
          onRename={handleRename}
          onDelete={handleDelete}
          onExport={handleExport}
          onImport={handleImport}
          canDelete={savedFlows.includes(flowName)}
        />
        
        <button
          onClick={handleResetHabits}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors ml-auto"
          title="習慣をリセット"
        >
          🔄 リセット
        </button>
      </div>
      <div className="w-full h-[600px]">
        <ReactFlow
        nodes={nodes.map(node => {
          if (node.type !== 'habit') return node;
          
          const habitNode = node as HabitNodeType;
          
          // 条件分岐後のノードかどうかチェック
          const isAfterConditional = edges.some(e => 
            e.target === node.id && 
            nodes.find(n => n.id === e.source)?.type === 'conditional'
          );
          
          if (isAfterConditional) {
            // ジョギングとエアロバイクのノード
            const joggingNode = nodes.find(n => n.id === 'habit-2') as HabitNodeType;
            const bikeNode = nodes.find(n => n.id === 'habit-3') as HabitNodeType;
            
            // どちらかが完了している場合、もう一方を視覚的に無効化（ただしクリックは可能）
            if (joggingNode?.data.isCompleted && node.id === 'habit-3' && !bikeNode?.data.isCompleted) {
              return {
                ...habitNode,
                data: {
                  ...habitNode.data,
                  isInactive: true, // disabledではなくinactiveに
                },
              };
            }
            if (bikeNode?.data.isCompleted && node.id === 'habit-2' && !joggingNode?.data.isCompleted) {
              return {
                ...habitNode,
                data: {
                  ...habitNode.data,
                  isInactive: true, // disabledではなくinactiveに
                },
              };
            }
          }
          
          // その他のノードはdisableしない
          return habitNode;
        })}
        edges={edges.map(edge => {
          const targetNode = nodes.find(n => n.id === edge.target);
          const sourceNode = nodes.find(n => n.id === edge.source);
          
          // ターゲットが条件分岐ノードの場合、ソースが完了していればアクティブ
          if (targetNode?.type === 'conditional') {
            const isSourceCompleted = sourceNode?.type === 'habit' ?
              (sourceNode as HabitNodeType).data.isCompleted :
              sourceNode?.type === 'trigger' ? true : false;
            return { ...edge, data: { ...edge.data, isActive: isSourceCompleted } } as FlowEdge;
          }
          
          // ターゲットが習慣ノードの場合
          if (targetNode?.type === 'habit') {
            const targetHabitNode = targetNode as HabitNodeType;
            const isTargetCompleted = targetHabitNode.data.isCompleted;
            
            // ソースが条件分岐の場合
            if (sourceNode?.type === 'conditional') {
              // ターゲットが完了している場合のみアクティブ
              return { ...edge, data: { ...edge.data, isActive: isTargetCompleted } } as FlowEdge;
            }
            
            // 合流地点（コールドシャワー）の場合
            if (targetNode.id === 'habit-4') {
              // ソースノードが完了していて、かつターゲットも完了している場合のみ
              const isSourceCompleted = sourceNode?.type === 'habit' ?
                (sourceNode as HabitNodeType).data.isCompleted : false;
              return { ...edge, data: { ...edge.data, isActive: isSourceCompleted && isTargetCompleted } } as FlowEdge;
            }
            
            // 通常のエッジ
            return { ...edge, data: { ...edge.data, isActive: isTargetCompleted } } as FlowEdge;
          }
          
          return edge;
        })}
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