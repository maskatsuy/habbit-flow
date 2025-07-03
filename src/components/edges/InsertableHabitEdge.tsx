import { memo, useState, useCallback, useEffect } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import type { HabitEdgeData } from '../../types';
import { useNodeEditor } from '../../contexts/NodeEditorContext';

interface InsertableHabitEdgeProps extends EdgeProps<HabitEdgeData> {
  onInsertNode?: (edgeId: string, position: { x: number; y: number }) => void;
}

const InsertableHabitEdge = memo(({
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
  source,
  target,
}: InsertableHabitEdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const isActive = data?.isActive || false;
  const { onInsertNode } = useNodeEditor();
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // 中間点を計算
  const midX = labelX;
  const midY = labelY;

  // ホバー状態を管理
  useEffect(() => {
    if (isHovered) {
      setShowButton(true);
    } else {
      // 少し遅延してからボタンを非表示に
      const timer = setTimeout(() => setShowButton(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  const handleInsertClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInsertNode) {
      onInsertNode(id, { x: midX, y: midY });
    }
  }, [id, midX, midY, onInsertNode]);

  const edgeColor = data?.condition === 'sunny' ? '#FCD34D' : 
                   data?.condition === 'not_sunny' ? '#9CA3AF' : 
                   isActive ? '#3B82F6' : '#E5E7EB';

  return (
    <>
      {/* ベースのエッジ */}
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* クリック領域拡大用の透明なパス */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth="40"
          style={{ cursor: 'pointer' }}
        />
        
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: isHovered ? '#10B981' : (isActive ? edgeColor : '#E5E7EB'),
            strokeWidth: isHovered ? 3 : 2,
            transition: 'all 0.3s ease',
          }}
        />
      </g>

      {/* アニメーション */}
      {isActive && (
        <>
          {/* 流れるドット */}
          <circle r="4" fill={edgeColor} style={{ pointerEvents: 'none' }}>
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
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* 挿入ボタン */}
      {showButton && onInsertNode && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${midX}px,${midY}px)`,
              pointerEvents: 'all',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={handleInsertClick}
              className="w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all transform hover:scale-125 shadow-lg flex items-center justify-center animate-fade-in"
              title="ここに習慣を挿入"
            >
              <span className="text-xl font-bold">+</span>
            </button>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* ラベル（挿入ボタンと重ならないように調整） */}
      {label && !isHovered && (
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
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.2s ease-out;
          }
        `}
      </style>
    </>
  );
});

InsertableHabitEdge.displayName = 'InsertableHabitEdge';

export default InsertableHabitEdge;