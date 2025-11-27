# Final Cleanup Script - Import Path Update Guide

## 🎯 After running final-cleanup.ps1, you MUST update these import paths

### Quick Reference: Search & Replace in VSCode (Ctrl + Shift + H)

---

## 1. Hooks (4 files)

```
Search: from '@/hooks/
Replace: from '@/shared/hooks/
```

**Files affected:**

- `useAuth.ts`
- `useInventory.ts`
- `useNotification.ts`
- `useRecipe.ts`

---

## 2. Types (multiple files)

```
Search: from '@/types/
Replace: from '@/shared/types/
```

**Subdirectories:**

- `@/types/api/*` → `@/shared/types/api/*`
- `@/types/components/*` → `@/shared/types/components/*`
- `@/types/shared/*` → `@/shared/types/shared/*`

---

## 3. Utils (3 files - specific paths)

### formatDate

```
Search: from '@/utils/formatDate'
Replace: from '@/shared/utils/format/formatDate'
```

### validator

```
Search: from '@/utils/validator'
Replace: from '@/shared/utils/validation/validator'
```

### storage

```
Search: from '@/utils/storage'
Replace: from '@/shared/utils/helpers/storage'
```

---

## 4. Store Slices

### authSlice

```
Search: from '@/store/authSlice'
Replace: from '@/modules/auth/store/authSlice'
```

### inventorySlice

```
Search: from '@/store/inventorySlice'
Replace: from '@/modules/inventory/store/inventorySlice'
```

### recipeSlice

```
Search: from '@/store/recipeSlice'
Replace: from '@/modules/recipe/store/recipeSlice'
```

### uiSlice (KEEP AS IS)

```
from '@/store/uiSlice'  ✅ No change needed
```

---

## 📋 Store Configuration Update

After moving slices, update your store configuration:

### Old store configuration (if exists)

```typescript
// src/lib/redux.ts or src/store/index.ts
import authReducer from '@/store/authSlice';
import inventoryReducer from '@/store/inventorySlice';
import recipeReducer from '@/store/recipeSlice';
import uiReducer from '@/store/uiSlice';
```

### New store configuration

```typescript
// src/lib/redux.ts
import authReducer from '@/modules/auth/store/authSlice';
import inventoryReducer from '@/modules/inventory/store/inventorySlice';
import recipeReducer from '@/modules/recipe/store/recipeSlice';
import uiReducer from '@/store/uiSlice'; // Global state remains here

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    recipe: recipeReducer,
    ui: uiReducer,
  },
});
```

---

## ✅ Verification Checklist

After updating imports:

- [ ] Run `npm run dev` - no compilation errors
- [ ] Check VSCode problems panel (Ctrl + Shift + M) - no "Cannot find module" errors
- [ ] Test each page functionality
- [ ] Run `npm run build` - successful build
- [ ] Git status shows expected changes

---

## 🚨 Common Issues

### Issue: "Cannot find module '@/hooks/useAuth'"

**Fix**: Update to `@/shared/hooks/useAuth`

### Issue: "Module not found: Error: Can't resolve '@/types/api/auth'"

**Fix**: Update to `@/shared/types/api/auth`

### Issue: Store not working after update

**Fix**: Check `lib/redux.ts` imports are updated to new paths

---

## 💡 Batch Update Recommendation

Execute replacements in this order:

1. Hooks (most common)
2. Types (many files)
3. Utils (specific paths)
4. Store slices (critical)
5. Store configuration file

**Total estimated time**: 5-10 minutes

---

**Last updated**: 2025-11-26
