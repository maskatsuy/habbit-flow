import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { useReactFlow } from 'reactflow';
import ClickableHabitNode from '../ClickableHabitNode';
import type { NodeProps } from 'reactflow';
import type { HabitNodeData } from '../../../types';
import { renderWithProviders, fireDoubleClick, expectNodeState } from '../../../test-utils/testUtils';

// reactflowのモックを有効化
vi.mock('reactflow');

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

describe('ClickableHabitNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // useReactFlowのデフォルトモックを設定
    (useReactFlow as any).mockReturnValue({
      setNodes: vi.fn(),
      setEdges: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      project: vi.fn((position: any) => position),
      viewportInitialized: true,
    });
  });

  it('should render habit node with label and icon', () => {
    renderWithProviders(
      <ClickableHabitNode {...mockNodeProps} />
    );

    expect(screen.getByText('水を飲む')).toBeInTheDocument();
    expect(screen.getByText('💧')).toBeInTheDocument();
  });

  it('should show incomplete state by default', () => {
    renderWithProviders(
      <ClickableHabitNode {...mockNodeProps} />
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

    renderWithProviders(
      <ClickableHabitNode {...completedProps} />
    );

    const node = screen.getByTestId('habit-node');
    expect(node).toHaveClass('border-green-500');
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('should toggle completion on double click', async () => {
    const mockSetNodes = vi.fn();
    const mockGetNodes = vi.fn(() => []);
    const mockGetEdges = vi.fn(() => []);
    
    // useReactFlowはすでにvi.fnとしてモックされているので、mockReturnValueOnceを使用
    (useReactFlow as any).mockReturnValueOnce({
      setNodes: mockSetNodes,
      getNodes: mockGetNodes,
      getEdges: mockGetEdges,
    });

    renderWithProviders(
      <ClickableHabitNode {...mockNodeProps} />
    );

    const node = screen.getByTestId('habit-node');
    fireDoubleClick(node);

    expect(mockSetNodes).toHaveBeenCalled();
    const updateFunction = mockSetNodes.mock.calls[0][0];
    const updatedNodes = updateFunction([
      {
        id: 'test-node-1',
        type: 'habit',
        data: { ...mockNodeProps.data },
      },
    ]);

    expect(updatedNodes[0].data.isCompleted).toBe(true);
  });

  it('should call onEditNode on Shift+double click', async () => {
    const mockOnEditNode = vi.fn();
    
    renderWithProviders(
      <ClickableHabitNode {...mockNodeProps} />,
      { onEditNode: mockOnEditNode }
    );

    const node = screen.getByTestId('habit-node');
    fireDoubleClick(node, { shiftKey: true });

    expect(mockOnEditNode).toHaveBeenCalledWith('test-node-1');
  });

  it('should show selected state', () => {
    const selectedProps = {
      ...mockNodeProps,
      selected: true,
    };

    renderWithProviders(
      <ClickableHabitNode {...selectedProps} />
    );

    const node = screen.getByTestId('habit-node');
    expect(node).toHaveClass('ring-2');
    expect(node).toHaveClass('ring-offset-2');
  });

  it('should show inactive state when isInactive is true', () => {
    const inactiveProps = {
      ...mockNodeProps,
      data: {
        ...mockNodeProps.data,
        isInactive: true,
      },
    };

    renderWithProviders(
      <ClickableHabitNode {...inactiveProps} />
    );

    const node = screen.getByTestId('habit-node');
    expect(screen.getByText('未選択')).toBeInTheDocument();
    expect(node).toHaveClass('opacity-60');
  });

  it('should show disabled state when isDisabled is true', () => {
    const disabledProps = {
      ...mockNodeProps,
      data: {
        ...mockNodeProps.data,
        isDisabled: true,
      },
    };

    renderWithProviders(
      <ClickableHabitNode {...disabledProps} />
    );

    const node = screen.getByTestId('habit-node');
    expect(screen.getByText('利用不可')).toBeInTheDocument();
    expect(node).toHaveClass('opacity-50');
    expect(node).toHaveClass('cursor-not-allowed');
  });

  it('should not toggle completion when disabled', () => {
    const mockSetNodes = vi.fn();
    const mockGetNodes = vi.fn(() => []);
    const mockGetEdges = vi.fn(() => []);
    
    (useReactFlow as any).mockReturnValueOnce({
      setNodes: mockSetNodes,
      getNodes: mockGetNodes,
      getEdges: mockGetEdges,
    });

    const disabledProps = {
      ...mockNodeProps,
      data: {
        ...mockNodeProps.data,
        isDisabled: true,
      },
    };

    renderWithProviders(
      <ClickableHabitNode {...disabledProps} />
    );

    const node = screen.getByTestId('habit-node');
    fireDoubleClick(node);

    expect(mockSetNodes).not.toHaveBeenCalled();
  });
});