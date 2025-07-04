import { useCallback } from 'react'
import type { FlowNode, FlowEdge } from '../types'

export interface SavedFlow {
  version: string
  name: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  metadata: {
    createdAt: string
    updatedAt: string
    description?: string
  }
}

export interface FlowSummary {
  name: string
  createdAt: string
  updatedAt: string
  nodeCount: number
  edgeCount: number
}

const STORAGE_PREFIX = 'habitFlow:'
const CURRENT_VERSION = '1.0'

export function useFlowPersistence() {
  const saveFlow = useCallback(
    (name: string, nodes: FlowNode[], edges: FlowEdge[], description?: string) => {
      const flowData: SavedFlow = {
        version: CURRENT_VERSION,
        name,
        nodes,
        edges,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description,
        },
      }

      try {
        localStorage.setItem(`${STORAGE_PREFIX}${name}`, JSON.stringify(flowData))
        return true
      } catch (error) {
        console.error('Failed to save flow:', error)
        return false
      }
    },
    [],
  )

  const loadFlow = useCallback((name: string): SavedFlow | null => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${name}`)
      if (!data) return null

      const flow = JSON.parse(data) as SavedFlow

      // バージョンチェック（将来の互換性のため）
      if (flow.version !== CURRENT_VERSION) {
        console.warn(`Flow version mismatch: expected ${CURRENT_VERSION}, got ${flow.version}`)
      }

      return flow
    } catch (error) {
      console.error('Failed to load flow:', error)
      return null
    }
  }, [])

  const listFlows = useCallback((): FlowSummary[] => {
    const flows: FlowSummary[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const flow = JSON.parse(data) as SavedFlow
            flows.push({
              name: flow.name,
              createdAt: flow.metadata.createdAt,
              updatedAt: flow.metadata.updatedAt,
              nodeCount: flow.nodes.length,
              edgeCount: flow.edges.length,
            })
          }
        } catch (error) {
          console.error(`Failed to parse flow ${key}:`, error)
        }
      }
    }

    return flows.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [])

  const deleteFlow = useCallback((name: string) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${name}`)
      return true
    } catch (error) {
      console.error('Failed to delete flow:', error)
      return false
    }
  }, [])

  const exportFlow = useCallback((name: string, nodes: FlowNode[], edges: FlowEdge[]) => {
    const flowData: SavedFlow = {
      version: CURRENT_VERSION,
      name,
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `habitflow-${name}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const importFlow = useCallback((file: File): Promise<SavedFlow | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const flow = JSON.parse(content) as SavedFlow

          // バリデーション
          if (!flow.version || !flow.name || !flow.nodes || !flow.edges) {
            throw new Error('Invalid flow format')
          }

          resolve(flow)
        } catch (error) {
          console.error('Failed to import flow:', error)
          resolve(null)
        }
      }

      reader.readAsText(file)
    })
  }, [])

  return {
    saveFlow,
    loadFlow,
    listFlows,
    deleteFlow,
    exportFlow,
    importFlow,
  }
}
