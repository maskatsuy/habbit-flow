import { useEffect } from 'react'

interface KeyboardShortcutHandlers {
  onSave: () => void
  onSaveAs: () => void
}

export function useFlowKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (e.shiftKey) {
          handlers.onSaveAs()
        } else {
          handlers.onSave()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
