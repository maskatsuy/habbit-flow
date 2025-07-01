import { memo, useEffect, useRef } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import type { HabitEdgeData } from '../../types';

const AnimatedHabitEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
}: EdgeProps<HabitEdgeData>) => {
  const isActive = data?.isActive || false;
  const pathRef = useRef<SVGPathElement>(null);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // アニメーション用のグラデーション定義
  const gradientId = `gradient-${id}`;
  const flowId = `flow-${id}`;

  useEffect(() => {
    if (!pathRef.current || !isActive) return;

    const path = pathRef.current;
    const pathLength = path.getTotalLength();
    
    // パスの長さに基づいてアニメーション時間を調整
    const duration = Math.max(2, pathLength / 100);
    
    path.style.strokeDasharray = `${pathLength}`;
    path.style.animation = `flowAnimation ${duration}s linear infinite`;
  }, [isActive]);

  const edgeColor = data?.condition === 'sunny' ? '#FCD34D' : 
                   data?.condition === 'not_sunny' ? '#9CA3AF' : 
                   isActive ? '#3B82F6' : '#E5E7EB';

  return (
    <>
      <defs>
        {/* アニメーション用のグラデーション */}
        <linearGradient id={gradientId}>
          <stop offset="0%" stopColor={edgeColor} stopOpacity="0" />
          <stop offset="50%" stopColor={edgeColor} stopOpacity="1" />
          <stop offset="100%" stopColor={edgeColor} stopOpacity="0" />
        </linearGradient>

        {/* フローアニメーション用のマスク */}
        <mask id={flowId}>
          <path
            d={edgePath}
            stroke="white"
            strokeWidth="4"
            fill="none"
            ref={pathRef}
          />
        </mask>
      </defs>

      {/* ベースのエッジ */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isActive ? edgeColor : '#E5E7EB',
          strokeWidth: 2,
          transition: 'stroke 0.3s ease',
        }}
      />

      {/* アニメーション用のオーバーレイ */}
      {isActive && (
        <>
          {/* 流れるドット */}
          <circle r="4" fill={edgeColor}>
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
          
          {/* グロー効果 */}
          <path
            d={edgePath}
            fill="none"
            stroke={edgeColor}
            strokeWidth="4"
            opacity="0.3"
            style={{
              filter: 'blur(4px)',
            }}
          />
        </>
      )}

      {/* ラベル */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className={`nodrag nopan px-2 py-1 rounded text-xs font-medium ${
              isActive 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}

      <style>
        {`
          @keyframes flowAnimation {
            0% {
              stroke-dashoffset: 0;
            }
            100% {
              stroke-dashoffset: -100%;
            }
          }
        `}
      </style>
    </>
  );
});

AnimatedHabitEdge.displayName = 'AnimatedHabitEdge';

export default AnimatedHabitEdge;