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
  const { label, icon, isCompleted, isDisabled, isInactive, isFlowing } = data;
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
      // 条件分岐後のノードかチェック
      const currentNode = nodes.find(n => n.id === id);
      if (!currentNode || currentNode.type !== 'habit') return nodes;

      // 条件分岐ノードの後にあるかチェック
      const isAfterConditional = edges.some((e: any) => 
        e.target === id && 
        nodes.find(n => n.id === e.source)?.type === 'conditional'
      );

      return nodes.map((node) => {
        // ダブルクリックされたノードを更新
        if (node.id === id && node.type === 'habit') {
          console.log('Updating node completion:', id, 'from', isCompleted, 'to', !isCompleted);
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

        // 条件分岐後の排他制御
        if (isAfterConditional && node.type === 'habit') {
          const willBeCompleted = !isCompleted;
          
          // ジョギングがクリックされて完了になる場合、エアロバイクを未完了に
          if (id === 'habit-2' && node.id === 'habit-3' && willBeCompleted) {
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
          
          // エアロバイクがクリックされて完了になる場合、ジョギングを未完了に
          if (id === 'habit-3' && node.id === 'habit-2' && willBeCompleted) {
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