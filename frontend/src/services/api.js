import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  verifyToken: () => 
    api.get('/auth/verify'),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/password', { currentPassword, newPassword }),
};

// Users API
export const usersAPI = {
  getUsers: (page = 1, limit = 20) => 
    api.get(`/users?page=${page}&limit=${limit}`),
  
  getUser: (id) => 
    api.get(`/users/${id}`),
  
  createUser: (userData) => 
    api.post('/users', userData),
  
  updateUser: (id, userData) => 
    api.put(`/users/${id}`, userData),
  
  deleteUser: (id) => 
    api.delete(`/users/${id}`),
};

// Profiles API
export const profileAPI = {
  getProfiles: (category = 'personal') => 
    api.get(`/profiles?category=${category}`),
  
  getProfile: (id) => 
    api.get(`/profiles/${id}`),
  
  createProfile: (profileData) => {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(profileData).forEach(key => {
      if (key === 'screenshots') {
        // Handle multiple screenshots
        profileData.screenshots.forEach(file => {
          formData.append('screenshots', file);
        });
      } else {
        formData.append(key, profileData[key]);
      }
    });

    return api.post('/profiles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  updateProfile: (id, profileData) => {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      if (key === 'screenshots') {
        profileData.screenshots.forEach(file => {
          formData.append('screenshots', file);
        });
      } else {
        formData.append(key, profileData[key]);
      }
    });

    return api.put(`/profiles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteProfile: (id) => 
    api.delete(`/profiles/${id}`),
  
  exportProfile: (id) => 
    api.get(`/profiles/${id}/export`, { responseType: 'blob' }),
  
  openProfileFolder: (id) => 
    api.get(`/profiles/${id}/open-folder`),
};

// Categories API
export const categoryAPI = {
  getCategories: () => 
    api.get('/categories'),
  
  getCategoriesByType: (type) => 
    api.get(`/categories/${type}`),
  
  createCategory: (categoryData) => 
    api.post('/categories', categoryData),
  
  updateCategory: (id, categoryData) => 
    api.put(`/categories/${id}`, categoryData),
  
  deleteCategory: (id) => 
    api.delete(`/categories/${id}`),
};

// Emails API
export const emailAPI = {
  getEmails: (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    return api.get(`/emails?${params}`);
  },
  
  getStats: () => 
    api.get('/emails/stats'),
  
  getAvailableEmail: () => 
    api.get('/emails/available'),
  
  createEmail: (emailData) => 
    api.post('/emails', emailData),
  
  bulkCreateEmails: (emailsData) => 
    api.post('/emails/bulk', { emails: emailsData }),
  
  updateEmail: (id, emailData) => 
    api.put(`/emails/${id}`, emailData),
  
  deleteEmail: (id) => 
    api.delete(`/emails/${id}`),
};

// Fields API
export const fieldAPI = {
  getFields: () => 
    api.get('/fields'),
  
  getFieldsByCategory: (categoryType) => 
    api.get(`/fields/${categoryType}`),
  
  createField: (fieldData) => 
    api.post('/fields', fieldData),
  
  updateField: (id, fieldData) => 
    api.put(`/fields/${id}`, fieldData),
  
  updateFieldOrder: (id, displayOrder) => 
    api.put(`/fields/${id}/order`, { display_order: displayOrder }),
  
  deleteField: (id) => 
    api.delete(`/fields/${id}`),
};

// Statuses API
export const statusAPI = {
  getStatuses: () => 
    api.get('/statuses'),
  
  getStatusesByCategory: (categoryType) => 
    api.get(`/statuses/${categoryType}`),
  
  createStatus: (statusData) => 
    api.post('/statuses', statusData),
  
  updateStatus: (id, statusData) => 
    api.put(`/statuses/${id}`, statusData),
  
  deleteStatus: (id) => 
    api.delete(`/statuses/${id}`),
};

// Reminders API
export const reminderAPI = {
  getReminders: () => 
    api.get('/reminders'),
  
  getPendingReminders: () => 
    api.get('/reminders/pending'),
  
  dismissReminder: (id) => 
    api.put(`/reminders/${id}/dismiss`),
  
  createReminder: (reminderData) => 
    api.post('/reminders', reminderData),
};

export default api;