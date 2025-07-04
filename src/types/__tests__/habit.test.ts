import { describe, it, expect } from 'vitest'
import type { Habit, HabitNode, HabitEdge, HabitLog, Streak } from '../habit'

describe('Habit types', () => {
  it('should allow creating a valid Habit', () => {
    const habit: Habit = {
      id: 'habit-1',
      name: '朝起きたら水を飲む',
      description: '起床後すぐにコップ一杯の水を飲む',
      icon: '💧',
      status: 'active',
      timing: 'morning',
      frequency: 'daily',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    expect(habit.name).toBe('朝起きたら水を飲む')
    expect(habit.status).toBe('active')
  })

  it('should allow creating a HabitNode for React Flow', () => {
    const habitNode: HabitNode = {
      id: 'node-1',
      type: 'habit',
      position: { x: 100, y: 100 },
      data: {
        habitId: 'habit-1',
        label: '水を飲む',
        icon: '💧',
        isCompleted: false,
        completedAt: null,
      },
    }

    expect(habitNode.type).toBe('habit')
    expect(habitNode.data.isCompleted).toBe(false)
  })

  it('should allow creating a HabitEdge between nodes', () => {
    const edge: HabitEdge = {
      id: 'edge-1',
      source: 'node-1',
      target: 'node-2',
      type: 'smoothstep',
      data: {
        trigger: 'after', // node-1の後にnode-2を実行
        condition: null,
      },
    }

    expect(edge.data?.trigger).toBe('after')
  })

  it('should allow creating a HabitLog entry', () => {
    const log: HabitLog = {
      id: 'log-1',
      habitId: 'habit-1',
      completedAt: new Date('2024-01-01T07:30:00'),
      note: '今日もしっかり水分補給できた',
      duration: 60, // 秒
    }

    expect(log.habitId).toBe('habit-1')
    expect(log.duration).toBe(60)
  })

  it('should allow creating a Streak record', () => {
    const streak: Streak = {
      habitId: 'habit-1',
      currentStreak: 7,
      longestStreak: 30,
      lastCompletedDate: new Date('2024-01-07'),
      startDate: new Date('2024-01-01'),
    }

    expect(streak.currentStreak).toBe(7)
    expect(streak.longestStreak).toBe(30)
  })
})
