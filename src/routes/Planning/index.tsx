import { PlanningLayout } from './PlanningLayout';
import PlanningHome from './PlanningHome';
import CreateSharedList from './CreateSharedList';
import SharedListDetail from './SharedListDetail';
import CreatePost from './CreatePost';

import { RecipeList } from '@/modules/recipe/components/features/RecipeList';
import { FavoriteRecipes } from '@/modules/recipe/components/features/FavoriteRecipes';

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
      { path: 'recipes/favorites', element: <FavoriteRecipes /> },

    ],
  },
];

export default PlanningRoutes;
