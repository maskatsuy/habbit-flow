import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFlowAnimations } from '../useFlowAnimations';
import { FlowBuilder } from '../../test-utils/flowTestUtils';

describe('useFlowAnimations - 条件分岐での動的ノード追加', () => {
  it('選択されたパスに追加されたノードは未選択状態にならない', () => {
    const builder = new FlowBuilder();
    
    // 初期状態：条件分岐でジョギングを選択
    builder
      .addConditionalPattern(
        'trigger1',
        'weather1',
        ['jog1'],  // Yes: ジョギング
        ['bike1']  // No: エアロバイク
      )
      .addHabit('shower1', { label: 'シャワー' })
      .addEdge('jog1', 'shower1')
      .addEdge('bike1', 'shower1');

    const { nodes: initialNodes, edges: initialEdges } = builder.build();
    
    // ジョギングを完了させる
    const nodesWithJogCompleted = initialNodes.map(n => 
      n.id === 'jog1' 
        ? { ...n, data: { ...n.data, isCompleted: true } }
        : n
    );
    
    // ジョギングの前に筋トレを追加
    const muscleTrainingNode = {
      id: 'muscle1',
      type: 'habit' as const,
      position: { x: 300, y: 100 },
      data: {
        habitId: 'muscle1',
        label: '筋トレ',
        description: '筋力トレーニング',
        icon: '💪',
        timing: 'morning' as const,
        isCompleted: false,
        completedAt: null,
      },
    };
    
    // エッジを更新（weather1 -> muscle1 -> jog1）
    const edgesWithMuscleTraining = [
      ...initialEdges.filter(e => !(e.source === 'weather1' && e.target === 'jog1')),
      {
        id: 'edge-weather-muscle',
        source: 'weather1',
        sourceHandle: 'yes',
        target: 'muscle1',
        type: 'habit' as const,
        data: { trigger: 'after' as const, condition: 'sunny' as const },
      },
      {
        id: 'edge-muscle-jog',
        source: 'muscle1',
        target: 'jog1',
        type: 'habit' as const,
        data: { trigger: 'after' as const, condition: null },
      },
    ];
    
    const nodesWithMuscleTraining = [...nodesWithJogCompleted, muscleTrainingNode];
    
    // useFlowAnimationsを実行
    const { result } = renderHook(() => 
      useFlowAnimations(nodesWithMuscleTraining, edgesWithMuscleTraining)
    );
    
    const animatedNodes = result.current.nodes;
    
    // 筋トレノードを取得
    const muscleNode = animatedNodes.find(n => n.id === 'muscle1');
    const jogNode = animatedNodes.find(n => n.id === 'jog1');
    const bikeNode = animatedNodes.find(n => n.id === 'bike1');
    
    // アサーション
    expect(muscleNode?.data.isInactive).toBe(false); // 筋トレは選択されたパスなので未選択ではない
    expect(jogNode?.data.isInactive).toBe(false); // ジョギングは完了済みなので未選択ではない
    expect(bikeNode?.data.isInactive).toBe(true); // エアロバイクは選択されていないパスなので未選択
  });

  it('選択されていないパスに追加されたノードは未選択状態になる', () => {
    const builder = new FlowBuilder();
    
    // 初期状態：条件分岐でジョギングを選択
    builder
      .addConditionalPattern(
        'trigger1',
        'weather1',
        ['jog1'],  // Yes: ジョギング
        ['bike1']  // No: エアロバイク
      )
      .addHabit('shower1', { label: 'シャワー' })
      .addEdge('jog1', 'shower1')
      .addEdge('bike1', 'shower1');

    const { nodes: initialNodes, edges: initialEdges } = builder.build();
    
    // ジョギングを完了させる
    const nodesWithJogCompleted = initialNodes.map(n => 
      n.id === 'jog1' 
        ? { ...n, data: { ...n.data, isCompleted: true } }
        : n
    );
    
    // エアロバイクの前にストレッチを追加
    const stretchNode = {
      id: 'stretch1',
      type: 'habit' as const,
      position: { x: 300, y: 300 },
      data: {
        habitId: 'stretch1',
        label: 'ストレッチ',
        description: 'ストレッチ',
        icon: '🧘',
        timing: 'morning' as const,
        isCompleted: false,
        completedAt: null,
      },
    };
    
    // エッジを更新（weather1 -> stretch1 -> bike1）
    const edgesWithStretch = [
      ...initialEdges.filter(e => !(e.source === 'weather1' && e.target === 'bike1')),
      {
        id: 'edge-weather-stretch',
        source: 'weather1',
        sourceHandle: 'no',
        target: 'stretch1',
        type: 'habit' as const,
        data: { trigger: 'after' as const, condition: 'not_sunny' as const },
      },
      {
        id: 'edge-stretch-bike',
        source: 'stretch1',
        target: 'bike1',
        type: 'habit' as const,
        data: { trigger: 'after' as const, condition: null },
      },
    ];
    
    const nodesWithStretch = [...nodesWithJogCompleted, stretchNode];
    
    // useFlowAnimationsを実行
    const { result } = renderHook(() => 
      useFlowAnimations(nodesWithStretch, edgesWithStretch)
    );
    
    const animatedNodes = result.current.nodes;
    
    // ノードを取得
    const stretchNodeResult = animatedNodes.find(n => n.id === 'stretch1');
    const bikeNode = animatedNodes.find(n => n.id === 'bike1');
    const jogNode = animatedNodes.find(n => n.id === 'jog1');
    
    // アサーション
    expect(stretchNodeResult?.data.isInactive).toBe(true); // ストレッチは選択されていないパスなので未選択
    expect(bikeNode?.data.isInactive).toBe(true); // エアロバイクも選択されていないパスなので未選択
    expect(jogNode?.data.isInactive).toBe(false); // ジョギングは完了済みなので未選択ではない
  });

  it('完了後に追加されたノードが、後から完了された場合の動作', () => {
    const builder = new FlowBuilder();
    
    // 初期状態
    builder
      .addConditionalPattern(
        'trigger1',
        'weather1',
        ['jog1'],
        ['bike1']
      );

    const { nodes: initialNodes, edges: initialEdges } = builder.build();
    
    // ジョギングを完了
    let nodes = initialNodes.map(n => 
      n.id === 'jog1' 
        ? { ...n, data: { ...n.data, isCompleted: true } }
        : n
    );
    
    // 筋トレを追加
    const muscleNode = {
      id: 'muscle1',
      type: 'habit' as const,
      position: { x: 300, y: 100 },
      data: {
        habitId: 'muscle1',
        label: '筋トレ',
        description: '筋力トレーニング',
        icon: '💪',
        timing: 'morning' as const,
        isCompleted: false,
        completedAt: null,
      },
    };
    
    const edges = [
      ...initialEdges.filter(e => !(e.source === 'weather1' && e.target === 'jog1')),
      {
        id: 'edge-weather-muscle',
        source: 'weather1',
        sourceHandle: 'yes',
        target: 'muscle1',
        type: 'habit' as const,
        data: { trigger: 'after' as const, condition: 'sunny' as const },
      },
      {
        id: 'edge-muscle-jog',
        source: 'muscle1',
        target: 'jog1',
        type: 'habit' as const,
        data: { trigger: 'after' as const, condition: null },
      },
    ];
    
    nodes = [...nodes, muscleNode];
    
    // 最初の状態をチェック
    const { result: result1 } = renderHook(() => useFlowAnimations(nodes, edges));
    const muscleNode1 = result1.current.nodes.find(n => n.id === 'muscle1');
    expect(muscleNode1?.data.isInactive).toBe(false); // 選択されたパスなので未選択ではない
    
    // 筋トレも完了させる
    nodes = nodes.map(n => 
      n.id === 'muscle1' 
        ? { ...n, data: { ...n.data, isCompleted: true } }
        : n
    );
    
    // 完了後の状態をチェック
    const { result: result2 } = renderHook(() => useFlowAnimations(nodes, edges));
    const muscleNode2 = result2.current.nodes.find(n => n.id === 'muscle1');
    const bikeNode2 = result2.current.nodes.find(n => n.id === 'bike1');
    
    expect(muscleNode2?.data.isInactive).toBe(false); // 完了済みなので未選択ではない
    expect(bikeNode2?.data.isInactive).toBe(true); // 選択されていないパスなので未選択のまま
  });
});