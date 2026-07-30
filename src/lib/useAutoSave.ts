import { useEffect, useRef, useCallback, useState } from 'react'

const DRAFT_PREFIX = 'post-draft-'
const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000
const DRAFT_MAX_SIZE = 500 * 1024

interface AutoSaveState {
  hasUnsavedChanges: boolean
  lastSavedAt: number | null
  saveDraft: () => void
  restoreDraft: () => Record<string, any> | null
  clearDraft: () => void
}

function getDraftKey(postId?: string): string {
  return postId ? `${DRAFT_PREFIX}${postId}` : `${DRAFT_PREFIX}new`
}

function cleanOldDrafts() {
  const now = Date.now()
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (!key?.startsWith(DRAFT_PREFIX)) continue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const data = JSON.parse(raw)
      if (data._timestamp && now - data._timestamp > DRAFT_MAX_AGE) {
        localStorage.removeItem(key)
      }
    } catch {
      localStorage.removeItem(key)
    }
  }
}

export function useAutoSave(
  postId: string | undefined,
  data: Record<string, any>,
  enabled = true
): AutoSaveState {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef(data)
  dataRef.current = data

  const saveDraft = useCallback(() => {
    if (!enabled) return
    const key = getDraftKey(postId)
    const payload = { ...dataRef.current, _timestamp: Date.now() }
    try {
      const serialized = JSON.stringify(payload)
      if (serialized.length > DRAFT_MAX_SIZE) return
      localStorage.setItem(key, serialized)
      setHasUnsavedChanges(false)
      setLastSavedAt(Date.now())
    } catch {
      // quota exceeded or other error
    }
  }, [postId, enabled])

  useEffect(() => {
    cleanOldDrafts()
  }, [])

  useEffect(() => {
    if (!enabled) return
    setHasUnsavedChanges(true)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(saveDraft, 3000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, enabled, saveDraft])

  const restoreDraft = useCallback((): Record<string, any> | null => {
    const key = getDraftKey(postId)
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const data = JSON.parse(raw)
      const { _timestamp, ...rest } = data
      return rest
    } catch {
      return null
    }
  }, [postId])

  const clearDraft = useCallback(() => {
    const key = getDraftKey(postId)
    localStorage.removeItem(key)
    setHasUnsavedChanges(false)
    setLastSavedAt(null)
  }, [postId])

  return {
    hasUnsavedChanges,
    lastSavedAt,
    saveDraft,
    restoreDraft,
    clearDraft,
  }
}
