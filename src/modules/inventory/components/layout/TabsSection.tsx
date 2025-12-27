import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import OverviewPanel from '@/modules/inventory/components/layout/OverviewPanel';
import CommonItemsPanel from '@/modules/inventory/components/layout/CommonItemsPanel';
import ExpiredRecordsPanel from '@/modules/inventory/components/layout/ExpiredRecordsPanel';
import SettingsPanel from '@/modules/inventory/components/layout/SettingsPanel';
import LayoutAppliedNotification from '@/modules/inventory/components/ui/notification/LayoutAppliedNotification';
import { Tabs, type Tab } from '@/shared/components/ui/animated-tabs';
import {
  selectLayoutAppliedNotification,
  hideLayoutAppliedNotification,
} from '@/modules/inventory/store/inventorySlice';

type MainTabId = 'overview' | 'settings';
type SubTabId = 'all' | 'common' | 'expired';

const TabsSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mainTab = (searchParams.get('tab') as MainTabId) || 'overview';
  const [subTab, setSubTab] = useState<SubTabId>('all');

  const dispatch = useDispatch();
  const layoutNotification = useSelector(selectLayoutAppliedNotification);

  const setMainTab = (id: MainTabId) => {
    setSearchParams({ tab: id });
  };

  const handleCloseNotification = () => {
    dispatch(hideLayoutAppliedNotification());
  };

  const mainTabs: Tab<MainTabId>[] = [
    { id: 'overview', label: '庫存總覽' },
    { id: 'settings', label: '管理設定' },
  ];

  const subTabs: Tab<SubTabId>[] = [
    { id: 'all', label: '總覽' },
    { id: 'common', label: '常用項目' },
    { id: 'expired', label: '過期紀錄' },
  ];

  return (
    <section className="bg-[#F0F0F0] min-h-screen">
      <div className="max-w-layout-container mx-auto">
        {/* 主 Tabs */}
        <Tabs
          variant="underline"
          tabs={mainTabs}
          activeTab={mainTab}
          onTabChange={setMainTab}
          animated
        />
        <div className="mx-4">
          {/* 版型套用成功通知 */}
          {layoutNotification.show && (
            <LayoutAppliedNotification
              autoHide={mainTab === 'overview'}
              duration={60000}
              onClose={handleCloseNotification}
            />
          )}

          {mainTab === 'overview' && (
            <>
              <Tabs
                variant="pill"
                tabs={subTabs}
                activeTab={subTab}
                onTabChange={setSubTab}
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
