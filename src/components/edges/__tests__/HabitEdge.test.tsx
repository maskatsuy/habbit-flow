import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import HabitEdge from '../HabitEdge';
import type { EdgeProps } from 'reactflow';

const mockEdgeProps: EdgeProps = {
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  sourceX: 100,
  sourceY: 100,
  targetX: 200,
  targetY: 100,
  sourcePosition: 'right' as const,
  targetPosition: 'left' as const,
  style: {},
  markerEnd: '',
  data: {
    trigger: 'after',
    condition: null,
  },
};

describe('HabitEdge', () => {
  it('should render edge path', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <HabitEdge {...mockEdgeProps} />
        </svg>
      </ReactFlowProvider>
    );

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('should apply custom styles', () => {
    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <HabitEdge {...mockEdgeProps} />
        </svg>
      </ReactFlowProvider>
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toHaveStyle('stroke-width: 2');
  });
});