import { memo, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { HabitNodeData } from '../../types';
import { useFlowContext } from '../../contexts/FlowContext';
import { useNodeEditor } from '../../contexts/NodeEditorContext';
import NodeWrapper from './NodeWrapper';

export interface ClickableHabitNodeProps extends NodeProps<HabitNodeData> {
  onEditNode?: (nodeId: string) => void;
}

/**
 * クリック可能な習慣ノード
 * ReactFlowのコンテキストを使用して、ノードの更新を直接行う
 */
const ClickableHabitNode = memo(({ data, selected, id }: ClickableHabitNodeProps) => {
  const { label, icon, isCompleted, isDisabled, isInactive, isFlowing, canDelete } = data;
  const { setNodes } = useReactFlow();
  const { edges } = useFlowContext();
  const { onEditNode } = useNodeEditor();

  // ダブルクリックで完了/未完了を切り替え + 編集
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Shiftキーを押しながらダブルクリックで編集
    if (e.shiftKey && onEditNode) {
      onEditNode(id);
      return;
    }
    
    // 通常のダブルクリックで完了/未完了切り替え
    if (isDisabled) return;

    setNodes((nodes) => {
      const willBeCompleted = !isCompleted;
      
      // クリックされたノードが条件分岐のどのパスに属しているか調べる
      const findConditionalPath = (nodeId: string): { conditionalId: string; handle: string } | null => {
        const visited = new Set<string>();
        const queue: string[] = [nodeId];
        
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          if (visited.has(currentId)) continue;
          visited.add(currentId);
          
          const incomingEdges = edges.filter((e: any) => e.target === currentId);
          
          for (const edge of incomingEdges) {
            const sourceNode = nodes.find(n => n.id === edge.source);
            if (sourceNode?.type === 'conditional') {
              return {
                conditionalId: edge.source,
                handle: edge.sourceHandle
              };
            }
            queue.push(edge.source);
          }
        }
        
        return null;
      };
      
      const conditionalPath = findConditionalPath(id);
      
      // 同じ条件分岐の他のパスのノードを取得
      const getOtherPathNodes = (): Set<string> => {
        const otherNodes = new Set<string>();
        
        if (!conditionalPath) return otherNodes;
        
        // 条件分岐から出ている他のパスを見つける
        const otherPathEdges = edges.filter((e: any) => 
          e.source === conditionalPath.conditionalId && 
          e.sourceHandle !== conditionalPath.handle
        );
        
        // 各パスのノードを収集（再帰的に下流も含む、ただし合流点は除外）
        const collectPathNodes = (nodeId: string, visited = new Set<string>()) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);
          
          const node = nodes.find(n => n.id === nodeId);
          
          // 合流点（複数の入力を持つノード）は除外
          const incomingEdgeCount = edges.filter((e: any) => e.target === nodeId).length;
          if (incomingEdgeCount > 1) {
            return;
          }
          
          if (node?.type === 'habit') {
            otherNodes.add(nodeId);
          }
          
          // 下流のノードも収集（ただし条件分岐と合流点は越えない）
          const outgoingEdges = edges.filter((e: any) => e.source === nodeId);
          for (const edge of outgoingEdges) {
            const targetNode = nodes.find(n => n.id === edge.target);
            const targetIncomingCount = edges.filter((e: any) => e.target === edge.target).length;
            if (targetNode && targetNode.type !== 'conditional' && targetIncomingCount <= 1) {
              collectPathNodes(edge.target, visited);
            }
          }
        };
        
        otherPathEdges.forEach(edge => {
          collectPathNodes(edge.target);
        });
        
        return otherNodes;
      };
      
      const otherPathNodeIds = willBeCompleted ? getOtherPathNodes() : new Set<string>();

      return nodes.map((node) => {
        // ダブルクリックされたノードを更新
        if (node.id === id && node.type === 'habit') {
          return {
            ...node,
            type: 'habit' as const,
            data: {
              ...node.data,
              isCompleted: !isCompleted,
              completedAt: !isCompleted ? new Date() : null,
            },
          };
        }

        // 条件分岐の他のパスのノードを未完了にする
        if (otherPathNodeIds.has(node.id) && node.type === 'habit') {
          return {
            ...node,
            type: 'habit' as const,
            data: {
              ...node.data,
              isCompleted: false,
              completedAt: null,
            },
          };
        }

        return node;
      });
    });
  }, [id, isCompleted, isDisabled, setNodes, edges, onEditNode]);

  const getNodeStyle = () => {
    if (isDisabled) return 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50';
    if (isInactive) return 'border-gray-300 bg-gray-100 text-gray-500 cursor-pointer opacity-60 hover:opacity-80';
    if (isCompleted) return 'border-green-500 bg-green-50 text-green-800 cursor-pointer hover:bg-green-100';
    return 'border-gray-300 bg-white text-gray-800 cursor-pointer hover:shadow-md hover:border-gray-400';
  };

  return (
    <NodeWrapper
      isFlowing={isFlowing}
      selected={selected && !isDisabled}
      canDelete={canDelete}
      testId="habit-node"
      baseClassName={getNodeStyle()}
    >
      <div 
        onDoubleClick={handleDoubleClick}
        className={`
          flex items-center gap-2 rounded-md cursor-pointer select-none
          ${isFlowing ? (isCompleted ? 'bg-green-50' : 'bg-white') : ''}
        `}
        title="ダブルクリックで完了/未完了を切り替え、Shift+ダブルクリックで編集"
      >
        {icon && <span className={`text-2xl ${isDisabled || isInactive ? 'grayscale' : ''}`}>{icon}</span>}
        <div className="flex flex-col select-none">
          <span className="font-medium">{label}</span>
          {isCompleted && !isDisabled && !isInactive && (
            <span className="text-xs text-green-600">完了</span>
          )}
          {isInactive && !isCompleted && (
            <span className="text-xs text-gray-500">未選択</span>
          )}
          {isDisabled && (
            <span className="text-xs text-gray-400">利用不可</span>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
});

ClickableHabitNode.displayName = 'ClickableHabitNode';

export default ClickableHabitNode;