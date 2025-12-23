import { PlanningLayout } from './PlanningLayout';
import PlanningHome from './PlanningHome';
import CreateSharedList from './CreateSharedList';
import SharedListDetail from './SharedListDetail';
import CreatePost from './CreatePost';
import AIQueryPage from './AIQueryPage';
import { RecipeDetailView } from '@/modules/recipe/components/features/RecipeDetailView';
import { FavoriteRecipes } from '@/modules/recipe/components/features/FavoriteRecipes';
import { RecipeList } from '@/modules/recipe/components/features/RecipeList';

const PlanningRoutes = [
  {
    path: 'planning',
    element: <PlanningLayout />,
    children: [
      {
        index: true,
        element: <PlanningHome />,
      },
      // 共享清單
      {
        path: 'list/create',
        element: <CreateSharedList />,
        handle: { headerVariant: 'none', footer: false },
      },
      {
        path: 'list/:listId',
        element: <SharedListDetail />,
        handle: { headerVariant: 'none' },
      },
      { path: 'list/:listId/post/create', element: <CreatePost /> },
      // 食譜相關
      { path: 'recipes', element: <RecipeList /> },
      {
        path: 'recipes/:id',
        element: <RecipeDetailView />,
        handle: { headerVariant: 'none' },
      },
      { path: 'recipes/favorites', element: <FavoriteRecipes /> },
      { path: 'recipes/ai-query', element: <AIQueryPage /> },
    ],
  },
];

export default PlanningRoutes;
