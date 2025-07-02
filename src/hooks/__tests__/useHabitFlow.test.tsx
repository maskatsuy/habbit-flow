import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHabitFlow } from '../useHabitFlow';
import type { HabitNode } from '../../types';

describe('useHabitFlow', () => {
  it('should initialize with empty nodes and edges', () => {
    const { result } = renderHook(() => useHabitFlow());

    expect(result.current.nodes).toHaveLength(0);
    expect(result.current.edges).toHaveLength(0);
  });

  it('should add a habit node', () => {
    const { result } = renderHook(() => useHabitFlow());

    const newNode: HabitNode = {
      id: 'habit-1',
      type: 'habit',
      position: { x: 100, y: 100 },
      data: {
        habitId: 'habit-1',
        label: '水を飲む',
        icon: '💧',
        isCompleted: false,
        completedAt: null,
      },
    };

    act(() => {
      result.current.addNode(newNode);
    });

    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0]).toEqual(newNode);
  });

  it('should update a node', () => {
    const { result } = renderHook(() => useHabitFlow());

    const node: HabitNode = {
      id: 'habit-1',
      type: 'habit',
      position: { x: 100, y: 100 },
      data: {
        habitId: 'habit-1',
        label: '水を飲む',
        icon: '💧',
        isCompleted: false,
        completedAt: null,
      },
    };

    act(() => {
      result.current.addNode(node);
    });

    act(() => {
      result.current.updateNode('habit-1', {
        position: { x: 200, y: 200 },
      });
    });

    expect(result.current.nodes[0].position).toEqual({ x: 200, y: 200 });
  });

  it('should delete a node', () => {
    const { result } = renderHook(() => useHabitFlow());

    const node: HabitNode = {
      id: 'habit-1',
      type: 'habit',
      position: { x: 100, y: 100 },
      data: {
        habitId: 'habit-1',
        label: '水を飲む',
        icon: '💧',
        isCompleted: false,
        completedAt: null,
      },
    };

    act(() => {
      result.current.addNode(node);
    });

    act(() => {
      result.current.deleteNode('habit-1');
    });

    expect(result.current.nodes).toHaveLength(0);
  });

  it('should complete a habit', () => {
    const { result } = renderHook(() => useHabitFlow());

    const node: HabitNode = {
      id: 'habit-1',
      type: 'habit',
      position: { x: 100, y: 100 },
      data: {
        habitId: 'habit-1',
        label: '水を飲む',
        icon: '💧',
        isCompleted: false,
        completedAt: null,
      },
    };

    act(() => {
      result.current.addNode(node);
    });

    act(() => {
      result.current.completeHabit('habit-1');
    });

    const updatedNode = result.current.nodes[0] as HabitNode;
    expect(updatedNode.data.isCompleted).toBe(true);
    expect(updatedNode.data.completedAt).toBeInstanceOf(Date);
  });

  it('should reset daily progress', () => {
    const { result } = renderHook(() => useHabitFlow());

    const node: HabitNode = {
      id: 'habit-1',
      type: 'habit',
      position: { x: 100, y: 100 },
      data: {
        habitId: 'habit-1',
        label: '水を飲む',
        icon: '💧',
        isCompleted: true,
        completedAt: new Date(),
      },
    };

    act(() => {
      result.current.addNode(node);
    });

    act(() => {
      result.current.resetDailyProgress();
    });

    const resetNode = result.current.nodes[0] as HabitNode;
    expect(resetNode.data.isCompleted).toBe(false);
    expect(resetNode.data.completedAt).toBe(null);
  });
});