import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NodeEditor from '../NodeEditor';

describe('NodeEditor', () => {
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

  it('should not be visible initially', () => {
    render(
      <NodeEditor
        node={null}
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show edit modal when node is provided and isOpen is true', () => {
    render(
      <NodeEditor
        node={mockNode}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('習慣ノードを編集')).toBeInTheDocument();
  });

  it('should display current node data in form fields', () => {
    render(
      <NodeEditor
        node={mockNode}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    
    expect(screen.getByDisplayValue('瞑想')).toBeInTheDocument();
    expect(screen.getByDisplayValue('朝の瞑想習慣')).toBeInTheDocument();
    
    // Check that the correct option is selected in the icon dropdown
    const iconSelect = screen.getByLabelText('アイコン') as HTMLSelectElement;
    expect(iconSelect.value).toBe('🧘');
    
    // Check that the correct option is selected in the timing dropdown
    const timingSelect = screen.getByLabelText('実行タイミング') as HTMLSelectElement;
    expect(timingSelect.value).toBe('morning');
  });

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    
    render(
      <NodeEditor
        node={mockNode}
        isOpen={true}
        onClose={mockOnClose}
        onSave={vi.fn()}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onSave with updated data when form is submitted', async () => {
    const user = userEvent.setup();
    const mockOnSave = vi.fn();
    
    render(
      <NodeEditor
        node={mockNode}
        isOpen={true}
        onClose={vi.fn()}
        onSave={mockOnSave}
      />
    );
    
    // Update form fields
    const labelInput = screen.getByLabelText('習慣名');
    await user.clear(labelInput);
    await user.type(labelInput, '朝の瞑想（10分）');
    
    const descriptionInput = screen.getByLabelText('説明');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '10分間の瞑想習慣');
    
    const saveButton = screen.getByRole('button', { name: /保存/i });
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      ...mockNode,
      data: {
        ...mockNode.data,
        label: '朝の瞑想（10分）',
        description: '10分間の瞑想習慣',
      },
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <NodeEditor
        node={mockNode}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );
    
    // Clear required field
    const labelInput = screen.getByLabelText('習慣名');
    await user.clear(labelInput);
    
    const saveButton = screen.getByRole('button', { name: /保存/i });
    await user.click(saveButton);
    
    expect(screen.getByText('習慣名は必須です')).toBeInTheDocument();
  });

  it('should handle icon selection changes', async () => {
    const user = userEvent.setup();
    const mockOnSave = vi.fn();
    
    render(
      <NodeEditor
        node={mockNode}
        isOpen={true}
        onClose={vi.fn()}
        onSave={mockOnSave}
      />
    );
    
    const iconSelect = screen.getByLabelText('アイコン');
    await user.selectOptions(iconSelect, '📝');
    
    const saveButton = screen.getByRole('button', { name: /保存/i });
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      ...mockNode,
      data: {
        ...mockNode.data,
        icon: '📝',
      },
    });
  });

  it('should handle timing selection changes', async () => {
    const user = userEvent.setup();
    const mockOnSave = vi.fn();
    
    render(
      <NodeEditor
        node={mockNode}
        isOpen={true}
        onClose={vi.fn()}
        onSave={mockOnSave}
      />
    );
    
    const timingSelect = screen.getByLabelText('実行タイミング');
    await user.selectOptions(timingSelect, 'evening');
    
    const saveButton = screen.getByRole('button', { name: /保存/i });
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith({
      ...mockNode,
      data: {
        ...mockNode.data,
        timing: 'evening',
      },
    });
  });
});