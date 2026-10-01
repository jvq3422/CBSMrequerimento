const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erro HTTP ${response.status}`);
  }

  return data;
}

export const api = {
  // System
  getSystemInfo: () => request('/system/info'),
  resetDatabase: () => request('/system/reset', { method: 'POST' }),

  // Auth & Users
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  registerMaster: (data) => request('/auth/register-master', { method: 'POST', body: data }),
  getUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: data }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Obras
  getObras: () => request('/obras'),
  createObra: (data) => request('/obras', { method: 'POST', body: data }),

  // Catalog
  getCatalog: (category) => request(`/catalog${category ? `?category=${category}` : ''}`),
  createCatalogItem: (data) => request('/catalog', { method: 'POST', body: data }),
  updateCatalogItem: (id, updates) => request(`/catalog/${id}`, { method: 'PUT', body: updates }),
  deleteCatalogItem: (id) => request(`/catalog/${id}`, { method: 'DELETE' }),

  // Requisitions
  getRequisitions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.obraId) params.append('obraId', filters.obraId);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    const qs = params.toString();
    return request(`/requisitions${qs ? `?${qs}` : ''}`);
  },
  getRequisitionById: (id) => request(`/requisitions/${id}`),
  createRequisition: (data) => request('/requisitions', { method: 'POST', body: data }),
  reviewRequisition: (id, reviewData) => request(`/requisitions/${id}/review`, { method: 'POST', body: reviewData })
};
