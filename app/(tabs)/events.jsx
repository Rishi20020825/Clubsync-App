// app/(tabs)/events.js - Events List Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { eventsService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utility function to properly capitalize category names
const capitalizeCategory = (category) => {
  if (!category) return '';

  // Special handling for multi-word categories
  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getCategoryColor = (category) => {
  // Standard predefined colors
  const colors = {
    'Environment': '#10b981',
    'Community Service': '#f59e0b',
    'Education': '#8b5cf6',
    'Animal Welfare': '#ec4899',
    'Health': '#ef4444'
  };

  // If category exists in our predefined colors, use it (case-insensitive)
  if (category) {
    const capitalizedCategory = capitalizeCategory(category);
    if (colors[capitalizedCategory]) {
      return colors[capitalizedCategory];
    }
  }

  // Generate a deterministic color based on the category name for consistency
  if (category) {
    // Simple hash function to generate a color based on the category name
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color (ensuring it's not too light or dark)
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 45%)`;
  }

  // Default fallback
  return '#6b7280';
};

const getCategoryGradient = (category) => {
  // Standard predefined gradients
  const gradients = {
    'Environment': ['#10b981', '#059669'],
    'Community Service': ['#f59e0b', '#d97706'],
    'Education': ['#8b5cf6', '#7c3aed'],
    'Animal Welfare': ['#ec4899', '#db2777'],
    'Health': ['#ef4444', '#dc2626']
  };

  // If category exists in our predefined gradients, use it (case-insensitive)
  if (category) {
    const capitalizedCategory = capitalizeCategory(category);
    if (gradients[capitalizedCategory]) {
      return gradients[capitalizedCategory];
    }
  }

  // Generate a gradient based on the category color
  if (category) {
    const baseColor = getCategoryColor(category);

    // Create a slightly darker shade for the second color in the gradient
    // For HSL colors
    if (baseColor.startsWith('hsl')) {
      const lightnessMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (lightnessMatch) {
        const hue = lightnessMatch[1];
        const saturation = lightnessMatch[2];
        const lightness = Math.max(parseInt(lightnessMatch[3]) - 10, 30);
        return [baseColor, `hsl(${hue}, ${saturation}%, ${lightness}%)`];
      }
    }

    // For hex colors or fallback
    return [baseColor, baseColor]; // Same color as fallback
  }

  // Default fallback
  return ['#6b7280', '#4b5563'];
};

const EventCard = ({ event, onPress, onImageError, isRegistered }) => {
  // Support both field naming conventions (API vs mock data)
  const currentCount = event.currentVolunteers ?? event.registeredCount ?? 0;
  const maxCount = event.maxVolunteers ?? event.maxCapacity ?? 0;
  const isFull = maxCount > 0 && currentCount >= maxCount;
  const categoryGradient = getCategoryGradient(event.category);
  const progressPercentage = maxCount > 0 ? (currentCount / maxCount) * 100 : 0;

  // Get appropriate default image based on category
  const getDefaultImage = (category) => {
    if (!category) return require('../../assets/2.png');

    // Create a deterministic selection of default images based on category name
    // This ensures the same category always gets the same default image
    const defaultImages = [
      require('../../assets/events.png'),
    ];

    // Otherwise, choose an image deterministically based on the category name
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % defaultImages.length;
    return defaultImages[index];
  };

  // Handle image loading errors
  const [imageError, setImageError] = useState(false);

  // Get the appropriate image source
  const getImageSource = useCallback(() => {
    // If there was an error loading the image or no image URL exists
    if (imageError || event.hasImageError || (!event.coverImage && !event.image)) {
      return getDefaultImage(event.category);
    }

    // Try to use the provided image URL
    return { uri: event.coverImage || event.image };
  }, [event.coverImage, event.image, imageError, event.hasImageError, event.category]);

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={styles.eventImageContainer}>
        <Image
          source={getImageSource()}
          style={styles.eventImage}
          resizeMode="cover"
          onError={() => {
            console.log(`Image failed to load for event: ${event.id} - ${event.title}`);
            setImageError(true);
            if (onImageError) onImageError();
          }}
        />
        <View style={styles.imageOverlay} />
        <LinearGradient
          colors={isFull ? ['#ef4444', '#dc2626'] : categoryGradient}
          style={styles.categoryBadge}
        >
          <Text style={styles.categoryText}>
            {isFull ? 'FULL' : capitalizeCategory(event.category)}
          </Text>
        </LinearGradient>
        
        {isRegistered && (
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.registeredBadge}
          >
            <Feather name="check-circle" size={12} color="#ffffff" style={{marginRight: 4}} />
            <Text style={styles.registeredText}>
              Registered
            </Text>
          </LinearGradient>
        )}
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={3}>
          {event.description}
        </Text>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{event.date} at {event.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="map-pin" size={16} color="#6b7280" />
            <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="users" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {currentCount}/{maxCount} volunteers
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <LinearGradient
              colors={isFull ? ['#ef4444', '#dc2626'] : categoryGradient}
              style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progressPercentage)}% filled</Text>
        </View>

        <View style={styles.eventFooter}>
          <Text style={styles.organizer}>by {event.organizer?.name || 'Unknown'}</Text>
          <TouchableOpacity
            style={[
              styles.applyButton, 
              isFull && styles.applyButtonDisabled,
              isRegistered && styles.registeredButton
            ]}
            disabled={isFull}
            onPress={onPress}
          >
            <Text style={[
              styles.applyButtonText, 
              isFull && styles.applyButtonTextDisabled,
              isRegistered && styles.registeredButtonText
            ]}>
              {isFull ? 'Full' : isRegistered ? 'Registered' : 'View Details'}
            </Text>
            {!isFull && <Feather name={isRegistered ? "check" : "arrow-right"} size={14} color={isRegistered ? "#10b981" : "#ffffff"} />}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function EventsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'your'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [exploreEvents, setExploreEvents] = useState([]);
  const [yourEvents, setYourEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [categories, setCategories] = useState(['All', 'Environment', 'Community Service', 'Education', 'Animal Welfare', 'Health']);
  const [userId, setUserId] = useState(null);

  // Get user ID from AsyncStorage
  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData.id) {
          setUserId(parsedData.id);
          return parsedData.id;
        } else {
          console.warn('User data found but no ID present:', parsedData);
        }
      } else {
        // Create a default user ID for demo purposes
        // In a production app, you would redirect to login instead
        const defaultId = 'demo-user-' + Date.now().toString().slice(-6);
        const defaultUserData = { id: defaultId, name: 'Demo User' };
        await AsyncStorage.setItem('userData', JSON.stringify(defaultUserData));
        
        // Also create some demo event registrations for testing
        const demoEventRegistrations = [
          { eventId: 'cmgxd1oe3001wv71o0v9n4cqf', userId: defaultId, date: new Date().toISOString() },
          { eventId: 'cmgx9m78m0005v71o2hjkqkwp', userId: defaultId, date: new Date().toISOString() }
        ];
        await AsyncStorage.setItem('eventRegistrations', JSON.stringify(demoEventRegistrations));
        
        setUserId(defaultId);
        console.log('Created demo user with ID:', defaultId);
        console.log('Created demo event registrations for testing');
        return defaultId;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return null;
  };

  // Helper function to normalize event data
  const normalizeEventData = (event) => {
    // For debugging
    console.log('Normalizing event:', JSON.stringify(event, null, 2));
    
    // Validate image URLs
    const eventImage = event.coverImage || event.image;
    const validImageUrl = eventImage &&
      typeof eventImage === 'string' &&
      eventImage.trim().length > 0 &&
      (eventImage.startsWith('http://') || eventImage.startsWith('https://'));

    // Helper function to get default image URL from category
    const getDefaultImageUrl = (category) => {
      const baseCategories = {
        'environment': 'nature',
        'community service': 'volunteer',
        'education': 'education',
        'animal welfare': 'animals',
        'health': 'healthcare'
      };

      const searchTerm = category && typeof category === 'string' && baseCategories[category.toLowerCase()]
        ? baseCategories[category.toLowerCase()]
        : 'volunteer';

      return `https://source.unsplash.com/400x200/?${encodeURIComponent(searchTerm)}`;
    };
    
    // Handle possible missing or undefined fields
    const safeEvent = {
      id: event.id || 'unknown-id',
      title: event.title || 'Untitled Event',
      description: event.description || 'No description available',
      startDateTime: event.startDateTime || new Date().toISOString(),
      venue: event.venue || event.location || 'No location specified',
      category: event.category || 'Other',
      maxParticipants: event.maxParticipants || event.maxVolunteers || event.maxCapacity || 0,
      registeredCount: event.registeredCount || event.currentVolunteers || 0
    };
    
    // Ensure consistent date formatting for sorting purposes
    // Parse the date from the event object
    let eventDate = new Date();
    
    // Try to extract date from different possible fields
    if (event.startDateTime) {
      eventDate = new Date(event.startDateTime);
    } else if (event.startDate) {
      eventDate = new Date(event.startDate);
    } else if (event.date && event.time) {
      // If we have separate date and time strings, try to combine them
      const combinedDateTime = `${event.date} ${event.time}`;
      const parsedDate = new Date(combinedDateTime);
      if (!isNaN(parsedDate.getTime())) {
        eventDate = parsedDate;
      }
    } else if (event.date) {
      // Try to parse the date string
      const parsedDate = new Date(event.date);
      if (!isNaN(parsedDate.getTime())) {
        eventDate = parsedDate;
      }
    }
    
    // Make sure the date is valid, otherwise keep the current date
    if (isNaN(eventDate.getTime())) {
      eventDate = new Date();
    }
    
    // Format the startDateTime consistently for both tabs
    const startDateTime = eventDate.toISOString();
    
    return {
      id: safeEvent.id,
      title: safeEvent.title,
      description: safeEvent.description,
      startDateTime: startDateTime, // Add this explicitly for sorting
      date: event.date || eventDate.toLocaleDateString(),
      time: event.time || eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: safeEvent.venue,
      maxVolunteers: safeEvent.maxParticipants,
      currentVolunteers: safeEvent.registeredCount,
      category: safeEvent.category,
      organizer: {
        name: event.clubName || (event.club?.name || "Unknown"),
        logoUrl: event.clubLogo || (event.club?.logoUrl || null)
      },
      coverImage: validImageUrl ? eventImage : getDefaultImageUrl(safeEvent.category),
      // Additional fields from the backend
      eventRole: event.eventRole || 'attendee',
      hasAttended: !!event.hasAttended,
      attendTime: event.attendTime || null,
      addons: Array.isArray(event.addons) ? event.addons : [],
      agenda: Array.isArray(event.agenda) ? event.agenda : []
    };
  };

  // Function to extract unique categories from events
  const extractCategories = (eventsArray) => {
    const eventCategories = eventsArray
      .map(event => event.category)
      .filter(Boolean)
      .reduce((unique, category) => {
        // Check for case-insensitive duplicates
        const categoryLower = category.toLowerCase();
        if (!unique.some(cat => cat.toLowerCase() === categoryLower)) {
          unique.push(category);
        }
        return unique;
      }, [])
      .sort();

    return ['All', ...eventCategories];
  };

  // Function to fetch all events for the Explore tab
  const fetchExploreEvents = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      console.log('Fetching events for Explore tab...');
      
      const url = `${eventsService._baseUrl}/api/events/all`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fetchedEvents = data?.events || data?.data || data || [];

      if (fetchedEvents && fetchedEvents.length > 0) {
        // Normalize the event data
        const normalizedEvents = fetchedEvents.map(normalizeEventData);
        setExploreEvents(normalizedEvents);
        
        // Update categories
        setCategories(extractCategories(normalizedEvents));
        console.log(`Loaded ${normalizedEvents.length} events for Explore tab`);
      } else {
        console.warn('API returned empty events array');
        setExploreEvents([]);
      }
    } catch (err) {
      console.error('Error fetching explore events:', err);
      
      // Provide a user-friendly error message based on the error
      if (err.message.includes('Network request failed')) {
        setError('Network connection error. Please check your internet connection.');
      } else if (err.message.includes('timeout')) {
        setError('Request timed out. Please try again later.');
      } else {
        setError('Unable to load events. Please try again later.');
      }
      
      setExploreEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Helper function to fall back to local storage for registered events
  const fallbackToLocalEvents = async (userId) => {
    try {
      const allEventsResponse = await fetch(`${eventsService._baseUrl}/api/events/all`);
      if (!allEventsResponse.ok) {
        throw new Error('Failed to load your registered events');
      }
      
      const allEventsData = await allEventsResponse.json();
      const allEvents = allEventsData?.events || allEventsData?.data || allEventsData || [];
      const normalizedAllEvents = allEvents.map(normalizeEventData);
      
      // Get registrations from AsyncStorage
      const registrationsData = await AsyncStorage.getItem('eventRegistrations');
      if (registrationsData) {
        const registrations = JSON.parse(registrationsData);
        // Filter events to find ones user has registered for
        const userRegisteredEvents = normalizedAllEvents.filter(event => 
          registrations.some(reg => reg.eventId === event.id && reg.userId === userId)
        );
        setYourEvents(userRegisteredEvents);
        console.log(`Found ${userRegisteredEvents.length} registered events from local storage`);
      } else {
        setYourEvents([]);
      }
    } catch (error) {
      console.error('Error in fallback method:', error);
      setError('Unable to load your events');
      setYourEvents([]);
    }
  };

  // Function to fetch user's registered events
  const fetchYourEvents = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      // Get user ID
      const currentUserId = await getUserId();
      
      // If we couldn't get a user ID, we'll show an empty state but not throw an error
      if (!currentUserId) {
        console.warn('No user ID available for fetching registered events');
        setYourEvents([]);
        return;
      }
      
      console.log('Fetching registered events for user...');
      
      // Call the API endpoint for registered events
      // The backend will extract the user ID from the JWT token
      const baseUrl = eventsService._baseUrl || '';
      console.log('API Base URL:', baseUrl);
      
      const url = `${baseUrl}/api/events/registered`;
      console.log('Fetching from URL:', url);
      
      let token = await AsyncStorage.getItem('token');
      
      if (!token) {
        // Check if we're in development mode
        if (__DEV__) {
          // For development purposes only, create a dummy token
          token = 'demo-token-' + Date.now().toString();
          await AsyncStorage.setItem('token', token);
          console.log('Created demo token for development testing');
        } else {
          // In production, we should require a proper login
          console.log('No auth token found - user needs to log in');
          throw new Error('Please log in to view your registered events');
        }
      }
      
      console.log('Using authorization token:', token.substring(0, 10) + '...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error('API call failed:', responseText);
        
        // Check for specific backend errors
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error && errorData.error.includes('Unknown field')) {
            console.log('Backend schema error detected:', errorData.error);
            // This is a backend schema error, don't display to the user
            // Continue with fallback approach
          } else if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
          } else if (response.status === 404) {
            // No registered events found or endpoint doesn't exist
            console.log('No registered events found or endpoint not available');
            setYourEvents([]);
            return;
          } else {
            // Some other error occurred
            throw new Error(errorData.error || 'Failed to load your registered events');
          }
        } catch (parseError) {
          // If we can't parse the error response, just continue with fallback
          console.log('Could not parse error response, continuing with fallback');
        }
        
        // Fallback to the AsyncStorage approach if API fails with other errors
        console.log('Falling back to AsyncStorage approach');
        await fallbackToLocalEvents(currentUserId);
      } else {
        // Process API response if successful
        const responseText = await response.text();
        console.log('API Response:', responseText);
        
        try {
          const data = JSON.parse(responseText);
          console.log('Parsed data:', data);
          
          // Check if there's an error in the response even though status was 200
          if (data.error) {
            console.error('API returned error:', data.error);
            throw new Error(data.error);
          }
          
          const registeredEvents = data?.events || [];
          
          if (registeredEvents.length === 0) {
            console.log('No registered events found for this user');
            setYourEvents([]);
          } else {
            const normalizedEvents = registeredEvents.map(normalizeEventData);
            setYourEvents(normalizedEvents);
            console.log(`Loaded ${normalizedEvents.length} registered events from API`);
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          
          // If we can't parse the response or there's an error in the response
          // Fall back to the AsyncStorage approach
          console.log('Falling back to AsyncStorage approach due to parse error');
          await fallbackToLocalEvents(currentUserId);
        }
      }
    } catch (err) {
      console.error('Error fetching registered events:', err);
      // Use a more user-friendly error message
      if (err.message.includes('log in')) {
        setError('You need to be logged in to view your events');
      } else if (err.message.includes('token')) {
        setError('Your session has expired. Please log in again');
      } else {
        setError('Unable to load your events. Please try again later');
      }
      setYourEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Track if we've already loaded each tab's data
  const [dataLoaded, setDataLoaded] = useState({
    explore: false,
    your: false
  });

  // Fetch both tabs' data on initial load
  useEffect(() => {
    const loadInitialData = async () => {
      // Load both datasets on first render to make tab switching fast
      await fetchExploreEvents(false);
      await fetchYourEvents(false);
      
      // Mark both as loaded
      setDataLoaded({
        explore: true,
        your: true
      });
    };
    
    loadInitialData();
  }, []);
  
  // Handle tab changes - avoid full reloading if data was already loaded once
  useEffect(() => {
    if (activeTab === 'explore' && !dataLoaded.explore) {
      fetchExploreEvents();
    } else if (activeTab === 'your' && !dataLoaded.your) {
      fetchYourEvents();
    }
  }, [activeTab]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'explore') {
      fetchExploreEvents(true);
      setDataLoaded(prev => ({
        ...prev,
        explore: true
      }));
    } else {
      fetchYourEvents(true);
      setDataLoaded(prev => ({
        ...prev,
        your: true
      }));
    }
  };
  
  // Check if user is registered for an event (only used for display purposes now)
  const isUserRegistered = (eventId) => {
    // Since we're fetching registered events directly, in the 'your' tab all events are registered
    if (activeTab === 'your') return true;
    
    // For the explore tab, check if the event is in the yourEvents list
    const isRegistered = yourEvents.some(event => event.id === eventId);
    return isRegistered;
  };
  
  // Filter events based on search query, selected category, and registration status
  const getFilteredEvents = () => {
    // Determine which event list to use based on active tab
    let eventsToFilter = activeTab === 'explore' ? exploreEvents : yourEvents;
    
    // Log the current state of data
    console.log(`Filtering events - Active tab: ${activeTab}`);
    console.log(`Events count: ${eventsToFilter.length}`);
    console.log(`Search query: "${searchQuery}", Selected category: ${selectedCategory}`);
    
    // For explore tab, filter out events that user has already registered for
    if (activeTab === 'explore') {
      const registeredEventIds = yourEvents.map(event => event.id);
      eventsToFilter = eventsToFilter.filter(event => !registeredEventIds.includes(event.id));
      console.log(`Events after removing registered ones: ${eventsToFilter.length}`);
    }
    
    const filtered = eventsToFilter.filter(event => {
      // Basic filtering for search query and category
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    // Sort events by showing upcoming events first (closest to today first)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
    
    const sortedEvents = [...filtered].sort((a, b) => {
      // We now have standardized startDateTime fields for all events
      const dateA = new Date(a.startDateTime || a.date || 0);
      const dateB = new Date(b.startDateTime || b.date || 0);
      
      // Determine if events are upcoming or past
      const aIsUpcoming = dateA >= today;
      const bIsUpcoming = dateB >= today;
      
      // If both are upcoming or both are past, sort by proximity to today
      if (aIsUpcoming === bIsUpcoming) {
        // For upcoming events, earlier date first (ascending)
        if (aIsUpcoming) {
          return dateA - dateB;
        } 
        // For past events, more recent date first (descending)
        else {
          return dateB - dateA;
        }
      }
      
      // Show upcoming events before past events
      return aIsUpcoming ? -1 : 1;
    });
    
    console.log(`Filtered and sorted events: ${sortedEvents.length}`);
    return sortedEvents;
  };
  
  // Get filtered events based on criteria
  const filteredEvents = getFilteredEvents();

  // Function to handle image errors and track which events need fallback images
  const handleImageError = (eventId) => {
    console.log(`Image failed to load for event ID: ${eventId}`);
    setImageLoadErrors(prev => ({
      ...prev,
      [eventId]: true
    }));
  };

  const handleEventPress = (eventId) => {
    router.push(`/event/${eventId}`);
  };
  
  // Function to render content
  const renderContent = () => {
    // Loading state for only first data load, handled outside this function now
    // This keeps the content visible during tab switches
    
    return (
      <View style={styles.eventsList}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsCount}>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
          </Text>
          <View style={{flexDirection: 'row', gap: 8}}>
            <TouchableOpacity style={styles.sortButton}>
              <Feather name="filter" size={16} color="#6b7280" />
              <Text style={styles.sortButtonText}>Sort</Text>
            </TouchableOpacity>
          </View>
        </View>

        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={{
              ...event,
              hasImageError: imageLoadErrors[event.id]
            }}
            onPress={() => handleEventPress(event.id)}
            onImageError={() => handleImageError(event.id)}
            isRegistered={isUserRegistered(event.id)} // Pass registration status
          />
        ))}

        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name={activeTab === 'explore' ? "calendar" : "user-check"} size={64} color="#fed7aa" />
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'explore' ? 'No Events Found' : 'No Registered Events'}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'explore' 
                ? searchQuery || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria'
                  : yourEvents.length > 0 
                    ? 'You\'ve registered for all available events!'
                    : 'No available events at the moment'
                : 'You haven\'t registered for any events yet. Register for events to see them here.'
              }
            </Text>
            
            {/* Explore tab refresh button removed */}
            
            {/* Buttons removed as requested */}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={['#f97316', '#ef4444']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Feather name={activeTab === 'explore' ? "calendar" : "user-check"} size={32} color="#ffffff" />
          <Text style={styles.headerTitle}>
            {activeTab === 'explore' ? 'Available Events' : 'Your Events'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'explore' 
              ? 'Discover new volunteering opportunities you haven\'t registered for yet' 
              : 'View and manage events you\'ve registered for'
            }
          </Text>
          {/* Refresh button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={loading}
          >
            <Feather
              name="refresh-cw"
              size={20}
              color="#ffffff"
              style={loading ? { opacity: 0.6 } : {}}
            />
          </TouchableOpacity>
          
          {/* Tab buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'explore' && styles.activeTab]}
              onPress={() => setActiveTab('explore')}
            >
              <Text style={[styles.tabText, activeTab === 'explore' && styles.activeTabText]}>Explore</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'your' && styles.activeTab]}
              onPress={() => setActiveTab('your')}
            >
              <Text style={[styles.tabText, activeTab === 'your' && styles.activeTabText]}>Your Events</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive
              ]}>
                {category === 'All' ? 'All' : capitalizeCategory(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
        }
      >
        {/* Error state */}
        {activeTab === 'your' && error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#fed7aa" />
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            {error.toLowerCase().includes('log in') && (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRefresh}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Only show loading indicator on first data load */}
            {loading && !dataLoaded[activeTab] ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : renderContent()}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },

  // Header Styles
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
  },
  refreshButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  // Tab Styles
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 12, 
    padding: 4, 
    width: '100%', 
    maxWidth: 320,
    marginTop: 10,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  activeTab: { 
    backgroundColor: '#ffffff' 
  },
  tabText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#ffffff', 
    opacity: 0.8 
  },
  activeTabText: { 
    color: '#f97316', 
    opacity: 1 
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Search and Filter Styles
  searchSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
    color: '#000000',
  },
  categoriesContainer: {
    paddingRight: 24,
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Content Styles
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  eventsCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  eventsList: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // Event Card Styles
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  eventImageContainer: {
    position: 'relative',
    height: 180,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  eventImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventImageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  registeredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  registeredText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Event Content Styles
  eventContent: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 26,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },

  // Progress Bar Styles
  progressContainer: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Event Footer Styles
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizer: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    flex: 1,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  applyButtonDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  applyButtonTextDisabled: {
    color: '#9ca3af',
  },
  registeredButton: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#10b981',
    shadowColor: '#10b981',
  },
  registeredButtonText: {
    color: '#10b981',
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  /* buttonGroup style removed */

  // End of styles
});
