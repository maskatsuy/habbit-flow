import type { Node, Edge } from 'reactflow'

export type HabitStatus = 'active' | 'paused' | 'completed'
export type HabitTiming = 'morning' | 'afternoon' | 'evening' | 'anytime'
export type HabitFrequency = 'daily' | 'weekly' | 'custom'
export type TriggerType = 'after' | 'before' | 'with'

export interface Habit {
  id: string
  name: string
  description?: string
  icon?: string
  status: HabitStatus
  timing: HabitTiming
  frequency: HabitFrequency
  createdAt: Date
  updatedAt: Date
}

export interface HabitNodeData {
  habitId: string
  label: string
  description?: string
  icon?: string
  timing?: HabitTiming
  isCompleted: boolean
  completedAt: Date | null
  isDisabled?: boolean
  isInactive?: boolean
  isFlowing?: boolean
  canDelete?: boolean
}

export type HabitNode = Node<HabitNodeData, 'habit'>

export interface HabitEdgeData {
  trigger: TriggerType
  condition: string | null
  isActive?: boolean
}

export type HabitEdge = Edge<HabitEdgeData>

export interface HabitLog {
  id: string
  habitId: string
  completedAt: Date
  note?: string
  duration?: number
}

export interface Streak {
  habitId: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate: Date
  startDate: Date
}
