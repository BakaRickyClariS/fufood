import type { RecipeIngredient } from '@/modules/recipe/types';

type IngredientListProps = {
  ingredients: RecipeIngredient[];
};

export const IngredientList = ({ ingredients }: IngredientListProps) => {
  const prepIngredients = ingredients.filter((i) => i.category === '準備材料');
  const seasonings = ingredients.filter((i) => i.category === '調味料');

  const renderList = (title: string, items: RecipeIngredient[]) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-500 mb-3">{title}</h4>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
          >
            <span className="text-gray-900">{item.name}</span>
            <span className="text-gray-600 font-medium">{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-4">
      {prepIngredients.length > 0 && renderList('準備材料', prepIngredients)}
      {seasonings.length > 0 && renderList('調味料', seasonings)}
    </div>
  );
};
