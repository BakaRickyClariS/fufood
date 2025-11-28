import heroBanner from '@/assets/images/dashboard/hero-banner.png';
import InventorySection from '@/modules/dashboard/components/InventorySection';
import RecipeSection from '@/modules/dashboard/components/RecipeSection';

import { useNavigate } from 'react-router-dom';
import { Home, ChevronDown, ShieldCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-stone-50">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
             <div className="w-8 h-8 rounded-full bg-red-200 border-2 border-white" />
             <div className="w-8 h-8 rounded-full bg-orange-200 border-2 border-white" />
             <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white" />
          </div>
          <button 
            className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm"
            onClick={() => navigate('/group/members')}
          >
            <span className="text-sm font-medium text-stone-700">My Home</span>
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </button>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/group/settings')}>
             <Home className="w-6 h-6 text-stone-600" />
           </button>
           <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
             <ShieldCheck className="w-5 h-5 text-[#EE5D50]" />
           </div>
        </div>
      </div>
    {/* Hero 區塊 */}
    <section>
      <div className="flex justify-center px-4 w-full">
        <div className="flex flex-row justify-center max-w-layout-container w-full">
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
