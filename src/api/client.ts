/**
 * Fufood 統一 API 客戶端
 *
 * 目前已整合為單一後端 (AI API)，所有請求皆透過此客戶端發送。
 * Base URL: VITE_API_BASE_URL (e.g. http://localhost:3000 for local, https://api.fufood.jocelynh.me for prod)
 */
import { identity } from '@/shared/utils/identity';

// API 類型定義 (已整合，保留 interface 供擴充)
// type ApiType = 'unified';

// API 基底 URL 配置（後端 host，不含路徑；空字串代表走 Vite proxy）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
// CSRF Token in-memory cache
let csrfTokenCache: string | null = null;
let isFetchingCsrf = false;
let csrfQueue: Array<() => void> = [];

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 確保 CSRF Token 存在，如果不存在則呼叫後端取得
   */
  private async ensureCsrfToken(): Promise<void> {
    if (csrfTokenCache) return;

    if (isFetchingCsrf) {
      return new Promise((resolve) => {
        csrfQueue.push(resolve);
      });
    }

    isFetchingCsrf = true;
    try {
      const resp = await fetch(`${this.baseUrl}/api/v2/auth/csrf-token`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (resp.ok) {
        const result = await resp.json();
        // 依照後端規格調整取值，通常是 result.data.csrfToken 或 result.csrfToken
        csrfTokenCache = result.data?.csrfToken || result.csrfToken || null;
        console.log('[ApiClient] CSRF Token fetched successfully.');
      }
    } catch (e) {
      console.warn('[ApiClient] Failed to fetch CSRF token:', e);
    } finally {
      isFetchingCsrf = false;
      csrfQueue.forEach((cb) => cb());
      csrfQueue = [];
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, headers, body, ...customConfig } = options;

    // Build URL with query params
    let urlString = `${this.baseUrl}${endpoint}`;

    if (params) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      ) as Record<string, string>;

      const searchParams = new URLSearchParams(filteredParams).toString();
      if (searchParams) {
        urlString += (urlString.includes('?') ? '&' : '?') + searchParams;
      }
    }

    const url = urlString;

    let resolvedHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    };

    // 如果 body 是 FormData，不要合併自訂 headers 中的 Content-Type
    if (body instanceof FormData) {
      resolvedHeaders = Object.fromEntries(
        Object.entries(resolvedHeaders).filter(
          ([key]) => key.toLowerCase() !== 'content-type',
        ),
      );
    }

    // 定義不需要攜帶 Token 的 public endpoints 和 CSRF 獲取端點
    const publicEndpoints = [
      '/api/v2/auth/login',
      '/api/v2/auth/register',
      '/api/v2/auth/line/init',
      '/api/v2/auth/line/callback',
      '/api/v2/auth/csrf-token',
    ];

    const isPublicEndpoint = publicEndpoints.some((e) => endpoint.includes(e));

    // 注入 JWT 認證（v2 規範）
    const token = identity.getAuthToken();
    if (token && !isPublicEndpoint) {
      resolvedHeaders = {
        ...resolvedHeaders,
        Authorization: `Bearer ${token}`,
      };
    }

    // 判斷是否為會改變狀態的請求方法
    const methodStr = customConfig.method?.toUpperCase() || 'GET';
    const requiresCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(methodStr);

    // [重要] 如果是 mutating request 且不是打 CSRF endpoints 本身或公開路由，確保 CSRF Token 存在並加上
    if (requiresCsrf && !isPublicEndpoint) {
      await this.ensureCsrfToken();
      if (csrfTokenCache) {
        resolvedHeaders['x-csrf-token'] = csrfTokenCache;
      } else {
        console.warn(
          '[ApiClient] 正在送出 POST 請求，但尚未準備好 CSRF Token！',
        );
      }
    }

    const config: RequestInit = {
      ...customConfig,
      credentials: 'include', // 允許攜帶 HttpOnly Cookie (備援 v1)
      headers: resolvedHeaders,
    };

    // Don't stringify FormData
    if (body !== undefined && body !== null) {
      if (body instanceof FormData) {
        config.body = body;
      } else if (config.method !== 'GET') {
        config.body =
          typeof body === 'object' ? JSON.stringify(body) : (body as BodyInit);
      } else {
        config.body = body as BodyInit;
      }
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details (422 info):', errorData);
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
      console.error(`[API] Request Failed: ${config.method} ${url}`, error);
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
