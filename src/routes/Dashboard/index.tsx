import heroBanner from '../../assets/images/dashboard/hero-banner.png';
import InventorySection from '@/components/layout/InventorySection';
import RecipeSection from '@/components/layout/RecipeSection';

const Dashboard: React.FC = () => {
  return (
    <>
      {/* Hero 區塊 */}
      <section>
        <div className="flex justify-center px-4 w-full">
          <div className="flex flex-row justify-center max-w-[800px] w-full">
            <div className="flex flex-col max-w-[150px] mr-[-70px] mt-5 w-full z-10">
              <h1 className="text-xl/7 font-bold text-primary-800">
                Good Morning,
              </h1>
              <h1 className="text-xl font-bold text-primary-800 mb-4">
                Jocelyn.
              </h1>
              <p className="text-sm text-neutral-600 py-1 px-3 bg-[#FEF3F2] rounded-b-xl rounded-tl-xl">
                歡迎回到冰箱小隊～
              </p>
            </div>

            <img
              className="max-w-[300px] w-full h-auto object-cover"
              src={heroBanner}
              alt="banner"
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
