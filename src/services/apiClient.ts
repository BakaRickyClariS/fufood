const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type RequestConfig = RequestInit & {
  params?: Record<string, string>;
  body?: BodyInit | null;
};

async function request<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<{ data: T }> {
  const { params, ...customConfig } = config;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customConfig.headers as Record<string, string>),
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...customConfig,
    headers,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();
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
