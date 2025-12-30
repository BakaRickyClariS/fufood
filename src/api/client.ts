/**
 * Fufood 統一 API 客戶端
 *
 * 提供兩個 API 實例：
 * - aiApi: AI 服務（OCR、食譜生成、媒體上傳）
 * - backendApi: 後端服務（認證、庫存、群組、食譜等）
 *
 * @example
 * // AI 服務呼叫
 * import { aiApi } from '@/api/client';
 * const result = await aiApi.post('/api/v1/ai/analyze-image', formData);
 *
 * // 後端服務呼叫
 * import { backendApi } from '@/api/client';
 * const user = await backendApi.get('/api/v1/profile');
 */

import { identity } from '@/shared/utils/identity';

// API 類型定義
type ApiType = 'ai' | 'backend';

// API 基底 URL 配置
const API_BASES: Record<ApiType, string> = {
  ai: import.meta.env.VITE_AI_API_BASE_URL || '/api/v1',
  backend:
    import.meta.env.VITE_BACKEND_API_BASE_URL ||
    'https://api.fufood.jocelynh.me',
};

type ApiBody = BodyInit | Record<string, unknown> | null | undefined;

type RequestOptions = Omit<RequestInit, 'body'> & {
  params?: Record<string, string | number | boolean | undefined>;
  body?: ApiBody;
};

/**
 * 統一 API 客戶端
 * 支援 AI API 和後端 API 兩種類型
 */
class ApiClient {
  private readonly baseUrl: string;
  private readonly apiType: ApiType;

  constructor(apiType: ApiType) {
    this.apiType = apiType;
    this.baseUrl = API_BASES[apiType];
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, headers, body, ...customConfig } = options;

    // Build URL with query params
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      ) as Record<string, string>;
      if (Object.keys(filteredParams).length > 0) {
        url.search = new URLSearchParams(filteredParams).toString();
      }
    }

    let token: string | null = '';
    let userId: string | null = '';

    // Access tokens and user IDs are only used in the AI API. The backend API relies on HTTP-only cookies.
    if (this.apiType === 'ai') {
      // 使用統一的 identity 模組取得認證資訊
      token = identity.getAuthToken();
      userId = identity.getUserId();

      if (!userId) {
        // Debug: 僅在 AI API 且缺少必要資訊時警告
        console.warn(
          '[AI API] No user ID found, AI backend may reject this request',
        );
      }
    }

    let resolvedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // 嘗試為所有 API 都帶上 X-User-Id (若有)，以防後端某些 middleware 需要
      ...(userId ? { 'X-User-Id': userId } : {}),
      ...headers,
    };

    // 如果 body 是 FormData，不要合併自訂 headers 中的 Content-Type
    // 讓瀏覽器自動設定正確的 multipart/form-data boundary
    if (body instanceof FormData) {
      resolvedHeaders = Object.fromEntries(
        Object.entries(resolvedHeaders).filter(
          ([key]) => key.toLowerCase() !== 'content-type',
        ),
      );
    }

    const config: RequestInit = {
      ...customConfig,
      credentials: 'include', // 允許攜帶 HttpOnly Cookie
      headers: resolvedHeaders,
    };

    // Don't stringify FormData
    if (body && !(body instanceof FormData) && config.method !== 'GET') {
      config.body = JSON.stringify(body);
    } else if (body) {
      config.body = body as BodyInit;
    }

    try {
      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      // Handle 204 No Content or empty body
      if (
        response.status === 204 ||
        response.headers.get('content-length') === '0'
      ) {
        return {} as T;
      }

      // 嘗試解析 JSON，若失敗則回傳空物件
      const text = await response.text();
      if (!text || text.trim() === '') {
        return {} as T;
      }

      try {
        return JSON.parse(text);
      } catch {
        // JSON 解析失敗，可能是空回應或非 JSON 格式
        return {} as T;
      }
    } catch (error) {
      console.error(
        `[${this.apiType.toUpperCase()} API] Request Failed:`,
        error,
      );
      throw error;
    }
  }

  get<T>(
    endpoint: string,
    params?: RequestOptions['params'],
    options?: Omit<RequestOptions, 'params'>,
  ) {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  post<T>(endpoint: string, body?: ApiBody, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  }

  put<T>(endpoint: string, body?: ApiBody, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  patch<T>(endpoint: string, body?: ApiBody, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * 取得當前 API 基底 URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// ============================================================
// 匯出 API 客戶端實例
// ============================================================

/**
 * AI API 客戶端
 * 用於：OCR 辨識、AI 食譜生成、媒體上傳
 */
export const aiApi = new ApiClient('ai');

/**
 * 後端 API 客戶端
 * 用於：認證、庫存管理、群組管理、食譜查詢、購物清單等
 */
export const backendApi = new ApiClient('backend');

/**
 * @deprecated 請使用 aiApi 或 backendApi
 * 為了向後相容保留，預設為 AI API
 */
export const apiClient = aiApi;
