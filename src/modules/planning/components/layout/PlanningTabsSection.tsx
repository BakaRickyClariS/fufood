import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, type Tab } from '@/shared/components/ui/animated-tabs';
import { useSharedListsContext } from '@/modules/planning/contexts/SharedListsContext';
import { MonthTimelinePicker } from '@/modules/planning/components/ui/MonthTimelinePicker';

type MainTabId = 'planning' | 'recipes';
type SubTabId = 'in-progress' | 'completed';

type PlanningTabsSectionProps = {
  children: (
    mainTab: MainTabId,
    subTab: SubTabId,
    year: number,
    month: number,
  ) => React.ReactNode;
};

const PlanningTabsSection = ({ children }: PlanningTabsSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 從 Layout 層級的 Context 取得共享清單資料
  const sharedLists = useSharedListsContext();

  // 計算每月的清單數量供時間軸使用
  const planCountByMonth = useMemo(() => {
    const countMap = new Map<string, number>();

    sharedLists.lists.forEach((list) => {
      if (list.startsAt) {
        const date = new Date(list.startsAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${month}`;
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }
    });

    return countMap;
  }, [sharedLists.lists]);

  // 預設為當前年月
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  // 從 URL 取得 tab 與狀態
  const mainTab = (searchParams.get('tab') as MainTabId) || 'planning';
  const subTab = (searchParams.get('status') as SubTabId) || 'in-progress';

  const setMainTab = (tab: MainTabId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
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

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const mainTabs: Tab<MainTabId>[] = [
    { id: 'planning', label: '採買規劃' },
    { id: 'recipes', label: '食譜靈感' },
  ];

  const subTabs: Tab<SubTabId>[] = [
    { id: 'in-progress', label: '進行中' },
    { id: 'completed', label: '已完成' },
  ];

  return (
    <section>
      <div className="max-w-layout-container mx-auto">
        {/* 主 Tabs */}
        {/* 主 Tabs */}
        <Tabs
          variant="underline"
          tabs={mainTabs}
          activeTab={mainTab}
          onTabChange={setMainTab}
          animated
          className={mainTab === 'planning' ? 'shadow-none' : ''}
        />
        <div>
          {mainTab === 'planning' && (
            <div className="bg-white pb-4 mb-4 rounded-b-xl">
              {/* 月份時間軸 */}
              <div className="p-4">
                <MonthTimelinePicker
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  onMonthChange={handleMonthChange}
                  planCountByMonth={planCountByMonth}
                />
              </div>

              <Tabs
                variant="pill"
                tabs={subTabs}
                activeTab={subTab}
                onTabChange={setSubTab}
                animated
                className="mx-4"
              />
            </div>
          )}

          {/* 子內容渲染 */}
          <div>{children(mainTab, subTab, selectedYear, selectedMonth)}</div>
        </div>
      </div>
    </section>
  );
};

export default PlanningTabsSection;
