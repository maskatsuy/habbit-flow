import { memo } from 'react';

interface SaveIndicatorProps {
  hasUnsavedChanges: boolean;
}

const SaveIndicator = memo(({ hasUnsavedChanges }: SaveIndicatorProps) => {
  if (!hasUnsavedChanges) return null;

  return (
    <span className="text-xs text-orange-500 font-medium">
      ● 未保存
    </span>
  );
});

SaveIndicator.displayName = 'SaveIndicator';

export default SaveIndicator;