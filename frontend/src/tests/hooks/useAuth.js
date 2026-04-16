import { renderHook } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useAuth } from '../../hooks/useAuth'

describe('useAuth hook', () => {
  test('returns user as null initially', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
  })

  test('isLoading starts as false', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isLoading).toBe(false)
  })
})