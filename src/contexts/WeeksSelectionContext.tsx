import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

type WeeksSelectionContextValue = {
  selectedWeekIds: string[];
  isSelected: (id: string) => boolean;
  toggleWeek: (id: string) => void;
  setSelectedWeeks: (ids: string[]) => void;
  clearSelection: () => void;
};

const WeeksSelectionContext = createContext<WeeksSelectionContextValue | undefined>(undefined);

export function WeeksSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedWeekIds, setSelectedWeekIds] = useState<string[]>([]);

  const value = useMemo<WeeksSelectionContextValue>(() => ({
    selectedWeekIds,
    isSelected: (id: string) => selectedWeekIds.includes(id),
    toggleWeek: (id: string) => {
      setSelectedWeekIds((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
    },
    setSelectedWeeks: (ids: string[]) => setSelectedWeekIds(Array.from(new Set(ids))),
    clearSelection: () => setSelectedWeekIds([]),
  }), [selectedWeekIds]);

  return <WeeksSelectionContext.Provider value={value}>{children}</WeeksSelectionContext.Provider>;
}

export function useWeeksSelection() {
  const ctx = useContext(WeeksSelectionContext);
  if (!ctx) throw new Error('useWeeksSelection must be used within WeeksSelectionProvider');
  return ctx;
}
