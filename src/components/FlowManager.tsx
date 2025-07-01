import { useState, useEffect } from 'react';
import { useFlowPersistence } from '../hooks/useFlowPersistence';
import type { FlowSummary } from '../hooks/useFlowPersistence';

interface FlowManagerProps {
  currentFlow: string;
  onLoadFlow: (name: string) => void;
  onNewFlow: () => void;
}

export default function FlowManager({
  currentFlow,
  onLoadFlow,
  onNewFlow,
}: FlowManagerProps) {
  const [flows, setFlows] = useState<FlowSummary[]>([]);
  const { listFlows, deleteFlow } = useFlowPersistence();

  useEffect(() => {
    const loadFlows = () => {
      const flowList = listFlows();
      setFlows(flowList);
    };

    loadFlows();
    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      loadFlows();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [listFlows, currentFlow]);

  const handleDelete = (name: string) => {
    if (window.confirm(`フロー「${name}」を削除しますか？`)) {
      deleteFlow(name);
      setFlows(flows.filter(f => f.name !== name));
      if (name === currentFlow) {
        onNewFlow();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            保存されたフロー
          </h3>
          <button
            onClick={onNewFlow}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            新規フロー
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {flows.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              保存されたフローはありません
            </p>
          ) : (
            flows.map((flow) => (
              <div
                key={flow.name}
                className={`
                  p-3 border rounded cursor-pointer transition-all
                  ${flow.name === currentFlow
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
                onClick={() => onLoadFlow(flow.name)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {flow.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {flow.nodeCount} ノード, {flow.edgeCount} エッジ
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      更新: {formatDate(flow.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(flow.name);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}