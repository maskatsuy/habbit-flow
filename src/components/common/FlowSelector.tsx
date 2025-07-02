import { memo } from 'react';

interface FlowSelectorProps {
  currentFlow: string;
  savedFlows: string[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FlowSelector = memo(({ currentFlow, savedFlows, onChange }: FlowSelectorProps) => {
  return (
    <select
      value={currentFlow}
      onChange={onChange}
      className="px-3 py-2 border border-gray-300 rounded-md min-w-[200px] font-medium"
    >
      <optgroup label="現在のフロー">
        <option value={currentFlow}>{currentFlow}</option>
      </optgroup>
      {savedFlows.filter(name => name !== currentFlow).length > 0 && (
        <optgroup label="保存済みフロー">
          {savedFlows
            .filter(name => name !== currentFlow)
            .map(name => (
              <option key={name} value={name}>{name}</option>
            ))
          }
        </optgroup>
      )}
      <option value="__new__">➕ 新規フロー作成</option>
    </select>
  );
});

FlowSelector.displayName = 'FlowSelector';

export default FlowSelector;