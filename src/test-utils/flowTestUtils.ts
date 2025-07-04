import type { FlowNode, FlowEdge, HabitNode, TriggerNode, ConditionalNode } from '../types'

/**
 * テスト用のフロー構造を簡単に作成するためのビルダークラス
 */
export class FlowBuilder {
  private nodes: FlowNode[] = []
  private edges: FlowEdge[] = []
  private nodeCounter = 0
  private edgeCounter = 0

  /**
   * トリガーノードを追加
   */
  addTrigger(id?: string, options: Partial<TriggerNode['data']> = {}): FlowBuilder {
    const nodeId = id || `trigger-${++this.nodeCounter}`
    this.nodes.push({
      id: nodeId,
      type: 'trigger',
      position: { x: 50, y: 200 },
      data: {
        label: '朝7時',
        triggerType: 'time',
        icon: '⏰',
        ...options,
      },
    })
    return this
  }

  /**
   * 習慣ノードを追加
   */
  addHabit(
    id?: string,
    options: Partial<HabitNode['data']> = {},
    position?: { x: number; y: number },
  ): FlowBuilder {
    const nodeId = id || `habit-${++this.nodeCounter}`
    this.nodes.push({
      id: nodeId,
      type: 'habit',
      position: position || { x: 250 + this.nodeCounter * 200, y: 200 },
      data: {
        habitId: nodeId,
        label: `習慣${this.nodeCounter}`,
        icon: '📝',
        isCompleted: false,
        completedAt: null,
        ...options,
      },
    } as HabitNode)
    return this
  }

  /**
   * 条件分岐ノードを追加
   */
  addConditional(
    id?: string,
    options: Partial<ConditionalNode['data']> = {},
    position?: { x: number; y: number },
  ): FlowBuilder {
    const nodeId = id || `conditional-${++this.nodeCounter}`
    this.nodes.push({
      id: nodeId,
      type: 'conditional',
      position: position || { x: 450, y: 200 },
      data: {
        label: '条件分岐',
        condition: '条件',
        icon: '❓',
        ...options,
      },
    })
    return this
  }

  /**
   * エッジを追加
   */
  addEdge(source: string, target: string, options: Partial<FlowEdge> = {}): FlowBuilder {
    const edgeId = options.id || `edge-${++this.edgeCounter}`
    this.edges.push({
      id: edgeId,
      source,
      target,
      type: 'habit',
      data: {
        trigger: 'after',
        condition: null,
      },
      ...options,
    } as FlowEdge)
    return this
  }

  /**
   * 条件分岐からのエッジを追加（sourceHandle付き）
   */
  addConditionalEdge(
    source: string,
    target: string,
    handle: 'yes' | 'no',
    label?: string,
  ): FlowBuilder {
    return this.addEdge(source, target, {
      sourceHandle: handle,
      label,
      data: {
        trigger: 'after',
        condition: handle === 'yes' ? 'sunny' : 'not_sunny',
      },
    })
  }

  /**
   * ノードのチェーンを作成
   */
  addChain(nodeIds: string[], nodeType: 'habit' | 'trigger' = 'habit'): FlowBuilder {
    for (let i = 0; i < nodeIds.length; i++) {
      if (nodeType === 'habit') {
        this.addHabit(nodeIds[i], {
          label: nodeIds[i],
        })
      } else if (i === 0) {
        this.addTrigger(nodeIds[i])
      }

      if (i > 0) {
        this.addEdge(nodeIds[i - 1], nodeIds[i])
      }
    }
    return this
  }

  /**
   * 条件分岐パターンを作成
   */
  addConditionalPattern(
    triggerId: string,
    conditionalId: string,
    yesPath: string[],
    noPath: string[],
  ): FlowBuilder {
    // トリガーと条件分岐を接続
    this.addTrigger(triggerId)
    this.addConditional(conditionalId, {
      label: '天気をチェック',
      condition: '晴れている？',
      icon: '🌤️',
    })
    this.addEdge(triggerId, conditionalId)

    // Yesパス
    if (yesPath.length > 0) {
      this.addHabit(yesPath[0], { label: yesPath[0] }, { x: 700, y: 100 })
      this.addConditionalEdge(conditionalId, yesPath[0], 'yes', '晴れ')
      for (let i = 1; i < yesPath.length; i++) {
        this.addHabit(yesPath[i], { label: yesPath[i] }, { x: 700 + i * 200, y: 100 })
        this.addEdge(yesPath[i - 1], yesPath[i])
      }
    }

    // Noパス
    if (noPath.length > 0) {
      this.addHabit(noPath[0], { label: noPath[0] }, { x: 700, y: 300 })
      this.addConditionalEdge(conditionalId, noPath[0], 'no', '雨/曇り')
      for (let i = 1; i < noPath.length; i++) {
        this.addHabit(noPath[i], { label: noPath[i] }, { x: 700 + i * 200, y: 300 })
        this.addEdge(noPath[i - 1], noPath[i])
      }
    }

    return this
  }

  /**
   * 合流点を追加
   */
  addMergePoint(sourceIds: string[], mergeNodeId: string): FlowBuilder {
    this.addHabit(mergeNodeId, { label: mergeNodeId }, { x: 900, y: 200 })
    sourceIds.forEach((sourceId) => {
      this.addEdge(sourceId, mergeNodeId)
    })
    return this
  }

  /**
   * ノードを取得
   */
  getNode(id: string): FlowNode | undefined {
    return this.nodes.find((n) => n.id === id)
  }

  /**
   * エッジを取得
   */
  getEdge(id: string): FlowEdge | undefined {
    return this.edges.find((e) => e.id === id)
  }

  /**
   * ビルド結果を取得
   */
  build(): { nodes: FlowNode[]; edges: FlowEdge[] } {
    return {
      nodes: [...this.nodes],
      edges: [...this.edges],
    }
  }
}

/**
 * 標準的なテストフローを作成
 */
export function createStandardTestFlow() {
  return new FlowBuilder()
    .addConditionalPattern(
      'trigger-1',
      'conditional-1',
      ['ジョギング', 'コールドシャワー'],
      ['エアロバイク', 'コールドシャワー'],
    )
    .build()
}

/**
 * 条件分岐と合流のあるフローを作成
 */
export function createConditionalFlowWithMerge() {
  const builder = new FlowBuilder()

  builder
    .addTrigger('trigger-1')
    .addHabit('water', { label: '水を飲む' })
    .addConditional('weather-check', {
      label: '天気をチェック',
      condition: '晴れている？',
    })
    .addEdge('trigger-1', 'water')
    .addEdge('water', 'weather-check')
    // 晴れパス
    .addHabit('jog', { label: 'ジョギング' }, { x: 700, y: 100 })
    .addConditionalEdge('weather-check', 'jog', 'yes', '晴れ')
    // 雨パス
    .addHabit('bike', { label: 'エアロバイク' }, { x: 700, y: 300 })
    .addConditionalEdge('weather-check', 'bike', 'no', '雨')
    // 合流
    .addMergePoint(['jog', 'bike'], 'shower')

  return builder.build()
}

/**
 * ノードの状態を更新するヘルパー
 */
export function updateNodeData<T extends FlowNode>(
  nodes: FlowNode[],
  nodeId: string,
  data: Partial<T['data']>,
): FlowNode[] {
  return nodes.map((node) =>
    node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node,
  )
}

/**
 * ノードを完了状態にする
 */
export function completeNode(nodes: FlowNode[], nodeId: string): FlowNode[] {
  return updateNodeData<HabitNode>(nodes, nodeId, {
    isCompleted: true,
    completedAt: new Date(),
  })
}

/**
 * 特定の条件を満たすノードを検索
 */
export function findNodesByType(nodes: FlowNode[], type: FlowNode['type']): FlowNode[] {
  return nodes.filter((node) => node.type === type)
}

/**
 * パスに属するノードを取得
 */
export function getNodesInPath(
  nodes: FlowNode[],
  edges: FlowEdge[],
  startNodeId: string,
  stopAtMerge = true,
): string[] {
  const result: string[] = []
  const visited = new Set<string>()

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    result.push(nodeId)

    // 合流点で停止
    if (stopAtMerge) {
      const incomingEdges = edges.filter((e) => e.target === nodeId)
      if (incomingEdges.length > 1) return
    }

    // 下流を探索
    const outgoingEdges = edges.filter((e) => e.source === nodeId)
    outgoingEdges.forEach((edge) => traverse(edge.target))
  }

  traverse(startNodeId)
  return result
}
