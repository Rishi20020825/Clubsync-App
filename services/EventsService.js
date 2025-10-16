// services/EventsService.js
import { netconfig } from '../netconfig';

/**
 * EventsService
 * Handles all API interactions related to events in the ClubSync application
 */
class EventsService {
  /**
   * Base URL for API requests
   * @private
   */
  _baseUrl = netconfig.API_BASE_URL;
  
  /**
   * Flag to track if we've attempted to find a working URL
   * @private
   */
  _urlChecked = false;
  
  /**
   * Default request timeout in milliseconds
   * @private
   */
  _timeout = 15000;
  
  /**
   * Find and set the best working API URL
   * @private
   */
  async _ensureWorkingUrl() {
    if (!this._urlChecked) {
      console.log('Checking for best API URL...');
      this._baseUrl = await netconfig.findWorkingUrl();
      this._urlChecked = true;
      console.log(`Using API URL: ${this._baseUrl}`);
    }
  }
  
  /**
   * Cache storage for event data
   * @private
   */
  _cache = {
    allEvents: {
      data: null,
      timestamp: null,
      expiryMs: 5 * 60 * 1000 // 5 minutes
    },
    eventDetails: {}
  };

  /**
   * Makes an API request with proper error handling and timeout control
   * @private
   * @param {string} endpoint - API endpoint to call
   * @param {Object} options - Request options
   * @returns {Promise<any>} - Response data
   * @throws {Error} - API or network error
   */
  async _apiRequest(endpoint, options = {}) {
    const url = `${this._baseUrl}${endpoint}`;
    console.log(`Making API request to: ${url}`, options);
    
    const controller = new AbortController();
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      console.log(`Request timeout for ${url}`);
      controller.abort();
    }, this._timeout);
    
    try {
      console.log(`Fetching ${url}...`);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      console.log(`Response status: ${response.status} for ${url}`);
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error response body: ${errorBody}`);
        let errorMessage;
        
        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.message || errorJson.error || `HTTP error! status: ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log(`API response data:`, data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API request failed for ${url}:`, error);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout for ${url}`);
      }
      
      // Check for network connectivity issues
      const isNetworkError = error.message && (
        error.message.includes('Network request failed') || 
        error.message.includes('network') ||
        error.message.includes('connection') ||
        error.message.includes('Failed to fetch') ||
        !global.navigator?.onLine
      );
      
      // Enhance error with additional context
      const enhancedError = new Error(`Error fetching ${endpoint}: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.isNetworkError = isNetworkError;
      enhancedError.endpoint = endpoint;
      enhancedError.url = url;
      
      if (isNetworkError) {
        console.error('Network connectivity issue detected');
      }
      
      throw enhancedError;
    }
  }

  /**
   * Format date from ISO string to user-friendly format
   * @private
   * @param {string} isoString - ISO date string
   * @returns {Object} - Object with date and time properties
   */
  _formatDate(isoString) {
    try {
      const date = new Date(isoString);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } catch (e) {
      console.warn('Error parsing date:', e);
      return { date: 'Unknown date', time: 'Unknown time' };
    }
  }

  /**
   * Normalize event data from API to app's internal format
   * @private
   * @param {Object} apiEvent - Event data from API
   * @returns {Object} - Normalized event object
   */
  _normalizeEvent(apiEvent) {
    if (!apiEvent) return null;
    
    const startDateFormatted = this._formatDate(apiEvent.startDateTime);
    const endDateFormatted = this._formatDate(apiEvent.endDateTime);
    
    return {
      id: apiEvent.id,
      title: apiEvent.title,
      description: apiEvent.description,
      date: startDateFormatted.date,
      time: startDateFormatted.time,
      endDate: endDateFormatted.date,
      endTime: endDateFormatted.time,
      location: apiEvent.venue,
      venue: apiEvent.venue,
      category: apiEvent.category,
      maxCapacity: apiEvent.maxParticipants,
      registeredCount: apiEvent.registeredCount,
      isActive: true, // Default to true unless explicitly set false in API
      coverImage: apiEvent.coverImage || null,
      organizer: {
        id: apiEvent.club?.id,
        name: apiEvent.club?.name,
        type: 'club',
        profileImage: apiEvent.club?.profileImage
      }
    };
  }

  /**
   * Check if cached data is valid
   * @private
   * @param {Object} cacheEntry - Cache entry with data and timestamp
   * @returns {boolean} - True if cache is valid
   */
  _isCacheValid(cacheEntry) {
    if (!cacheEntry || !cacheEntry.timestamp || !cacheEntry.data) {
      return false;
    }
    
    const now = new Date().getTime();
    return (now - cacheEntry.timestamp) < cacheEntry.expiryMs;
  }

  /**
   * Fetch a specific event by ID
   * @public
   * @param {string} eventId - ID of the event to fetch
   * @param {boolean} [forceRefresh=false] - Force refresh bypassing cache
   * @returns {Promise<Object>} - Event details
   * @throws {Error} - If fetch fails
   */
  async fetchEventById(eventId, forceRefresh = false) {
    try {
      // Ensure we're using the best working API URL
      await this._ensureWorkingUrl();
      
      // Check cache first
      const cacheKey = `event_${eventId}`;
      const cachedEvent = this._cache.eventDetails[cacheKey];
      
      if (!forceRefresh && this._isCacheValid(cachedEvent)) {
        return cachedEvent.data;
      }
      
      // Try different endpoint patterns to handle different API structures
      const endpoints = [
        `/api/events/all/${eventId}`,              // Prioritize the /all endpoint
        `/api/events/${eventId}`,                  // Standard REST pattern
        `/api/events/details/${eventId}`,          // Common pattern for detail endpoints
        `/api/events?id=${eventId}`,               // Query parameter approach
        `/api/events/event/${eventId}`             // Another common pattern
      ];
      
      let response = null;
      let lastError = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint for event details: ${endpoint}`);
          response = await this._apiRequest(endpoint);
          
          // If we get here without an error being thrown, we succeeded
          console.log(`Successful response from ${endpoint}`);
          break;
        } catch (err) {
          lastError = err;
          console.warn(`Endpoint ${endpoint} failed:`, err.message);
          // Continue to next endpoint
        }
      }
      
      // If all endpoints failed, throw the last error
      if (!response) {
        throw lastError || new Error(`Failed to fetch event with id ${eventId}`);
      }
      
      // Handle different response formats
      let eventData = null;
      
      if (response.event) {
        // Standard format: { event: {...} }
        eventData = response.event;
      } else if (response.data) {
        // Alternative format: { data: {...} }
        eventData = response.data;
      } else if (!Array.isArray(response) && typeof response === 'object') {
        // Direct event object in response
        eventData = response;
      } else if (Array.isArray(response) && response.length > 0) {
        // Array response (unexpected but handle it)
        eventData = response[0];
      }
      
      if (!eventData) {
        throw new Error(`Invalid event data received for ID ${eventId}`);
      }
      
      // Normalize and cache the event
      const normalizedEvent = this._normalizeEvent(eventData);
      
      this._cache.eventDetails[cacheKey] = {
        data: normalizedEvent,
        timestamp: new Date().getTime(),
        expiryMs: 5 * 60 * 1000 // 5 minutes
      };
      
      return normalizedEvent;
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  }

  /**
   * Fetch all events with optional filtering
   * @public
   * @param {Object} params - Search parameters
   * @param {string} [params.search] - Search term
   * @param {string} [params.category] - Category filter
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=20] - Number of items per page
   * @param {boolean} [forceRefresh=false] - Force refresh bypassing cache
   * @returns {Promise<Array<Object>>} - List of events
   * @throws {Error} - If fetch fails
   */
  async fetchAllEvents(params = {}, forceRefresh = false) {
    try {
      // Ensure we're using the best working API URL
      await this._ensureWorkingUrl();
      
      // Try different endpoint formats since we're not sure about the exact API structure
      let response = null;
      let error = null;
      
      // Build query string
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      
      const page = params.page || 1;
      const limit = params.limit || 20;
      
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      // Generate cache key based on params
      const cacheKey = queryParams.toString();
      
      // Check cache if not forcing refresh
      if (!forceRefresh && cacheKey === '' && this._isCacheValid(this._cache.allEvents)) {
        console.log('Returning cached events data');
        return this._cache.allEvents.data;
      }
      
      console.log('Cache not valid or force refresh requested, fetching from API');
      
      // Try multiple endpoint patterns to handle different API structures
      const endpoints = [
        `/api/events/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, // Prioritize the /all endpoint
        `/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, // Fallback to standard REST pattern
        `/api/events/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, // Alternative common pattern
      ];
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await this._apiRequest(endpoint);
          
          // If we get here without an error being thrown, we succeeded
          console.log(`Successful response from ${endpoint}`);
          break;
        } catch (err) {
          error = err;
          console.warn(`Endpoint ${endpoint} failed:`, err.message);
          // Continue to next endpoint
        }
      }
      
      // If we've tried all endpoints and still have no response, throw the last error
      if (!response) {
        throw error || new Error('All API endpoints failed');
      }
      
      // Handle various API response structures
      let eventsData = [];
      
      // Check different possible response formats
      if (response.events && Array.isArray(response.events)) {
        eventsData = response.events;
      } else if (response.data && Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (Array.isArray(response)) {
        eventsData = response;
      } else {
        console.error('Unexpected API response structure:', response);
        throw new Error('Invalid events data format received');
      }
      
      console.log(`Found ${eventsData.length} events in API response`);
      
      // Normalize each event
      const normalizedEvents = eventsData.map(event => this._normalizeEvent(event));
      
      // Cache only if it's the default request with no filters
      if (cacheKey === '') {
        this._cache.allEvents = {
          data: normalizedEvents,
          timestamp: new Date().getTime(),
          expiryMs: 5 * 60 * 1000 // 5 minutes
        };
      }
      
      return normalizedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   * @public
   */
  clearCache() {
    this._cache = {
      allEvents: {
        data: null,
        timestamp: null,
        expiryMs: 5 * 60 * 1000
      },
      eventDetails: {}
    };
  }
}

// Create singleton instance
const eventsService = new EventsService();

export default eventsService;
