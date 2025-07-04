import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import type { HabitNodeData } from '../../types'
import NodeWrapper from './NodeWrapper'

interface HabitNodeProps extends NodeProps<HabitNodeData> {
  onComplete?: (nodeId: string) => void
}

const HabitNode = memo(({ data, selected, id }: HabitNodeProps) => {
  const { label, icon, isCompleted, isDisabled, isInactive, isFlowing, onComplete } =
    data as HabitNodeData & { onComplete?: (nodeId: string) => void }

  const handleClick = () => {
    if (onComplete && !isDisabled) {
      onComplete(id)
    }
  }

  const getNodeStyle = () => {
    if (isDisabled) return 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
    if (isInactive) return 'border-gray-300 bg-gray-100 text-gray-500 cursor-pointer opacity-60'
    if (isCompleted) return 'border-green-500 bg-green-50 text-green-800 cursor-pointer'
    return 'border-gray-300 bg-white text-gray-800 cursor-pointer hover:shadow-md'
  }

  return (
    <NodeWrapper
      isFlowing={isFlowing}
      selected={selected && !isDisabled}
      testId="habit-node"
      baseClassName={getNodeStyle()}
    >
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-2 rounded-md
          ${isFlowing ? (isCompleted ? 'bg-green-50' : 'bg-white') : ''}
        `}
      >
        {icon && (
          <span className={`text-2xl ${isDisabled || isInactive ? 'grayscale' : ''}`}>{icon}</span>
        )}
        <div className="flex flex-col">
          <span className="font-medium">{label}</span>
          {isCompleted && !isDisabled && !isInactive && (
            <span className="text-xs text-green-600">完了</span>
          )}
          {isInactive && !isCompleted && <span className="text-xs text-gray-500">未選択</span>}
          {isDisabled && <span className="text-xs text-gray-400">利用不可</span>}
        </div>
      </div>
    </NodeWrapper>
  )
})

HabitNode.displayName = 'HabitNode'

export default HabitNode
