import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlowManager from '../FlowManager';
import type { FlowSummary } from '../../hooks/useFlowPersistence';

const mockFlows: FlowSummary[] = [
  {
    name: '朝のルーティン',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    nodeCount: 5,
    edgeCount: 4,
  },
  {
    name: '夜のルーティン',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    nodeCount: 3,
    edgeCount: 2,
  },
];

const mockUseFlowPersistence = {
  listFlows: vi.fn(() => mockFlows),
  deleteFlow: vi.fn(),
};

vi.mock('../../hooks/useFlowPersistence', () => ({
  useFlowPersistence: () => mockUseFlowPersistence,
}));

describe('FlowManager', () => {
  it('should display list of saved flows', () => {
    render(
      <FlowManager
        currentFlow="朝のルーティン"
        onLoadFlow={() => {}}
        onNewFlow={() => {}}
      />
    );

    expect(screen.getByText('保存されたフロー')).toBeInTheDocument();
    expect(screen.getByText('朝のルーティン')).toBeInTheDocument();
    expect(screen.getByText('夜のルーティン')).toBeInTheDocument();
  });

  it('should show node and edge counts', () => {
    render(
      <FlowManager
        currentFlow="朝のルーティン"
        onLoadFlow={() => {}}
        onNewFlow={() => {}}
      />
    );

    expect(screen.getByText('5 ノード, 4 エッジ')).toBeInTheDocument();
    expect(screen.getByText('3 ノード, 2 エッジ')).toBeInTheDocument();
  });

  it('should highlight current flow', () => {
    render(
      <FlowManager
        currentFlow="朝のルーティン"
        onLoadFlow={() => {}}
        onNewFlow={() => {}}
      />
    );

    // フローカードの要素を探す（p-3クラスを持つdiv）
    const flowCards = screen.getAllByText(/ノード/).map(el => 
      el.closest('.p-3')
    );
    const currentFlowCard = flowCards.find(card => 
      card?.textContent?.includes('朝のルーティン')
    );
    
    expect(currentFlowCard).toHaveClass('border-blue-500');
  });

  it('should call onLoadFlow when flow is clicked', async () => {
    const user = userEvent.setup();
    const onLoadFlow = vi.fn();

    render(
      <FlowManager
        currentFlow="朝のルーティン"
        onLoadFlow={onLoadFlow}
        onNewFlow={() => {}}
      />
    );

    await user.click(screen.getByText('夜のルーティン'));
    expect(onLoadFlow).toHaveBeenCalledWith('夜のルーティン');
  });

  it('should call onNewFlow when new flow button is clicked', async () => {
    const user = userEvent.setup();
    const onNewFlow = vi.fn();

    render(
      <FlowManager
        currentFlow="朝のルーティン"
        onLoadFlow={() => {}}
        onNewFlow={onNewFlow}
      />
    );

    await user.click(screen.getByText('新規フロー'));
    expect(onNewFlow).toHaveBeenCalled();
  });

  it('should delete flow when delete button is clicked', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);

    render(
      <FlowManager
        currentFlow="朝のルーティン"
        onLoadFlow={() => {}}
        onNewFlow={() => {}}
      />
    );

    const deleteButtons = screen.getAllByText('🗑️');
    await user.click(deleteButtons[1]); // 夜のルーティンを削除

    expect(window.confirm).toHaveBeenCalledWith(
      'フロー「夜のルーティン」を削除しますか？'
    );
    expect(mockUseFlowPersistence.deleteFlow).toHaveBeenCalledWith('夜のルーティン');
  });
});