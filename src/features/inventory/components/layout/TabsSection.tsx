import { useState } from 'react';
import InventoryMainTabs from '../ui/tabs/InventoryMainTabs';
import InventorySubTabs, { type SubTabType } from '../ui/tabs/InventorySubTabs';
import OverviewPanel from '@/features/inventory/components/layout/OverviewPanel';
import CommonItemsPanel from '@/features/inventory/components/layout/CommonItemsPanel';
import ExpiredRecordsPanel from '@/features/inventory/components/layout/ExpiredRecordsPanel';
import SettingsPanel from '@/features/inventory/components/layout/SettingsPanel';

const TabsSection = () => {
  const [mainTab, setMainTab] = useState<'overview' | 'settings'>('overview');
  const [subTab, setSubTab] = useState<SubTabType>('all');

  return (
    <section
      className={mainTab === 'settings' ? 'bg-neutral-100 min-h-screen' : ''}
    >
      <div className="max-w-layout-container mx-auto">
        {/* 主 Tabs */}
        <InventoryMainTabs active={mainTab} onChange={setMainTab} />
        <div className="mx-4">
          {mainTab === 'overview' && (
            <>
              <InventorySubTabs active={subTab} onChange={setSubTab} />
              {subTab === 'all' && <OverviewPanel />}
              {subTab === 'common' && <CommonItemsPanel />}
              {subTab === 'expired' && <ExpiredRecordsPanel />}
            </>
          )}
          {mainTab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </section>
  );
};

export default TabsSection;
