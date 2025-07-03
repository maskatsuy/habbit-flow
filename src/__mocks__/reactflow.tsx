import React from 'react';
import { vi } from 'vitest';

// モックされたuseReactFlow
export const useReactFlow = vi.fn(() => ({
  setNodes: vi.fn(),
  setEdges: vi.fn(),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
  project: vi.fn((position: any) => position),
  viewportInitialized: true,
}));

// ReactFlowProviderのモック
export const ReactFlowProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="react-flow-provider">{children}</div>;
};

// その他の必要なコンポーネントのモック
export const ReactFlow = ({ children }: { children?: React.ReactNode }) => {
  return <div data-testid="react-flow">{children}</div>;
};

export const Handle = () => null;

export const Position = {
  Top: 'top',
  Right: 'right',
  Bottom: 'bottom',
  Left: 'left',
} as const;

export const MarkerType = {
  Arrow: 'arrow',
  ArrowClosed: 'arrowclosed',
} as const;

// その他の必要なエクスポート
export const getBezierPath = () => ['M 0 0', 0, 0];
export const EdgeLabelRenderer = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const BaseEdge = () => null;
export const useNodesState = () => [[], vi.fn(), vi.fn()];
export const useEdgesState = () => [[], vi.fn(), vi.fn()];
export const addEdge = vi.fn();
export const Controls = () => null;
export const Background = () => null;
export const MiniMap = () => null;
export const useKeyPress = () => false;
export const useOnSelectionChange = () => {};