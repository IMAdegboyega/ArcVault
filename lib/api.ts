const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Core fetch wrapper with auth token handling
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Send cookies
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Handle token expiry — attempt refresh
    if (response.status === 401 && token) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry original request with new token
        const newToken = localStorage.getItem('accessToken');
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, config);
        return retryResponse.json();
      } else {
        // Refresh failed — clear auth and redirect
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        return { success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired' } };
      }
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Failed to connect to server' },
    };
  }
}

async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success && data.data.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ==================== Auth ====================

export async function apiRegister(params: SignUpParams) {
  const res = await apiFetch<{ user: User; accessToken: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (res.success && res.data?.accessToken) {
    localStorage.setItem('accessToken', res.data.accessToken);
  }

  return res;
}

export async function apiLogin(params: LoginUser) {
  const res = await apiFetch<{ user: User; accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (res.success && res.data?.accessToken) {
    localStorage.setItem('accessToken', res.data.accessToken);
  }

  return res;
}

export async function apiLogout() {
  const res = await apiFetch('/auth/logout', { method: 'POST' });
  localStorage.removeItem('accessToken');
  return res;
}

export async function apiGetProfile() {
  return apiFetch<{ user: User; bankAccounts: Account[] }>('/user/profile');
}

export async function apiUpdateProfile(data: Partial<User>) {
  return apiFetch<{ user: User }>('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==================== Banking ====================

export async function apiCreateLinkToken() {
  return apiFetch<{ linkToken: string; expiration: string; institutions: { id: string; name: string; logo: string }[] }>(
    '/banking/create-link-token',
    { method: 'POST' }
  );
}

export async function apiConnectBank(publicToken: string, institutionId: string) {
  return apiFetch('/banking/connect', {
    method: 'POST',
    body: JSON.stringify({ publicToken, institutionId }),
  });
}

export async function apiGetInstitutions() {
  return apiFetch<{ institutions: { id: string; name: string; logo: string }[] }>('/banking/institutions');
}

// ==================== Banks ====================

export async function apiGetBanks() {
  return apiFetch<{ banks: Account[]; totalBanks: number; totalCurrentBalance: number }>('/banks');
}

export async function apiGetBank(id: string) {
  return apiFetch<{ bank: Account & { transactions: Transaction[] } }>(`/banks/${id}`);
}

export async function apiDeleteBank(id: string) {
  return apiFetch(`/banks/${id}`, { method: 'DELETE' });
}

export async function apiSyncBank(id: string) {
  return apiFetch(`/banks/${id}/sync`, { method: 'POST' });
}

// ==================== Accounts ====================

export async function apiGetAccounts() {
  return apiFetch<{ accounts: Account[]; totalBanks: number; totalCurrentBalance: number }>('/accounts');
}

export async function apiGetAccount(id: string) {
  return apiFetch<{ account: Account }>(`/accounts/${id}`);
}

export async function apiGetAccountTransactions(
  id: string,
  params?: { page?: number; limit?: number; startDate?: string; endDate?: string; category?: string }
) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  if (params?.category) query.set('category', params.category);

  return apiFetch<{
    transactions: Transaction[];
    pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
  }>(`/accounts/${id}/transactions?${query.toString()}`);
}

// ==================== Transfers ====================

export async function apiCreateTransfer(params: {
  senderAccountId: string;
  receiverAccountId?: string;
  email?: string;
  shareableId?: string;
  amount: number;
  description?: string;
}) {
  return apiFetch<{ transfer: Transfer }>('/transfers', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function apiGetTransfers(page = 1, limit = 10) {
  return apiFetch<{
    transfers: Transfer[];
    pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
  }>(`/transfers?page=${page}&limit=${limit}`);
}

export async function apiGetTransfer(id: string) {
  return apiFetch<{ transfer: Transfer }>(`/transfers/${id}`);
}
