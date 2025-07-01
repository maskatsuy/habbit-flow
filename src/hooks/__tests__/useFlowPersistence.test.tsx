import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFlowPersistence } from '../useFlowPersistence';
import type { FlowNode, FlowEdge } from '../../types';

// LocalStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useFlowPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockNodes: FlowNode[] = [
    {
      id: 'node-1',
      type: 'habit',
      position: { x: 100, y: 100 },
      data: {
        habitId: 'habit-1',
        label: 'テストノード',
        isCompleted: false,
        completedAt: null,
      },
    },
  ];

  const mockEdges: FlowEdge[] = [
    {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      type: 'habit',
      data: {
        trigger: 'after',
        condition: null,
      },
    },
  ];

  it('should save flow to localStorage', () => {
    const { result } = renderHook(() => useFlowPersistence());

    act(() => {
      result.current.saveFlow('test-flow', mockNodes, mockEdges);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'habitFlow:test-flow',
      expect.any(String)
    );

    const savedData = JSON.parse(
      localStorageMock.setItem.mock.calls[0][1] as string
    );

    expect(savedData).toMatchObject({
      version: '1.0',
      name: 'test-flow',
      nodes: mockNodes,
      edges: mockEdges,
      metadata: {
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });
  });

  it('should load flow from localStorage', () => {
    const savedFlow = {
      version: '1.0',
      name: 'test-flow',
      nodes: mockNodes,
      edges: mockEdges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedFlow));

    const { result } = renderHook(() => useFlowPersistence());

    act(() => {
      const loaded = result.current.loadFlow('test-flow');
      expect(loaded).toEqual(savedFlow);
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('habitFlow:test-flow');
  });

  it('should return null when flow does not exist', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useFlowPersistence());

    act(() => {
      const loaded = result.current.loadFlow('non-existent');
      expect(loaded).toBeNull();
    });
  });

  it('should list all saved flows', () => {
    const flow1 = {
      version: '1.0',
      name: 'morning-routine',
      nodes: [],
      edges: [],
      metadata: {
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    };

    const flow2 = {
      version: '1.0',
      name: 'evening-routine',
      nodes: [],
      edges: [],
      metadata: {
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    };

    localStorageMock.getItem
      .mockReturnValueOnce(JSON.stringify(flow1))
      .mockReturnValueOnce(JSON.stringify(flow2));
    
    localStorageMock.key
      .mockReturnValueOnce('habitFlow:morning-routine')
      .mockReturnValueOnce('habitFlow:evening-routine')
      .mockReturnValueOnce(null);

    Object.defineProperty(localStorageMock, 'length', {
      value: 2,
      writable: true,
    });

    const { result } = renderHook(() => useFlowPersistence());

    act(() => {
      const flows = result.current.listFlows();
      expect(flows).toHaveLength(2);
      // 新しい順にソートされるので、evening-routineが先
      expect(flows[0].name).toBe('evening-routine');
      expect(flows[1].name).toBe('morning-routine');
    });
  });

  it('should delete a flow', () => {
    const { result } = renderHook(() => useFlowPersistence());

    act(() => {
      result.current.deleteFlow('test-flow');
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('habitFlow:test-flow');
  });
});