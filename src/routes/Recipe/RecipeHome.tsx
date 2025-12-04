import { useState } from 'react';
import { Tabs, type Tab } from '@/shared/components/ui/animated-tabs';
import { AISearchCard } from '@/modules/recipe/components/ui/AISearchCard';
import { RecipeList } from '@/modules/recipe/components/features/RecipeList';

type RecipeTabId = 'recommend' | 'rules';

const RecipeHome = () => {
  const [activeTab, setActiveTab] = useState<RecipeTabId>('recommend');

  const tabs: Tab<RecipeTabId>[] = [
    { id: 'recommend', label: '食譜推薦' },
    { id: 'rules', label: '共享規則' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Tabs 
        variant="underline"
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        className="bg-white sticky top-14 z-30"
      />

      {activeTab === 'recommend' && (
        <div className="space-y-6 mt-4">
          <AISearchCard />
          <RecipeList />
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="p-10 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">共享規則功能開發中</h3>
          <p className="text-gray-500">這裡將顯示您與家人的食譜共享設定</p>
        </div>
      )}
    </div>
  );
};

export default RecipeHome;
