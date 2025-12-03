import { RecipeLayout } from './RecipeLayout';
import { RecipeDetailView } from '@/modules/recipe/components/features/RecipeDetailView';
import { FavoriteRecipes } from '@/modules/recipe/components/features/FavoriteRecipes';
import RecipeHome from './RecipeHome';
import AIQueryPage from './AIQueryPage';

const RecipeRoutes = [
  {
    path: 'recipe',
    element: <RecipeLayout />,
    children: [
      { index: true, element: <RecipeHome /> },
      { path: 'ai-query', element: <AIQueryPage /> },
      { path: ':id', element: <RecipeDetailView /> },
      { path: 'favorites', element: <FavoriteRecipes /> },
    ],
  },
];

export default RecipeRoutes;
