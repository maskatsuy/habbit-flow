import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { useReactFlow } from 'reactflow'
import ClickableHabitNode from '../ClickableHabitNode'
import type { NodeProps } from 'reactflow'
import type { HabitNodeData } from '../../../types'
import { renderWithProviders, fireDoubleClick } from '../../../test-utils/testUtils'
import { FlowBuilder } from '../../../test-utils/flowTestUtils'

// reactflowのモックを有効化
vi.mock('reactflow')

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
}

describe('ClickableHabitNode', () => {
  let mockSetNodes: ReturnType<typeof vi.fn>
  let mockSetEdges: ReturnType<typeof vi.fn>
  let mockGetNodes: ReturnType<typeof vi.fn>
  let mockGetEdges: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // モック関数を作成
    mockSetNodes = vi.fn()
    mockSetEdges = vi.fn()
    mockGetNodes = vi.fn(() => [])
    mockGetEdges = vi.fn(() => [])

    // useReactFlowのデフォルトモックを設定
    ;(useReactFlow as any).mockReturnValue({
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      getNodes: mockGetNodes,
      getEdges: mockGetEdges,
      getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      project: vi.fn((position: any) => position),
      viewportInitialized: true,
    })
  })

  describe('基本的な表示', () => {
    it('should render habit node with label and icon', () => {
      renderWithProviders(<ClickableHabitNode {...mockNodeProps} />)

      expect(screen.getByText('水を飲む')).toBeInTheDocument()
      expect(screen.getByText('💧')).toBeInTheDocument()
    })

    it('should show incomplete state by default', () => {
      renderWithProviders(<ClickableHabitNode {...mockNodeProps} />)

      const node = screen.getByTestId('habit-node')
      expect(node).toHaveClass('border-gray-300')
      expect(node).not.toHaveClass('border-green-500')
    })

    it('should show completed state when isCompleted is true', () => {
      const completedProps = {
        ...mockNodeProps,
        data: {
          ...mockNodeProps.data,
          isCompleted: true,
          completedAt: new Date(),
        },
      }

      renderWithProviders(<ClickableHabitNode {...completedProps} />)

      const node = screen.getByTestId('habit-node')
      expect(node).toHaveClass('border-green-500')
      expect(screen.getByText('完了')).toBeInTheDocument()
    })

    it('should show selected state', () => {
      const selectedProps = {
        ...mockNodeProps,
        selected: true,
      }

      renderWithProviders(<ClickableHabitNode {...selectedProps} />)

      const node = screen.getByTestId('habit-node')
      expect(node).toHaveClass('ring-2')
      expect(node).toHaveClass('ring-offset-2')
    })

    it('should show inactive state when isInactive is true', () => {
      const inactiveProps = {
        ...mockNodeProps,
        data: {
          ...mockNodeProps.data,
          isInactive: true,
        },
      }

      renderWithProviders(<ClickableHabitNode {...inactiveProps} />)

      const node = screen.getByTestId('habit-node')
      expect(screen.getByText('未選択')).toBeInTheDocument()
      expect(node).toHaveClass('opacity-60')
    })

    it('should show disabled state when isDisabled is true', () => {
      const disabledProps = {
        ...mockNodeProps,
        data: {
          ...mockNodeProps.data,
          isDisabled: true,
        },
      }

      renderWithProviders(<ClickableHabitNode {...disabledProps} />)

      const node = screen.getByTestId('habit-node')
      expect(screen.getByText('利用不可')).toBeInTheDocument()
      expect(node).toHaveClass('opacity-50')
      expect(node).toHaveClass('cursor-not-allowed')
    })
  })

  describe('ダブルクリック完了機能', () => {
    it('should toggle completion on double click', async () => {
      renderWithProviders(<ClickableHabitNode {...mockNodeProps} />)

      const node = screen.getByTestId('habit-node')
      fireDoubleClick(node)

      expect(mockSetNodes).toHaveBeenCalled()
      const updateFunction = mockSetNodes.mock.calls[0][0]
      const updatedNodes = updateFunction([
        {
          id: 'test-node-1',
          type: 'habit',
          data: { ...mockNodeProps.data },
        },
      ])

      expect(updatedNodes[0].data.isCompleted).toBe(true)
    })

    it('should call onEditNode on Shift+double click', async () => {
      const mockOnEditNode = vi.fn()

      renderWithProviders(<ClickableHabitNode {...mockNodeProps} />, { onEditNode: mockOnEditNode })

      const node = screen.getByTestId('habit-node')
      fireDoubleClick(node, { shiftKey: true })

      expect(mockOnEditNode).toHaveBeenCalledWith('test-node-1')
    })

    it('should not toggle completion when disabled', () => {
      const disabledProps = {
        ...mockNodeProps,
        data: {
          ...mockNodeProps.data,
          isDisabled: true,
        },
      }

      renderWithProviders(<ClickableHabitNode {...disabledProps} />)

      const node = screen.getByTestId('habit-node')
      fireDoubleClick(node)

      expect(mockSetNodes).not.toHaveBeenCalled()
    })
  })

  describe('条件分岐の排他制御', () => {
    it('should handle conditional path exclusivity', () => {
      const builder = new FlowBuilder()
      builder
        .addConditionalPattern('trigger1', 'weather1', ['jog1'], ['bike1'])
        .addHabit('shower1', { label: 'シャワー' }, { x: 0, y: 300 })

      const { nodes, edges } = builder.build()

      // ジョギングノードを完了させる
      const jogNode = nodes.find((n) => n.id === 'jog1')
      const props: NodeProps<HabitNodeData> = {
        ...mockNodeProps,
        id: 'jog1',
        data: jogNode!.data as HabitNodeData,
      }

      // モックのgetNodes/getEdgesを設定
      mockGetNodes.mockReturnValue(nodes)
      mockGetEdges.mockReturnValue(edges)

      renderWithProviders(<ClickableHabitNode {...props} />, { edges })

      const node = screen.getByTestId('habit-node')
      fireDoubleClick(node)

      expect(mockSetNodes).toHaveBeenCalled()
      const updateFunction = mockSetNodes.mock.calls[0][0]
      const updatedNodes = updateFunction(nodes)

      // デバッグ用に更新後のノードを確認
      // console.log('Updated nodes:', updatedNodes.map((n: FlowNode) => ({ id: n.id, type: n.type, data: n.data })));

      // ジョギングノードが完了
      const updatedJogNode = updatedNodes.find((n: FlowNode) => n.id === 'jog1')
      expect(updatedJogNode?.data.isCompleted).toBe(true)

      // エアロバイクノードが未完了になる（isInactiveはuseFlowAnimationsで管理される）
      const updatedBikeNode = updatedNodes.find((n: FlowNode) => n.id === 'bike1')
      expect(updatedBikeNode?.data.isCompleted).toBe(false)
    })

    it('should allow switching between conditional paths', () => {
      const builder = new FlowBuilder()
      builder
        .addConditionalPattern('trigger1', 'weather1', ['jog1'], ['bike1'])
        .addHabit('shower1', { label: 'シャワー' }, { x: 0, y: 300 })

      const { nodes: initialNodes, edges } = builder.build()

      // 初期状態: ジョギングを完了済みにする
      const nodes = initialNodes.map((n) =>
        n.id === 'jog1'
          ? { ...n, data: { ...n.data, isCompleted: true } }
          : n.id === 'bike1'
            ? { ...n, data: { ...n.data, isInactive: true } }
            : n,
      )

      // エアロバイクノードをクリック
      const bikeNode = nodes.find((n) => n.id === 'bike1')
      const props: NodeProps<HabitNodeData> = {
        ...mockNodeProps,
        id: 'bike1',
        data: bikeNode!.data as HabitNodeData,
      }

      // モックのgetNodes/getEdgesを設定
      mockGetNodes.mockReturnValue(nodes)
      mockGetEdges.mockReturnValue(edges)

      renderWithProviders(<ClickableHabitNode {...props} />, { edges })

      const node = screen.getByTestId('habit-node')
      fireDoubleClick(node)

      expect(mockSetNodes).toHaveBeenCalled()
      const updateFunction = mockSetNodes.mock.calls[0][0]
      const updatedNodes = updateFunction(nodes)

      // エアロバイクが完了
      const updatedBikeNode = updatedNodes.find((n: FlowNode) => n.id === 'bike1')
      expect(updatedBikeNode?.data.isCompleted).toBe(true)
      // isInactiveは元の状態から変更されるので、元がtrueのままである
      expect(updatedBikeNode?.data.isInactive).toBe(true)

      // ジョギングが未完了になる
      const updatedJogNode = updatedNodes.find((n: FlowNode) => n.id === 'jog1')
      expect(updatedJogNode?.data.isCompleted).toBe(false)
      // isInactiveは元の状態から変更されない
      expect(updatedJogNode?.data.isInactive).toBeFalsy()
    })

    it('should not affect merge points when completing nodes', () => {
      const builder = new FlowBuilder()
      builder
        .addConditionalPattern('trigger1', 'weather1', ['jog1'], ['bike1'])
        .addHabit('shower1', { label: 'シャワー' }, { x: 0, y: 300 })
        .addEdge('jog1', 'shower1')
        .addEdge('bike1', 'shower1')

      const { nodes, edges } = builder.build()

      // ジョギングノードを完了させる
      const jogNode = nodes.find((n) => n.id === 'jog1')
      const props: NodeProps<HabitNodeData> = {
        ...mockNodeProps,
        id: 'jog1',
        data: jogNode!.data as HabitNodeData,
      }

      // モックのgetNodes/getEdgesを設定
      mockGetNodes.mockReturnValue(nodes)
      mockGetEdges.mockReturnValue(edges)

      renderWithProviders(<ClickableHabitNode {...props} />, { edges })

      const node = screen.getByTestId('habit-node')
      fireDoubleClick(node)

      expect(mockSetNodes).toHaveBeenCalled()
      const updateFunction = mockSetNodes.mock.calls[0][0]
      const updatedNodes = updateFunction(nodes)

      // マージポイント（シャワー）は影響を受けない
      const showerNode = updatedNodes.find((n: FlowNode) => n.id === 'shower1')
      expect(showerNode?.data.isInactive).toBeFalsy()
      expect(showerNode?.data.isCompleted).toBeFalsy()
    })
  })
})
