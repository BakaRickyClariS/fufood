/**
 * 編輯模式狀態管理 Hook
 */
import { useState, useCallback } from 'react';

type UseEditModeReturn = {
  isEditMode: boolean;
  selectedIds: Set<string>;
  enterEditMode: () => void;
  exitEditMode: () => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
};

export const useEditMode = (): UseEditModeReturn => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    isEditMode,
    selectedIds,
    enterEditMode,
    exitEditMode,
    toggleSelect,
    selectAll,
    clearSelection,
  };
};
