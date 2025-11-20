import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { categories } from '../../data/categories';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Search } from 'lucide-react';
import HeroCard from '@/components/layout/HeroCard';
import CategoryBanner from '@/components/layout/inventory/CategoryBanner';
import { Input } from '@/components/ui/input';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categories.find((c) => c.id === categoryId);

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="搜尋"
            className="pl-9 bg-white border-none shadow-sm h-11 rounded-xl"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          >
            <span className="sr-only">Filter</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 3H14M4.66667 8H11.3333M7.33333 13H8.66667"
                stroke="#171717"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>

        {/* Item List Placeholder */}
        <div className="grid grid-cols-2 gap-3">
          {/* Mock Items */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 shadow-sm aspect-[3/4] flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                大陸A菜
              </div>
              <div className="flex-1 bg-neutral-100 rounded-xl mb-2"></div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-neutral-500">剩餘</p>
                  <p className="text-lg font-bold text-neutral-900">6</p>
                </div>
                <div className="text-[10px] text-neutral-400 text-right">
                  <p>請購 2026/01/01</p>
                  <p>過期 2026/01/14</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
