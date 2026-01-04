/**
 * AI API 類型定義
 *
 * 包含 AI 食譜生成、SSE Streaming、媒體上傳與影像辨識的類型
 */

// 重新匯出前端顯示用型別（來自 recipeTransformer）
export type {
  DisplayRecipe,
  DisplayIngredient,
  DisplayStep,
} from '../utils/recipeTransformer';

// ============================================================
// 請求類型
// ============================================================

/** AI 食譜難易度 */
export type AIDifficulty = '簡單' | '中等' | '困難';

/**
 * AI 食譜生成請求
 */
export type AIRecipeRequest = {
  /** 使用者的自然語言提示（必填） */
  prompt: string;

  /** 是否自動納入使用者庫存食材（預設 true） */
  includeInventory?: boolean;

  /** 是否套用使用者飲食偏好設定（預設 true） */
  applyDietaryPreferences?: boolean;

  /** 預計人數（可選，預設 2） */
  servings?: number;

  /** 難易度偏好（可選） */
  difficulty?: AIDifficulty;

  /** 料理類型偏好（可選） */
  category?: string;

  /** 額外選擇的庫存食材名稱 */
  selectedIngredients?: string[];

  /** 額外排除的食材 */
  excludeIngredients?: string[];

  /** 希望推薦幾道食譜（預設 2，最多 5） */
  recipeCount?: number;
};

// ============================================================
// 回應類型
// ============================================================

/** 食材項目（準備材料或調味料） */
export type AIIngredientItem = {
  name: string;
  amount: string | number;
  unit?: string;
};

/** 烹煮步驟 */
export type AICookingStep = {
  step: number;
  description: string;
};

/** AI 生成的食譜項目 */
export type AIRecipeItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null; // 允許 null，表示圖片生成失敗或未完成
  servings: number;
  cookTime: number;
  isFavorite: boolean;
  difficulty?: AIDifficulty;
  ingredients?: AIIngredientItem[];
  seasonings?: AIIngredientItem[];
  steps?: AICookingStep[];
};

/** AI 食譜生成回應 */
export type AIRecipeResponse = {
  status: boolean;
  message: string;
  data: {
    greeting: string;
    recipes: AIRecipeItem[];
    aiMetadata: {
      generatedAt: string;
      model: string;
    };
    remainingQueries: number;
  };
};

/** Prompt 建議回應 */
export type AISuggestionsResponse = {
  status: boolean;
  message: string;
  data: string[];
};

// ============================================================
// SSE 事件類型
// ============================================================

/** SSE 事件基礎型別 */
type AIStreamEventBase = {
  id: string;
  timestamp: string;
};

/** 開始事件 */
export type AIStreamStartEvent = AIStreamEventBase & {
  event: 'start';
  data: { sessionId: string; model: string };
};

/** 文字片段事件 */
export type AIStreamChunkEvent = AIStreamEventBase & {
  event: 'chunk';
  data: {
    text: string;
    section: 'greeting' | 'name' | 'ingredients' | 'steps' | 'summary';
  };
};

/** 進度事件 */
export type AIStreamProgressEvent = AIStreamEventBase & {
  event: 'progress';
  data: { percent: number; stage: string };
};

/** 完成事件 */
export type AIStreamDoneEvent = AIStreamEventBase & {
  event: 'done';
  data: {
    recipes: AIRecipeItem[];
    aiMetadata: { generatedAt: string; model: string };
    remainingQueries: number;
  };
};

/** 錯誤事件 */
export type AIStreamErrorEvent = AIStreamEventBase & {
  event: 'error';
  data: { code: string; message: string };
};

/** SSE 事件聯合型別 */
export type AIStreamEvent =
  | AIStreamStartEvent
  | AIStreamChunkEvent
  | AIStreamProgressEvent
  | AIStreamDoneEvent
  | AIStreamErrorEvent;

// ============================================================
// 媒體 API 類型
// ============================================================

/** 媒體上傳回應 */
export type MediaUploadResponse = {
  success: boolean;
  data: {
    url: string;
    publicId: string;
  };
};

/** 影像辨識回應 */
export type AnalyzeImageResponse = {
  success: boolean;
  data: {
    productName: string;
    category: string;
    attributes: string;
    purchaseQuantity: number;
    unit: string;
    purchaseDate: string;
    expiryDate: string;
    lowStockAlert: boolean;
    lowStockThreshold: number;
    notes: string;
    imageUrl: string;
  };
  timestamp: string;
};

// ============================================================
// 錯誤類型
// ============================================================

/** AI 錯誤回應 */
export type AIErrorResponse = {
  status: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

/** AI 錯誤代碼 */
export type AIErrorCode =
  | 'AI_001' // Prompt 不可為空
  | 'AI_002' // Prompt 過長
  | 'AI_003' // 已達每日查詢上限
  | 'AI_004' // 未授權
  | 'AI_005' // AI 服務暫時無法使用
  | 'AI_006' // AI 生成逾時
  | 'AI_007' // Prompt Injection 偵測
  | 'MEDIA_001' // 未提供檔案
  | 'MEDIA_002' // 檔案類型不支援
  | 'MEDIA_003'; // 檔案過大

// ============================================================
// 儲存食譜型別
// ============================================================

/** 儲存食譜的輸入格式 */
export type SaveRecipeInput = {
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string | null; // 允許 null，表示圖片生成失敗
  servings?: number;
  cookTime?: number;
  difficulty?: '簡單' | '中等' | '困難';
  ingredients: { name: string; quantity: string; unit: string }[];
  seasonings?: { name: string; quantity: string; unit: string }[];
  steps: { step: number; description: string }[];
  originalPrompt?: string;
  refrigeratorId?: string;
};

/** 已儲存的食譜 (完整) */
export type SavedRecipe = {
  id: string;
  userId: string;
  name: string;
  category: string | null;
  description: string | null;
  imageUrl: string | null;
  servings: number;
  cookTime: number | null;
  difficulty: '簡單' | '中等' | '困難' | null;
  ingredients: { name: string; quantity: string; unit: string }[];
  seasonings: { name: string; quantity: string; unit: string }[];
  steps: { step: number; description: string }[];
  source: 'ai_generated' | 'manual';
  originalPrompt: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

/** 已儲存的食譜列表項目 */
export type SavedRecipeListItem = {
  id: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
  servings: number;
  cookTime: number | null;
  difficulty: '簡單' | '中等' | '困難' | null;
  isFavorite: boolean;
  createdAt: string;
};
