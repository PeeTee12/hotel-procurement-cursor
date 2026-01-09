const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || error.error || 'An error occurred')
  }

  return response.json()
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ success: boolean; user: any }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  quickLogin: (userId: number) =>
    fetchApi<{ success: boolean; user: any }>(`/users/quick-login/${userId}`, {
      method: 'POST',
    }),
  getAvailableUsers: () =>
    fetchApi<any[]>('/users/available'),
  me: () =>
    fetchApi<{ success: boolean; user: any }>('/me'),
  logout: () =>
    fetchApi<{ success: boolean }>('/logout', { method: 'POST' }),
}

// Dashboard
export const dashboardApi = {
  get: () =>
    fetchApi<{
      stats: {
        totalOrders: number
        totalAmount: string
        pendingApproval: number
        approvedToday: number
        urgentOrders: number
      }
      recentOrders: any[]
      pendingApproval: any[]
    }>('/dashboard'),
}

// Products
export const productsApi = {
  list: (categoryId?: number, search?: string) => {
    const params = new URLSearchParams()
    if (categoryId) params.append('category', categoryId.toString())
    if (search) params.append('search', search)
    return fetchApi<{ products: any[]; total: number }>(`/products?${params}`)
  },
  getCategories: () =>
    fetchApi<{ categories: any[] }>('/products/categories'),
  get: (id: number) =>
    fetchApi<any>(`/products/${id}`),
}

// Orders
export const ordersApi = {
  list: (userId?: number, status?: string) => {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId.toString())
    if (status) params.append('status', status)
    const queryString = params.toString()
    return fetchApi<{ orders: any[]; total: number }>(`/orders${queryString ? `?${queryString}` : ''}`)
  },
  getPending: () =>
    fetchApi<{ orders: any[]; total: number }>('/orders/pending'),
  get: (id: number) =>
    fetchApi<any>(`/orders/${id}`),
  create: (data: { branchId: number; items: any[]; priority?: string; note?: string; userId?: number }) =>
    fetchApi<{ success: boolean; order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submit: (id: number) =>
    fetchApi<{ success: boolean; order: any }>(`/orders/${id}/submit`, {
      method: 'POST',
    }),
  approve: (id: number) =>
    fetchApi<{ success: boolean; order: any }>(`/orders/${id}/approve`, {
      method: 'POST',
    }),
  reject: (id: number) =>
    fetchApi<{ success: boolean; order: any }>(`/orders/${id}/reject`, {
      method: 'POST',
    }),
}

// Suppliers
export const suppliersApi = {
  list: () =>
    fetchApi<{ suppliers: any[]; stats: { active: number; withErrors: number; total: number } }>('/suppliers'),
  get: (id: number) =>
    fetchApi<any>(`/suppliers/${id}`),
  create: (data: { name: string; category?: string; apiEndpoint?: string }) =>
    fetchApi<{ success: boolean; supplier: any }>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  sync: (id: number) =>
    fetchApi<{ success: boolean; supplier: any }>(`/suppliers/${id}/sync`, {
      method: 'POST',
    }),
}

// Reports
export const reportsApi = {
  get: (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    return fetchApi<{
      stats: {
        totalOrders: number
        totalAmount: string
        averageOrder: string
        savings: string
      }
      byStatus: Record<string, number>
      monthlyData: any[]
      topProducts: any[]
      hotelPerformance: any[]
    }>(`/reports?${params}`)
  },
}

// Branches
export const branchesApi = {
  list: () =>
    fetchApi<{ branches: Array<{ id: number; name: string; address: string; organization: { id: number; name: string } }> }>('/branches'),
  create: (data: { name: string; address?: string }) =>
    fetchApi<{ success: boolean; branch: any }>('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name?: string; address?: string }) =>
    fetchApi<{ success: boolean; branch: any }>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Settings
export const settingsApi = {
  getBranding: () =>
    fetchApi<{
      logo: string | null
      name: string
      primaryColor: string
      secondaryColor: string
      domain: string | null
    }>('/settings/branding'),
  updateBranding: (data: {
    name?: string
    primaryColor?: string
    secondaryColor?: string
    domain?: string
  }) =>
    fetchApi<{ success: boolean; branding: any }>('/settings/branding', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateProfile: (data: { name?: string; email?: string; avatar?: string }) =>
    fetchApi<{ success: boolean; user: any }>('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchApi<{ success: boolean }>('/settings/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getColorSchemes: () =>
    fetchApi<{
      schemes: Array<{
        id: string
        name: string
        primary: string
        secondary: string
      }>
    }>('/settings/color-schemes'),
  getOrganization: () =>
    fetchApi<{
      organization: {
        id: number
        name: string
        logo: string | null
        domain: string | null
        primaryColor: string | null
        secondaryColor: string | null
        createdAt: string
      }
      branches: Array<{
        id: number
        name: string
        address: string | null
        createdAt: string
      }>
    }>('/settings/organization'),
  getUsers: () =>
    fetchApi<{
      users: Array<{
        id: number
        name: string
        email: string
        avatar: string | null
        roles: string[]
        createdAt: string
      }>
    }>('/settings/users'),
  updateUserRoles: (userId: number, roles: string[]) =>
    fetchApi<{ success: boolean; user: any }>(`/settings/users/${userId}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roles }),
    }),
}

// Shipments
export const shipmentsApi = {
  list: () =>
    fetchApi<{
      shipments: Array<{
        id: number
        orderNumber: string | null
        trackingNumber: string | null
        createdAt: string
        updatedAt: string | null
        deliveredAt: string | null
        order: { id: number; orderNumber: string } | null
      }>
      total: number
    }>('/shipments'),
  update: (id: number, data: { orderNumber?: string | null; trackingNumber?: string | null }) =>
    fetchApi<{ success: boolean; shipment: any }>(`/shipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deliver: (id: number) =>
    fetchApi<{ success: boolean; shipment: any }>(`/shipments/${id}/deliver`, {
      method: 'PUT',
    }),
}
