import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('アプリケーションタイトルが表示されること', () => {
    render(<App />)
    
    expect(screen.getByText('HabitFlow')).toBeInTheDocument()
    expect(screen.getByText('習慣化フローアプリケーション')).toBeInTheDocument()
  })

  it('Tailwind CSSのクラスが適用されていること', () => {
    const { container } = render(<App />)
    
    // Tailwindのクラスが適用されているか確認
    const appContainer = container.firstChild
    expect(appContainer).toHaveClass('min-h-screen', 'bg-gray-50')
  })

  it('環境構築の確認項目が表示されること', () => {
    render(<App />)
    
    expect(screen.getByText('✅ React + TypeScript')).toBeInTheDocument()
    expect(screen.getByText('✅ Tailwind CSS')).toBeInTheDocument()
    expect(screen.getByText('✅ React Flow')).toBeInTheDocument()
  })

  it('習慣フローセクションが表示されること', () => {
    render(<App />)
    
    expect(screen.getByText('習慣フロー')).toBeInTheDocument()
    expect(screen.getByText('ノードをクリックして習慣を完了にできます')).toBeInTheDocument()
  })
})