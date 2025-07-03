import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactFlowProvider } from 'reactflow';
import HabitFlow from '../index';
import type { FlowNode, FlowEdge } from '../../../../types';
import { FlowBuilder } from '../../../../test-utils/flowTestUtils';

// reactflowのモックを有効化
vi.mock('reactflow', async () => {
  const actual = await vi.importActual('reactflow');
  return {
    ...actual,
    ReactFlow: vi.fn(({ children }) => <div data-testid="react-flow">{children}</div>),
    Background: vi.fn(() => null),
    Controls: vi.fn(() => null),
    MiniMap: vi.fn(() => null),
  };
});

describe('HabitFlow - ノード削除と再接続', () => {
  let mockNodes: FlowNode[];
  let mockEdges: FlowEdge[];
  let mockSetNodes: ReturnType<typeof vi.fn>;
  let mockSetEdges: ReturnType<typeof vi.fn>;
  let mockOnNodesChange: ReturnType<typeof vi.fn>;
  let mockOnEdgesChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetNodes = vi.fn();
    mockSetEdges = vi.fn();
    mockOnNodesChange = vi.fn();
    mockOnEdgesChange = vi.fn();
  });

  const renderHabitFlow = (nodes: FlowNode[], edges: FlowEdge[]) => {
    return render(
      <ReactFlowProvider>
        <HabitFlow
          nodes={nodes}
          edges={edges}
          setNodes={mockSetNodes}
          setEdges={mockSetEdges}
          onNodesChange={mockOnNodesChange}
          onEdgesChange={mockOnEdgesChange}
        />
      </ReactFlowProvider>
    );
  };

  describe('単純なチェーンでのノード削除', () => {
    it('should reconnect nodes when deleting a middle node', () => {
      const builder = new FlowBuilder();
      builder
        .addTrigger('trigger1')
        .addHabit('habit1', { label: '習慣1' })
        .addHabit('habit2', { label: '習慣2' })
        .addHabit('habit3', { label: '習慣3' })
        .addEdge('trigger1', 'habit1')
        .addEdge('habit1', 'habit2')
        .addEdge('habit2', 'habit3');

      const { nodes, edges } = builder.build();
      mockNodes = nodes;
      mockEdges = edges;

      renderHabitFlow(nodes, edges);

      // habit2を削除
      const deleteNodeId = 'habit2';
      
      // onNodesChangeを通じて削除をシミュレート
      mockOnNodesChange([
        {
          type: 'remove',
          id: deleteNodeId,
        }
      ]);

      // setNodesとsetEdgesが呼ばれることを確認
      expect(mockSetNodes).toHaveBeenCalled();
      expect(mockSetEdges).toHaveBeenCalled();

      // エッジの更新を確認
      const edgeUpdateFunction = mockSetEdges.mock.calls[0][0];
      const updatedEdges = edgeUpdateFunction(edges);

      // habit2に関連するエッジが削除され、habit1とhabit3が直接接続されることを確認
      expect(updatedEdges).not.toContainEqual(expect.objectContaining({
        source: 'habit1',
        target: 'habit2',
      }));
      expect(updatedEdges).not.toContainEqual(expect.objectContaining({
        source: 'habit2',
        target: 'habit3',
      }));
      expect(updatedEdges).toContainEqual(expect.objectContaining({
        source: 'habit1',
        target: 'habit3',
      }));
    });

    it('should handle deletion of first habit node', () => {
      const builder = new FlowBuilder();
      builder
        .addTrigger('trigger1')
        .addHabit('habit1', { label: '習慣1' })
        .addHabit('habit2', { label: '習慣2' })
        .addEdge('trigger1', 'habit1')
        .addEdge('habit1', 'habit2');

      const { nodes, edges } = builder.build();
      renderHabitFlow(nodes, edges);

      // habit1を削除
      mockOnNodesChange([
        {
          type: 'remove',
          id: 'habit1',
        }
      ]);

      const edgeUpdateFunction = mockSetEdges.mock.calls[0][0];
      const updatedEdges = edgeUpdateFunction(edges);

      // trigger1が直接habit2に接続されることを確認
      expect(updatedEdges).toContainEqual(expect.objectContaining({
        source: 'trigger1',
        target: 'habit2',
      }));
    });

    it('should handle deletion of last habit node', () => {
      const builder = new FlowBuilder();
      builder
        .addHabit('habit1', { label: '習慣1' })
        .addHabit('habit2', { label: '習慣2' })
        .addEdge('habit1', 'habit2');

      const { nodes, edges } = builder.build();
      renderHabitFlow(nodes, edges);

      // habit2を削除
      mockOnNodesChange([
        {
          type: 'remove',
          id: 'habit2',
        }
      ]);

      const edgeUpdateFunction = mockSetEdges.mock.calls[0][0];
      const updatedEdges = edgeUpdateFunction(edges);

      // habit1からhabit2へのエッジが削除されることを確認
      expect(updatedEdges).not.toContainEqual(expect.objectContaining({
        source: 'habit1',
        target: 'habit2',
      }));
    });
  });

  describe('条件分岐でのノード削除', () => {
    it('should not allow deletion of last node in conditional path', () => {
      const builder = new FlowBuilder();
      builder
        .addConditionalPattern(
          'trigger1',
          'weather1',
          ['jog1'],  // Yesパスに1つのノード
          ['bike1']  // Noパスに1つのノード
        );

      const { nodes, edges } = builder.build();
      renderHabitFlow(nodes, edges);

      // アラートのモック
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      // jog1を削除しようとする
      mockOnNodesChange([
        {
          type: 'remove',
          id: 'jog1',
        }
      ]);

      // アラートが表示されることを確認
      expect(alertSpy).toHaveBeenCalledWith(
        '条件分岐の各パスには最低1つのノードが必要です。このノードは削除できません。'
      );

      // ノードとエッジの更新が呼ばれないことを確認
      expect(mockSetNodes).not.toHaveBeenCalled();
      expect(mockSetEdges).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('should allow deletion and reconnect in conditional path with multiple nodes', () => {
      const builder = new FlowBuilder();
      builder
        .addConditionalPattern(
          'trigger1',
          'weather1',
          ['jog1'],
          ['bike1']
        )
        .addHabit('stretch1', { label: 'ストレッチ' })
        .addEdge('jog1', 'stretch1')
        .addHabit('shower1', { label: 'シャワー' })
        .addEdge('stretch1', 'shower1');

      const { nodes, edges } = builder.build();
      renderHabitFlow(nodes, edges);

      // stretch1を削除
      mockOnNodesChange([
        {
          type: 'remove',
          id: 'stretch1',
        }
      ]);

      const edgeUpdateFunction = mockSetEdges.mock.calls[0][0];
      const updatedEdges = edgeUpdateFunction(edges);

      // jog1とshower1が直接接続されることを確認
      expect(updatedEdges).toContainEqual(expect.objectContaining({
        source: 'jog1',
        target: 'shower1',
      }));
    });

    it('should handle deletion at merge point correctly', () => {
      const builder = new FlowBuilder();
      builder
        .addConditionalPattern(
          'trigger1',
          'weather1',
          ['jog1'],
          ['bike1']
        )
        .addHabit('shower1', { label: 'シャワー' })
        .addEdge('jog1', 'shower1')
        .addEdge('bike1', 'shower1')
        .addHabit('breakfast1', { label: '朝食' })
        .addEdge('shower1', 'breakfast1');

      const { nodes, edges } = builder.build();
      renderHabitFlow(nodes, edges);

      // マージポイント（shower1）を削除
      mockOnNodesChange([
        {
          type: 'remove',
          id: 'shower1',
        }
      ]);

      const edgeUpdateFunction = mockSetEdges.mock.calls[0][0];
      const updatedEdges = edgeUpdateFunction(edges);

      // 両方のパスからbreakfast1に接続されることを確認
      expect(updatedEdges).toContainEqual(expect.objectContaining({
        source: 'jog1',
        target: 'breakfast1',
      }));
      expect(updatedEdges).toContainEqual(expect.objectContaining({
        source: 'bike1',
        target: 'breakfast1',
      }));
    });
  });

  describe('複数ノードの同時削除', () => {
    it('should handle deletion of multiple nodes', () => {
      const builder = new FlowBuilder();
      builder
        .addTrigger('trigger1')
        .addHabit('habit1', { label: '習慣1' })
        .addHabit('habit2', { label: '習慣2' })
        .addHabit('habit3', { label: '習慣3' })
        .addHabit('habit4', { label: '習慣4' })
        .addEdge('trigger1', 'habit1')
        .addEdge('habit1', 'habit2')
        .addEdge('habit2', 'habit3')
        .addEdge('habit3', 'habit4');

      const { nodes, edges } = builder.build();
      renderHabitFlow(nodes, edges);

      // habit2とhabit3を同時に削除
      mockOnNodesChange([
        {
          type: 'remove',
          id: 'habit2',
        },
        {
          type: 'remove',
          id: 'habit3',
        }
      ]);

      const edgeUpdateFunction = mockSetEdges.mock.calls[0][0];
      const updatedEdges = edgeUpdateFunction(edges);

      // habit1とhabit4が直接接続されることを確認
      expect(updatedEdges).toContainEqual(expect.objectContaining({
        source: 'habit1',
        target: 'habit4',
      }));
      
      // 削除されたノードに関連するエッジがないことを確認
      expect(updatedEdges).not.toContainEqual(expect.objectContaining({
        source: 'habit2',
      }));
      expect(updatedEdges).not.toContainEqual(expect.objectContaining({
        target: 'habit2',
      }));
      expect(updatedEdges).not.toContainEqual(expect.objectContaining({
        source: 'habit3',
      }));
      expect(updatedEdges).not.toContainEqual(expect.objectContaining({
        target: 'habit3',
      }));
    });
  });
});