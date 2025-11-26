import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Search, ListFilter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import HeroCard from '@/shared/components/layout/HeroCard';
import CategoryBanner from '@/features/inventory/components/CategoryBanner';
import FoodCard from '@/features/inventory/components/FoodCard';
import FoodDetailModal from '@/features/inventory/components/FoodDetailModal';
import SearchModal from '@/shared/components/common/SearchModal';
import FilterModal from '@/shared/components/common/FilterModal';
import { categories } from '@/features/inventory/constants/categories';
import { foodData, type FoodItem } from '@/features/inventory/constants/foodImages';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const category = categories.find((c) => c.id === categoryId);
  const items = category ? foodData[category.id] || [] : [];

  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterAttribute, setFilterAttribute] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Filter
      if (searchQuery && !item.name.includes(searchQuery)) {
        return false;
      }

      // 2. Attribute Filter (Category)
      if (filterAttribute && item.category !== filterAttribute) {
        return false;
      }

      // 3. Status Filter
      if (filterStatus) {
        const today = new Date();
        const expireDate = new Date(item.expireAt);
        const diffTime = expireDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filterStatus) {
          case '已過期':
            return diffDays < 0;
          case '即將到期':
            return diffDays >= 0 && diffDays <= 3;
          case '低庫存':
            return item.quantity <= 2;
          case '有庫存':
            return item.quantity > 0;
          default:
            return true;
        }
      }

      return true;
    });
  }, [items, searchQuery, filterAttribute, filterStatus]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterApply = (status: string | null, attribute: string | null) => {
    setFilterStatus(status);
    setFilterAttribute(attribute);
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

      {/* Hero Section */}
      <HeroCard>
        <CategoryBanner category={category} />
      </HeroCard>

      <div className="px-4 mt-2 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-row w-full cursor-pointer items-center">
          <div
            className="pl-2 bg-white border-none w-full shadow-sm py-1 rounded-xl flex items-center text-neutral-400 text-sm"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className=" h-4 w-4 text-neutral-900" />
            <p className="ml-3">{searchQuery || '搜尋'}</p>
          </div>
          <ListFilter
            className={`h-6 w-6 ml-3 cursor-pointer transition-colors ${
              filterStatus || filterAttribute ? 'text-[#EE5D50]' : 'text-neutral-900 hover:text-neutral-600'
            }`}
            onClick={() => setIsFilterOpen(true)}
          />
        </div>

        {/* Item List */}
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
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
