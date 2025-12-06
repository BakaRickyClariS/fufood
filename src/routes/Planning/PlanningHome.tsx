import PlanningTabsSection from '@/modules/planning/components/layout/PlanningTabsSection';
import { SharedPlanningList } from '@/modules/planning/components/features/SharedPlanningList';
import { RecipeList } from '@/modules/recipe/components/features/RecipeList';
import { AISearchCard } from '@/modules/recipe/components/ui/AISearchCard';

const PlanningHome = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <PlanningTabsSection>
        {(mainTab, subTab, year, month) => (
          <>
            {mainTab === 'planning' && (
              <SharedPlanningList
                statusFilter={subTab}
                year={year}
                month={month}
              />
            )}

            {mainTab === 'recipes' && (
              <div className="space-y-6">
                {/* AISearchCard 在這裡可能需要調整樣式，或者維持原樣 */}
                <div className="px-4">
                  <AISearchCard />
                </div>
                <RecipeList />
              </div>
            )}
          </>
        )}
      </PlanningTabsSection>
    </div>
  );
};

export default PlanningHome;
