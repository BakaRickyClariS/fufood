import { useRef, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import PlanningTabsSection from '@/modules/planning/components/layout/PlanningTabsSection';
import { SharedPlanningList } from '@/modules/planning/components/features/SharedPlanningList';
import { RecipeList } from '@/modules/recipe/components/features/RecipeList';
import { AISearchCard } from '@/modules/recipe/components/ui/AISearchCard';
import { SharedListDetail } from '@/modules/planning/components/features/SharedListDetail';
import { SharedListEditModal } from '@/modules/planning/components/features/SharedListEditModal';
import { useSharedListsContext } from '@/modules/planning/contexts/SharedListsContext';
import { sharedListApi } from '@/modules/planning/services/api/sharedListApi';
import { toast } from 'sonner';

const PlanningHome = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lists, createList } = useSharedListsContext();
  const navigate = useNavigate();

  // URL query params for modals
  const activeListId = searchParams.get('list');
  const isEditMode = searchParams.get('edit') === 'true';
  const isCreateMode = searchParams.get('create') === 'true';

  // State (from navigation)
  const location = useLocation();
  const initialCreateItems = (location.state as { initialItems?: any[] })
    ?.initialItems;
  const defaultCreateTitle = (location.state as { defaultTitle?: string })
    ?.defaultTitle;

  const handledAutoCreate = useRef(false);

  // 處理來自食譜的自動建立清單請求
  useEffect(() => {
    const state = location.state as {
      action?: string;
      recipeData?: any;
      initialItems?: any[];
    } | null;

    if (
      state?.action === 'autoCreate' &&
      !handledAutoCreate.current &&
      state.recipeData
    ) {
      handledAutoCreate.current = true;

      const createAndFillList = async () => {
        const loadingToast = toast.loading('正在建立採買清單...');
        try {
          // 1. Create List
          const newList = await createList({
            title: state.recipeData?.name || '未命名清單',
            startsAt: new Date().toISOString(),
            coverPhotoPath: state.recipeData?.coverImage || '',
            enableNotifications: true,
          });

          // 2. Add Items
          if (state.initialItems && state.initialItems.length > 0) {
            await Promise.all(
              state.initialItems.map((item) =>
                sharedListApi.createSharedListItem(newList.id, {
                  name: item.ingredientName,
                  quantity: item.consumedQuantity || 1,
                  unit: item.unit || '個',
                }),
              ),
            );
          }

          toast.dismiss(loadingToast);
          toast.success('已建立採買清單');

          // 3. Navigate to list
          navigate(
            {
              pathname: location.pathname,
              search: `?tab=planning&list=${newList.id}`,
            },
            { replace: true, state: {} },
          );
        } catch (error) {
          console.error('Auto create list failed', error);
          toast.dismiss(loadingToast);
          toast.error('建立清單失敗');
          handledAutoCreate.current = false;
        }
      };

      createAndFillList();
    }
  }, [location.state, createList, navigate, location.pathname]);

  // 開啟清單詳細頁 Modal
  const handleOpenList = (listId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('list', listId);
    setSearchParams(params);
  };

  // 關閉清單詳細頁 Modal
  const handleCloseList = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('list');
    params.delete('edit');
    setSearchParams(params);
  };

  // 開啟編輯 Modal
  const handleOpenEdit = (listId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('list', listId);
    params.set('edit', 'true');
    setSearchParams(params);
  };

  // 關閉編輯 Modal
  const handleCloseEdit = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('edit');
    setSearchParams(params);
  };

  // 關閉建立 Drawer
  const handleCloseCreate = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('create');
    setSearchParams(params);
  };

  // 從詳細頁導航到編輯頁
  const handleNavigateToEdit = (_listId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('edit', 'true');
    setSearchParams(params);
  };

  // 取得當前選中的清單
  const selectedList = activeListId
    ? lists.find((l) => l.id === activeListId) || null
    : null;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 max-w-layout-container mx-auto">
      <PlanningTabsSection>
        {(mainTab, subTab, year, month) => (
          <>
            {mainTab === 'planning' && (
              <div className="px-4">
                <SharedPlanningList
                  statusFilter={subTab}
                  year={year}
                  month={month}
                  onOpenList={handleOpenList}
                  onOpenEdit={handleOpenEdit}
                  isCreateOpen={isCreateMode}
                  initialCreateItems={initialCreateItems}
                  defaultCreateTitle={defaultCreateTitle}
                  onCloseCreate={handleCloseCreate}
                />
              </div>
            )}

            {mainTab === 'recipes' && (
              <div className="">
                <div className="bg-neutral-100 p-4">
                  <AISearchCard />
                </div>
                <RecipeList />
              </div>
            )}
          </>
        )}
      </PlanningTabsSection>

      {/* 清單詳細頁 Modal - controlled by URL query param */}
      <SharedListDetail
        listId={activeListId}
        isOpen={!!activeListId && !isEditMode}
        onClose={handleCloseList}
        onNavigateToEdit={handleNavigateToEdit}
      />

      {/* 編輯清單 Modal - controlled by URL query param */}
      <SharedListEditModal
        list={selectedList}
        isOpen={!!activeListId && isEditMode}
        onClose={handleCloseEdit}
      />
    </div>
  );
};

export default PlanningHome;
