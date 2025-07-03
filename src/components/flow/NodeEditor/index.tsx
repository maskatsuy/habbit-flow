import { useState, useEffect, memo } from 'react';
import type { HabitNode } from '../../../types';

interface NodeEditorProps {
  node: HabitNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNode: HabitNode) => void;
}

const NodeEditor = memo(({ node, isOpen, onClose, onSave }: NodeEditorProps) => {
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    icon: '',
    timing: 'morning',
  });
  const [errors, setErrors] = useState<{ label?: string }>({});

  // Update form data when node changes
  useEffect(() => {
    if (node) {
      setFormData({
        label: node.data.label || '',
        description: node.data.description || '',
        icon: node.data.icon || '',
        timing: node.data.timing || 'morning',
      });
      setErrors({});
    }
  }, [node]);

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
    
    if (node) {
      onSave({
        ...node,
        data: {
          ...node.data,
          label: formData.label,
          description: formData.description,
          icon: formData.icon,
          timing: formData.timing,
        },
      });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
    setErrors({});
  };

  if (!isOpen || !node) {
    return null;
  }

  return (
    <div
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">習慣ノードを編集</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="edit-label" className="block text-sm font-medium mb-1">
              習慣名
            </label>
            <input
              id="edit-label"
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
            <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
              説明
            </label>
            <textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="edit-icon" className="block text-sm font-medium mb-1">
              アイコン
            </label>
            <select
              id="edit-icon"
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
            <label htmlFor="edit-timing" className="block text-sm font-medium mb-1">
              実行タイミング
            </label>
            <select
              id="edit-timing"
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
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

NodeEditor.displayName = 'NodeEditor';

export default NodeEditor;