import { memo } from 'react'
import { Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import NodeWrapper from './NodeWrapper'

interface TriggerNodeData {
  label: string
  triggerType: 'time' | 'event' | 'location'
  icon?: string
  isFlowing?: boolean
}

const TriggerNode = memo(({ data, selected }: NodeProps<TriggerNodeData>) => {
  const { label, icon, triggerType, isFlowing } = data

  const getNodeStyle = () => {
    switch (triggerType) {
      case 'time':
        return 'border-blue-400 bg-blue-50 text-blue-800'
      case 'event':
        return 'border-purple-400 bg-purple-50 text-purple-800'
      case 'location':
        return 'border-orange-400 bg-orange-50 text-orange-800'
      default:
        return 'border-gray-400 bg-gray-50 text-gray-800'
    }
  }

  const ringColor = selected
    ? triggerType === 'time'
      ? 'ring-blue-500'
      : triggerType === 'event'
        ? 'ring-purple-500'
        : triggerType === 'location'
          ? 'ring-orange-500'
          : 'ring-gray-500'
    : ''

  const getFlowingBg = () => {
    if (!isFlowing) return ''
    switch (triggerType) {
      case 'time':
        return 'bg-blue-50'
      case 'event':
        return 'bg-purple-50'
      case 'location':
        return 'bg-orange-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <NodeWrapper
      isFlowing={isFlowing}
      selected={selected}
      testId="trigger-node"
      baseClassName={`${getNodeStyle()} ${ringColor}`}
      handlePosition={{ source: Position.Right }}
    >
      <div className={`flex items-center gap-2 rounded-md ${getFlowingBg()}`}>
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex flex-col">
          <span className="text-xs opacity-75">トリガー</span>
          <span className="font-medium">{label}</span>
        </div>
      </div>
    </NodeWrapper>
  )
})

TriggerNode.displayName = 'TriggerNode'

export default TriggerNode
