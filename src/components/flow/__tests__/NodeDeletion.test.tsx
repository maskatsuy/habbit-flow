import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NodeDeletion from '../NodeDeletion';

describe('NodeDeletion', () => {
  const mockNode = {
    id: 'habit-1',
    type: 'habit',
    position: { x: 100, y: 100 },
    data: {
      habitId: 'habit-1',
      label: '瞑想',
      description: '朝の瞑想習慣',
      icon: '🧘',
      timing: 'morning',
      isCompleted: false,
      completedAt: null,
    },
  };

  it('should render delete button when node is selected', () => {
    render(
      <NodeDeletion
        selectedNode={mockNode}
        onDelete={vi.fn()}
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: /削除/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass('bg-red-500');
  });

  it('should not render when no node is selected', () => {
    render(
      <NodeDeletion
        selectedNode={null}
        onDelete={vi.fn()}
      />
    );
    
    expect(screen.queryByRole('button', { name: /削除/i })).not.toBeInTheDocument();
  });

  it('should show confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <NodeDeletion
        selectedNode={mockNode}
        onDelete={vi.fn()}
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: /削除/i });
    await user.click(deleteButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('ノードを削除しますか？')).toBeInTheDocument();
    expect(screen.getByText(/瞑想.*を削除してもよろしいですか/)).toBeInTheDocument();
  });

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <NodeDeletion
        selectedNode={mockNode}
        onDelete={vi.fn()}
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: /削除/i });
    await user.click(deleteButton);
    
    const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
    await user.click(cancelButton);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should call onDelete when confirmed', async () => {
    const user = userEvent.setup();
    const mockOnDelete = vi.fn();
    
    render(
      <NodeDeletion
        selectedNode={mockNode}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: /削除/i });
    await user.click(deleteButton);
    
    const confirmButton = screen.getByRole('button', { name: /削除する/i });
    await user.click(confirmButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('habit-1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should not allow deletion of trigger nodes', () => {
    const triggerNode = {
      ...mockNode,
      type: 'trigger',
      data: {
        label: '朝7時',
        icon: '⏰',
      },
    };

    render(
      <NodeDeletion
        selectedNode={triggerNode}
        onDelete={vi.fn()}
      />
    );
    
    expect(screen.queryByRole('button', { name: /削除/i })).not.toBeInTheDocument();
  });

  it('should show keyboard shortcut hint', () => {
    render(
      <NodeDeletion
        selectedNode={mockNode}
        onDelete={vi.fn()}
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: /削除/i });
    expect(deleteButton).toHaveAttribute('title', expect.stringContaining('Delete'));
  });
});