import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, type Tab } from '@/shared/components/ui/animated-tabs';
import { useSharedLists } from '@/modules/planning/hooks/useSharedLists';
import { MonthTimelinePicker } from '@/modules/planning/components/ui/MonthTimelinePicker';

type MainTabId = 'planning' | 'recipes';
type SubTabId = 'in-progress' | 'pending-purchase' | 'completed';

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

  // 取得共享清單資料（不帶參數取得全部，用於統計計畫數量）
  const { lists } = useSharedLists();

  // 統計每個月份的計畫數量
  const planCountByMonth = useMemo(() => {
    const countMap = new Map<string, number>();

    lists.forEach((list) => {
      if (list.scheduledDate) {
        const date = new Date(list.scheduledDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${month}`;
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }
    });

    return countMap;
  }, [lists]);

  // 初始化為當前月份
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  // 從 URL 參數取得 tab 狀態
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
              {/* 月份選擇器 */}
              <div className="mb-4">
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
                className="mb-6"
              />
            </div>
          )}

          {/* 渲染子內容 */}
          {children(mainTab, subTab, selectedYear, selectedMonth)}
        </div>
      </div>
    </section>
  );
};

export default PlanningTabsSection;
