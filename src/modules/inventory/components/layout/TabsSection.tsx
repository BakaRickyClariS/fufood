import { useState } from 'react';
import OverviewPanel from '@/modules/inventory/components/layout/OverviewPanel';
import CommonItemsPanel from '@/modules/inventory/components/layout/CommonItemsPanel';
import ExpiredRecordsPanel from '@/modules/inventory/components/layout/ExpiredRecordsPanel';
import SettingsPanel from '@/modules/inventory/components/layout/SettingsPanel';
import InventorySubTabs, { type SubTabType } from '../ui/tabs/InventorySubTabs';
import InventoryMainTabs from '../ui/tabs/InventoryMainTabs';

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
