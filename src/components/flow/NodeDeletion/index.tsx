import { useState, memo } from 'react';
import type { FlowNode } from '../../../types';

interface NodeDeletionProps {
  selectedNode: FlowNode | null;
  onDelete: (nodeId: string) => void;
}

const NodeDeletion = memo(({ selectedNode, onDelete }: NodeDeletionProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Only allow deletion of habit nodes (not trigger or conditional nodes)
  if (!selectedNode || selectedNode.type !== 'habit') {
    return null;
  }

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    onDelete(selectedNode.id);
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <button
        onClick={handleDeleteClick}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
        title="ノードを削除 (Delete)"
      >
        🗑️ 削除
      </button>

      {showConfirmDialog && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">ノードを削除しますか？</h2>
            
            <p className="mb-6 text-gray-700">
              「{selectedNode.data.label}」を削除してもよろしいですか？
              この操作は取り消せません。
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

NodeDeletion.displayName = 'NodeDeletion';

export default NodeDeletion;