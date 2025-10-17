// services/api.js
import { netconfig } from '../netconfig';
import eventsService from './EventsService';

// API Configuration
export const API_CONFIG = {
  BASE_URL: netconfig.API_BASE_URL,
  ENDPOINTS: {
    EVENTS: '/api/events/all',
    EVENT_DETAIL: '/api/events', // append /:id for specific event
    CATEGORIES: '/api/events/categories',
    REGISTER: '/api/events/register',
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/auth/profile'
    }
  }
};

// Generic API fetch utility
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: error.message };
  }
};

// Events API functions that utilize the EventsService
export const eventsApi = {
  // Get all events
  getAll: async (filters = {}) => {
    try {
      const events = await eventsService.fetchAllEvents(filters);
      return { success: true, data: { events } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get event by ID
  getById: async (id) => {
    try {
      const event = await eventsService.fetchEventById(id);
      return { success: true, data: { event } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get categories
  getCategories: async () => {
    return apiRequest(API_CONFIG.ENDPOINTS.CATEGORIES);
  },

  // Register for event
  register: async (eventId, userData) => {
    return apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ eventId, ...userData })
    });
  },
  
  // Clear event cache
  clearCache: () => {
    eventsService.clearCache();
    return { success: true };
  }
};

// Error handling utility
export const handleApiError = (error, showAlert = true) => {
  console.error('API Error:', error);
  
  if (showAlert) {
    // You can customize this based on your alert system
    return {
      title: 'Connection Error',
      message: 'Unable to connect to server. Please check your internet connection and try again.',
      actions: [
        { text: 'OK', style: 'default' }
      ]
    };
  }
  
  return error;
};

// Export the EventsService directly for more advanced usage
export { eventsService };
