import { describe, it, expect } from 'vitest'
import type { FlowNode, FlowEdge } from '../../../../types'
import { FlowBuilder } from '../../../../test-utils/flowTestUtils'

// ノード削除ロジックのユニットテスト
// HabitFlowコンポーネントのhandleNodeDelete関数のロジックをテスト

describe('Node Deletion Logic', () => {
  // handleNodeDelete関数のロジックを抽出してテスト
  const testNodeDeletion = (
    nodes: FlowNode[],
    edges: FlowEdge[],
    nodeIdToDelete: string,
  ): {
    canDelete: boolean
    alertMessage?: string
    updatedNodes?: FlowNode[]
    updatedEdges?: FlowEdge[]
  } => {
    // 条件分岐のパスチェック用の関数（HabitFlowコンポーネントから抽出）
    const isPartOfConditionalPath = (
      nodeId: string,
    ): { isConditionalPath: boolean; conditionalId?: string; handle?: string } => {
      const visited = new Set<string>()
      const queue: string[] = [nodeId]

      while (queue.length > 0) {
        const currentId = queue.shift()!
        if (visited.has(currentId)) continue
        visited.add(currentId)

        const incomingEdges = edges.filter((e) => e.target === currentId)

        for (const edge of incomingEdges) {
          const sourceNode = nodes.find((n) => n.id === edge.source)
          if (sourceNode?.type === 'conditional') {
            return {
              isConditionalPath: true,
              conditionalId: edge.source,
              handle: edge.sourceHandle,
            }
          }
          queue.push(edge.source)
        }
      }

      return { isConditionalPath: false }
    }

    // マージポイント（複数の入力を持つノード）は削除できない
    const incomingEdgeCount = edges.filter((e) => e.target === nodeIdToDelete).length
    const isMergePoint = incomingEdgeCount > 1

    if (isMergePoint) {
      return {
        canDelete: false,
        alertMessage: 'マージポイント（複数の入力を持つノード）は削除できません',
      }
    }

    const pathInfo = isPartOfConditionalPath(nodeIdToDelete)

    if (pathInfo.isConditionalPath && pathInfo.conditionalId && pathInfo.handle) {
      // 同じ条件分岐の同じハンドルから始まるパス上のhabitノードを数える
      const countHabitNodesInConditionalPath = (): number => {
        let count = 0
        const visited = new Set<string>()

        const startEdge = edges.find(
          (e) => e.source === pathInfo.conditionalId && e.sourceHandle === pathInfo.handle,
        )

        if (!startEdge) return 0

        const traverse = (nodeId: string) => {
          if (visited.has(nodeId)) return
          visited.add(nodeId)

          const node = nodes.find((n) => n.id === nodeId)
          const incomingEdgeCount = edges.filter((e) => e.target === nodeId).length

          if (incomingEdgeCount > 1) {
            return
          }

          if (node?.type === 'habit') {
            count++
          }

          const outgoingEdges = edges.filter((e) => e.source === nodeId)
          for (const edge of outgoingEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target)
            if (targetNode && targetNode.type !== 'conditional') {
              traverse(edge.target)
            }
          }
        }

        traverse(startEdge.target)
        return count
      }

      const habitNodeCount = countHabitNodesInConditionalPath()

      if (habitNodeCount <= 1) {
        return {
          canDelete: false,
          alertMessage:
            '条件分岐の各パスには最低1つのノードが必要です。このノードは削除できません。',
        }
      }
    }

    // ノードを削除
    const updatedNodes = nodes.filter((node) => node.id !== nodeIdToDelete)

    // エッジの更新
    const incomingEdges = edges.filter((edge) => edge.target === nodeIdToDelete)
    const outgoingEdges = edges.filter((edge) => edge.source === nodeIdToDelete)

    const filteredEdges = edges.filter(
      (edge) => edge.source !== nodeIdToDelete && edge.target !== nodeIdToDelete,
    )

    const newEdges: FlowEdge[] = []

    if (incomingEdges.length > 0 && outgoingEdges.length > 0) {
      incomingEdges.forEach((inEdge) => {
        const sourceNode = nodes.find((n) => n.id === inEdge.source)

        if (sourceNode?.type === 'conditional') {
          outgoingEdges.forEach((outEdge) => {
            const newEdge: FlowEdge = {
              id: `edge-reconnect-${Date.now()}-${Math.random()}`,
              source: inEdge.source,
              target: outEdge.target,
              sourceHandle: inEdge.sourceHandle,
              type: 'habit',
              data: inEdge.data,
            }
            newEdges.push(newEdge)
          })
        } else {
          outgoingEdges.forEach((outEdge) => {
            const newEdge: FlowEdge = {
              id: `edge-reconnect-${Date.now()}-${Math.random()}`,
              source: inEdge.source,
              target: outEdge.target,
              type: 'habit',
              data: {
                trigger: 'after',
                condition: null,
              },
            }
            newEdges.push(newEdge)
          })
        }
      })
    }

    const updatedEdges = [...filteredEdges, ...newEdges]

    return {
      canDelete: true,
      updatedNodes,
      updatedEdges,
    }
  }

  describe('単純なチェーンでのノード削除', () => {
    it('中間ノードを削除すると前後が再接続される', () => {
      const builder = new FlowBuilder()
      builder
        .addTrigger('trigger1')
        .addHabit('habit1', { label: '習慣1' })
        .addHabit('habit2', { label: '習慣2' })
        .addHabit('habit3', { label: '習慣3' })
        .addEdge('trigger1', 'habit1')
        .addEdge('habit1', 'habit2')
        .addEdge('habit2', 'habit3')

      const { nodes, edges } = builder.build()

      const result = testNodeDeletion(nodes, edges, 'habit2')

      expect(result.canDelete).toBe(true)
      expect(result.updatedNodes).toHaveLength(nodes.length - 1)
      expect(result.updatedNodes?.find((n) => n.id === 'habit2')).toBeUndefined()

      // habit1とhabit3が直接接続されることを確認
      expect(result.updatedEdges).toContainEqual(
        expect.objectContaining({
          source: 'habit1',
          target: 'habit3',
        }),
      )
    })

    it('最初のhabitノードを削除するとトリガーが次のノードに接続される', () => {
      const builder = new FlowBuilder()
      builder
        .addTrigger('trigger1')
        .addHabit('habit1', { label: '習慣1' })
        .addHabit('habit2', { label: '習慣2' })
        .addEdge('trigger1', 'habit1')
        .addEdge('habit1', 'habit2')

      const { nodes, edges } = builder.build()

      const result = testNodeDeletion(nodes, edges, 'habit1')

      expect(result.canDelete).toBe(true)
      expect(result.updatedEdges).toContainEqual(
        expect.objectContaining({
          source: 'trigger1',
          target: 'habit2',
        }),
      )
    })

    it('最後のノードを削除してもエラーにならない', () => {
      const builder = new FlowBuilder()
      builder
        .addHabit('habit1', { label: '習慣1' })
        .addHabit('habit2', { label: '習慣2' })
        .addEdge('habit1', 'habit2')

      const { nodes, edges } = builder.build()

      const result = testNodeDeletion(nodes, edges, 'habit2')

      expect(result.canDelete).toBe(true)
      expect(result.updatedEdges).not.toContainEqual(
        expect.objectContaining({
          source: 'habit1',
          target: 'habit2',
        }),
      )
    })
  })

  describe('条件分岐でのノード削除', () => {
    it('条件分岐パスの最後のノードは削除できない', () => {
      const builder = new FlowBuilder()
      builder.addConditionalPattern('trigger1', 'weather1', ['jog1'], ['bike1'])

      const { nodes, edges } = builder.build()

      const result = testNodeDeletion(nodes, edges, 'jog1')

      expect(result.canDelete).toBe(false)
      expect(result.alertMessage).toBe(
        '条件分岐の各パスには最低1つのノードが必要です。このノードは削除できません。',
      )
    })

    it('条件分岐パスに複数ノードがある場合は削除可能', () => {
      const builder = new FlowBuilder()
      builder
        .addConditionalPattern('trigger1', 'weather1', ['jog1'], ['bike1'])
        .addHabit('stretch1', { label: 'ストレッチ' })
        .addEdge('jog1', 'stretch1')

      const { nodes, edges } = builder.build()

      const result = testNodeDeletion(nodes, edges, 'stretch1')

      expect(result.canDelete).toBe(true)
    })

    it('条件分岐からのエッジはsourceHandleを保持する', () => {
      const builder = new FlowBuilder()
      builder
        .addConditionalPattern('trigger1', 'weather1', ['jog1'], ['bike1'])
        .addHabit('stretch1', { label: 'ストレッチ' })
        .addEdge('jog1', 'stretch1')
        .addHabit('shower1', { label: 'シャワー' })
        .addEdge('stretch1', 'shower1')

      const { nodes, edges } = builder.build()

      // jog1を削除（条件分岐の直後のノード）
      const result = testNodeDeletion(nodes, edges, 'jog1')

      expect(result.canDelete).toBe(true)

      // weather1からstretch1への新しいエッジがsourceHandle='yes'を持つことを確認
      const newEdge = result.updatedEdges?.find(
        (e) => e.source === 'weather1' && e.target === 'stretch1',
      )
      expect(newEdge).toBeDefined()
      expect(newEdge?.sourceHandle).toBe('yes')
    })

    it('マージポイント（合流点）は削除できない', () => {
      const builder = new FlowBuilder()
      builder
        .addConditionalPattern('trigger1', 'weather1', ['jog1'], ['bike1'])
        .addHabit('shower1', { label: 'シャワー' })
        .addEdge('jog1', 'shower1')
        .addEdge('bike1', 'shower1')

      const { nodes, edges } = builder.build()

      const result = testNodeDeletion(nodes, edges, 'shower1')

      // マージポイントは削除できないべき
      expect(result.canDelete).toBe(false)
      expect(result.alertMessage).toBe('マージポイント（複数の入力を持つノード）は削除できません')
    })

    it('マージポイントの後にノードがある場合も削除できない', () => {
      const builder = new FlowBuilder()
      builder
        .addConditionalPattern('trigger1', 'weather1', ['jog1'], ['bike1'])
        .addHabit('shower1', { label: 'シャワー' })
        .addEdge('jog1', 'shower1')
        .addEdge('bike1', 'shower1')
        .addHabit('breakfast1', { label: '朝食' })
        .addEdge('shower1', 'breakfast1')

      const { nodes, edges } = builder.build()

      const result = testNodeDeletion(nodes, edges, 'shower1')

      // マージポイントは削除できないべき
      expect(result.canDelete).toBe(false)
      expect(result.alertMessage).toBe('マージポイント（複数の入力を持つノード）は削除できません')
    })
  })
})
