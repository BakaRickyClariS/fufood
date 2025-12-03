import { useState } from 'react';
import OverviewPanel from '@/modules/inventory/components/layout/OverviewPanel';
import CommonItemsPanel from '@/modules/inventory/components/layout/CommonItemsPanel';
import ExpiredRecordsPanel from '@/modules/inventory/components/layout/ExpiredRecordsPanel';
import SettingsPanel from '@/modules/inventory/components/layout/SettingsPanel';
import { Tabs } from '@/shared/components/ui/animated-tabs';

type SubTabType = 'all' | 'common' | 'expired';

const TabsSection = () => {
  const [mainTab, setMainTab] = useState<'overview' | 'settings'>('overview');
  const [subTab, setSubTab] = useState<SubTabType>('all');

  const mainTabs = [
    { id: 'overview', label: '庫存總覽' },
    { id: 'settings', label: '管理設定' },
  ];

  const subTabs = [
    { id: 'all', label: '總覽' },
    { id: 'common', label: '常用項目' },
    { id: 'expired', label: '過期紀錄' },
  ];

  return (
    <section
      className={mainTab === 'settings' ? 'bg-neutral-100 min-h-screen' : ''}
    >
      <div className="max-w-layout-container mx-auto">
        {/* 主 Tabs */}
        <Tabs 
          variant="underline"
          tabs={mainTabs}
          activeTab={mainTab}
          onTabChange={(id: string) => setMainTab(id as 'overview' | 'settings')}
          animated
        />
        <div className="mx-4">
          {mainTab === 'overview' && (
            <>
              <Tabs 
                variant="pill"
                tabs={subTabs}
                activeTab={subTab}
                onTabChange={(id: string) => setSubTab(id as SubTabType)}
                animated
                className="mt-8 mb-6"
              />
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
