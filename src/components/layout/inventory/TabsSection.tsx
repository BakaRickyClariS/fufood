import { useState } from 'react';
import InventoryMainTabs from '../../ui/InventoryMainTabs';
import InventorySubTabs, { type SubTabType } from '../../ui/InventorySubTabs';
import CategorySection from '@/components/layout/inventory/CategorySection';
import CommonItemsSection from '@/components/layout/inventory/CommonItemsSection';
import ExpiredRecordsSection from '@/components/layout/inventory/ExpiredRecordsSection';

const TabsSection = () => {
  const [mainTab, setMainTab] = useState<'overview' | 'settings'>('overview');
  const [subTab, setSubTab] = useState<SubTabType>('all');

  return (
    <section>
      <div className="max-w-[800px] mx-auto">
        {/* 主 Tabs */}
        <InventoryMainTabs active={mainTab} onChange={setMainTab} />
        <div className="mx-4">
          {mainTab === 'overview' && (
            <>
              <InventorySubTabs active={subTab} onChange={setSubTab} />
              {subTab === 'all' && <CategorySection />}
              {subTab === 'common' && <CommonItemsSection />}
              {subTab === 'expired' && <ExpiredRecordsSection />}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TabsSection;
