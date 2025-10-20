import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService from '../services/UserService';

// Create context
const OrganizerContext = createContext({
  isOrganizer: false,
  organizerEvents: [],
  loading: false,
  checkStatus: () => {},
});

// Create provider component
export const OrganizerProvider = ({ children }) => {
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [loading, setLoading] = useState(false); // Start as false until we've checked cache

  // Load cached data immediately
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        // First check if user is authenticated before trying to get organizer status
        const token = await AsyncStorage.getItem('token');
        
        // If not authenticated, don't try to check organizer status yet
        if (!token) {
          console.log('No auth token found, skipping organizer status check');
          setIsOrganizer(false);
          setOrganizerEvents([]);
          setLoading(false);
          return;
        }
        
        // If authenticated, try to get cached data
        const cachedData = await AsyncStorage.getItem('organizerStatusCache');
        if (cachedData) {
          const data = JSON.parse(cachedData);
          setIsOrganizer(data.isOrganizer);
          setOrganizerEvents(data.events || []);
        }
        
        // Always refresh data from server in background, but only if authenticated
        refreshOrganizerStatus();
      } catch (error) {
        console.error('Error loading cached organizer status:', error);
        setLoading(true);
        checkOrganizerStatus();
      }
    };

    loadCachedData();
    
    // Add a listener for authentication changes
    const authListener = async () => {
      // Check authentication status periodically
      const checkAuthInterval = setInterval(async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // If newly authenticated, refresh organizer status
          refreshOrganizerStatus();
          clearInterval(checkAuthInterval);
        }
      }, 2000); // Check every 2 seconds
      
      // Clean up interval on unmount
      return () => clearInterval(checkAuthInterval);
    };
    
    authListener();
  }, []);

  // Function to refresh in background without setting loading to true
  const refreshOrganizerStatus = async () => {
    try {
      // Check if user is authenticated first
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Not authenticated, skipping organizer status refresh');
        return;
      }
      
      const result = await UserService.checkOrganizerStatus(false); // Use cache if available
      setIsOrganizer(result.isOrganizer);
      setOrganizerEvents(result.events || []);
    } catch (error) {
      console.error('Error refreshing organizer status:', error);
      // Don't update state on error, keep previous values
    }
  };

  // Full check with loading state
  const checkOrganizerStatus = async (forceRefresh = true) => {
    try {
      // Check authentication first
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Not authenticated, returning default non-organizer status');
        setIsOrganizer(false);
        setOrganizerEvents([]);
        return false;
      }
      
      setLoading(true);
      const result = await UserService.checkOrganizerStatus(forceRefresh);
      setIsOrganizer(result.isOrganizer);
      setOrganizerEvents(result.events || []);
      return result.isOrganizer;
    } catch (error) {
      console.error('Error checking organizer status:', error);
      // Keep current state on error
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrganizerContext.Provider
      value={{
        isOrganizer,
        organizerEvents,
        loading,
        checkStatus: checkOrganizerStatus,
      }}
    >
      {children}
    </OrganizerContext.Provider>
  );
};

// Custom hook to use the organizer context
export const useOrganizer = () => useContext(OrganizerContext);

export default OrganizerContext;
