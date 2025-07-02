import { useCallback } from 'react';
import type { FlowNode, FlowEdge, HabitNode as HabitNodeType } from '../types';

export function useConditionalNodeLogic(
  edges: FlowEdge[],
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>
) {
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      if (node.type === 'habit') {
        setNodes((nds) => {
          // 条件分岐後のノードかチェック
          const isAfterConditional = edges.some(e => 
            e.target === node.id && 
            nds.find(nd => nd.id === e.source)?.type === 'conditional'
          );
          
          return nds.map((n): FlowNode => {
            if (n.type !== 'habit') return n;
            
            const habitNode = n as HabitNodeType;
            
            // クリックされたノードの処理
            if (n.id === node.id) {
              return {
                ...habitNode,
                type: 'habit' as const,
                data: {
                  ...habitNode.data,
                  isCompleted: !habitNode.data.isCompleted,
                  completedAt: !habitNode.data.isCompleted ? new Date() : null,
                },
              } as HabitNodeType;
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
                  type: 'habit' as const,
                  data: {
                    ...habitNode.data,
                    isCompleted: false,
                    completedAt: null,
                  },
                } as HabitNodeType;
              }
              // エアロバイクがクリックされて完了になる場合、ジョギングを未完了に
              if (node.id === 'habit-3' && n.id === 'habit-2' && willBeCompleted) {
                return {
                  ...habitNode,
                  type: 'habit' as const,
                  data: {
                    ...habitNode.data,
                    isCompleted: false,
                    completedAt: null,
                  },
                } as HabitNodeType;
              }
            }
            
            return n;
          });
        });
      }
    },
    [setNodes, edges]
  );

  return { handleNodeClick };
}