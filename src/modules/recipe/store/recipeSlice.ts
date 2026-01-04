import { createSlice } from '@reduxjs/toolkit';

export interface RecipeState {
  lastUpdated: number;
}

const initialState: RecipeState = {
  lastUpdated: 0,
};

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    triggerRecipeRefresh: (state) => {
      state.lastUpdated = Date.now();
    },
  },
});

export const { triggerRecipeRefresh } = recipeSlice.actions;

export const selectRecipeLastUpdated = (state: { recipe?: RecipeState }) =>
  state.recipe?.lastUpdated || 0;

export default recipeSlice.reducer;
