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
        } else {
          // 合流点（複数の入力を持つノード）の場合
          const incomingEdges = edges.filter(e => e.target === targetNode.id);
          if (incomingEdges.length > 1) {
            const isSourceCompleted = sourceNode?.type === 'habit' ?
              (sourceNode as HabitNodeType).data.isCompleted : false;
            isActive = isSourceCompleted && isTargetCompleted;
          } else {
            isActive = isTargetCompleted;
          }
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
        
        // 終端ノードかどうかを動的に判定
        const outgoingEdges = edges.filter(e => e.source === node.id);
        const isTerminalNode = outgoingEdges.length === 0;
        
        if (isTerminalNode) {
          return {
            ...habitNode,
            data: {
              ...habitNode.data,
              isFlowing: habitNode.data.isCompleted,
            },
          };
        }
        
        // isInactiveの状態を動的に計算
        let isInactive = false;
        
        // このノードが属する条件分岐パスを見つける
        const findConditionalPath = (nodeId: string): { conditionalId: string; handle: string } | null => {
            const visited = new Set<string>();
            const queue: string[] = [nodeId];
            
            while (queue.length > 0) {
              const currentId = queue.shift()!;
              if (visited.has(currentId)) continue;
              visited.add(currentId);
              
              const incomingEdges = edges.filter(e => e.target === currentId);
              
              for (const edge of incomingEdges) {
                const sourceNode = nodes.find(n => n.id === edge.source);
                if (sourceNode?.type === 'conditional') {
                  return {
                    conditionalId: edge.source,
                    handle: edge.sourceHandle || ''
                  };
                }
                queue.push(edge.source);
              }
            }
            
            return null;
          };
          
        const conditionalPath = findConditionalPath(node.id);
        
        if (conditionalPath) {
          // パス上の完了ノードをチェックする関数（条件分岐から始まって、合流点まで）
          const checkPathForCompletedNodes = (startEdge: any): boolean => {
            const nodesInPath = new Set<string>();
            
            // まず、このパス上のすべてのノードを収集
            const collectNodesInPath = (nodeId: string, visited = new Set<string>()) => {
              if (visited.has(nodeId)) return;
              visited.add(nodeId);
              
              const node = nodes.find(n => n.id === nodeId);
              if (!node) return;
              
              // 合流点（複数の入力を持つノード）に到達したら停止
              const incomingCount = edges.filter(e => e.target === nodeId).length;
              if (incomingCount > 1) {
                return;
              }
              
              nodesInPath.add(nodeId);
              
              // 下流も収集（条件分岐は越えない）
              const outgoing = edges.filter(e => e.source === nodeId);
              for (const out of outgoing) {
                const target = nodes.find(n => n.id === out.target);
                if (target && target.type !== 'conditional') {
                  collectNodesInPath(out.target, visited);
                }
              }
            };
            
            collectNodesInPath(startEdge.target);
            
            // 収集したノードの中に完了ノードがあるかチェック
            for (const nodeId of nodesInPath) {
              const node = nodes.find(n => n.id === nodeId);
              if (node?.type === 'habit' && (node as HabitNodeType).data.isCompleted) {
                return true;
              }
            }
            
            return false;
          };
          
          // 自分のパスのエッジを見つける
          const myPathEdge = edges.find(e => 
            e.source === conditionalPath.conditionalId && 
            e.sourceHandle === conditionalPath.handle
          );
          
          // 他のパスのエッジを見つける
          const otherPathEdges = edges.filter(e => 
            e.source === conditionalPath.conditionalId && 
            e.sourceHandle !== conditionalPath.handle
          );
          
          // 自分のパスに完了ノードがあるかチェック
          const hasCompletedNodeInMyPath = myPathEdge ? checkPathForCompletedNodes(myPathEdge) : false;
          
          // 他のパスに完了ノードがあるかチェック
          const hasCompletedNodeInOtherPath = otherPathEdges.some(edge => checkPathForCompletedNodes(edge));
          
          // 非アクティブの判定：
          // 完了したノードは常にアクティブ
          if (habitNode.data.isCompleted) {
            isInactive = false;
          } else {
            // 未完了ノードの場合：
            // 他のパスに完了ノードがあり、かつ自分のパスに完了ノードがない場合のみグレーアウト
            if (hasCompletedNodeInOtherPath && !hasCompletedNodeInMyPath) {
              // 他のパスが選択されていて、自分のパスは選択されていない
              isInactive = true;
            }
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
        
        // 合流点（複数の入力を持つノード）の場合
        const incomingEdges = edges.filter(e => e.target === targetNode.id);
        if (incomingEdges.length > 1) {
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