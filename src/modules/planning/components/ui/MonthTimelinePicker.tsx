import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';

type MonthOption = {
  year: number;
  month: number;
  label: string;
  key: string;
};

type MonthTimelinePickerProps = {
  selectedYear: number;
  selectedMonth: number;
  onMonthChange: (year: number, month: number) => void;
  /** 月份計畫數量 Map，key 為 "年-月" 格式 */
  planCountByMonth?: Map<string, number>;
};

/**
 * 產生以當前月份為中心的月份選項
 * 過去 12 個月 + 當前月份 + 未來 12 個月
 */
const generateTimelineMonths = (): MonthOption[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const options: MonthOption[] = [];

  // 過去 12 個月
  for (let i = 12; i >= 1; i--) {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    options.push({
      year,
      month,
      label: `${month}月`,
      key: `${year}-${month}`,
    });
  }

  // 當前月份
  options.push({
    year: currentYear,
    month: currentMonth,
    label: `${currentMonth}月`,
    key: `${currentYear}-${currentMonth}`,
  });

  // 未來 12 個月
  for (let i = 1; i <= 12; i++) {
    const date = new Date(currentYear, currentMonth - 1 + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    options.push({
      year,
      month,
      label: `${month}月`,
      key: `${year}-${month}`,
    });
  }

  return options;
};

/** 根據年份分組月份選項 */
const groupByYear = (options: MonthOption[]): Map<number, MonthOption[]> => {
  const grouped = new Map<number, MonthOption[]>();
  options.forEach((opt) => {
    const existing = grouped.get(opt.year) || [];
    existing.push(opt);
    grouped.set(opt.year, existing);
  });
  return grouped;
};

/**
 * 時間軸式月份選擇器
 * 支援 GSAP 動畫、計畫數量標記
 */
export const MonthTimelinePicker = ({
  selectedYear,
  selectedMonth,
  onMonthChange,
  planCountByMonth = new Map(),
}: MonthTimelinePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedMonthRef = useRef<HTMLButtonElement>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const monthOptions = generateTimelineMonths();
  const groupedMonths = groupByYear(monthOptions);
  const sortedYears = Array.from(groupedMonths.keys()).sort((a, b) => a - b);

  // 立即滾動到選中的月份
  const scrollToSelectedMonth = useCallback(() => {
    if (selectedMonthRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedElement = selectedMonthRef.current;
      const containerHeight = container.clientHeight;
      const elementTop = selectedElement.offsetTop;
      const elementHeight = selectedElement.clientHeight;
      container.scrollTop =
        elementTop - containerHeight / 2 + elementHeight / 2;
    }
  }, []);

  // GSAP 開啟動畫
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const dropdown = scrollContainerRef.current;
      scrollToSelectedMonth();
      gsap.fromTo(
        dropdown,
        { opacity: 0, y: -10, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' },
      );
    }
  }, [isOpen, scrollToSelectedMonth]);

  // 關閉動畫
  const closeDropdown = useCallback(() => {
    if (scrollContainerRef.current) {
      gsap.to(scrollContainerRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.98,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  }, []);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closeDropdown]);

  const handleMonthSelect = (year: number, month: number) => {
    onMonthChange(year, month);
    closeDropdown();
  };

  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 觸發按鈕 */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-neutral-200 hover:border-neutral-300 transition-colors"
      >
        <span className="text-lg font-medium text-neutral-800">
          {selectedMonth}月
        </span>
        <ChevronDown
          className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <div
          ref={scrollContainerRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden max-h-80 overflow-y-auto"
          style={{ opacity: 0 }}
        >
          {sortedYears.map((year) => {
            const months = groupedMonths.get(year) || [];
            const sortedMonths = [...months].sort((a, b) => a.month - b.month);

            return (
              <div key={year}>
                {/* 年份標題 */}
                <div className="px-4 py-2 bg-neutral-50 text-sm font-semibold text-neutral-500 sticky top-0 z-10 border-b border-neutral-100">
                  {year}年
                </div>

                {/* 月份列表 */}
                <div className="py-1">
                  {sortedMonths.map((opt) => {
                    const isSelected =
                      selectedYear === opt.year && selectedMonth === opt.month;
                    const isCurrent =
                      currentYear === opt.year && currentMonth === opt.month;
                    const planCount = planCountByMonth.get(opt.key) || 0;

                    return (
                      <button
                        key={opt.key}
                        ref={isSelected ? selectedMonthRef : null}
                        type="button"
                        onClick={() => handleMonthSelect(opt.year, opt.month)}
                        className={`w-full px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-4 transition-all ${
                          isSelected ? 'bg-red-50' : 'hover:bg-neutral-50'
                        }`}
                      >
                        {/* 左側：月份名稱和本月標籤 */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-base font-medium ${
                              isSelected ? 'text-red-500' : 'text-neutral-800'
                            }`}
                          >
                            {opt.label}
                          </span>
                          {isCurrent && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-400 text-white">
                              本月
                            </span>
                          )}
                        </div>
                        {/* 右側：計畫數量和選中指示器（固定寬度確保對齊） */}
                        <div className="flex items-center justify-end gap-2">
                          {planCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                              {planCount}
                            </span>
                          )}
                          {/* 選中指示器 - 始終佔用固定寬度 */}
                          <div className="w-2 flex justify-center">
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
