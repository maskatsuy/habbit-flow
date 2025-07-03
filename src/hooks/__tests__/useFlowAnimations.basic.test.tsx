import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFlowAnimations } from '../useFlowAnimations';
import { FlowBuilder } from '../../test-utils/flowTestUtils';

describe('useFlowAnimations - 基本的な動作', () => {
  it('フックがエラーなく実行される', () => {
    const builder = new FlowBuilder();
    builder
      .addTrigger('trigger1')
      .addHabit('habit1', { label: '習慣1' })
      .addEdge('trigger1', 'habit1');

    const { nodes, edges } = builder.build();
    
    const { result } = renderHook(() => useFlowAnimations(nodes, edges));
    
    // フックが正常に動作し、結果を返すことを確認
    expect(result.current).toBeDefined();
    expect(result.current.nodes).toBeDefined();
    expect(result.current.edges).toBeDefined();
    expect(Array.isArray(result.current.nodes)).toBe(true);
    expect(Array.isArray(result.current.edges)).toBe(true);
  });

  it('ノードとエッジの数が変わらない', () => {
    const builder = new FlowBuilder();
    builder
      .addConditionalPattern(
        'trigger1',
        'weather1',
        ['jog1'],
        ['bike1']
      );

    const { nodes, edges } = builder.build();
    
    const { result } = renderHook(() => useFlowAnimations(nodes, edges));
    
    // アニメーション処理後もノードとエッジの数は変わらない
    expect(result.current.nodes).toHaveLength(nodes.length);
    expect(result.current.edges).toHaveLength(edges.length);
  });

  it('完了済みノードの情報が保持される', () => {
    const builder = new FlowBuilder();
    builder
      .addTrigger('trigger1')
      .addHabit('habit1', { label: '習慣1', isCompleted: true })
      .addHabit('habit2', { label: '習慣2', isCompleted: false })
      .addEdge('trigger1', 'habit1')
      .addEdge('habit1', 'habit2');

    const { nodes, edges } = builder.build();
    
    const { result } = renderHook(() => useFlowAnimations(nodes, edges));
    const animatedNodes = result.current.nodes;
    
    // 元の完了状態が保持されていることを確認
    const habit1 = animatedNodes.find(n => n.id === 'habit1');
    const habit2 = animatedNodes.find(n => n.id === 'habit2');
    
    expect(habit1?.data.isCompleted).toBe(true);
    expect(habit2?.data.isCompleted).toBe(false);
  });

  it('条件分岐構造でもエラーが発生しない', () => {
    const builder = new FlowBuilder();
    builder
      .addConditionalPattern(
        'trigger1',
        'weather1',
        ['jog1', 'stretch1'],
        ['bike1', 'hydrate1']
      )
      .addHabit('shower1', { label: 'シャワー' })
      .addEdge('jog1', 'shower1')
      .addEdge('bike1', 'shower1');

    const { nodes: initialNodes, edges } = builder.build();
    
    // 一部のノードを完了済みにする
    const nodes = initialNodes.map(n => 
      n.id === 'jog1' || n.id === 'stretch1'
        ? { ...n, data: { ...n.data, isCompleted: true } }
        : n
    );
    
    const { result } = renderHook(() => useFlowAnimations(nodes, edges));
    
    // エラーなく実行されることを確認
    expect(result.current.nodes).toBeDefined();
    expect(result.current.edges).toBeDefined();
    
    // 基本的な構造が保持されていることを確認
    const animatedNodes = result.current.nodes;
    expect(animatedNodes.find(n => n.id === 'trigger1')).toBeDefined();
    expect(animatedNodes.find(n => n.id === 'weather1')).toBeDefined();
    expect(animatedNodes.find(n => n.id === 'jog1')).toBeDefined();
    expect(animatedNodes.find(n => n.id === 'bike1')).toBeDefined();
  });
});