import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactFlowProvider } from 'reactflow';
import HabitNode from '../HabitNode';
import type { NodeProps } from 'reactflow';
import type { HabitNodeData } from '../../../types';

const mockNodeProps: NodeProps<HabitNodeData> = {
  id: 'test-node-1',
  data: {
    habitId: 'habit-1',
    label: '水を飲む',
    icon: '💧',
    isCompleted: false,
    completedAt: null,
  },
  type: 'habit',
  selected: false,
  isConnectable: true,
  xPos: 0,
  yPos: 0,
  zIndex: 1,
  dragging: false,
};

describe('HabitNode', () => {
  it('should render habit node with label and icon', () => {
    render(
      <ReactFlowProvider>
        <HabitNode {...mockNodeProps} />
      </ReactFlowProvider>
    );

    expect(screen.getByText('水を飲む')).toBeInTheDocument();
    expect(screen.getByText('💧')).toBeInTheDocument();
  });

  it('should show incomplete state by default', () => {
    render(
      <ReactFlowProvider>
        <HabitNode {...mockNodeProps} />
      </ReactFlowProvider>
    );

    const node = screen.getByTestId('habit-node');
    expect(node).toHaveClass('border-gray-300');
    expect(node).not.toHaveClass('border-green-500');
  });

  it('should show completed state when isCompleted is true', () => {
    const completedProps = {
      ...mockNodeProps,
      data: {
        ...mockNodeProps.data,
        isCompleted: true,
        completedAt: new Date(),
      },
    };

    render(
      <ReactFlowProvider>
        <HabitNode {...completedProps} />
      </ReactFlowProvider>
    );

    const node = screen.getByTestId('habit-node');
    expect(node).toHaveClass('border-green-500');
    expect(node).toHaveClass('bg-green-50');
  });

  it('should handle click to toggle completion', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    
    render(
      <ReactFlowProvider>
        <HabitNode {...mockNodeProps} onComplete={onComplete} />
      </ReactFlowProvider>
    );

    const node = screen.getByTestId('habit-node');
    await user.click(node);

    expect(onComplete).toHaveBeenCalledWith('test-node-1');
  });

  it('should show selected state', () => {
    const selectedProps = {
      ...mockNodeProps,
      selected: true,
    };

    render(
      <ReactFlowProvider>
        <HabitNode {...selectedProps} />
      </ReactFlowProvider>
    );

    const node = screen.getByTestId('habit-node');
    expect(node).toHaveClass('ring-2');
    expect(node).toHaveClass('ring-blue-500');
  });
});