import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, Search, ListFilter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

import FoodCard from '@/modules/inventory/components/ui/card/FoodCard';
import SearchModal from '@/modules/inventory/components/ui/modal/SearchModal';
import FilterModal from '@/modules/inventory/components/ui/modal/FilterModal';
import CategoryStatsBar from '@/modules/inventory/components/ui/other/CategoryStatsBar';
import { categories } from '@/modules/inventory/constants/categories';
import { useInventory, useInventoryFilter } from '@/modules/inventory/hooks';
import {
  selectAllGroups,
  fetchGroups,
} from '@/modules/groups/store/groupsSlice';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';
import { getRefrigeratorId } from '@/modules/inventory/utils/getRefrigeratorId';
import {
  SlideModalLayout,
  type SlideModalLayoutRef,
} from '@/shared/components/layout/SlideModalLayout';
import type { InventoryStatus } from '@/modules/inventory/types';

type CategoryModalProps = {
  categoryId: string | null;
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
  /** 開啟食物詳情 Modal 的回呼 */
  onOpenItem?: (itemId: string) => void;
};

/**
 * 分類詳細頁 Modal
 * 使用 SlideModalLayout 實現滑入/滑出動畫
 */
const CategoryModal: React.FC<CategoryModalProps> = ({
  categoryId,
  isOpen,
  onClose,
  groupId: urlGroupId,
  onOpenItem,
}) => {
  const dispatch = useDispatch();
  const layoutRef = useRef<SlideModalLayoutRef>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 取得 groups 並計算 refrigeratorId
  const groups = useSelector(selectAllGroups);
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);
  const refrigeratorId =
    activeRefrigeratorId || getRefrigeratorId(urlGroupId, groups);

  // 確保 groups 載入
  useEffect(() => {
    if (groups.length === 0) {
      // @ts-ignore
      dispatch(fetchGroups());
    }
  }, [dispatch, groups.length]);

  const { items: allItems, isLoading } = useInventory(
    refrigeratorId || undefined,
  );

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categoryId],
  );

  // Filter items by category first
  const categoryItems = useMemo(() => {
    if (!category) return [];
    return allItems.filter((item) => item.category === categoryId);
  }, [allItems, category, categoryId]);

  const {
    filteredItems: hookFilteredItems,
    setFilter,
    filters,
  } = useInventoryFilter(categoryItems);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (query: string) => {
    setFilter('searchQuery', query);
  };

  const handleFilterApply = (statuses: string[], attributes: string[]) => {
    if (statuses.length > 0) {
      const mappedStatuses: InventoryStatus[] = [];

      statuses.forEach((status) => {
        switch (status) {
          case '已過期':
            mappedStatuses.push('expired');
            break;
          case '即將到期':
            mappedStatuses.push('expiring-soon');
            break;
          case '低庫存':
            mappedStatuses.push('low-stock');
            break;
          case '有庫存':
            mappedStatuses.push('normal');
            break;
        }
      });

      setFilter('status', mappedStatuses);
    } else {
      setFilter('status', 'all');
    }

    setFilter('attributes', attributes);
    setIsFilterOpen(false);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    let expired = 0;
    let expiring = 0;

    categoryItems.forEach((item) => {
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);

      if (expiry < today) {
        expired++;
      } else if (expiry >= today && expiry <= threeDaysLater) {
        expiring++;
      }
    });

    return {
      total: categoryItems.length,
      expired,
      expiring,
    };
  }, [categoryItems]);

  // Calculate total active filters count
  const statusCount =
    (Array.isArray(filters.status)
      ? filters.status.length
      : filters.status !== 'all'
        ? 1
        : 0) + (filters.attributes ? filters.attributes.length : 0);

  if (!categoryId) return null;

  // 自訂 Header
  const customHeader = category ? (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2 hover:bg-black/5"
          onClick={() => layoutRef.current?.close()}
        >
          <ChevronLeft className="h-6 w-6 text-neutral-900" />
        </Button>
        <h1 className="text-lg font-bold text-neutral-900">
          {category.title.split(' ')[0]}
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Banner Section */}
      <div className="relative w-full pt-4 overflow-hidden bg-neutral-300">
        <img
          src={category.img}
          alt=""
          className="absolute top-0 left-0 w-full h-48 object-cover object-center scale-250"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

        <div className="relative px-4 max-w-layout-container mx-auto z-10 rounded-3xl overflow-hidden">
          <div
            className={`relative w-full h-40 rounded-3xl overflow-hidden bg-white/60 p-6`}
          >
            <div className="flex justify-between items-start h-full">
              <div className="flex flex-col justify-center h-full max-w-[80%] z-5">
                <h2 className="text-base font-bold text-neutral-900 mb-2">
                  {category.slogan}
                </h2>
                <div className="text-xs text-neutral-600 space-y-1 border-l-2 border-neutral-600 pl-3">
                  {category.description.map((desc, index) => (
                    <p key={index}>{desc}</p>
                  ))}
                </div>
              </div>

              <img
                src={category.img}
                alt={category.title}
                className="absolute -right-30 -bottom-30 h-[200%] object-contain translate-y-2 translate-x-2"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <SlideModalLayout
        ref={layoutRef}
        isOpen={isOpen}
        onClose={onClose}
        showHeader={false}
        customHeader={customHeader}
        bgClassName="bg-white"
        className="pb-24"
      >
        {/* Content Section - Search & Items */}
        <div ref={scrollRef} className="py-4 px-4 space-y-4 bg-white -mt-4">
          {/* Search Bar */}
          <div className="flex flex-row w-full cursor-pointer items-center gap-2">
            <div
              className={`flex-1 border-2 rounded-full bg-neutral-100 border-neutral-200 flex items-center px-4 py-2 text-sm transition-colors ${
                filters.searchQuery
                  ? 'text-neutral-900'
                  : 'text-neutral-500 hover:bg-gray-200'
              }`}
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className={`size-6 mr-3 text-neutral-900`} />
              <p>{filters.searchQuery || '搜尋'}</p>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={`h-12 w-12 rounded-full transition-colors ${
                  statusCount > 0
                    ? 'bg-neutral-400 text-neutral-700 hover:text-neutral-100 hover:bg-neutral-600'
                    : 'bg-transparent text-neutral-900 hover:bg-gray-100'
                }`}
                onClick={() => setIsFilterOpen(true)}
              >
                <ListFilter className="size-6" />
              </Button>
              {statusCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-[#EE5D50] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {statusCount}
                </div>
              )}
            </div>
          </div>

          {/* Item List */}
          <div className="grid grid-cols-2 gap-3 pb-24">
            {isLoading ? (
              <div className="col-span-2 text-center py-10 text-neutral-400">
                載入中...
              </div>
            ) : hookFilteredItems.length > 0 ? (
              hookFilteredItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onClick={() => {
                    if (onOpenItem) {
                      onOpenItem(item.id);
                    }
                  }}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-10 text-neutral-400">
                沒有符合條件的項目
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <CategoryStatsBar
          totalCount={stats.total}
          expiringCount={stats.expiring}
          expiredCount={stats.expired}
          scrollContainerRef={scrollRef}
        />
      </SlideModalLayout>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
      />
    </>
  );
};

export default CategoryModal;
