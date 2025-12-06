import type { RecipeApi } from './api/recipeApi';
import { RealRecipeApi } from './api/recipeApi';
import { MockRecipeApi } from './mock/mockRecipeApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export const recipeApi: RecipeApi = USE_MOCK
  ? new MockRecipeApi()
  : new RealRecipeApi();
