import { useState, memo } from 'react';
import type { FlowNode } from '../../../types';

interface NodeCreatorProps {
  onCreateNode: (nodeData: {
    label: string;
    description?: string;
    icon?: string;
    timing?: string;
    parentNodeId?: string;
  }) => void;
  nodes: FlowNode[];
  selectedNode: FlowNode | null;
}

const NodeCreator = memo(({ onCreateNode, nodes, selectedNode }: NodeCreatorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    icon: '',
    timing: 'morning',
  });
  const [errors, setErrors] = useState<{ label?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { label?: string } = {};
    if (!formData.label.trim()) {
      newErrors.label = '習慣名は必須です';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onCreateNode({
      ...formData,
      parentNodeId: selectedNode?.id,
    });
    setIsModalOpen(false);
    // Reset form
    setFormData({
      label: '',
      description: '',
      icon: '',
      timing: 'morning',
    });
    setErrors({});
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({
      label: '',
      description: '',
      icon: '',
      timing: 'morning',
    });
    setErrors({});
  };

  const renderModal = () => (
    <div
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {selectedNode ? `「${selectedNode.data.label}」に続く習慣を作成` : '新規習慣ノードを作成'}
        </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="label" className="block text-sm font-medium mb-1">
                  習慣名
                </label>
                <input
                  id="label"
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.label ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.label && (
                  <p className="text-red-500 text-sm mt-1">{errors.label}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  説明
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="icon" className="block text-sm font-medium mb-1">
                  アイコン
                </label>
                <select
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">選択してください</option>
                  <option value="💧">💧 白湯を飲む</option>
                  <option value="🧘">🧘 瞑想</option>
                  <option value="📝">📝 日次レビュー</option>
                  <option value="📊">📊 週次レビュー</option>
                  <option value="✍️">✍️ ジャーナリング（5分間）</option>
                  <option value="📚">📚 読書（5分〜）</option>
                  <option value="🏃">🏃 運動・ストレッチ</option>
                  <option value="📱">📱 X（Twitter）発信</option>
                  <option value="📋">📋 Notion記録</option>
                  <option value="📅">📅 習慣カレンダー更新</option>
                  <option value="🎯">🎯 今日の目標確認</option>
                  <option value="🌅">🌅 朝のルーティン</option>
                  <option value="🌙">🌙 夜のルーティン</option>
                  <option value="💤">💤 睡眠準備</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="timing" className="block text-sm font-medium mb-1">
                  実行タイミング
                </label>
                <select
                  id="timing"
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="morning">朝</option>
                  <option value="afternoon">昼</option>
                  <option value="evening">夜</option>
                  <option value="anytime">いつでも</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
  );

  // ノードが0個の時は特別なUIを表示
  if (nodes.length === 0) {
    return (
      <>
        {!isModalOpen && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 pointer-events-auto"
            >
              <span className="text-2xl">+</span>
              <span className="text-lg">最初の習慣を作成</span>
            </button>
          </div>
        )}
        {isModalOpen && renderModal()}
      </>
    );
  }

  // 通常の表示（ノードが選択されている時のみ表示）
  const renderButton = () => {
    if (!selectedNode || selectedNode.type !== 'habit') {
      return null;
    }

    return (
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
      >
        <span className="text-xl">→</span>
        接続して追加
      </button>
    );
  };

  return (
    <>
      {renderButton()}
      {isModalOpen && renderModal()}
    </>
  );
});

NodeCreator.displayName = 'NodeCreator';

export default NodeCreator;