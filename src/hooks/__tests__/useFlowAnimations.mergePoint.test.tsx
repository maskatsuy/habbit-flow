import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFlowAnimations } from '../useFlowAnimations'
import { FlowBuilder } from '../../test-utils/flowTestUtils'

describe('useFlowAnimations - マージポイントの状態管理', () => {
  it('一つのパスが完了してももう一つのパスを完了できる（マージポイントは影響を受けない）', () => {
    const builder = new FlowBuilder()
    builder
      .addConditionalPattern(
        'trigger1',
        'weather1',
        ['jog1'], // Yes: ジョギング
        ['bike1'], // No: エアロバイク
      )
      .addHabit('shower1', { label: 'コールドシャワー' })
      .addEdge('jog1', 'shower1')
      .addEdge('bike1', 'shower1')

    const { nodes: initialNodes, edges } = builder.build()

    // ステップ1: ジョギングを完了
    let nodes = initialNodes.map((n) =>
      n.id === 'jog1' ? { ...n, data: { ...n.data, isCompleted: true } } : n,
    )

    const { result: result1 } = renderHook(() => useFlowAnimations(nodes, edges))
    const animatedNodes1 = result1.current.nodes

    const jogNode1 = animatedNodes1.find((n) => n.id === 'jog1')
    const bikeNode1 = animatedNodes1.find((n) => n.id === 'bike1')
    const showerNode1 = animatedNodes1.find((n) => n.id === 'shower1')

    // この時点での状態を確認
    expect(jogNode1?.data.isInactive).toBe(false) // 完了済み
    expect(bikeNode1?.data.isInactive).toBe(true) // 選択されていないパス
    expect(showerNode1?.data.isInactive).toBe(false) // マージポイントはアクティブ

    // ステップ2: エアロバイクも完了（パス切り替え）
    nodes = nodes.map((n) =>
      n.id === 'bike1' ? { ...n, data: { ...n.data, isCompleted: true } } : n,
    )

    const { result: result2 } = renderHook(() => useFlowAnimations(nodes, edges))
    const animatedNodes2 = result2.current.nodes

    const jogNode2 = animatedNodes2.find((n) => n.id === 'jog1')
    const bikeNode2 = animatedNodes2.find((n) => n.id === 'bike1')
    const showerNode2 = animatedNodes2.find((n) => n.id === 'shower1')

    // 両方のパスが完了済みの場合の状態
    expect(jogNode2?.data.isInactive).toBe(false) // 完了済み
    expect(bikeNode2?.data.isInactive).toBe(false) // 完了済み
    expect(showerNode2?.data.isInactive).toBe(false) // マージポイントは常にアクティブ
  })

  it('マージポイントは条件分岐の影響を受けない', () => {
    const builder = new FlowBuilder()

    // サンプルフローと同じ構造
    builder
      .addTrigger('trigger1')
      .addHabit('water1', { label: '水を飲む' })
      .addEdge('trigger1', 'water1')
      .addConditional('weather1', { label: '天気をチェック' })
      .addEdge('water1', 'weather1')
      .addHabit('jog1', { label: 'ジョギング' })
      .addHabit('bike1', { label: 'エアロバイク' })
      .addEdge('weather1', 'jog1', { sourceHandle: 'yes', condition: 'sunny' })
      .addEdge('weather1', 'bike1', { sourceHandle: 'no', condition: 'not_sunny' })
      .addHabit('shower1', { label: 'コールドシャワー' })
      .addEdge('jog1', 'shower1')
      .addEdge('bike1', 'shower1')

    const { nodes: initialNodes, edges } = builder.build()

    // ジョギングを完了
    const nodes = initialNodes.map((n) =>
      n.id === 'jog1' ? { ...n, data: { ...n.data, isCompleted: true } } : n,
    )

    const { result } = renderHook(() => useFlowAnimations(nodes, edges))
    const animatedNodes = result.current.nodes

    const waterNode = animatedNodes.find((n) => n.id === 'water1')
    const jogNode = animatedNodes.find((n) => n.id === 'jog1')
    const bikeNode = animatedNodes.find((n) => n.id === 'bike1')
    const showerNode = animatedNodes.find((n) => n.id === 'shower1')

    console.log('マージポイントテスト結果:', {
      water: { id: waterNode?.id, isInactive: waterNode?.data.isInactive },
      jog: {
        id: jogNode?.id,
        isInactive: jogNode?.data.isInactive,
        isCompleted: jogNode?.data.isCompleted,
      },
      bike: {
        id: bikeNode?.id,
        isInactive: bikeNode?.data.isInactive,
        isCompleted: bikeNode?.data.isCompleted,
      },
      shower: {
        id: showerNode?.id,
        isInactive: showerNode?.data.isInactive,
        isCompleted: showerNode?.data.isCompleted,
      },
    })

    // アサーション
    expect(waterNode?.data.isInactive).toBe(false) // 条件分岐前は影響なし
    expect(jogNode?.data.isInactive).toBe(false) // 完了済み
    expect(bikeNode?.data.isInactive).toBe(true) // 選択されていないパス
    expect(showerNode?.data.isInactive).toBe(false) // マージポイントは影響を受けない！
  })

  it('マージポイント自体が完了してもパスの選択状態は変わらない', () => {
    const builder = new FlowBuilder()
    builder
      .addConditionalPattern('trigger1', 'weather1', ['jog1'], ['bike1'])
      .addHabit('shower1', { label: 'コールドシャワー' })
      .addEdge('jog1', 'shower1')
      .addEdge('bike1', 'shower1')

    const { nodes: initialNodes, edges } = builder.build()

    // ジョギングとシャワーを完了
    const nodes = initialNodes.map((n) =>
      n.id === 'jog1' || n.id === 'shower1' ? { ...n, data: { ...n.data, isCompleted: true } } : n,
    )

    const { result } = renderHook(() => useFlowAnimations(nodes, edges))
    const animatedNodes = result.current.nodes

    const jogNode = animatedNodes.find((n) => n.id === 'jog1')
    const bikeNode = animatedNodes.find((n) => n.id === 'bike1')
    const showerNode = animatedNodes.find((n) => n.id === 'shower1')

    // アサーション
    expect(jogNode?.data.isInactive).toBe(false) // 完了済み
    expect(bikeNode?.data.isInactive).toBe(true) // 選択されていないパスのまま
    expect(showerNode?.data.isInactive).toBe(false) // 完了済み
  })
})
