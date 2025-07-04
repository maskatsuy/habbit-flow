import React, { createContext, useContext } from 'react'

interface NodeEditorContextType {
  onEditNode: (nodeId: string) => void
  onInsertNode: (edgeId: string, position: { x: number; y: number }) => void
}

const NodeEditorContext = createContext<NodeEditorContextType | null>(null)

export const NodeEditorProvider: React.FC<{
  children: React.ReactNode
  onEditNode: (nodeId: string) => void
  onInsertNode: (edgeId: string, position: { x: number; y: number }) => void
}> = ({ children, onEditNode, onInsertNode }) => {
  return (
    <NodeEditorContext.Provider value={{ onEditNode, onInsertNode }}>
      {children}
    </NodeEditorContext.Provider>
  )
}

export const useNodeEditor = () => {
  const context = useContext(NodeEditorContext)
  if (!context) {
    throw new Error('useNodeEditor must be used within a NodeEditorProvider')
  }
  return context
}
