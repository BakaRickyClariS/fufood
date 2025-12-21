/**
 * AI API 類型定義
 *
 * 包含 AI 食譜生成、SSE Streaming、媒體上傳與影像辨識的類型
 */

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
  amount: string;
  unit: string;
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
  imageUrl: string;
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
  | 'MEDIA_001' // 未提供檔案
  | 'MEDIA_002' // 檔案類型不支援
  | 'MEDIA_003'; // 檔案過大
