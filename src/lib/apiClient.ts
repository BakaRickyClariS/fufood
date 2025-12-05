import { getAuthToken } from '../modules/auth/utils/authUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, body, ...customConfig } = options;

    // Build URL with query params
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Get token (if available)
    const token = getAuthToken();

    const config: RequestInit = {
      ...customConfig,
      headers: {
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // 如果 body 是 FormData，不要合併自訂 headers 中的 Content-Type
        // 讓瀏覽器自動設定正確的 multipart/form-data boundary
        ...(headers && !(body instanceof FormData) ? headers : 
            headers && body instanceof FormData ? 
              Object.fromEntries(
                Object.entries(headers).filter(([key]) => key.toLowerCase() !== 'content-type')
              ) : {}),
      },
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

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  }

  get<T>(endpoint: string, params?: RequestOptions['params'], options?: Omit<RequestOptions, 'params'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(BASE_URL);
