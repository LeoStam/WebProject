const API_BASE_URL = 'http://localhost:3000/api';

export const apiService = {
  // Generic API request handler
  async request(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (requireAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    };

    

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Auth endpoints
  register: async (userData) => {
    return this.request('/auth/register', 'POST', userData);
  },

  // User management
  getAllUsers: async (token) => {
    return this.request('/users', 'GET', null, token);
  },

  // ΠΡΟΣΘΗΚΗ: Λήψη αυτοκινήτων χρήστη
  getUserCars: async () => {
    return this.request('/api/cars', 'GET', null, true);
  },

  // ΠΡΟΣΘΗΚΗ: Δημιουργία ραντεβού
  createAppointment: async (data) => {
    return this.request('/api/appointments', 'POST', data, true);
  },

  // ΠΡΟΣΘΗΚΗ: Λήψη ραντεβού χρήστη
  getUserAppointments: async () => {
    return this.request('/api/appointments', 'GET', null, true);
  }
};

export const authService = {
  requestPasswordReset: (email) => api.post('/auth/request-reset', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};