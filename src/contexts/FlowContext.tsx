import { createContext, useContext, ReactNode } from 'react'
import type { FlowEdge } from '../types'

interface FlowContextType {
  edges: FlowEdge[]
}

const FlowContext = createContext<FlowContextType | null>(null)

export const FlowProvider = ({ children, edges }: { children: ReactNode; edges: FlowEdge[] }) => {
  return <FlowContext.Provider value={{ edges }}>{children}</FlowContext.Provider>
}

export const useFlowContext = () => {
  const context = useContext(FlowContext)
  if (!context) {
    throw new Error('useFlowContext must be used within FlowProvider')
  }
  return context
}
