import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFlowAnimations } from '../useFlowAnimations';
import type { FlowNode, FlowEdge } from '../../types';

describe('useFlowAnimations - パス切り替え時のマージポイント', () => {
  it('ジョギング完了後にエアロバイク完了してもコールドシャワーはアクティブのまま', () => {
    // 実際の状態を再現
    const nodes: FlowNode[] = [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 50, y: 200 },
        data: { label: '朝7時', triggerType: 'time', icon: '⏰' },
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
        position: { x: 700, y: 100 },
        data: {
          habitId: 'habit-2',
          label: 'ジョギング',
          icon: '🏃',
          isCompleted: false, // ジョギングは未完了に戻っている
          completedAt: null,
        },
      },
      {
        id: 'habit-3',
        type: 'habit',
        position: { x: 700, y: 300 },
        data: {
          habitId: 'habit-3',
          label: 'エアロバイク',
          icon: '🚴',
          isCompleted: true, // エアロバイクが完了
          completedAt: '2025-07-03T02:16:39.662Z',
        },
      },
      {
        id: 'habit-4',
        type: 'habit',
        position: { x: 900, y: 200 },
        data: {
          habitId: 'habit-4',
          label: 'コールドシャワー',
          icon: '🚿',
          isCompleted: false,
          completedAt: null,
        },
      },
    ];

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
      {
        id: 'edge-yes',
        source: 'conditional-1',
        sourceHandle: 'yes',
        target: 'habit-2',
        type: 'habit',
        label: '晴れ',
        data: { trigger: 'after', condition: 'sunny' },
      },
      {
        id: 'edge-no',
        source: 'conditional-1',
        sourceHandle: 'no',
        target: 'habit-3',
        type: 'habit',
        label: '雨/曇り',
        data: { trigger: 'after', condition: 'not_sunny' },
      },
      {
        id: 'edge-3',
        source: 'habit-2',
        target: 'habit-4',
        type: 'habit',
        label: '運動後',
        data: { trigger: 'after', condition: null },
      },
      {
        id: 'edge-4',
        source: 'habit-3',
        target: 'habit-4',
        type: 'habit',
        label: '運動後',
        data: { trigger: 'after', condition: null },
      },
    ];

    const { result } = renderHook(() => useFlowAnimations(nodes, edges));
    const animatedNodes = result.current.nodes;

    const jogNode = animatedNodes.find(n => n.id === 'habit-2');
    const bikeNode = animatedNodes.find(n => n.id === 'habit-3');
    const showerNode = animatedNodes.find(n => n.id === 'habit-4');

    console.log('パス切り替え時の状態:', {
      jog: { 
        id: jogNode?.id, 
        label: jogNode?.data.label,
        isInactive: jogNode?.data.isInactive,
        isCompleted: jogNode?.data.isCompleted,
      },
      bike: { 
        id: bikeNode?.id, 
        label: bikeNode?.data.label,
        isInactive: bikeNode?.data.isInactive,
        isCompleted: bikeNode?.data.isCompleted,
      },
      shower: { 
        id: showerNode?.id, 
        label: showerNode?.data.label,
        isInactive: showerNode?.data.isInactive,
        isCompleted: showerNode?.data.isCompleted,
        // デバッグ情報
        incomingEdgeCount: edges.filter(e => e.target === 'habit-4').length,
      },
    });

    // アサーション
    expect(jogNode?.data.isInactive).toBe(true); // ジョギングは選択されていないパス
    expect(bikeNode?.data.isInactive).toBe(false); // エアロバイクは完了済み
    expect(showerNode?.data.isInactive).toBe(false); // マージポイントは常にアクティブであるべき！
  });
});