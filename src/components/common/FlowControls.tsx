import { memo } from 'react';
import FlowSelector from './FlowSelector';
import SaveIndicator from './SaveIndicator';
import FlowMenu from '../flow/FlowMenu';

interface FlowControlsProps {
  flowName: string;
  savedFlows: string[];
  hasUnsavedChanges: boolean;
  canDelete: boolean;
  onFlowChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSave: () => void;
  onSaveAs: () => void;
  onRename: () => void;
  onDelete: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}

const FlowControls = memo(({
  flowName,
  savedFlows,
  hasUnsavedChanges,
  canDelete,
  onFlowChange,
  onSave,
  onSaveAs,
  onRename,
  onDelete,
  onExport,
  onImport,
  onReset,
}: FlowControlsProps) => {
  return (
    <div className="flex gap-2 mb-4 items-center flex-wrap">
      <div className="flex items-center gap-2">
        <FlowSelector
          currentFlow={flowName}
          savedFlows={savedFlows}
          onChange={onFlowChange}
        />
        <SaveIndicator hasUnsavedChanges={hasUnsavedChanges} />
      </div>
      
      <button
        onClick={onSave}
        className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
          hasUnsavedChanges 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!hasUnsavedChanges}
        title={hasUnsavedChanges ? '保存 (Cmd/Ctrl + S)' : '変更なし'}
      >
        💾 保存
      </button>
      
      <FlowMenu
        onSaveAs={onSaveAs}
        onRename={onRename}
        onDelete={onDelete}
        onExport={onExport}
        onImport={onImport}
        canDelete={canDelete}
      />
      
      <button
        onClick={onReset}
        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors ml-auto"
        title="習慣をリセット"
      >
        🔄 リセット
      </button>
    </div>
  );
});

FlowControls.displayName = 'FlowControls';

export default FlowControls;