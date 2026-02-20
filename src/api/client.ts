/**
 * Fufood 統一 API 客戶端
 *
 * 目前已整合為單一後端 (AI API)，所有請求皆透過此客戶端發送。
 * Base URL: VITE_AI_API_BASE_URL (預設 /api/v1 -> 將逐漸遷移至 /api/v2)
 */

import { identity } from '@/shared/utils/identity';

// API 類型定義 (已整合，保留 interface 供擴充)
// type ApiType = 'unified';

// API 基底 URL 配置
const API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || '/api';

type ApiBody = BodyInit | Record<string, unknown> | null | undefined;

type RequestOptions = Omit<RequestInit, 'body'> & {
  params?: Record<string, string | number | boolean | undefined>;
  body?: ApiBody;
};

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public data?: any;

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

/**
 * 統一 API 客戶端
 */

// V2 API Response Wrapper
interface V2ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

// Type guard for V2 response
function isV2Response<T>(data: any): data is V2ApiResponse<T> {
  return (
    data && typeof data === 'object' && 'success' in data && 'data' in data
  );
}

/**
 * 統一 API 客戶端
 */
class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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

    const userId = identity.getUserId();

    let resolvedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      // X-User-Id 用於識別當前操作的冰箱/群組 context (AI Backend 需求)
      ...(userId ? { 'X-User-Id': userId } : {}),
      ...headers,
    };

    // 如果 body 是 FormData，不要合併自訂 headers 中的 Content-Type
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
        throw new ApiError(
          errorData.message || `API Error: ${response.status}`,
          response.status,
          errorData.code,
          errorData,
        );
      }

      // Handle 204 No Content or empty body
      if (
        response.status === 204 ||
        response.headers.get('content-length') === '0'
      ) {
        return {} as T;
      }

      // 嘗試解析 JSON
      const text = await response.text();
      if (!text || text.trim() === '') {
        return {} as T;
      }

      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        // JSON 解析失敗，回傳空物件
        return {} as T;
      }

      // Auto-unwrap V2 response
      // Strategy: certain endpoints are V2 and wrapped in { success, data }.
      // We automatically unwrap 'data' if strictly matches V2 structure.
      // This allows api.get<User> to return User, even if backend sent { success:true, data: User }
      if (isV2Response<T>(json)) {
        return json.data;
      }

      // For V1 or non-conforming responses (e.g. { items: [] } or just Array), return as is.
      return json as T;
    } catch (error) {
      console.error(
        `[API] Request Failed: ${config.method} ${url.toString()}`,
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
 * 主要 API 客戶端
 */
export const api = new ApiClient(API_BASE_URL);

/**
 * @deprecated 請改用 import { api } from '@/api/client'
 * 相容性別名：指向同一實例
 */
export const aiApi = api;

/**
 * @deprecated 請改用 import { api } from '@/api/client'
 * 相容性別名：指向同一實例 (已移除舊版 C# Backend 客戶端)
 */
export const backendApi = api;

/**
 * @deprecated 請改用 api
 */
export const apiClient = api;
