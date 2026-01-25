import type { RecipeIngredient } from '@/modules/recipe/types';

type IngredientListProps = {
  ingredients: RecipeIngredient[];
};

export const IngredientList = ({ ingredients }: IngredientListProps) => {
  const prepIngredients = ingredients.filter((i) => i.category === '準備材料');
  const seasonings = ingredients.filter((i) => i.category === '調味料');

  const renderList = (title: string, items: RecipeIngredient[]) => (
    <div className="mb-6 bg-gray-100/80 rounded-2xl p-4">
      <h4 className="flex items-center text-lg font-bold text-gray-700 mb-4 pl-3 border-l-4 border-primary-500">
        {title}
      </h4>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
          >
            <span className="text-gray-900">{item.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-900 font-medium">{item.quantity}</span>
              {item.unit && (
                <span className="text-gray-500 text-sm">{item.unit}</span>
              )}
            </div>
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
