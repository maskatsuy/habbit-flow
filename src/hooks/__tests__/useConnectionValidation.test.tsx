import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useConnectionValidation } from '../useConnectionValidation'
import type { FlowNode, FlowEdge } from '../../types'

describe('useConnectionValidation', () => {
  const sampleNodes: FlowNode[] = [
    {
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 0, y: 0 },
      data: { label: '朝7時', icon: '⏰' },
    },
    {
      id: 'habit-1',
      type: 'habit',
      position: { x: 100, y: 0 },
      data: {
        habitId: 'habit-1',
        label: '水を飲む',
        icon: '💧',
        isCompleted: false,
        completedAt: null,
      },
    },
    {
      id: 'conditional-1',
      type: 'conditional',
      position: { x: 200, y: 0 },
      data: { label: '天気をチェック', condition: '晴れ' },
    },
    {
      id: 'habit-2',
      type: 'habit',
      position: { x: 300, y: 0 },
      data: {
        habitId: 'habit-2',
        label: 'ジョギング',
        icon: '🏃',
        isCompleted: false,
        completedAt: null,
      },
    },
  ]

  const sampleEdges: FlowEdge[] = [
    {
      id: 'edge-1',
      source: 'trigger-1',
      target: 'habit-1',
      type: 'habit',
      data: { trigger: 'after', condition: null },
    },
  ]

  it('should validate connections between compatible node types', () => {
    const { result } = renderHook(() => useConnectionValidation(sampleNodes, sampleEdges))

    // Trigger -> Habit: Valid
    expect(
      result.current.isValidConnection({
        source: 'trigger-1',
        target: 'habit-2',
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBe(true)

    // Habit -> Habit: Valid
    expect(
      result.current.isValidConnection({
        source: 'habit-1',
        target: 'habit-2',
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBe(true)

    // Habit -> Conditional: Valid
    expect(
      result.current.isValidConnection({
        source: 'habit-1',
        target: 'conditional-1',
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBe(true)

    // Conditional -> Habit: Valid
    expect(
      result.current.isValidConnection({
        source: 'conditional-1',
        target: 'habit-2',
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBe(true)
  })

  it('should prevent self-connections', () => {
    const { result } = renderHook(() => useConnectionValidation(sampleNodes, sampleEdges))

    expect(
      result.current.isValidConnection({
        source: 'habit-1',
        target: 'habit-1',
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBe(false)
  })

  it('should prevent duplicate connections', () => {
    const { result } = renderHook(() => useConnectionValidation(sampleNodes, sampleEdges))

    // This connection already exists in sampleEdges
    expect(
      result.current.isValidConnection({
        source: 'trigger-1',
        target: 'habit-1',
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBe(false)
  })

  it('should prevent trigger nodes from having incoming connections', () => {
    const { result } = renderHook(() => useConnectionValidation(sampleNodes, sampleEdges))

    expect(
      result.current.isValidConnection({
        source: 'habit-1',
        target: 'trigger-1',
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBe(false)
  })

  it('should limit conditional nodes to maximum 2 outgoing connections', () => {
    const edgesWithConditional: FlowEdge[] = [
      ...sampleEdges,
      {
        id: 'edge-2',
        source: 'conditional-1',
        target: 'habit-2',
        type: 'habit',
        data: { trigger: 'after', condition: '晴れ' },
      },
      {
        id: 'edge-3',
        source: 'conditional-1',
        target: 'habit-1',
        type: 'habit',
        data: { trigger: 'after', condition: '雨' },
      },
    ]

    renderHook(() => useConnectionValidation(sampleNodes, edgesWithConditional))

    // Conditional already has 2 outgoing connections
    const newHabit: FlowNode = {
      id: 'habit-3',
      type: 'habit',
      position: { x: 400, y: 0 },
      data: {
        habitId: 'habit-3',
        label: 'ストレッチ',
        icon: '🧘',
        isCompleted: false,
        completedAt: null,
      },
    }

    const nodesWithNewHabit = [...sampleNodes, newHabit]
    const { result: resultWithLimit } = renderHook(() =>
      useConnectionValidation(nodesWithNewHabit, edgesWithConditional),
    )

    expect(
      resultWithLimit.current.isValidConnection({
        source: 'conditional-1',
        target: 'habit-3',
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBe(false)
  })

  it('should prevent circular dependencies', () => {
    const circularEdges: FlowEdge[] = [
      {
        id: 'edge-1',
        source: 'habit-1',
        target: 'habit-2',
        type: 'habit',
        data: { trigger: 'after', condition: null },
      },
      {
        id: 'edge-2',
        source: 'habit-2',
        target: 'conditional-1',
        type: 'habit',
        data: { trigger: 'after', condition: null },
      },
    ]

    const { result } = renderHook(() => useConnectionValidation(sampleNodes, circularEdges))

    // Creating a connection from conditional-1 back to habit-1 would create a cycle
    expect(
      result.current.isValidConnection({
        source: 'conditional-1',
        target: 'habit-1',
        sourceHandle: null,
        targetHandle: null,
      }),
    ).toBe(false)
  })

  it('should provide validation messages', () => {
    const { result } = renderHook(() => useConnectionValidation(sampleNodes, sampleEdges))

    const selfConnectionResult = result.current.validateConnection({
      source: 'habit-1',
      target: 'habit-1',
      sourceHandle: null,
      targetHandle: null,
    })

    expect(selfConnectionResult.isValid).toBe(false)
    expect(selfConnectionResult.message).toContain('自己接続')
  })
})
