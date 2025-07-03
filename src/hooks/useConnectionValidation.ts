import { useMemo } from 'react';
import type { Connection } from 'reactflow';
import type { FlowNode, FlowEdge } from '../types';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function useConnectionValidation(nodes: FlowNode[], edges: FlowEdge[]) {
  // Check if there's a path from source to target (for cycle detection)
  const hasPath = useMemo(() => {
    return (from: string, to: string, visited = new Set<string>()): boolean => {
      if (from === to) return true;
      if (visited.has(from)) return false;
      
      visited.add(from);
      
      const outgoingEdges = edges.filter(e => e.source === from);
      for (const edge of outgoingEdges) {
        if (hasPath(edge.target, to, new Set(visited))) {
          return true;
        }
      }
      
      return false;
    };
  }, [edges]);

  const validateConnection = (connection: Connection): ValidationResult => {
    const { source, target, sourceHandle, targetHandle } = connection;
    
    if (!source || !target) {
      return { isValid: false, message: '接続元または接続先が指定されていません' };
    }

    // Prevent self-connections
    if (source === target) {
      return { isValid: false, message: '自己接続はできません' };
    }

    // Find source and target nodes
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);

    if (!sourceNode || !targetNode) {
      return { isValid: false, message: 'ノードが見つかりません' };
    }

    // Check for duplicate connections
    const existingConnection = edges.find(
      e => e.source === source && e.target === target
    );
    if (existingConnection) {
      return { isValid: false, message: 'この接続は既に存在します' };
    }

    // Trigger nodes cannot have incoming connections
    if (targetNode.type === 'trigger') {
      return { isValid: false, message: 'トリガーノードには接続できません' };
    }

    // Conditional nodes can have maximum 2 outgoing connections
    if (sourceNode.type === 'conditional') {
      const outgoingConnections = edges.filter(e => e.source === source);
      if (outgoingConnections.length >= 2) {
        return { isValid: false, message: '条件分岐ノードは最大2つまでしか接続できません' };
      }
    }

    // Check for circular dependencies
    if (hasPath(target, source)) {
      return { isValid: false, message: '循環参照になるため接続できません' };
    }

    return { isValid: true };
  };

  const isValidConnection = (connection: Connection): boolean => {
    return validateConnection(connection).isValid;
  };

  return {
    validateConnection,
    isValidConnection,
  };
}