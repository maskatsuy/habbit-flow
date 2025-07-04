import { describe, it, expect } from 'vitest'
import type { FlowEdge } from '../../../../types'

describe('ノード挿入時のエッジ作成', () => {
  it('条件分岐から出るエッジにノードを挿入する場合、sourceHandleを保持する', () => {
    // 既存のエッジ（条件分岐からジョギングへ）
    const existingEdge: FlowEdge = {
      id: 'edge-yes',
      source: 'conditional-1',
      sourceHandle: 'yes',
      target: 'habit-2',
      type: 'habit',
      data: {
        trigger: 'after',
        condition: 'sunny',
      },
    }

    // ノード挿入処理をシミュレート
    const nodeId = 'habit-muscle'

    // 新しいエッジ1（条件分岐から筋トレへ）
    const newEdge1: FlowEdge = {
      id: `edge-1`,
      source: existingEdge.source,
      sourceHandle: existingEdge.sourceHandle, // 重要：sourceHandleを保持
      target: nodeId,
      type: 'habit',
      data: existingEdge.data,
    }

    // 新しいエッジ2（筋トレからジョギングへ）
    const newEdge2: FlowEdge = {
      id: `edge-2`,
      source: nodeId,
      target: existingEdge.target,
      type: 'habit',
      data: {
        trigger: 'after',
        condition: null,
      },
    }

    // アサーション
    expect(newEdge1.sourceHandle).toBe('yes')
    expect(newEdge1.source).toBe('conditional-1')
    expect(newEdge1.target).toBe('habit-muscle')
    expect(newEdge1.data.condition).toBe('sunny')

    expect(newEdge2.source).toBe('habit-muscle')
    expect(newEdge2.target).toBe('habit-2')
    expect(newEdge2.sourceHandle).toBeUndefined() // 筋トレからのエッジにはsourceHandleは不要
  })

  it('通常のノード間のエッジにノードを挿入する場合', () => {
    // 既存のエッジ（水を飲むから条件分岐へ）
    const existingEdge: FlowEdge = {
      id: 'edge-2',
      source: 'habit-1',
      target: 'conditional-1',
      type: 'habit',
      data: {
        trigger: 'after',
        condition: null,
      },
    }

    // ノード挿入処理をシミュレート
    const nodeId = 'habit-stretch'

    // 新しいエッジ1
    const newEdge1: FlowEdge = {
      id: `edge-1`,
      source: existingEdge.source,
      sourceHandle: existingEdge.sourceHandle, // undefined でも問題ない
      target: nodeId,
      type: 'habit',
      data: existingEdge.data,
    }

    // 新しいエッジ2
    const newEdge2: FlowEdge = {
      id: `edge-2`,
      source: nodeId,
      target: existingEdge.target,
      type: 'habit',
      data: {
        trigger: 'after',
        condition: null,
      },
    }

    // アサーション
    expect(newEdge1.sourceHandle).toBeUndefined()
    expect(newEdge1.source).toBe('habit-1')
    expect(newEdge1.target).toBe('habit-stretch')

    expect(newEdge2.source).toBe('habit-stretch')
    expect(newEdge2.target).toBe('conditional-1')
  })
})
