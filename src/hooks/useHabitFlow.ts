import { useState, useCallback } from 'react';
import type { FlowNode, FlowEdge, HabitNode, HabitFlowStore } from '../types';

export function useHabitFlow(): HabitFlowStore {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);

  const addNode = useCallback((node: FlowNode) => {
    setNodes((nds) => [...nds, node]);
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<FlowNode>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      )
    );
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    // Also delete connected edges
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== id && edge.target !== id)
    );
  }, []);

  const addEdge = useCallback((edge: FlowEdge) => {
    setEdges((eds) => [...eds, edge]);
  }, []);

  const deleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }, []);

  const completeHabit = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId && node.type === 'habit') {
          const habitNode = node as HabitNode;
          return {
            ...habitNode,
            data: {
              ...habitNode.data,
              isCompleted: true,
              completedAt: new Date(),
            },
          };
        }
        return node;
      })
    );
  }, []);

  const resetDailyProgress = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'habit') {
          const habitNode = node as HabitNode;
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
  }, []);

  return {
    nodes,
    edges,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    completeHabit,
    resetDailyProgress,
  };
}