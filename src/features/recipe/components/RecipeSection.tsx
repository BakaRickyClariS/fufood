import RecipeCard from './RecipeCard';
import AiRecommendCard from './AiRecommendCard';
import recipe1 from '@/assets/images/dashboard/recipe-1.png';
import recipe2 from '@/assets/images/dashboard/recipe-2.png';

const RecipeSection = () => {
  return (
    <section className="w-full rounded-t-3xl overflow-hidden bg-white px-4 mt-6 pb-32">
      {/* 標題列 */}
      <div className="flex justify-between items-center max-w-[800px] mx-auto mb-4">
        <p className="text-neutral-900 font-bold text-lg">推薦食譜</p>
        <button type="button" className="text-neutral-700 text-sm">
          查看更多
        </button>
      </div>

      {/* 卡片排版 */}
      <div className="grid grid-cols-2 gap-4 max-w-[800px] mx-auto">
        <RecipeCard
          cover={recipe1}
          tag="熱門"
          category="中式"
          title="涼拌小黃瓜"
          servings={6}
          time={10}
        />

        <RecipeCard
          cover={recipe2}
          category="中式"
          title="鮮蝦冰花煎餃"
          servings={1}
          time={20}
        />
      </div>
      <AiRecommendCard />
    </section>
  );
};

export default RecipeSection;
