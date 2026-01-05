import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import OverviewPanel from '@/modules/inventory/components/layout/OverviewPanel';
import CommonItemsPanel from '@/modules/inventory/components/layout/CommonItemsPanel';
import ExpiredRecordsPanel from '@/modules/inventory/components/layout/ExpiredRecordsPanel';
import SettingsPanel from '@/modules/inventory/components/layout/SettingsPanel';
import LayoutAppliedNotification from '@/modules/inventory/components/ui/notification/LayoutAppliedNotification';
import CategoryModal from '@/modules/inventory/components/ui/modal/CategoryModal';
import FoodDetailModal from '@/modules/inventory/components/ui/modal/FoodDetailModal';
import { Tabs, type Tab } from '@/shared/components/ui/animated-tabs';
import {
  selectLayoutAppliedNotification,
  hideLayoutAppliedNotification,
} from '@/modules/inventory/store/inventorySlice';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';
import { useInventory } from '@/modules/inventory/hooks';

type MainTabId = 'overview' | 'settings';
type SubTabId = 'all' | 'common' | 'expired';

const TabsSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mainTab = (searchParams.get('tab') as MainTabId) || 'overview';
  const [subTab, setSubTab] = useState<SubTabId>('all');

  // URL query params for modals
  const activeCategoryId = searchParams.get('category');
  const activeItemId = searchParams.get('item');

  const dispatch = useDispatch();
  const layoutNotification = useSelector(selectLayoutAppliedNotification);
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);

  // Fetch inventory items for FoodDetailModal
  const { items: allItems, refetch } = useInventory(
    activeRefrigeratorId || undefined,
  );
  const [selectedItem, setSelectedItem] = useState<(typeof allItems)[0] | null>(
    null,
  );

  // Update selectedItem when activeItemId changes
  useEffect(() => {
    if (activeItemId && allItems.length > 0) {
      const item = allItems.find((i) => i.id === activeItemId);
      if (item) {
        setSelectedItem(item);
      }
    } else {
      setSelectedItem(null);
    }
  }, [activeItemId, allItems]);

  const setMainTab = (id: MainTabId) => {
    setSearchParams({ tab: id });
  };

  const handleCloseNotification = () => {
    dispatch(hideLayoutAppliedNotification());
  };

  // 開啟分類 Modal
  const handleOpenCategory = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', categoryId);
    setSearchParams(params);
  };

  // 關閉分類 Modal
  const handleCloseCategory = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    params.delete('item'); // 同時關閉 item
    setSearchParams(params);
  };

  // 開啟食物詳情 Modal
  const handleOpenItem = (itemId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('item', itemId);
    setSearchParams(params);
  };

  // 關閉食物詳情 Modal
  const handleCloseItem = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('item');
    setSearchParams(params);
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
              {subTab === 'all' && (
                <OverviewPanel onOpenCategory={handleOpenCategory} />
              )}
              {subTab === 'common' && (
                <CommonItemsPanel onOpenItem={handleOpenItem} />
              )}
              {subTab === 'expired' && (
                <ExpiredRecordsPanel onOpenItem={handleOpenItem} />
              )}
            </>
          )}
          {mainTab === 'settings' && <SettingsPanel />}
        </div>
      </div>

      {/* Category Modal - controlled by URL query param */}
      <CategoryModal
        categoryId={activeCategoryId}
        isOpen={!!activeCategoryId}
        onClose={handleCloseCategory}
        onOpenItem={handleOpenItem}
      />

      {/* Food Detail Modal - controlled by URL query param */}
      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          isOpen={!!activeItemId}
          onClose={handleCloseItem}
          onItemUpdate={refetch}
          isCompleted={selectedItem.quantity <= 0}
        />
      )}
    </section>
  );
};

export default TabsSection;
