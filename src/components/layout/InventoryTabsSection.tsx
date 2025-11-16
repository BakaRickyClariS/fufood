import { useState } from 'react';
import InventoryMainTabs from '../ui/InventoryMainTabs';
import InventorySubTabs, { type SubTabType } from '../ui/InventorySubTabs';

const InventoryTabsSection = () => {
  const [mainTab, setMainTab] = useState<'overview' | 'settings'>('overview');
  const [subTab, setSubTab] = useState<SubTabType>('all');

  return (
    <section className="px-4 mt-4">
      <div className="max-w-[800px] mx-auto">
        {/* 主 Tabs */}
        <InventoryMainTabs active={mainTab} onChange={setMainTab} />

        {/* 只有庫存總覽才顯示子 tabs */}
        {mainTab === 'overview' && (
          <InventorySubTabs active={subTab} onChange={setSubTab} />
        )}
      </div>
    </section>
  );
};

export default InventoryTabsSection;
