import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import TriggerNode from '../TriggerNode'
import type { NodeProps } from 'reactflow'

interface TriggerNodeData {
  label: string
  triggerType: 'time' | 'event' | 'location'
  icon?: string
}

const mockNodeProps: NodeProps<TriggerNodeData> = {
  id: 'trigger-node-1',
  data: {
    label: '朝7時',
    triggerType: 'time',
    icon: '⏰',
  },
  type: 'trigger',
  selected: false,
  isConnectable: true,
  xPos: 0,
  yPos: 0,
  zIndex: 1,
  dragging: false,
}

describe('TriggerNode', () => {
  it('should render trigger node with label and icon', () => {
    render(
      <ReactFlowProvider>
        <TriggerNode {...mockNodeProps} />
      </ReactFlowProvider>,
    )

    expect(screen.getByText('朝7時')).toBeInTheDocument()
    expect(screen.getByText('⏰')).toBeInTheDocument()
  })

  it('should have appropriate styling for trigger type', () => {
    render(
      <ReactFlowProvider>
        <TriggerNode {...mockNodeProps} />
      </ReactFlowProvider>,
    )

    const node = screen.getByTestId('trigger-node')
    expect(node).toHaveClass('border-blue-400')
    expect(node).toHaveClass('bg-blue-50')
  })

  it('should show selected state', () => {
    const selectedProps = {
      ...mockNodeProps,
      selected: true,
    }

    render(
      <ReactFlowProvider>
        <TriggerNode {...selectedProps} />
      </ReactFlowProvider>,
    )

    const node = screen.getByTestId('trigger-node')
    expect(node).toHaveClass('ring-2')
    expect(node).toHaveClass('ring-blue-500')
  })

  it('should render different trigger types', () => {
    const eventTriggerProps = {
      ...mockNodeProps,
      data: {
        label: 'メール受信時',
        triggerType: 'event' as const,
        icon: '📧',
      },
    }

    render(
      <ReactFlowProvider>
        <TriggerNode {...eventTriggerProps} />
      </ReactFlowProvider>,
    )

    expect(screen.getByText('メール受信時')).toBeInTheDocument()
    expect(screen.getByText('📧')).toBeInTheDocument()
  })
})
