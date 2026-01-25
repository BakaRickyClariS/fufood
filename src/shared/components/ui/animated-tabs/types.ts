export type Tab<TId extends string = string> = {
  id: TId;
  label: string;
};

export type TabsVariant = 'underline' | 'pill';

export type BaseTabsProps<TId extends string = string> = {
  tabs: Tab<TId>[];
  activeTab: TId;
  onTabChange: (tabId: TId) => void;
  className?: string;
};

export type TabsProps<TId extends string = string> = BaseTabsProps<TId> & {
  variant?: TabsVariant;
  animated?: boolean;
};
