import React from 'react';

export type SubTabType = 'all' | 'common' | 'expired';

type SubTabsProps = {
  active: SubTabType;
  onChange: (value: SubTabType) => void;
};

const InventorySubTabs: React.FC<SubTabsProps> = ({ active, onChange }) => {
  const tabs: { id: SubTabType; label: string }[] = [
    { id: 'all', label: '總覽' },
    { id: 'common', label: '常用' },
    { id: 'expired', label: '已過期' },
  ];

  return (
    <div className="flex items-center justify-between bg-neutral-100 rounded-full px-2 py-1 mt-2">
      {tabs.map((tab, index) => (
        <div key={tab.id} className="flex items-center">
          <button
            className={`
              px-6 py-2 rounded-full text-sm font-medium transition-all
              ${
                active === tab.id
                  ? 'bg-white shadow-[0_6px_14px_-2px_rgba(0,0,0,0.12)]'
                  : 'text-neutral-600'
              }
            `}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>

          {/* 分隔線 | */}
          {index !== tabs.length - 1 && (
            <span className="mx-2 text-neutral-400 font-light text-lg">|</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default InventorySubTabs;
