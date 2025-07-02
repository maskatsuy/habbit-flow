import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import ConditionalNode from '../ConditionalNode';
import type { NodeProps } from 'reactflow';

interface ConditionalNodeData {
  label: string;
  condition: string;
  icon?: string;
}

const mockNodeProps: NodeProps<ConditionalNodeData> = {
  id: 'conditional-1',
  data: {
    label: '天気をチェック',
    condition: '晴れている？',
    icon: '🌤️',
  },
  type: 'conditional',
  selected: false,
  isConnectable: true,
  xPos: 0,
  yPos: 0,
  zIndex: 1,
  dragging: false,
};

describe('ConditionalNode', () => {
  it('should render conditional node with label and condition', () => {
    render(
      <ReactFlowProvider>
        <ConditionalNode {...mockNodeProps} />
      </ReactFlowProvider>
    );

    expect(screen.getByText('天気をチェック')).toBeInTheDocument();
    expect(screen.getByText('晴れている？')).toBeInTheDocument();
    expect(screen.getByText('🌤️')).toBeInTheDocument();
  });

  it('should have appropriate styling for conditional type', () => {
    render(
      <ReactFlowProvider>
        <ConditionalNode {...mockNodeProps} />
      </ReactFlowProvider>
    );

    const node = screen.getByTestId('conditional-node');
    expect(node).toHaveClass('border-yellow-400');
    expect(node).toHaveClass('bg-yellow-50');
  });

  it('should show YES/NO labels for source handles', () => {
    render(
      <ReactFlowProvider>
        <ConditionalNode {...mockNodeProps} />
      </ReactFlowProvider>
    );

    expect(screen.getByText('YES')).toBeInTheDocument();
    expect(screen.getByText('NO')).toBeInTheDocument();
  });

  it('should show selected state', () => {
    const selectedProps = {
      ...mockNodeProps,
      selected: true,
    };

    render(
      <ReactFlowProvider>
        <ConditionalNode {...selectedProps} />
      </ReactFlowProvider>
    );

    const node = screen.getByTestId('conditional-node');
    expect(node).toHaveClass('ring-2');
    expect(node).toHaveClass('ring-offset-2');
  });
});