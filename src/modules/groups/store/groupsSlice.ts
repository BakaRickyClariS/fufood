import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {
  Group,
  CreateGroupForm,
  UpdateGroupForm,
  Friend,
  InviteCodeResponse,
} from '../types/group.types';
import { groupsApi, GroupsApiError } from '../api';

// State definition
export interface GroupsState {
  items: Group[];
  isLoading: boolean;
  error: string | null;
  // Optional: keep track of active group in Redux if desired,
  // but for now we focus on the data sync issue.
  searchResults: Friend[];
  isSearching: boolean;
  inviteCode: InviteCodeResponse | null;
  isGeneratingCode: boolean;
}

const initialState: GroupsState = {
  items: [],
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  inviteCode: null,
  isGeneratingCode: false,
};

// Async Thunks

export const fetchGroups = createAsyncThunk(
  'groups/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await groupsApi.getAll();
      return Array.isArray(response) ? response : [];
    } catch (err) {
      if (err instanceof GroupsApiError) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue(
        (err as Error).message || 'Failed to fetch groups',
      );
    }
  },
);

export const createGroup = createAsyncThunk(
  'groups/create',
  async (data: CreateGroupForm, { rejectWithValue }) => {
    try {
      return await groupsApi.create(data);
    } catch (err) {
      if (err instanceof GroupsApiError) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue(
        (err as Error).message || 'Failed to create group',
      );
    }
  },
);

export const updateGroup = createAsyncThunk(
  'groups/update',
  async (
    { id, data }: { id: string; data: UpdateGroupForm },
    { rejectWithValue },
  ) => {
    try {
      return await groupsApi.update(id, data);
    } catch (err) {
      if (err instanceof GroupsApiError) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue(
        (err as Error).message || 'Failed to update group',
      );
    }
  },
);

export const deleteGroup = createAsyncThunk(
  'groups/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await groupsApi.delete(id);
      return id;
    } catch (err) {
      if (err instanceof GroupsApiError) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue(
        (err as Error).message || 'Failed to delete group',
      );
    }
  },
);

export const searchFriends = createAsyncThunk(
  'groups/searchFriends',
  async (query: string, { rejectWithValue }) => {
    try {
      return await groupsApi.searchFriends(query);
    } catch (err) {
      if (err instanceof GroupsApiError) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue(
        (err as Error).message || 'Failed to search friends',
      );
    }
  },
);

export const getInviteCode = createAsyncThunk(
  'groups/getInviteCode',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await groupsApi.getInviteCode(groupId);
    } catch (err) {
      if (err instanceof GroupsApiError) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue(
        (err as Error).message || 'Failed to get invite code',
      );
    }
  },
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchGroups
    builder.addCase(fetchGroups.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchGroups.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // createGroup
    builder.addCase(createGroup.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createGroup.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items.push(action.payload);
    });
    builder.addCase(createGroup.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // updateGroup
    builder.addCase(updateGroup.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateGroup.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.items.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });
    builder.addCase(updateGroup.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // deleteGroup
    builder.addCase(deleteGroup.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteGroup.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = state.items.filter((g) => g.id !== action.payload);
    });
    builder.addCase(deleteGroup.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // searchFriends
    builder.addCase(searchFriends.pending, (state) => {
      state.isSearching = true;
      state.error = null;
    });
    builder.addCase(searchFriends.fulfilled, (state, action) => {
      state.isSearching = false;
      state.searchResults = action.payload;
    });
    builder.addCase(searchFriends.rejected, (state, action) => {
      state.isSearching = false;
      state.error = action.payload as string;
    });

    // getInviteCode
    builder.addCase(getInviteCode.pending, (state) => {
      state.isGeneratingCode = true;
      state.error = null;
    });
    builder.addCase(getInviteCode.fulfilled, (state, action) => {
      state.isGeneratingCode = false;
      state.inviteCode = action.payload;
    });
    builder.addCase(getInviteCode.rejected, (state, action) => {
      state.isGeneratingCode = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = groupsSlice.actions;

// Selectors
export const selectAllGroups = (state: { groups: GroupsState }) =>
  state.groups.items;
export const selectGroupsLoading = (state: { groups: GroupsState }) =>
  state.groups.isLoading;
export const selectGroupsError = (state: { groups: GroupsState }) =>
  state.groups.error;

export default groupsSlice.reducer;
