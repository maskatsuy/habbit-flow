import { useEffect, useCallback, useState } from 'react';
import type { FlowNode } from '../../types';

interface NodeDeletionProps {
  selectedNode: FlowNode;
  onDelete: (nodeId: string) => void;
}

/**
 * ノード削除機能を提供するコンポーネント
 * - Deleteキーでの削除
 * - 削除ボタンでの削除（オプション）
 */
export default function NodeDeletion({ selectedNode, onDelete }: NodeDeletionProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // selectedNodeがnullの場合は何も表示しない
  if (!selectedNode) {
    return null;
  }

  // Deleteキーでの削除処理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Deleteキーまたは Backspaceキーで削除
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // テキスト入力中は削除しない
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      event.preventDefault();
      setShowConfirmDialog(true);
    }
  }, [selectedNode.id, onDelete]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // トリガーノードと条件分岐ノードは削除不可
  const isDeletable = selectedNode.type === 'habit';

  if (!isDeletable) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            選択中: {selectedNode.data.label}
          </span>
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="ノードを削除 (Delete)"
          >
            削除
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Deleteキーでも削除できます
        </div>
      </div>
      
      {/* 確認ダイアログ */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowConfirmDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4" role="dialog">
            <h3 className="text-lg font-semibold mb-4">ノードを削除しますか？</h3>
            <p className="text-gray-600 mb-6">
              「{selectedNode.data.label}」を削除してもよろしいですか？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  onDelete(selectedNode.id);
                  setShowConfirmDialog(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}