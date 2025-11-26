import { useState } from 'react';
import InventoryMainTabs from '../ui/tabs/InventoryMainTabs';
import InventorySubTabs, { type SubTabType } from '../ui/tabs/InventorySubTabs';
import CategorySection from '@/features/inventory/components/layout/CategoryPanel';
import CommonItemsSection from '@/features/inventory/components/layout/CommonItemsSection';
import ExpiredRecordsSection from '@/features/inventory/components/layout/ExpiredRecordsSection';
import InventorySettingsSection from '@/features/inventory/components/layout/InventorySettingsSection';

const TabsSection = () => {
  const [mainTab, setMainTab] = useState<'overview' | 'settings'>('overview');
  const [subTab, setSubTab] = useState<SubTabType>('all');

  return (
    <section
      className={mainTab === 'settings' ? 'bg-neutral-100 min-h-screen' : ''}
    >
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
          {mainTab === 'settings' && <InventorySettingsSection />}
        </div>
      </div>
    </section>
  );
};

export default TabsSection;
