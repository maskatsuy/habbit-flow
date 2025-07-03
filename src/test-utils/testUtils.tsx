import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { FlowProvider } from '../contexts/FlowContext';
import { NodeEditorProvider } from '../contexts/NodeEditorContext';
import type { FlowNode, FlowEdge } from '../types';

interface TestProviderProps {
  children: React.ReactNode;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  onEditNode?: (nodeId: string) => void;
  onInsertNode?: (edgeId: string, position: { x: number; y: number }) => void;
}

/**
 * テスト用のプロバイダーコンポーネント
 */
export function TestProviders({ 
  children, 
  edges = [],
  onEditNode = vi.fn(),
  onInsertNode = vi.fn(),
}: TestProviderProps) {
  return (
    <FlowProvider edges={edges}>
      <NodeEditorProvider onEditNode={onEditNode} onInsertNode={onInsertNode}>
        {children}
      </NodeEditorProvider>
    </FlowProvider>
  );
}

/**
 * カスタムレンダー関数
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    edges?: FlowEdge[];
    onEditNode?: (nodeId: string) => void;
    onInsertNode?: (edgeId: string, position: { x: number; y: number }) => void;
  }
) {
  const { edges, onEditNode, onInsertNode, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders 
        edges={edges} 
        onEditNode={onEditNode} 
        onInsertNode={onInsertNode}
      >
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  });
}

/**
 * React Flowのモックセットアップ
 */
export function setupReactFlowMocks() {
  // useReactFlowのモック
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();
  const mockGetNodes = vi.fn(() => []);
  const mockGetEdges = vi.fn(() => []);

  vi.mock('reactflow', () => ({
    ...vi.importActual('reactflow'),
    useReactFlow: () => ({
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      getNodes: mockGetNodes,
      getEdges: mockGetEdges,
    }),
  }));

  return {
    mockSetNodes,
    mockSetEdges,
    mockGetNodes,
    mockGetEdges,
  };
}

/**
 * ダブルクリックイベントを発火するヘルパー
 */
export function fireDoubleClick(element: HTMLElement, options: { shiftKey?: boolean } = {}) {
  // React合成イベントのためにonDoubleClickハンドラーを直接呼び出す必要がある場合がある
  const event = new MouseEvent('dblclick', {
    bubbles: true,
    cancelable: true,
    shiftKey: options.shiftKey || false,
  });
  
  // イベントの伝播を確実にするため、対象要素の子要素も検索
  const clickableDiv = element.querySelector('[title*="ダブルクリック"]') || element;
  clickableDiv.dispatchEvent(event);
}

/**
 * ノードの状態をアサートするヘルパー
 */
export function expectNodeState(
  element: HTMLElement,
  state: {
    isCompleted?: boolean;
    isInactive?: boolean;
    isDisabled?: boolean;
  }
) {
  const classList = element.classList;
  
  if (state.isCompleted !== undefined) {
    if (state.isCompleted) {
      expect(classList.contains('border-green-500')).toBe(true);
      expect(element.textContent).toContain('完了');
    } else {
      expect(classList.contains('border-green-500')).toBe(false);
    }
  }
  
  if (state.isInactive !== undefined) {
    if (state.isInactive) {
      expect(classList.contains('opacity-60')).toBe(true);
      expect(element.textContent).toContain('未選択');
    } else {
      expect(classList.contains('opacity-60')).toBe(false);
    }
  }
  
  if (state.isDisabled !== undefined) {
    if (state.isDisabled) {
      expect(classList.contains('opacity-50')).toBe(true);
      expect(classList.contains('cursor-not-allowed')).toBe(true);
    } else {
      expect(classList.contains('opacity-50')).toBe(false);
    }
  }
}

// Re-export everything from Testing Library
export * from '@testing-library/react';