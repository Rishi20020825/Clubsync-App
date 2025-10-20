import { netconfig } from '../netconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserService = {
  /**
   * Check if the current user is an organizer for any events
   * @param {boolean} forceRefresh - If true, bypass cache and force a new API call
   * @returns {Promise<{isOrganizer: boolean, events: Array}>} Object containing organizer status and events
   */
  async checkOrganizerStatus(forceRefresh = false) {
    try {
      // Try to get cached data first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = await AsyncStorage.getItem('organizerStatusCache');
        const cachedTimestamp = await AsyncStorage.getItem('organizerStatusTimestamp');
        
        // Use cache if it exists and is less than 30 minutes old
        if (cachedData && cachedTimestamp) {
          const parsedData = JSON.parse(cachedData);
          const timestamp = parseInt(cachedTimestamp);
          const now = Date.now();
          const thirtyMinutesInMs = 30 * 60 * 1000;
          
          if (now - timestamp < thirtyMinutesInMs) {
            console.log('Using cached organizer status');
            return parsedData;
          }
        }
      }
      
      // Get fresh data if no cache or cache expired
      const token = await AsyncStorage.getItem('token');
      
      // Return default non-organizer data if no token instead of throwing error
      if (!token) {
        console.log('User not authenticated, returning default non-organizer status');
        return { isOrganizer: false, events: [] };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${netconfig.API_BASE_URL}/api/users/check-organizer`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      await AsyncStorage.setItem('organizerStatusCache', JSON.stringify(data));
      await AsyncStorage.setItem('organizerStatusTimestamp', Date.now().toString());
      
      return data;
    } catch (error) {
      console.error('Failed to check organizer status:', error);
      
      // Try to use cached data as fallback if fetch fails
      try {
        const cachedData = await AsyncStorage.getItem('organizerStatusCache');
        if (cachedData) {
          console.log('Using cached organizer status after fetch failure');
          return JSON.parse(cachedData);
        }
      } catch (cacheError) {
        console.error('Error reading cache:', cacheError);
      }
      
      return { isOrganizer: false, events: [] };
    }
  }
};

export default UserService;
