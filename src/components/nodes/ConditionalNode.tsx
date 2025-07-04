import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import NodeWrapper from './NodeWrapper'

interface ConditionalNodeData {
  label: string
  condition: string
  icon?: string
  isFlowing?: boolean
}

const ConditionalNode = memo(({ data, selected }: NodeProps<ConditionalNodeData>) => {
  const { label, icon, condition, isFlowing } = data

  const customHandles = (
    <>
      {/* YES handle (top) */}
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        style={{ top: '30%' }}
        className="!bg-green-500"
      />
      <div className="absolute -right-8 top-[30%] transform -translate-y-1/2 text-xs font-bold text-green-600">
        YES
      </div>
      {/* NO handle (bottom) */}
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        style={{ top: '70%' }}
        className="!bg-red-500"
      />
      <div className="absolute -right-6 top-[70%] transform -translate-y-1/2 text-xs font-bold text-red-600">
        NO
      </div>
    </>
  )

  return (
    <NodeWrapper
      isFlowing={isFlowing}
      selected={selected}
      testId="conditional-node"
      baseClassName="border-yellow-400 bg-yellow-50 text-yellow-800"
      flowingPadding="px-4 py-3"
      customHandles={customHandles}
    >
      <div className={`flex flex-col rounded-md ${isFlowing ? 'bg-yellow-50' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <span className="font-medium">{label}</span>
        </div>
        <div className="text-sm font-semibold text-center border-t border-yellow-300 pt-2">
          {condition}
        </div>
      </div>
    </NodeWrapper>
  )
})

ConditionalNode.displayName = 'ConditionalNode'

export default ConditionalNode
