import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NodeCreator from '../NodeCreator'

describe('NodeCreator', () => {
  const mockNodes = [
    {
      id: 'habit-1',
      type: 'habit' as const,
      position: { x: 100, y: 100 },
      data: {
        habitId: 'habit-1',
        label: '水を飲む',
        icon: '💧',
        isCompleted: false,
        completedAt: null,
      },
    },
  ]

  it('should render special button when no nodes exist', () => {
    render(<NodeCreator onCreateNode={vi.fn()} nodes={[]} selectedNode={null} />)

    const addButton = screen.getByRole('button', { name: /最初の習慣を作成/i })
    expect(addButton).toBeInTheDocument()
  })

  it('should render connect button when habit node is selected', () => {
    render(<NodeCreator onCreateNode={vi.fn()} nodes={mockNodes} selectedNode={mockNodes[0]} />)

    const addButton = screen.getByRole('button', { name: /接続して追加/i })
    expect(addButton).toBeInTheDocument()
  })

  it('should not render button when no node is selected', () => {
    render(<NodeCreator onCreateNode={vi.fn()} nodes={mockNodes} selectedNode={null} />)

    expect(screen.queryByRole('button', { name: /接続して追加/i })).not.toBeInTheDocument()
  })

  it('should show creation modal when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<NodeCreator onCreateNode={vi.fn()} nodes={[]} selectedNode={null} />)

    const addButton = screen.getByRole('button', { name: /最初の習慣を作成/i })
    await user.click(addButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('新規習慣ノードを作成')).toBeInTheDocument()
  })

  it('should show connected modal title when creating from selected node', async () => {
    const user = userEvent.setup()
    render(<NodeCreator onCreateNode={vi.fn()} nodes={mockNodes} selectedNode={mockNodes[0]} />)

    const addButton = screen.getByRole('button', { name: /接続して追加/i })
    await user.click(addButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('「水を飲む」に続く習慣を作成')).toBeInTheDocument()
  })

  it('should have form fields in the modal', async () => {
    const user = userEvent.setup()
    render(<NodeCreator onCreateNode={vi.fn()} nodes={[]} selectedNode={null} />)

    const addButton = screen.getByRole('button', { name: /最初の習慣を作成/i })
    await user.click(addButton)

    expect(screen.getByLabelText('習慣名')).toBeInTheDocument()
    expect(screen.getByLabelText('説明')).toBeInTheDocument()
    expect(screen.getByLabelText('アイコン')).toBeInTheDocument()
    expect(screen.getByLabelText('実行タイミング')).toBeInTheDocument()
  })

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<NodeCreator onCreateNode={vi.fn()} nodes={[]} selectedNode={null} />)

    const addButton = screen.getByRole('button', { name: /最初の習慣を作成/i })
    await user.click(addButton)

    const cancelButton = screen.getByRole('button', { name: /キャンセル/i })
    await user.click(cancelButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should call onCreateNode with form data when submitted', async () => {
    const user = userEvent.setup()
    const mockOnCreateNode = vi.fn()
    render(<NodeCreator onCreateNode={mockOnCreateNode} nodes={[]} selectedNode={null} />)

    const addButton = screen.getByRole('button', { name: /最初の習慣を作成/i })
    await user.click(addButton)

    // Fill form
    await user.type(screen.getByLabelText('習慣名'), '瞑想')
    await user.type(screen.getByLabelText('説明'), '朝の瞑想習慣')
    await user.selectOptions(screen.getByLabelText('アイコン'), '🧘')
    await user.selectOptions(screen.getByLabelText('実行タイミング'), 'morning')

    const submitButton = screen.getByRole('button', { name: /作成/i })
    await user.click(submitButton)

    expect(mockOnCreateNode).toHaveBeenCalledWith({
      label: '瞑想',
      description: '朝の瞑想習慣',
      icon: '🧘',
      timing: 'morning',
      parentNodeId: undefined,
    })

    // Modal should close after submission
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should include parentNodeId when creating from selected node', async () => {
    const user = userEvent.setup()
    const mockOnCreateNode = vi.fn()
    render(
      <NodeCreator onCreateNode={mockOnCreateNode} nodes={mockNodes} selectedNode={mockNodes[0]} />,
    )

    const addButton = screen.getByRole('button', { name: /接続して追加/i })
    await user.click(addButton)

    // Fill form
    await user.type(screen.getByLabelText('習慣名'), '瞑想')

    const submitButton = screen.getByRole('button', { name: /作成/i })
    await user.click(submitButton)

    expect(mockOnCreateNode).toHaveBeenCalledWith(
      expect.objectContaining({
        label: '瞑想',
        parentNodeId: 'habit-1',
      }),
    )
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<NodeCreator onCreateNode={vi.fn()} nodes={[]} selectedNode={null} />)

    const addButton = screen.getByRole('button', { name: /最初の習慣を作成/i })
    await user.click(addButton)

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /作成/i })
    await user.click(submitButton)

    expect(screen.getByText('習慣名は必須です')).toBeInTheDocument()
  })
})
