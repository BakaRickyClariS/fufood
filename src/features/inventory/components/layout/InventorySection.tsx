import InventoryCard from '../ui/card/InventoryCard';
import totalImg from '@/assets/images/dashboard/inventory-total.png';
import lowImg from '@/assets/images/dashboard/inventory-low.png';
import expireImg from '@/assets/images/dashboard/inventory-expire.png';

const InventorySection = () => {
  return (
    <section className="w-full px-4 mt-4">
      {/* 上方標題 */}
      <div className="flex justify-between max-w-[800px] mx-auto">
        <p className="text-neutral-800 text-base font-semibold">庫存狀態</p>
        <p className="text-sm text-neutral-900 px-3 py-1.5 bg-primary-100 rounded-full">
          更新 今天10:00
        </p>
      </div>

      {/* 三個卡片 */}
      <div className="grid grid-cols-2 gap-4 max-w-[800px] mx-auto mt-3">
        {/* 大卡片：總庫存 */}
        <div className="col-span-2">
          <InventoryCard
            title="總庫存數量"
            value={30}
            img={totalImg}
            boxShadow="shadow-[0_6px_6px_-2px_rgba(0,0,0,0.12)]"
          />
        </div>

        {/* 小卡片：低庫存 */}
        <InventoryCard
          title="低庫存數量"
          value={8}
          img={lowImg}
          boxShadow="shadow-[0_6px_6px_-2px_rgba(0,0,0,0.12)]"
        />

        {/* 小卡片：即將到期 */}
        <InventoryCard
          title="即將到期數量"
          value={12}
          img={expireImg}
          boxShadow="shadow-[0_6px_6px_-2px_rgba(0,0,0,0.12)]"
        />
      </div>
    </section>
  );
};

export default InventorySection;
