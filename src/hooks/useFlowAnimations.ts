import { useMemo } from 'react';
import type { FlowNode, FlowEdge, HabitNode as HabitNodeType } from '../types';

export function useFlowAnimations(nodes: FlowNode[], edges: FlowEdge[]) {
  return useMemo(() => {
    // アニメーションエッジを計算
    const animatedEdges = edges.map(edge => {
      const targetNode = nodes.find(n => n.id === edge.target);
      const sourceNode = nodes.find(n => n.id === edge.source);
      
      let isActive = false;
      
      // ターゲットが条件分岐ノードの場合
      if (targetNode?.type === 'conditional') {
        const isSourceCompleted = sourceNode?.type === 'habit' ?
          (sourceNode as HabitNodeType).data.isCompleted :
          sourceNode?.type === 'trigger' ? true : false;
        isActive = isSourceCompleted;
      }
      // ターゲットが習慣ノードの場合
      else if (targetNode?.type === 'habit') {
        const isTargetCompleted = (targetNode as HabitNodeType).data.isCompleted;
        
        if (sourceNode?.type === 'conditional') {
          isActive = isTargetCompleted;
        } else if (targetNode.id === 'habit-4') {
          const isSourceCompleted = sourceNode?.type === 'habit' ?
            (sourceNode as HabitNodeType).data.isCompleted : false;
          isActive = isSourceCompleted && isTargetCompleted;
        } else {
          isActive = isTargetCompleted;
        }
      }
      
      return { ...edge, isActive };
    });

    // ノードのアニメーション状態を計算
    const animatedNodes = nodes.map(node => {
      // トリガーノードの処理
      if (node.type === 'trigger') {
        const outgoingEdge = edges.find(e => e.source === node.id);
        const nextNode = outgoingEdge ? nodes.find(n => n.id === outgoingEdge.target) : null;
        const isNextCompleted = nextNode?.type === 'habit' ? 
          (nextNode as HabitNodeType).data.isCompleted : false;
        
        return {
          ...node,
          type: 'trigger' as const,
          data: {
            ...node.data,
            isFlowing: isNextCompleted,
          },
        };
      }
      
      // 条件分岐ノードの処理
      if (node.type === 'conditional') {
        const incomingEdge = edges.find(e => e.target === node.id);
        const prevNode = incomingEdge ? nodes.find(n => n.id === incomingEdge.source) : null;
        const isPrevCompleted = prevNode?.type === 'habit' ? 
          (prevNode as HabitNodeType).data.isCompleted : false;
        
        const outgoingEdges = edges.filter(e => e.source === node.id);
        const hasNextCompleted = outgoingEdges.some(edge => {
          const nextNode = nodes.find(n => n.id === edge.target);
          return nextNode?.type === 'habit' && (nextNode as HabitNodeType).data.isCompleted;
        });
        
        return {
          ...node,
          type: 'conditional' as const,
          data: {
            ...node.data,
            isFlowing: isPrevCompleted && hasNextCompleted,
          },
        };
      }
      
      // 習慣ノードの処理
      if (node.type === 'habit') {
        const habitNode = node as HabitNodeType;
        
        // 終端ノードの特別処理
        if (node.id === 'habit-4') {
          return {
            ...habitNode,
            data: {
              ...habitNode.data,
              isFlowing: habitNode.data.isCompleted,
            },
          };
        }
        
        // 条件分岐後のノードかどうかチェック
        const isAfterConditional = edges.some(e => 
          e.target === node.id && 
          nodes.find(n => n.id === e.source)?.type === 'conditional'
        );
        
        // isInactiveの状態を計算
        let isInactive = false;
        if (isAfterConditional) {
          const joggingNode = nodes.find(n => n.id === 'habit-2') as HabitNodeType;
          const bikeNode = nodes.find(n => n.id === 'habit-3') as HabitNodeType;
          
          if (joggingNode?.data.isCompleted && node.id === 'habit-3' && !bikeNode?.data.isCompleted) {
            isInactive = true;
          }
          if (bikeNode?.data.isCompleted && node.id === 'habit-2' && !joggingNode?.data.isCompleted) {
            isInactive = true;
          }
        }
        
        // ノードの両端がアニメーション状態かチェック
        const incomingActive = animatedEdges.some(e => e.target === node.id && e.isActive);
        const outgoingActive = animatedEdges.some(e => e.source === node.id && e.isActive);
        
        return {
          ...habitNode,
          data: {
            ...habitNode.data,
            isInactive,
            isFlowing: incomingActive && outgoingActive,
          },
        };
      }
      
      return node;
    });

    // エッジのアニメーション状態を計算
    const processedEdges = edges.map(edge => {
      const targetNode = nodes.find(n => n.id === edge.target);
      const sourceNode = nodes.find(n => n.id === edge.source);
      
      if (targetNode?.type === 'conditional') {
        const isSourceCompleted = sourceNode?.type === 'habit' ?
          (sourceNode as HabitNodeType).data.isCompleted :
          sourceNode?.type === 'trigger' ? true : false;
        return { ...edge, data: { ...edge.data, isActive: isSourceCompleted } } as FlowEdge;
      }
      
      if (targetNode?.type === 'habit') {
        const targetHabitNode = targetNode as HabitNodeType;
        const isTargetCompleted = targetHabitNode.data.isCompleted;
        
        if (sourceNode?.type === 'conditional') {
          return { ...edge, data: { ...edge.data, isActive: isTargetCompleted } } as FlowEdge;
        }
        
        if (targetNode.id === 'habit-4') {
          const isSourceCompleted = sourceNode?.type === 'habit' ?
            (sourceNode as HabitNodeType).data.isCompleted : false;
          return { ...edge, data: { ...edge.data, isActive: isSourceCompleted && isTargetCompleted } } as FlowEdge;
        }
        
        return { ...edge, data: { ...edge.data, isActive: isTargetCompleted } } as FlowEdge;
      }
      
      return edge;
    });

    return {
      nodes: animatedNodes,
      edges: processedEdges,
    };
  }, [nodes, edges]);
}