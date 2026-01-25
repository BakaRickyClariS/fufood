import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { RecipeListItem, Recipe } from '@/modules/recipe/types';
import { RecipeDetailContent } from '@/modules/recipe/components/ui/RecipeDetailContent';
import { RecipeHeader } from '@/modules/recipe/components/layout/RecipeHeader';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';

import { useRecipeDetailLogic } from '@/modules/recipe/hooks/useRecipeDetailLogic';

type RecipeDetailModalProps = {
  recipe: RecipeListItem | null;
  isOpen: boolean;
  onClose: () => void;
};

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe: recipeListItem,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);

  // 判斷傳入的 recipe 是否包含完整資訊 (由 State 傳遞而來)
  // 這樣可以避免對剛生成的食譜 (尚未存入 DB) 進行 API 查詢
  const isFullRecipe = (r: any): r is Recipe => {
    return r && Array.isArray(r.ingredients) && Array.isArray(r.steps);
  };

  const initialRecipe = isFullRecipe(recipeListItem)
    ? (recipeListItem as Recipe)
    : null;

  // 使用共用邏輯
  const {
    recipe: fullRecipe,
    isLoading,
    consumptionItems,
    showConsumptionModal,
    setShowConsumptionModal,
    setRecipe,
    handleConfirmConsumption,
  } = useRecipeDetailLogic({
    recipeId: isOpen ? recipeListItem?.id : undefined,
    initialRecipe, // 傳入初始食譜，若存在則不會觸發 API 載入
    onClose,
  });

  // GSAP 進場動畫
  useGSAP(
    () => {
      if (isOpen) {
        gsap.fromTo(
          modalRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: 'power3.out' },
        );
      }
    },
    { scope: modalRef, dependencies: [isOpen] },
  );

  const { contextSafe } = useGSAP({ scope: modalRef });

  const handleClose = contextSafe(() => {
    gsap.to(modalRef.current, {
      x: '100%',
      duration: 0.3,
      ease: 'power3.in',
      onComplete: onClose,
    });
  });

  const hideParent = contextSafe(() => {
    gsap.to(modalRef.current, {
      x: '100%',
      duration: 0.3,
      ease: 'power3.in',
      onComplete: () => setIsHidden(true),
    });
  });

  const showParent = contextSafe(() => {
    setIsHidden(false);
    // Use setTimeout to ensure DOM is rendered before animating
    setTimeout(() => {
      gsap.fromTo(
        modalRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' },
      );
    }, 10);
  });

  if (!isOpen || (!recipeListItem && !fullRecipe)) return null;

  // 建構顯示用的食譜物件 (優先使用完整食譜，若無則使用列表項目資料建立暫時物件)
  const displayRecipe: Recipe | null =
    fullRecipe ||
    (recipeListItem
      ? ({
          ...recipeListItem,
          // 補足 Recipe 介面缺少的屬性
          ingredients: [],
          steps: [],
          difficulty: '簡單', // 預設值
          createdAt: new Date().toISOString(),
          series: undefined, // 避免 undefined 錯誤
        } as unknown as Recipe)
      : null);

  if (!displayRecipe) return null;

  return createPortal(
    <div
      ref={modalRef}
      className={`fixed inset-0 z-130 bg-white flex flex-col overflow-hidden ${isHidden ? 'invisible' : 'visible'}`}
    >
      <RecipeHeader onBack={handleClose} />

      <div className="min-h-screen overflow-y-auto">
        {/* 使用共用的食譜詳細內容元件 */}
        <RecipeDetailContent
          recipe={displayRecipe}
          consumptionItems={consumptionItems}
          showConsumptionModal={showConsumptionModal}
          onShowConsumptionModal={setShowConsumptionModal}
          onRecipeUpdate={setRecipe}
          showShoppingListButton={true}
          onAddToShoppingList={() => {
            navigate('/planning?tab=planning', {
              state: {
                action: 'autoCreate',
                recipeData: displayRecipe,
                initialItems: consumptionItems,
              },
            });
            onClose(); // Close the modal
          }}
          onConfirmConsumption={handleConfirmConsumption}
          isLoading={isLoading && !fullRecipe}
          onHideParent={hideParent}
          onShowParent={showParent}
          refrigeratorId={activeRefrigeratorId || undefined}
        />
      </div>
    </div>,
    document.body,
  );
};
