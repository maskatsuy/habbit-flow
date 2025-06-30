import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { HabitNodeData } from '../../types';

interface HabitNodeProps extends NodeProps<HabitNodeData> {
  onComplete?: (nodeId: string) => void;
}

const HabitNode = memo(({ data, selected, id, onComplete }: HabitNodeProps) => {
  const { label, icon, isCompleted } = data;

  const handleClick = () => {
    if (onComplete) {
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
          px-4 py-2 rounded-lg border-2 cursor-pointer transition-all
          ${isCompleted 
            ? 'border-green-500 bg-green-50 text-green-800' 
            : 'border-gray-300 bg-white text-gray-800'
          }
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          hover:shadow-md
        `}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <div className="flex flex-col">
            <span className="font-medium">{label}</span>
            {isCompleted && (
              <span className="text-xs text-green-600">完了</span>
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