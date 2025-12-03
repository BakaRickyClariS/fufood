export type Tab = {
  id: string;
  label: string;
};

export type TabsVariant = 'underline' | 'pill';

export type BaseTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
};

export type TabsProps = BaseTabsProps & {
  variant?: TabsVariant;
  animated?: boolean;
};
