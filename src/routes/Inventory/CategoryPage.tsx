import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Search, ListFilter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

import FoodCard from '@/modules/inventory/components/ui/card/FoodCard';
import FoodDetailModal from '@/modules/inventory/components/ui/modal/FoodDetailModal';
import SearchModal from '@/modules/inventory/components/ui/modal/SearchModal';
import FilterModal from '@/modules/inventory/components/ui/modal/FilterModal';
import { categories } from '@/modules/inventory/constants/categories';
import { useInventory, useInventoryFilter } from '@/modules/inventory/hooks';
import type { FoodItem, FoodCategory } from '@/modules/inventory/types';

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
    return allItems.filter(item => item.category === categoryName);
  }, [allItems, category]);

  const { filteredItems: hookFilteredItems, setFilter, filters } = useInventoryFilter(categoryItems);

  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync local state with hook filters
  const handleSearch = (query: string) => {
    setFilter('searchQuery', query);
  };

  const handleFilterApply = (
    status: string | null,
    _attribute: string | null,
  ) => {
    // Map UI status to hook status
    if (status) {
      switch (status) {
        case '已過期':
          setFilter('status', 'expired');
          break;
        case '即將到期':
          setFilter('status', 'expiring-soon');
          break;
        case '低庫存':
          setFilter('status', 'low-stock');
          break;
        case '有庫存':
          setFilter('status', 'normal');
          break;
        default:
          setFilter('status', 'all');
      }
    } else {
      setFilter('status', 'all');
    }
    
    // Attribute filter is not used in hook for now, or could map to category if needed
    // But we are already in a category page, so attribute filter might be redundant or for sub-categories
  };

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
        {/* Search Bar */}
        <div className="flex flex-row w-full cursor-pointer items-center">
          <div
            className="pl-2 bg-white border-none w-full shadow-sm py-1 rounded-xl flex items-center text-neutral-400 text-sm"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className=" h-4 w-4 text-neutral-900" />
            <p className="ml-3">{filters.searchQuery || '搜尋'}</p>
          </div>
          <ListFilter
            className={`h-6 w-6 ml-3 cursor-pointer transition-colors ${
              filters.status !== 'all'
                ? 'text-[#EE5D50]'
                : 'text-neutral-900 hover:text-neutral-600'
            }`}
            onClick={() => setIsFilterOpen(true)}
          />
        </div>

        {/* Item List */}
        <div className="grid grid-cols-2 gap-3">
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
