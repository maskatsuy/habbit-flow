import { memo, ReactNode } from 'react';
import { Handle, Position } from 'reactflow';

interface NodeWrapperProps {
  children: ReactNode;
  isFlowing?: boolean;
  selected?: boolean;
  testId?: string;
  baseClassName?: string;
  flowingPadding?: string;
  handlePosition?: {
    target?: Position;
    source?: Position;
  };
  customHandles?: ReactNode;
}

const NodeWrapper = memo(({
  children,
  isFlowing = false,
  selected = false,
  testId,
  baseClassName = '',
  flowingPadding = 'px-4 py-2',
  handlePosition = {
    target: Position.Left,
    source: Position.Right,
  },
  customHandles,
}: NodeWrapperProps) => {
  return (
    <>
      {handlePosition.target && (
        <Handle type="target" position={handlePosition.target} />
      )}
      <div
        data-testid={testId}
        className={`
          rounded-lg transition-all relative
          ${isFlowing ? 'habit-node-flowing-blue' : `border-2 ${flowingPadding} ${baseClassName}`}
          ${selected ? 'ring-2 ring-offset-2' : ''}
        `}
      >
        <div className={`
          relative z-10 rounded-md
          ${isFlowing ? `${flowingPadding} ${baseClassName}` : ''}
        `}>
          {children}
        </div>
      </div>
      {customHandles}
      {!customHandles && handlePosition.source && (
        <Handle type="source" position={handlePosition.source} />
      )}
    </>
  );
});

NodeWrapper.displayName = 'NodeWrapper';

export default NodeWrapper;