import { describe, it, expect } from 'vitest'
import type { DateRange, ValidationError, Result } from '../utils'

describe('Utility types', () => {
  it('should allow creating a DateRange', () => {
    const range: DateRange = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    }

    expect(range.start < range.end).toBe(true)
  })

  it('should allow creating a ValidationError', () => {
    const error: ValidationError = {
      field: 'name',
      message: '習慣名は必須です',
      code: 'REQUIRED',
    }

    expect(error.field).toBe('name')
    expect(error.code).toBe('REQUIRED')
  })

  it('should allow creating a Success Result', () => {
    const result: Result<string> = {
      success: true,
      data: 'habit-123',
    }

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('habit-123')
    }
  })

  it('should allow creating a Failure Result', () => {
    const result: Result<string> = {
      success: false,
      error: {
        message: '習慣の作成に失敗しました',
        code: 'CREATE_FAILED',
      },
    }

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('CREATE_FAILED')
    }
  })
})
