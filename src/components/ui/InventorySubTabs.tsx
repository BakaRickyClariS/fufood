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
    <div className="flex items-center justify-between bg-neutral-200 rounded-full gap-2 p-0.5 mt-8 mb-6 relative">
      {tabs.map((tab) => (
        <div key={tab.id} className="flex items-center justify-center w-1/3">
          <button
            className={`
              px-6 py-1 w-full rounded-full text-sm font-medium transition-all
              ${
                active === tab.id
                  ? 'bg-white shadow-[0_6px_14px_-2px_rgba(0,0,0,0.12)] z-10'
                  : 'text-neutral-600'
              }
            `}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        </div>
      ))}
      <div className="absolute w-full flex items-center justify-center left-1/2 top-1 -translate-x-1/2 z-0 pointer-events-none">
        <div className="flex w-[39.5%] items-center justify-between text-neutral-100 font-light text-sm">
          <span className="mx-2">|</span>
          <span className="mx-2">|</span>
        </div>
      </div>
    </div>
  );
};

export default InventorySubTabs;
