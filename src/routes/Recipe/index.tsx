import { RecipeLayout } from './RecipeLayout';
import { RecipeList } from '@/modules/recipe/components/features/RecipeList';
import { RecipeDetailView } from '@/modules/recipe/components/features/RecipeDetailView';
import { FavoriteRecipes } from '@/modules/recipe/components/features/FavoriteRecipes';

const RecipeRoutes = [
  {
    path: 'recipe',
    element: <RecipeLayout />,
    children: [
      { index: true, element: <RecipeList /> },
      { path: ':id', element: <RecipeDetailView /> },
      { path: 'favorites', element: <FavoriteRecipes /> },
    ],
  },
];

export default RecipeRoutes;
