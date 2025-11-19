import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { categories } from './categories';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

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
    <div className={`min-h-screen ${category.bgColor} p-4`}>
      <div className="mb-6">
        <Link to="/inventory">
          <Button variant="ghost" size="icon" className="hover:bg-black/5">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">{category.title}</h1>
        <img
          src={category.img}
          alt={category.title}
          className="w-32 h-32 object-contain"
        />
        <div className="w-full max-w-md bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <p className="text-center text-neutral-600">
            Items for {category.title} will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
