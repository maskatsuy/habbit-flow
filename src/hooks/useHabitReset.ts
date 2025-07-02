import { useCallback, useEffect, useState } from 'react';
import type { FlowNode, HabitNode as HabitNodeType } from '../types';

export function useHabitReset(
  nodes: FlowNode[],
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>
) {
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());

  const resetAllHabits = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'habit') {
          const habitNode = node as HabitNodeType;
          return {
            ...habitNode,
            data: {
              ...habitNode.data,
              isCompleted: false,
              completedAt: null,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // 日付変更を検知して自動リセット
  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastResetDate) {
        resetAllHabits();
        setLastResetDate(currentDate);
      }
    };

    // 初回チェック
    checkDateChange();

    // 1分ごとにチェック
    const interval = setInterval(checkDateChange, 60000);

    return () => clearInterval(interval);
  }, [lastResetDate, resetAllHabits]);

  // 手動リセット
  const handleResetHabits = useCallback(() => {
    if (window.confirm('すべての習慣の完了状態をリセットしますか？')) {
      resetAllHabits();
      setLastResetDate(new Date().toDateString());
    }
  }, [resetAllHabits]);

  return {
    resetAllHabits,
    handleResetHabits,
    lastResetDate,
  };
}