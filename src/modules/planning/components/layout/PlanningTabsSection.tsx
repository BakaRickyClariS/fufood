import { useSearchParams } from 'react-router-dom';
import { Tabs, type Tab } from '@/shared/components/ui/animated-tabs';

type MainTabId = 'planning' | 'recipes';
type SubTabId = 'in-progress' | 'pending-purchase' | 'completed';

type PlanningTabsSectionProps = {
  children: (mainTab: MainTabId, subTab: SubTabId) => React.ReactNode;
};

const PlanningTabsSection = ({ children }: PlanningTabsSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 從 URL 參數取得 tab 狀態，預設為 'planning'
  const mainTab = (searchParams.get('tab') as MainTabId) || 'planning';
  const subTab = (searchParams.get('status') as SubTabId) || 'in-progress';

  const setMainTab = (tab: MainTabId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    // 切換主 Tab 時清除 status 參數
    if (tab === 'recipes') {
      newParams.delete('status');
    }
    setSearchParams(newParams, { replace: true });
  };

  const setSubTab = (status: SubTabId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('status', status);
    setSearchParams(newParams, { replace: true });
  };

  const mainTabs: Tab<MainTabId>[] = [
    { id: 'planning', label: '共享規劃' },
    { id: 'recipes', label: '食譜推薦' },
  ];

  const subTabs: Tab<SubTabId>[] = [
    { id: 'in-progress', label: '進行中' },
    { id: 'pending-purchase', label: '待採買' },
    { id: 'completed', label: '已完成' },
  ];

  return (
    <section>
      <div className="max-w-layout-container mx-auto">
        {/* 主 Tabs */}
        <Tabs 
          variant="underline"
          tabs={mainTabs}
          activeTab={mainTab}
          onTabChange={setMainTab}
          animated
        />
        <div className="mx-4 mt-4">
          {mainTab === 'planning' && (
            <div className="mb-4">
               {/* 只有在 planning 頁籤才顯示副標題切換 */}
              {/* 月份選擇器 (Mock) */}
              <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-3 shadow-sm border border-neutral-100">
                <span className="text-lg font-medium">1月</span>
                <span className="text-neutral-400">▼</span>
              </div>

              <Tabs 
                variant="pill"
                tabs={subTabs}
                activeTab={subTab}
                onTabChange={setSubTab}
                animated
                className="mb-6"
              />
            </div>
          )}
          
          {/* 渲染子內容 */}
          {children(mainTab, subTab)}
        </div>
      </div>
    </section>
  );
};

export default PlanningTabsSection;
