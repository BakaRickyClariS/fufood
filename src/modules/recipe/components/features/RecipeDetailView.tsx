import { useNavigate, useParams } from 'react-router-dom';
import { useRecipeQuery } from '@/modules/recipe/api/queries';
import { RecipeDetailContent } from '@/modules/recipe/components/ui/RecipeDetailContent';
import { RecipeHeader } from '@/modules/recipe/components/layout/RecipeHeader';
import { useRecipeDetailLogic } from '@/modules/recipe/hooks/useRecipeDetailLogic';

export const RecipeDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. 先獲取基本查詢資料（快取優先）
  const { data: apiResponse, isLoading: isQueryLoading } = useRecipeQuery(id || '');
  const recipe = apiResponse?.data;

  // 2. 使用詳細頁邏輯 Hook（處理步驟、食材、消耗邏輯）
  const {
    recipe: fullRecipe,
    isLoading: isLogicLoading,
    consumptionItems,
    showConsumptionModal,
    setShowConsumptionModal,
    setRecipe,
    handleConfirmConsumption,
  } = useRecipeDetailLogic({
    recipeId: id,
    onClose: () => navigate(-1),
  });

  const isLoading = isQueryLoading || isLogicLoading;

  // 顯示用的食譜資料：優先使用 logic hook 的 fullRecipe，沒有的話使用 query 的 recipe
  // 如果兩個都沒有且正在載入，則顯示 null (或 skeleton)
  const displayRecipe = fullRecipe || recipe;

  if (!displayRecipe && !isLoading) {
    return <div className="p-4 text-center">找不到食譜</div>;
  }

  // 載入中骨架屏或處理 (RecipeDetailContent 內部有處理 isLoading)
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <RecipeHeader onBack={() => navigate(-1)} />
      
      <div className="flex-1 overflow-y-auto">
        {displayRecipe ? (
          <RecipeDetailContent
            recipe={displayRecipe}
            consumptionItems={consumptionItems}
            showConsumptionModal={showConsumptionModal}
            onShowConsumptionModal={setShowConsumptionModal}
            onRecipeUpdate={setRecipe}
            showShoppingListButton={true}
            onAddToShoppingList={() => {
              console.log('加入採買清單:', consumptionItems);
            }}
            onConfirmConsumption={handleConfirmConsumption}
            isLoading={isLoading && !fullRecipe}
          />
        ) : (
          <div className="p-10 text-center text-gray-500">載入中...</div>
        )}
      </div>
    </div>
  );
};
