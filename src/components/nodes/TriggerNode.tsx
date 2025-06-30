import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface TriggerNodeData {
  label: string;
  triggerType: 'time' | 'event' | 'location';
  icon?: string;
}

const TriggerNode = memo(({ data, selected }: NodeProps<TriggerNodeData>) => {
  const { label, icon, triggerType } = data;

  const getNodeStyle = () => {
    switch (triggerType) {
      case 'time':
        return 'border-blue-400 bg-blue-50 text-blue-800';
      case 'event':
        return 'border-purple-400 bg-purple-50 text-purple-800';
      case 'location':
        return 'border-orange-400 bg-orange-50 text-orange-800';
      default:
        return 'border-gray-400 bg-gray-50 text-gray-800';
    }
  };

  return (
    <>
      <div
        data-testid="trigger-node"
        className={`
          px-4 py-2 rounded-lg border-2 transition-all
          ${getNodeStyle()}
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <div className="flex flex-col">
            <span className="text-xs opacity-75">トリガー</span>
            <span className="font-medium">{label}</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
});

TriggerNode.displayName = 'TriggerNode';

export default TriggerNode;