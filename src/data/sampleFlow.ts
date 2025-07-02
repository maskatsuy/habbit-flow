import type { FlowNode, FlowEdge, HabitNode as HabitNodeType } from '../types';

export const initialNodes: FlowNode[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 50, y: 200 },
    data: {
      label: '朝7時',
      triggerType: 'time',
      icon: '⏰',
    },
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
  } as HabitNodeType,
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
      isCompleted: false,
      completedAt: null,
    },
  } as HabitNodeType,
  {
    id: 'habit-3',
    type: 'habit',
    position: { x: 700, y: 300 },
    data: {
      habitId: 'habit-3',
      label: 'エアロバイク',
      icon: '🚴',
      isCompleted: false,
      completedAt: null,
    },
  } as HabitNodeType,
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
  } as HabitNodeType,
];

export const initialEdges: FlowEdge[] = [
  {
    id: 'edge-1',
    source: 'trigger-1',
    target: 'habit-1',
    type: 'habit',
    data: {
      trigger: 'after',
      condition: null,
    },
  },
  {
    id: 'edge-2',
    source: 'habit-1',
    target: 'conditional-1',
    type: 'habit',
    data: {
      trigger: 'after',
      condition: null,
    },
  },
  {
    id: 'edge-yes',
    source: 'conditional-1',
    sourceHandle: 'yes',
    target: 'habit-2',
    type: 'habit',
    label: '晴れ',
    data: {
      trigger: 'after',
      condition: 'sunny',
    },
  },
  {
    id: 'edge-no',
    source: 'conditional-1',
    sourceHandle: 'no',
    target: 'habit-3',
    type: 'habit',
    label: '雨/曇り',
    data: {
      trigger: 'after',
      condition: 'not_sunny',
    },
  },
  {
    id: 'edge-3',
    source: 'habit-2',
    target: 'habit-4',
    type: 'habit',
    label: '運動後',
    data: {
      trigger: 'after',
      condition: null,
    },
  },
  {
    id: 'edge-4',
    source: 'habit-3',
    target: 'habit-4',
    type: 'habit',
    label: '運動後',
    data: {
      trigger: 'after',
      condition: null,
    },
  },
];