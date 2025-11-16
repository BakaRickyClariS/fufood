import React from 'react';

interface MainTabsProps {
  active: 'overview' | 'settings';
  onChange: (value: 'overview' | 'settings') => void;
}

const InventoryMainTabs: React.FC<MainTabsProps> = ({ active, onChange }) => {
  return (
    <div className="flex justify-center items-center gap-10 py-3 bg-white">
      {[
        { id: 'overview', label: '庫存總覽' },
        { id: 'settings', label: '管理設定' },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as 'overview' | 'settings')}
          className="relative font-semibold text-neutral-900"
        >
          {tab.label}

          {/* 底線效果 */}
          {active === tab.id && (
            <span className="absolute left-0 right-0 -bottom-1 mx-auto h-1 w-10 rounded-full bg-[#FF6A6A]"></span>
          )}
        </button>
      ))}
    </div>
  );
};

export default InventoryMainTabs;
