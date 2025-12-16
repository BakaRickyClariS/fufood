const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const LINE_API_BASE =
  import.meta.env.VITE_LINE_API_BASE_URL || 'https://api.fufood.jocelynh.me';

type RequestConfig = RequestInit & {
  params?: Record<string, string>;
  body?: BodyInit | null;
  useLineApi?: boolean; // 是否使用 LINE API 基底 URL
};

async function request<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<{ data: T }> {
  const { params, useLineApi, ...customConfig } = config;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customConfig.headers as Record<string, string>),
  };

  // 選擇基底 URL
  const baseUrl = useLineApi ? LINE_API_BASE : BASE_URL;
  
  let url = `${baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...customConfig,
    headers,
    credentials: 'include', // 攜帶 HttpOnly Cookie
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  // 處理空回應（如 204 No Content）
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { data };
}

export const apiClient = {
  get: <T>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'GET' }),
  post: <T, B = unknown>(url: string, data?: B, config?: RequestConfig) =>
    request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    }),
  put: <T, B = unknown>(url: string, data?: B, config?: RequestConfig) =>
    request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    }),
  patch: <T, B = unknown>(url: string, data?: B, config?: RequestConfig) =>
    request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    }),
  delete: <T>(url: string, config?: RequestConfig) =>
    request<T>(url, { ...config, method: 'DELETE' }),
};
