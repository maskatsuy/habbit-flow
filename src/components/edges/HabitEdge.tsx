import { memo } from 'react';
import { getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import type { EdgeProps } from 'reactflow';

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
  } = props;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#94a3b8',
        }}
        className="animate-pulse"
      />
      {label && (
        <EdgeLabelRenderer>
          <text
            x={labelX}
            y={labelY}
            className="fill-gray-600 text-xs"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label}
          </text>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

HabitEdge.displayName = 'HabitEdge';

export default HabitEdge;