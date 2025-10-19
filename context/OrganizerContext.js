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
        const cachedData = await AsyncStorage.getItem('organizerStatusCache');
        if (cachedData) {
          const data = JSON.parse(cachedData);
          setIsOrganizer(data.isOrganizer);
          setOrganizerEvents(data.events || []);
        }
        // Always refresh data from server in background
        refreshOrganizerStatus();
      } catch (error) {
        console.error('Error loading cached organizer status:', error);
        setLoading(true);
        checkOrganizerStatus();
      }
    };

    loadCachedData();
  }, []);

  // Function to refresh in background without setting loading to true
  const refreshOrganizerStatus = async () => {
    try {
      const result = await UserService.checkOrganizerStatus(false); // Use cache if available
      setIsOrganizer(result.isOrganizer);
      setOrganizerEvents(result.events || []);
    } catch (error) {
      console.error('Error refreshing organizer status:', error);
    }
  };

  // Full check with loading state
  const checkOrganizerStatus = async (forceRefresh = true) => {
    try {
      setLoading(true);
      const result = await UserService.checkOrganizerStatus(forceRefresh);
      setIsOrganizer(result.isOrganizer);
      setOrganizerEvents(result.events || []);
      return result.isOrganizer;
    } catch (error) {
      console.error('Error checking organizer status:', error);
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
