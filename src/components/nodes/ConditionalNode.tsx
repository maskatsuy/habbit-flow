import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

interface ConditionalNodeData {
  label: string;
  condition: string;
  icon?: string;
}

const ConditionalNode = memo(({ data, selected }: NodeProps<ConditionalNodeData>) => {
  const { label, icon, condition } = data;

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        data-testid="conditional-node"
        className={`
          px-4 py-3 rounded-lg border-2 transition-all
          border-yellow-400 bg-yellow-50 text-yellow-800
          ${selected ? 'ring-2 ring-yellow-500 ring-offset-2' : ''}
        `}
      >
        <div className="flex items-center gap-2 mb-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <span className="font-medium">{label}</span>
        </div>
        <div className="text-sm font-semibold text-center border-t border-yellow-300 pt-2">
          {condition}
        </div>
      </div>
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
  );
});

ConditionalNode.displayName = 'ConditionalNode';

export default ConditionalNode;