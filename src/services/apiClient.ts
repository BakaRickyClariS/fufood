const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type RequestConfig = RequestInit & {
  params?: Record<string, string>;
};

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<{ data: T }> {
  const { params, ...customConfig } = config;
  const headers = {
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
  get: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'GET' }),
  post: <T>(url: string, data?: any, config?: RequestConfig) => request<T>(url, { ...config, method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data?: any, config?: RequestConfig) => request<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'DELETE' }),
};
