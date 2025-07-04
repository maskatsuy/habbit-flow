import { memo } from 'react'
import { getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import type { EdgeProps } from 'reactflow'

const HabitEdge = memo((props: EdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label,
    style = {},
  } = props

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const isConditionalEdge = id?.includes('yes') || id?.includes('no')
  const edgeColor = id?.includes('yes')
    ? '#10b981' // green
    : id?.includes('no')
      ? '#ef4444' // red
      : '#94a3b8' // gray

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: edgeColor,
          ...(isConditionalEdge
            ? {}
            : { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }),
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

HabitEdge.displayName = 'HabitEdge'

export default HabitEdge
