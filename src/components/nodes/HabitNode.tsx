import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { HabitNodeData } from '../../types';

interface HabitNodeProps extends NodeProps<HabitNodeData> {
  onComplete?: (nodeId: string) => void;
}

const HabitNode = memo(({ data, selected, id, onComplete }: HabitNodeProps) => {
  const { label, icon, isCompleted, isDisabled, isInactive } = data;

  const handleClick = () => {
    if (onComplete && !isDisabled) {
      onComplete(id);
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        data-testid="habit-node"
        onClick={handleClick}
        className={`
          px-4 py-2 rounded-lg border-2 transition-all
          ${isDisabled 
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50' 
            : isInactive
              ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-pointer opacity-60'
              : isCompleted 
                ? 'border-green-500 bg-green-50 text-green-800 cursor-pointer' 
                : 'border-gray-300 bg-white text-gray-800 cursor-pointer hover:shadow-md'
          }
          ${selected && !isDisabled ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          {icon && <span className={`text-2xl ${isDisabled || isInactive ? 'grayscale' : ''}`}>{icon}</span>}
          <div className="flex flex-col">
            <span className="font-medium">{label}</span>
            {isCompleted && !isDisabled && !isInactive && (
              <span className="text-xs text-green-600">完了</span>
            )}
            {isInactive && !isCompleted && (
              <span className="text-xs text-gray-500">未選択</span>
            )}
            {isDisabled && (
              <span className="text-xs text-gray-400">利用不可</span>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
});

HabitNode.displayName = 'HabitNode';

export default HabitNode;