import totalImg from '@/assets/images/dashboard/inventory-total.png';
import lowImg from '@/assets/images/dashboard/inventory-low.png';
import expireImg from '@/assets/images/dashboard/inventory-expire.png';
import { useInventorySummaryQuery } from '@/modules/inventory/api/queries';
import InventoryCard from './InventoryCard';

import { useSelector } from 'react-redux';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';

// 格式化相對時間 (ex: 今天 10:00, 昨天 14:30, 12/25 09:00)
const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return '更新中...';

  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (isToday) return `更新 今天${timeStr}`;
  if (isYesterday) return `更新 昨天${timeStr}`;

  const dateStr = date.toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
  });
  return `更新 ${dateStr} ${timeStr}`;
};

const InventorySection = () => {
  // 取得當前選擇的冰箱 ID (Redux)
  const refrigeratorId = useSelector(selectActiveRefrigeratorId) || '';

  const { data, isLoading } = useInventorySummaryQuery(refrigeratorId);
  const summary = data?.data?.summary;

  // 使用 API 提供的 lastSyncedAt 或當前時間 (如果有的話)
  // 這裡假設 summary 可能沒有 lastSyncedAt，若無則暫時顯示 "更新中..." 或不顯示
  // 修正：API response type 定義中沒有 lastSyncedAt，根據 API spec，通常是即時的
  // 若後端沒回傳時間，暫時顯示 "即時更新" 或當下時間
  // 為了符合設計稿 "更新 今天10:00"，我們可以使用 client side current time 當作 fetch time
  const currentTime = new Date().toISOString();

  return (
    <section className="w-full px-4 mt-4">
      {/* 上方標題 */}
      <div className="flex justify-between max-w-layout-container mx-auto">
        <p className="text-neutral-800 text-base font-semibold">庫存狀態</p>
        <p className="text-sm text-neutral-900 px-3 py-1.5 bg-primary-100 rounded-full">
          {isLoading ? '更新中...' : formatRelativeTime(currentTime)}
        </p>
      </div>

      {/* 三個卡片 */}
      <div className="grid grid-cols-2 gap-4 max-w-layout-container mx-auto mt-3">
        {/* 大卡片：總庫存 */}
        <div className="col-span-2">
          <InventoryCard
            title="總庫存數量"
            value={summary?.total ?? 0}
            img={totalImg}
            boxShadow="shadow-[0_6px_6px_-2px_rgba(0,0,0,0.12)]"
            isLoading={isLoading}
          />
        </div>

        {/* 小卡片：低庫存 */}
        <InventoryCard
          title="低庫存數量"
          value={summary?.lowStock ?? 0}
          img={lowImg}
          boxShadow="shadow-[0_6px_6px_-2px_rgba(0,0,0,0.12)]"
          isLoading={isLoading}
        />

        {/* 小卡片：即將到期 */}
        <InventoryCard
          title="即將到期數量"
          value={summary?.expiring ?? 0}
          img={expireImg}
          boxShadow="shadow-[0_6px_6px_-2px_rgba(0,0,0,0.12)]"
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};

export default InventorySection;
