import { useState, useRef, useEffect } from 'react';

interface FlowMenuProps {
  onSaveAs: () => void;
  onRename: () => void;
  onDelete: () => void;
  onExport: () => void;
  onImport: () => void;
  canDelete: boolean;
}

export default function FlowMenu({
  onSaveAs,
  onRename,
  onDelete,
  onExport,
  onImport,
  canDelete,
}: FlowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        title="メニュー"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="5" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="15" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="py-1">
            <button
              onClick={() => handleMenuAction(onSaveAs)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-base">💾</span>
              <span>名前を付けて保存...</span>
            </button>

            <button
              onClick={() => handleMenuAction(onRename)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-base">✏️</span>
              <span>フロー名を変更...</span>
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={() => handleMenuAction(onImport)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-base">📥</span>
              <span>インポート...</span>
            </button>

            <button
              onClick={() => handleMenuAction(onExport)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-base">📤</span>
              <span>エクスポート</span>
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={() => handleMenuAction(onDelete)}
              disabled={!canDelete}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                canDelete
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-base">🗑️</span>
              <span>削除</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}