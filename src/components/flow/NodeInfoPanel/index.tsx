import { memo } from 'react';
import type { FlowNode } from '../../../types';

interface NodeInfoPanelProps {
  selectedNode: FlowNode | null;
  canDelete: boolean;
  deleteReason?: string;
  onDelete: () => void;
}

const NodeInfoPanel = memo(({ selectedNode, canDelete, deleteReason, onDelete }: NodeInfoPanelProps) => {
  if (!selectedNode) return null;

  const getNodeTypeLabel = () => {
    switch (selectedNode.type) {
      case 'trigger':
        return 'トリガーノード';
      case 'conditional':
        return '条件分岐ノード';
      case 'habit':
        return '習慣ノード';
      default:
        return 'ノード';
    }
  };

  const getNodeStatus = () => {
    if (selectedNode.type !== 'habit') return null;
    
    const { isCompleted, isInactive, isDisabled } = selectedNode.data;
    
    if (isDisabled) return '利用不可';
    if (isInactive) return '未選択';
    if (isCompleted) return '完了';
    return '未完了';
  };

  return (
    <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">選択中のノード</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{selectedNode.data.icon || '📌'}</span>
          <span className="font-medium text-gray-900">{selectedNode.data.label}</span>
        </div>
        
        <div className="text-sm text-gray-600">
          <div>種類: {getNodeTypeLabel()}</div>
          {selectedNode.type === 'habit' && (
            <div>状態: {getNodeStatus()}</div>
          )}
        </div>
      </div>

      {selectedNode.type === 'habit' && (
        <>
          <div className="mt-4 pt-4 border-t border-gray-200">
            {canDelete ? (
              <button
                onClick={onDelete}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                title="ノードを削除"
              >
                🗑️ 削除
              </button>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">⚠️</span>
                  <div className="text-sm">
                    <div className="font-medium text-orange-700">このノードは削除できません</div>
                    <div className="text-orange-600 mt-1">{deleteReason}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});

NodeInfoPanel.displayName = 'NodeInfoPanel';

export default NodeInfoPanel;