import React from 'react';

type MainTabsProps = {
  active: 'overview' | 'settings';
  onChange: (value: 'overview' | 'settings') => void;
};

const InventoryMainTabs: React.FC<MainTabsProps> = ({ active, onChange }) => {
  return (
    <div className="flex justify-center items-center bg-white shadow-[0_6px_5px_-2px_rgba(0,0,0,0.06)]">
      {[
        { id: 'overview', label: '庫存總覽' },
        { id: 'settings', label: '管理設定' },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as 'overview' | 'settings')}
          className={`relative font-semibold text-neutral-900 pt-4 pb-2 px-2 border-b-4  ${active === tab.id ? '  border-primary-500' : 'border-transparent'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default InventoryMainTabs;
