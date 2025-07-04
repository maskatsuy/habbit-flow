import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFlowAnimations } from '../useFlowAnimations'
import type { FlowNode, FlowEdge } from '../../types'

describe('useFlowAnimations - 手動テストシナリオ', () => {
  it('ジョギング完了後に筋トレを前に追加した場合、筋トレは未選択にならない', () => {
    // 初期状態のノード（サンプルフローと同じ構造）
    const nodes: FlowNode[] = [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 50, y: 200 },
        data: { label: '朝7時', icon: '⏰', time: '07:00' },
      },
      {
        id: 'habit-1',
        type: 'habit',
        position: { x: 250, y: 200 },
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
        position: { x: 450, y: 200 },
        data: {
          label: '天気をチェック',
          condition: '晴れている？',
          icon: '🌤️',
        },
      },
      {
        id: 'habit-2',
        type: 'habit',
        position: { x: 450, y: 100 },
        data: {
          habitId: 'habit-2',
          label: 'ジョギング',
          description: '30分間のジョギング',
          icon: '🏃',
          timing: 'morning',
          isCompleted: true, // 完了済み
          completedAt: new Date().toISOString(),
        },
      },
      {
        id: 'habit-3',
        type: 'habit',
        position: { x: 450, y: 300 },
        data: {
          habitId: 'habit-3',
          label: 'エアロバイク',
          description: '室内でのエアロバイク',
          icon: '🚴',
          timing: 'morning',
          isCompleted: false,
          completedAt: null,
        },
      },
      // 新しく追加した筋トレノード
      {
        id: 'habit-muscle',
        type: 'habit',
        position: { x: 350, y: 100 },
        data: {
          habitId: 'habit-muscle',
          label: '筋トレ',
          description: '筋力トレーニング',
          icon: '💪',
          timing: 'morning',
          isCompleted: false,
          completedAt: null,
        },
      },
    ]

    // エッジ（筋トレが条件分岐とジョギングの間に挿入された状態）
    const edges: FlowEdge[] = [
      {
        id: 'edge-1',
        source: 'trigger-1',
        target: 'habit-1',
        type: 'habit',
        data: { trigger: 'after', condition: null },
      },
      {
        id: 'edge-2',
        source: 'habit-1',
        target: 'conditional-1',
        type: 'habit',
        data: { trigger: 'after', condition: null },
      },
      // 条件分岐から筋トレへ（晴れの場合）
      {
        id: 'edge-2-new',
        source: 'conditional-1',
        sourceHandle: 'yes',
        target: 'habit-muscle',
        type: 'habit',
        data: { trigger: 'after', condition: 'sunny' },
      },
      // 筋トレからジョギングへ
      {
        id: 'edge-muscle-jog',
        source: 'habit-muscle',
        target: 'habit-2',
        type: 'habit',
        data: { trigger: 'after', condition: null },
      },
      // 条件分岐からエアロバイクへ（雨の場合）
      {
        id: 'edge-3',
        source: 'conditional-1',
        sourceHandle: 'no',
        target: 'habit-3',
        type: 'habit',
        data: { trigger: 'after', condition: 'not_sunny' },
      },
    ]

    const { result } = renderHook(() => useFlowAnimations(nodes, edges))
    const animatedNodes = result.current.nodes

    // 各ノードの状態を確認
    const muscleNode = animatedNodes.find((n) => n.id === 'habit-muscle')
    const jogNode = animatedNodes.find((n) => n.id === 'habit-2')
    const bikeNode = animatedNodes.find((n) => n.id === 'habit-3')

    console.log('筋トレノード:', {
      id: muscleNode?.id,
      isInactive: muscleNode?.data.isInactive,
      isCompleted: muscleNode?.data.isCompleted,
    })
    console.log('ジョギングノード:', {
      id: jogNode?.id,
      isInactive: jogNode?.data.isInactive,
      isCompleted: jogNode?.data.isCompleted,
    })
    console.log('エアロバイクノード:', {
      id: bikeNode?.id,
      isInactive: bikeNode?.data.isInactive,
      isCompleted: bikeNode?.data.isCompleted,
    })

    // アサーション
    expect(muscleNode?.data.isInactive).toBe(false) // 筋トレは選択されたパスなのでアクティブ
    expect(jogNode?.data.isInactive).toBe(false) // ジョギングは完了済みなのでアクティブ
    expect(bikeNode?.data.isInactive).toBe(true) // エアロバイクは選択されていないパスなので未選択
  })
})
