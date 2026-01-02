import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { sharedListApi } from '@/modules/planning/services/api/sharedListApi';
import type {
  SharedList,
  SharedListItem,
  CreateSharedListInput,
  CreateSharedListItemInput,
} from '@/modules/planning/types';

type ShoppingListState = {
  lists: SharedList[];
  currentListItems: SharedListItem[];
  isLoadingLists: boolean;
  isLoadingItems: boolean;
  error: string | null;
  currentListId: string | null;
};

const initialState: ShoppingListState = {
  lists: [],
  currentListItems: [],
  isLoadingLists: false,
  isLoadingItems: false,
  error: null,
  currentListId: null,
};

// Async Thunks

export const fetchShoppingLists = createAsyncThunk(
  'shoppingList/fetchLists',
  async (refrigeratorId: string, { rejectWithValue }) => {
    try {
      return await sharedListApi.getSharedLists(refrigeratorId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch lists',
      );
    }
  },
);

export const fetchListItems = createAsyncThunk(
  'shoppingList/fetchItems',
  async (listId: string, { rejectWithValue }) => {
    try {
      return await sharedListApi.getSharedListItems(listId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch items',
      );
    }
  },
);

export const createShoppingList = createAsyncThunk(
  'shoppingList/createList',
  async (
    {
      refrigeratorId,
      input,
    }: { refrigeratorId: string; input: CreateSharedListInput },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const newList = await sharedListApi.createSharedList(
        refrigeratorId,
        input,
      );
      // Automatically refresh lists
      dispatch(fetchShoppingLists(refrigeratorId));
      return newList;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create list',
      );
    }
  },
);

export const deleteShoppingList = createAsyncThunk(
  'shoppingList/deleteList',
  async (
    { listId, refrigeratorId }: { listId: string; refrigeratorId: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await sharedListApi.deleteSharedList(listId);
      dispatch(fetchShoppingLists(refrigeratorId));
      return listId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete list',
      );
    }
  },
);

// Item Operations

export const createListItem = createAsyncThunk(
  'shoppingList/createItem',
  async (
    {
      listId,
      input,
    }: { listId: string; input: CreateSharedListItemInput },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const newItem = await sharedListApi.createSharedListItem(listId, input);
      // Immediately refetch items to ensure sync
      dispatch(fetchListItems(listId));
      return newItem;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create item',
      );
    }
  },
);

// Batch Create Items
export const createListItems = createAsyncThunk(
  'shoppingList/createItems',
  async (
    {
      listId,
      inputs,
    }: { listId: string; inputs: CreateSharedListItemInput[] },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const promises = inputs.map((input) =>
        sharedListApi.createSharedListItem(listId, input),
      );
      await Promise.all(promises);
      dispatch(fetchListItems(listId));
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create items',
      );
    }
  },
);

export const updateListItem = createAsyncThunk(
  'shoppingList/updateItem',
  async (
    {
      listId, // needed for refetch
      itemId,
      input,
    }: {
      listId: string;
      itemId: string;
      input: Partial<CreateSharedListItemInput>;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await sharedListApi.updateSharedListItem(itemId, input);
      dispatch(fetchListItems(listId));
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update item',
      );
    }
  },
);

export const deleteListItem = createAsyncThunk(
  'shoppingList/deleteItem',
  async (
    { listId, itemId }: { listId: string; itemId: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await sharedListApi.deleteSharedListItem(itemId);
      dispatch(fetchListItems(listId));
      return itemId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete item',
      );
    }
  },
);

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    setCurrentListId: (state, action: PayloadAction<string | null>) => {
      state.currentListId = action.payload;
      // Clear items when switching lists to avoid flash of old content
      if (action.payload === null) {
        state.currentListItems = [];
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Lists
    builder
      .addCase(fetchShoppingLists.pending, (state) => {
        state.isLoadingLists = true;
        state.error = null;
      })
      .addCase(fetchShoppingLists.fulfilled, (state, action) => {
        state.isLoadingLists = false;
        state.lists = action.payload;
      })
      .addCase(fetchShoppingLists.rejected, (state, action) => {
        state.isLoadingLists = false;
        state.error = action.payload as string;
      });

    // Items
    builder
      .addCase(fetchListItems.pending, (state) => {
        state.isLoadingItems = true;
        state.error = null;
      })
      .addCase(fetchListItems.fulfilled, (state, action) => {
        state.isLoadingItems = false;
        state.currentListItems = action.payload;
      })
      .addCase(fetchListItems.rejected, (state, action) => {
        state.isLoadingItems = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentListId, clearError } = shoppingListSlice.actions;

export const selectShoppingLists = (state: { shoppingList: ShoppingListState }) =>
  state.shoppingList.lists;
export const selectCurrentListItems = (state: {
  shoppingList: ShoppingListState;
}) => state.shoppingList.currentListItems;
export const selectShoppingListLoading = (state: {
  shoppingList: ShoppingListState;
}) => state.shoppingList.isLoadingLists || state.shoppingList.isLoadingItems;

export default shoppingListSlice.reducer;
