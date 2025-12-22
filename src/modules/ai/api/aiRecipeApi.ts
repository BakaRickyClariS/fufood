/**
 * AI 食譜 API
 *
 * 提供 AI 食譜生成相關的 API 呼叫
 * 支援 Mock 模式（VITE_USE_MOCK_API=true）
 */
import { aiApi } from '@/api/client';
import type {
  AIRecipeRequest,
  AIRecipeResponse,
  AISuggestionsResponse,
  AIRecipeItem,
} from '../types';

const AI_API_BASE = import.meta.env.VITE_AI_API_BASE_URL || '';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// ============================================================
// Mock 資料
// ============================================================

const MOCK_SUGGESTIONS: string[] = [
  '台灣屬性的美食',
  '晚餐想吃日式',
  '聖誕節吃什麼',
  '快速早餐建議',
];

const MOCK_RECIPES: AIRecipeItem[] = [
  {
    id: 'ai-mock-001',
    name: '日式照燒雞腿丼',
    category: '日式料理',
    imageUrl:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
    servings: 2,
    cookTime: 30,
    isFavorite: false,
    difficulty: '中等',
    ingredients: [
      { name: '雞腿肉', amount: '2', unit: '片' },
      { name: '白飯', amount: '2', unit: '碗' },
      { name: '洋蔥', amount: '1/2', unit: '顆' },
    ],
    seasonings: [
      { name: '醬油', amount: '3', unit: '大匙' },
      { name: '味醂', amount: '2', unit: '大匙' },
      { name: '糖', amount: '1', unit: '大匙' },
    ],
    steps: [
      { step: 1, description: '雞腿肉用刀背拍鬆，兩面抹鹽靜置 10 分鐘' },
      { step: 2, description: '調製照燒醬：醬油、味醂、糖混合均勻' },
      { step: 3, description: '熱鍋下油，將雞腿肉皮面朝下煎至金黃' },
      { step: 4, description: '翻面續煎，倒入照燒醬收汁' },
      { step: 5, description: '切片擺在白飯上，淋上剩餘醬汁即完成' },
    ],
  },
  {
    id: 'ai-mock-002',
    name: '蒜香奶油蝦義大利麵',
    category: '義式料理',
    imageUrl:
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop',
    servings: 2,
    cookTime: 25,
    isFavorite: false,
    difficulty: '簡單',
    ingredients: [
      { name: '義大利麵', amount: '200', unit: 'g' },
      { name: '白蝦', amount: '10', unit: '隻' },
      { name: '蒜頭', amount: '4', unit: '瓣' },
    ],
    seasonings: [
      { name: '奶油', amount: '30', unit: 'g' },
      { name: '白酒', amount: '50', unit: 'ml' },
      { name: '黑胡椒', amount: '適量', unit: '' },
    ],
    steps: [
      { step: 1, description: '煮滾一鍋水，加鹽煮義大利麵' },
      { step: 2, description: '另起鍋融化奶油，爆香蒜片' },
      { step: 3, description: '加入蝦仁翻炒至變紅，倒入白酒' },
      { step: 4, description: '放入煮好的麵條拌炒均勻' },
      { step: 5, description: '撒上黑胡椒和巴西里即完成' },
    ],
  },
];

// ============================================================
// 擴展回應型別（加入 isMock 標記）
// ============================================================

export type AISuggestionsResponseWithMock = AISuggestionsResponse & {
  /** 是否使用 Mock 資料（真實 API 失敗時為 true） */
  isMock: boolean;
};

export type AIRecipeResponseWithMock = AIRecipeResponse & {
  /** 是否使用 Mock 資料（真實 API 失敗時為 true） */
  isMock: boolean;
};

// ============================================================
// API
// ============================================================

export const aiRecipeApi = {
  /**
   * 取得預設 Prompt 建議
   *
   * 策略：先嘗試真實 API，失敗時使用 Mock 資料並標註
   */
  getSuggestions: async (): Promise<AISuggestionsResponseWithMock> => {
    // 先嘗試真實 API
    try {
      const response = await aiApi.get<AISuggestionsResponse>(
        '/ai/recipe/suggestions',
      );
      return { ...response, isMock: false };
    } catch (error) {
      console.warn(
        '[AI API] getSuggestions 真實 API 失敗，使用 Mock 資料',
        error,
      );
      // 真實 API 失敗，回傳 Mock 資料
      return {
        status: true,
        message: 'Mock fallback - 真實 API 暫時無法使用',
        data: MOCK_SUGGESTIONS,
        isMock: true,
      };
    }
  },

  /**
   * 生成食譜（標準回應，非 SSE）
   *
   * 策略：先嘗試真實 API，失敗時使用 Mock 資料並標註
   */
  generateRecipe: async (
    request: AIRecipeRequest,
  ): Promise<AIRecipeResponseWithMock> => {
    // 先嘗試真實 API
    try {
      // Debug: 確認 request 物件內容
      console.log('[AI API] generateRecipe 請求內容:', request);

      const response = await aiApi.post<AIRecipeResponse>(
        '/ai/recipe',
        request,
      );
      return { ...response, isMock: false };
    } catch (error) {
      console.warn(
        '[AI API] generateRecipe 真實 API 失敗，使用 Mock 資料',
        error,
      );
      // 模擬一點延遲讓 UX 更自然
      await new Promise((resolve) => setTimeout(resolve, 800));
      // 真實 API 失敗，回傳 Mock 資料
      return {
        status: true,
        message: 'Mock fallback - 真實 API 暫時無法使用',
        data: {
          greeting: `根據您「${request.prompt}」的需求，為您推薦以下料理：`,
          recipes: MOCK_RECIPES,
          aiMetadata: {
            generatedAt: new Date().toISOString(),
            model: 'mock-model (fallback)',
          },
          remainingQueries: 5,
        },
        isMock: true,
      };
    }
  },

  /**
   * 取得 SSE Streaming URL
   * 用於 fetch + ReadableStream 處理
   */
  getStreamUrl: (): string => `${AI_API_BASE}/ai/recipe/stream`,

  /**
   * 檢查是否使用 Mock 模式
   */
  isMockMode: (): boolean => USE_MOCK,
};
