import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ArrowConnectorProps {
  panelRef: React.RefObject<HTMLDivElement>
  targetNodeId: string
  position: 'left' | 'right'
}

export const ArrowConnector = ({ panelRef, targetNodeId, position }: ArrowConnectorProps) => {
  const [arrowPath, setArrowPath] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!panelRef.current || !targetNodeId) return

    const updateArrowPath = () => {
      const panel = panelRef.current
      const node = document.querySelector(`[data-id="${targetNodeId}"]`)

      if (!panel || !node) return

      // React Flowのキャンバスを取得
      const canvas = document.querySelector('.react-flow')
      if (!canvas) return

      const canvasRect = canvas.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const nodeRect = node.getBoundingClientRect()

      // キャンバス相対座標に変換
      const panelRelative = {
        left: panelRect.left - canvasRect.left,
        top: panelRect.top - canvasRect.top,
        right: panelRect.right - canvasRect.left,
        bottom: panelRect.bottom - canvasRect.top,
        centerY: panelRect.top + panelRect.height / 2 - canvasRect.top,
      }

      const nodeRelative = {
        left: nodeRect.left - canvasRect.left,
        top: nodeRect.top - canvasRect.top,
        right: nodeRect.right - canvasRect.left,
        bottom: nodeRect.bottom - canvasRect.top,
        centerX: nodeRect.left + nodeRect.width / 2 - canvasRect.left,
        centerY: nodeRect.top + nodeRect.height / 2 - canvasRect.top,
      }

      // 矢印の開始点と終了点を計算
      let startX, startY, endX, endY

      if (position === 'left') {
        // パネルが左側：パネルの右端から出発
        startX = panelRelative.right
        startY = Math.max(
          panelRelative.top + 40,
          Math.min(panelRelative.bottom - 40, nodeRelative.centerY),
        )
        // ノードの左端を目指す
        endX = nodeRelative.left - 5
        endY = nodeRelative.centerY
      } else {
        // パネルが右側：パネルの左端から出発
        startX = panelRelative.left
        startY = Math.max(
          panelRelative.top + 40,
          Math.min(panelRelative.bottom - 40, nodeRelative.centerY),
        )
        // ノードの右端を目指す
        endX = nodeRelative.right + 5
        endY = nodeRelative.centerY
      }

      // ベジェ曲線のコントロールポイント
      const controlX = (startX + endX) / 2
      const controlY1 = startY
      const controlY2 = endY

      // SVGパスを生成
      const path = `M ${startX} ${startY} C ${controlX} ${controlY1}, ${controlX} ${controlY2}, ${endX} ${endY}`
      setArrowPath(path)
    }

    // 初回更新
    updateArrowPath()

    // React Flowのビューポート変更を監視
    const viewport = document.querySelector('.react-flow__viewport')
    if (viewport) {
      const observer = new MutationObserver(updateArrowPath)
      observer.observe(viewport, {
        attributes: true,
        attributeFilter: ['style'],
      })

      // リサイズ監視
      window.addEventListener('resize', updateArrowPath)

      return () => {
        observer.disconnect()
        window.removeEventListener('resize', updateArrowPath)
      }
    }
  }, [panelRef, targetNodeId, position])

  // React Flowのキャンバス内にSVGを描画
  const canvas = document.querySelector('.react-flow')
  if (!canvas || !arrowPath) {
    return null
  }

  return createPortal(
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 999,
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <defs>
        <marker
          id="arrowhead-connector"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
      </defs>
      <path
        d={arrowPath}
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
        markerEnd="url(#arrowhead-connector)"
        strokeDasharray="5,5"
        opacity="0.8"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="10"
          to="0"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </path>
    </svg>,
    canvas,
  )
}
