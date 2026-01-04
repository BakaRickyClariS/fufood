import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/modules/auth';
import { useGroups } from '@/modules/groups/hooks/useGroups';
import {
  selectActiveRefrigeratorId,
  setActiveRefrigeratorId,
} from '@/store/slices/refrigeratorSlice';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { ThemeSelectionModal } from '@/shared/components/modals/ThemeSelectionModal';
import InventorySection from '@/modules/dashboard/components/InventorySection';
import RecipeSection from '@/modules/dashboard/components/RecipeSection';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  // 主題系統
  const { currentTheme, shouldShowThemeModal, setTheme, dismissThemeModal } =
    useTheme();

  // 使用 useGroups 確保群組資料被載入，並取得群組列表
  const { groups } = useGroups();
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);

  // 自動初始化 activeRefrigeratorId
  // 如果用戶有群組，但當前沒有選中的冰箱 ID (例如首次登入或 localStorage 未同步)
  // 則自動將第一個群組設為預設冰箱
  useEffect(() => {
    if (groups && groups.length > 0 && !activeRefrigeratorId) {
      const defaultId = groups[0].id;
      console.log(
        '[Dashboard] Auto-selecting default refrigerator:',
        defaultId,
      );
      dispatch(setActiveRefrigeratorId(defaultId));
    }
  }, [groups, activeRefrigeratorId, dispatch]);

  // 注意：這裡應該顯示使用者的稱呼，如果未登入則顯示 'Guest' 或導向登入
  // 為了避免破壞排版，我們使用 user.name 或 user.displayName (如果有)
  const displayName = user?.name || user?.displayName || 'Guest';

  return (
    <>
      {/* 首次登入主題選擇 Modal */}
      <ThemeSelectionModal
        isOpen={shouldShowThemeModal}
        onClose={dismissThemeModal}
        onConfirm={setTheme}
        isFirstLogin={true}
      />

      {/* Hero 區塊 */}
      <section>
        <div className="flex justify-center px-4 w-full">
          <div className="flex flex-row justify-center max-w-layout-container w-full">
            <div className="flex flex-col max-w-[150px] mr-[-90px] mt-5 w-full z-10">
              <h1 className="text-xl/7 font-bold text-primary-800">
                Good Morning,
              </h1>
              <h1
                className="text-xl font-bold text-primary-800 mb-4 truncate"
                title={displayName}
              >
                {displayName}.
              </h1>
              <p className="text-sm text-neutral-600 py-1 px-3 bg-primary-50 rounded-b-xl rounded-tl-xl whitespace-nowrap">
                歡迎回到冰箱小隊～
              </p>
            </div>

            <img
              className="max-w-[300px] w-full h-auto object-cover"
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
    </>
  );
};

export default Dashboard;
