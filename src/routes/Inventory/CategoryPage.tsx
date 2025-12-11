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
import type { FoodItem, FoodCategory, InventoryStatus } from '@/modules/inventory/types';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams();
  const { items: allItems, isLoading } = useInventory();

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

  const handleFilterApply = (
    statuses: string[],
    attributes: string[],
  ) => {
    // Map UI status to hook status
    if (statuses.length > 0) {
      const mappedStatuses: InventoryStatus[] = [];
      
      statuses.forEach(status => {
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
    
    categoryItems.forEach(item => {
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
      expiring
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
    (Array.isArray(filters.status) ? filters.status.length : (filters.status !== 'all' ? 1 : 0)) +
    (filters.attributes ? filters.attributes.length : 0);

  // ... other code ...
  // In JSX:
  /*
    className={`h-12 w-12 rounded-full transition-colors ${
      statusCount > 0 
        ? 'bg-neutral-800 text-white hover:bg-neutral-900' // Neutral active color
        : 'bg-transparent text-neutral-900 hover:bg-gray-100'
    }`}
  */
  // It seems attributes are NOT in FilterOptions yet?
  // I need to check FilterModal onApply. It passes (status, attribute).
  // CategoryPage handleFilterApply takes (statuses, attributes).
  // But setFilter only sets 'status'.
  // I need to add 'attribute' to FilterOptions and setFilter logic.
  
  // Let's do a safe partial fix here first for Layout and Status count.
  // I'll proceed with layout fix.

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

      <div className="px-4 mt-2 space-y-4 max-w-layout-container mx-auto">
        {/* Banner Section */}
        <div className={`relative w-full rounded-3xl overflow-hidden ${category.bgColor} p-6 h-40`}>
          <div className="flex justify-between items-start h-full">
            <div className="flex flex-col justify-center h-full z-10 max-w-[60%]">
              <h2 className="text-lg font-bold text-neutral-900 mb-2">
                {category.slogan}
              </h2>
              <div className="text-sm text-neutral-600 space-y-1 border-l-2 border-neutral-400 pl-3">
                {category.description.map((desc, index) => (
                  <p key={index}>{desc}</p>
                ))}
              </div>
            </div>
            
            <img 
              src={category.img} 
              alt={category.title} 
              className="absolute right-0 bottom-0 h-[140%] object-contain translate-y-2 translate-x-2"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-row w-full cursor-pointer items-center gap-3">
          <div
            className={`flex-1 border-none h-12 rounded-xl flex items-center px-4 text-sm transition-colors ${
              filters.searchQuery ? 'bg-orange-50 text-neutral-900' : 'bg-gray-100 text-neutral-500 hover:bg-gray-200'
            }`}
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className={`h-5 w-5 mr-3 ${filters.searchQuery ? 'text-[#EE5D50]' : 'text-neutral-900'}`} />
            <p>{filters.searchQuery || '搜尋'}</p>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full transition-colors ${
                statusCount > 0 ? 'bg-neutral-800 text-white hover:bg-neutral-900' : 'bg-transparent text-neutral-900 hover:bg-gray-100'
              }`}
              onClick={() => setIsFilterOpen(true)}
            >
              <ListFilter className="h-6 w-6" />
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
