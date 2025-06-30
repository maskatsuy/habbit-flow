import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FlowDemo from './FlowDemo'

describe('FlowDemo', () => {
  it('React Flowが正しくレンダリングされること', () => {
    render(<FlowDemo />)
    
    // React Flowのコンテナが存在することを確認
    const reactFlowContainer = document.querySelector('.react-flow')
    expect(reactFlowContainer).toBeInTheDocument()
  })

  it('初期ノードが表示されること', () => {
    render(<FlowDemo />)
    
    // ノードのラベルが表示されていることを確認
    expect(screen.getByText('トリガー: 朝起きる')).toBeInTheDocument()
    expect(screen.getByText('アクション: 水を飲む')).toBeInTheDocument()
    expect(screen.getByText('アクション: ストレッチする')).toBeInTheDocument()
  })

  it('コントロールボタンが表示されること', () => {
    render(<FlowDemo />)
    
    // ズームイン/アウトボタンの存在を確認
    const zoomInButton = document.querySelector('.react-flow__controls-zoomin')
    const zoomOutButton = document.querySelector('.react-flow__controls-zoomout')
    const fitViewButton = document.querySelector('.react-flow__controls-fitview')
    
    expect(zoomInButton).toBeInTheDocument()
    expect(zoomOutButton).toBeInTheDocument()
    expect(fitViewButton).toBeInTheDocument()
  })
})