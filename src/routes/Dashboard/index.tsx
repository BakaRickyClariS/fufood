import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/modules/auth';
import { useGroups } from '@/modules/groups/hooks/useGroups';
import {
  selectActiveRefrigeratorId,
  setActiveRefrigeratorId,
} from '@/store/slices/refrigeratorSlice';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { ThemeSelectionSheet } from '@/shared/components/modals/ThemeSelectionSheet';
import InventorySection from '@/modules/dashboard/components/InventorySection';
import RecipeSection from '@/modules/dashboard/components/RecipeSection';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  // 主題系統
  const { currentTheme, shouldShowThemeModal, setTheme, dismissThemeModal } =
    useTheme();

  // 使用 useGroups 確保群組資料被載入
  const { groups: allGroups } = useGroups();
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);

  // 自動初始化 activeRefrigeratorId
  useEffect(() => {
    if (allGroups && allGroups.length > 0 && !activeRefrigeratorId) {
      const defaultId = allGroups[0].id;
      console.log(
        '[Dashboard] Auto-selecting default refrigerator:',
        defaultId,
      );
      dispatch(setActiveRefrigeratorId(defaultId));
    }
  }, [allGroups, activeRefrigeratorId, dispatch]);

  const displayName = user?.name || user?.displayName || 'Guest';

  return (
    <>
      {/* 首次登入主題選擇 Sheet */}
      <ThemeSelectionSheet
        isOpen={shouldShowThemeModal}
        onClose={async () => {
          await setTheme(1);
          dismissThemeModal();
        }}
        onConfirm={async (themeId, _userName) => {
          await setTheme(themeId);
        }}
        isFirstLogin={true}
        defaultUserName={displayName !== 'Guest' ? displayName : ''}
      />

      {/* Hero 區塊 */}
      <section>
        <div className="flex justify-center px-4 w-full">
          <div className="flex flex-row justify-center max-w-layout-container w-full">
            <div className="flex flex-col max-w-[150px] mr-[-100px] mt-14 w-full z-10">
              <h1 className="text-xl/7 font-bold text-neutral-600 mb-5">
                早安,{displayName}!
              </h1>
              <p className="text-sm text-neutral-600 py-1 px-3 bg-white rounded-b-xl rounded-tl-xl whitespace-nowrap">
                歡迎回到冰箱小隊～
              </p>
            </div>

            <img
              className="max-w-[300px] w-full h-auto object-cover translate-x-6 mt-3"
              src={currentTheme.homeBanner}
              alt="Illustration of a person looking into a fridge"
            />
          </div>
        </div>
      </section>

      {/* 庫存卡片區塊 */}
      <InventorySection />
      {/* 推薦食譜區塊 */}
      <RecipeSection />

      {/* 群組 Modal 已移至 MainLayout 中的 GlobalGroupModals 處理 */}
    </>
  );
};

export default Dashboard;
