import React, { useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Search, ListFilter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

import FoodCard from '@/modules/inventory/components/ui/card/FoodCard';
import FoodDetailModal from '@/modules/inventory/components/ui/modal/FoodDetailModal';
import SearchModal from '@/modules/inventory/components/ui/modal/SearchModal';
import FilterModal from '@/modules/inventory/components/ui/modal/FilterModal';
import CategoryStatsBar from '@/modules/inventory/components/ui/other/CategoryStatsBar';
import { categories } from '@/modules/inventory/constants/categories';
import { useInventory, useInventoryFilter } from '@/modules/inventory/hooks';
import type {
  FoodItem,
  FoodCategory,
  InventoryStatus,
} from '@/modules/inventory/types';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams();
  const { items: allItems, isLoading, refetch } = useInventory();

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categoryId],
  );

  // Filter items by category first
  const categoryItems = useMemo(() => {
    if (!category) return [];
    // Extract category name from title (e.g., "蔬果類 (92)" -> "蔬果類")
    const categoryName = category.title.split(' ')[0] as FoodCategory;
    return allItems.filter((item) => item.category === categoryName);
  }, [allItems, category]);

  const {
    filteredItems: hookFilteredItems,
    setFilter,
    filters,
  } = useInventoryFilter(categoryItems);

  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync local state with hook filters
  const handleSearch = (query: string) => {
    setFilter('searchQuery', query);
  };

  const handleFilterApply = (statuses: string[], attributes: string[]) => {
    // Map UI status to hook status
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

  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
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

  if (!category) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-red-500">Category not found</h1>
        <Link to="/inventory">
          <Button variant="outline" className="mt-4">
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate total active filters count
  const statusCount =
    (Array.isArray(filters.status)
      ? filters.status.length
      : filters.status !== 'all'
        ? 1
        : 0) + (filters.attributes ? filters.attributes.length : 0);

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-45 bg-white overflow-y-auto pb-24" // z-45 to cover TopNav(z-40) but be under BottomNav(z-50). Increased pb to 24 for safety.
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-20">
        <Link to="/inventory">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 hover:bg-black/5"
          >
            <ChevronLeft className="h-6 w-6 text-neutral-900" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-neutral-900">
          {category.title.split(' ')[0]}
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Banner Section - Background Container (Full Width) */}
      {/* 🎨 調整背景圖片放大倍數: 修改下方的 backgroundSize 值 (例: 100%, 150%, 200%) */}
      <div className="relative w-full pt-4 overflow-hidden bg-neutral-300">
        {/* Background Image - Positioned behind Banner Card, scaled up */}
        <img
          src={category.img}
          alt=""
          className="absolute top-0 left-0 w-full h-48 object-cover object-center scale-250"
        />

        {/* Blur overlay with 70% white transparency */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

        {/* Inner Container with Padding - rounded and clipped */}
        <div className="relative px-4 max-w-layout-container mx-auto z-10 rounded-3xl overflow-hidden">
          {/* Banner Card */}
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

          {/* Content Section - Search & Items */}
          <div className="py-4 px-4 space-y-4 bg-white rounded-t-3xl -mx-4 mt-4">
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
                      ? 'bg-neutral-400 text-neutral-700 hover:bg-neutral-900'
                      : 'bg-transparent text-neutral-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsFilterOpen(true)}
                >
                  <ListFilter className="size-6" />
                </Button>
                {/* Filter Badge */}
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
                    onClick={() => setSelectedItem(item)}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-10 text-neutral-400">
                  沒有符合條件的項目
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <CategoryStatsBar
        totalCount={stats.total}
        expiringCount={stats.expiring}
        expiredCount={stats.expired}
        scrollContainerRef={scrollRef}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onItemUpdate={refetch}
        />
      )}

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
    </div>
  );
};

export default CategoryPage;
