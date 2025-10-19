// app/event/[id].js - Event Details Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventsService from '../../services/EventsService';
import { normalizeEventData, getDefaultImageForCategory } from '../../utils/eventUtils';
import { netconfig } from '../../netconfig';

// Suppress console errors in production
if (process.env.NODE_ENV === 'production') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('EventsService error') || 
         args[0].includes('Failed to fetch'))) {
      console.log('Suppressed error:', args[0]);
    } else {
      originalConsoleError.apply(console, args);
    }
  };
}

const { width } = Dimensions.get('window');

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Beach Cleanup Drive',
    description: 'Join us for a community beach cleanup to help protect marine life and keep our beaches beautiful. We will provide all necessary equipment including gloves, trash bags, and pickup tools. This is a great opportunity to meet like-minded people while making a positive impact on our environment.',
    fullDescription: 'Our beach cleanup drive is part of a larger initiative to protect Singapore\'s coastal ecosystem. Volunteers will work in teams to collect litter, record data on the types of waste found, and participate in a short educational session about marine conservation. All equipment will be provided, but please bring your own water bottle and wear comfortable clothes that can get dirty. Light refreshments will be provided after the cleanup.',
    date: '2025-07-15',
    time: '08:00 AM',
    duration: '3 hours',
    location: 'East Coast Park',
    meetingPoint: 'East Coast Park Area C, near the McDonald\'s',
    maxVolunteers: 50,
    currentVolunteers: 23,
    category: 'Environment',
    organizer: 'Green Earth Club',
    organizerContact: 'greenearth@example.com',
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=400&fit=crop&crop=center',
    galleryImages: [
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop&crop=center'
    ],
    requirements: [
      'Minimum age: 12 years old',
      'Wear closed-toe shoes',
      'Bring your own water bottle',
      'Sun protection recommended'
    ],
    whatToBring: [
      'Water bottle',
      'Hat or cap',
      'Sunscreen',
      'Comfortable clothes'
    ],
    benefits: [
      'Community service hours certificate',
      'Free t-shirt',
      'Light refreshments',
      'Environmental education session'
    ]
  },
  {
    id: 2,
    title: 'Food Distribution for Elderly',
    description: 'Help distribute meals to elderly residents in the community. Make a difference in their day!',
    fullDescription: 'Our food distribution program serves elderly residents who may have difficulty accessing nutritious meals. Volunteers will help pack meal boxes, distribute them to residents, and spend time chatting with the elderly to provide social interaction. This is a heartwarming experience that makes a real difference in the community.',
    date: '2025-07-08',
    time: '11:00 AM',
    duration: '2.5 hours',
    location: 'Community Center Block 123',
    meetingPoint: 'Main entrance of Community Center Block 123',
    maxVolunteers: 20,
    currentVolunteers: 8,
    category: 'Community Service',
    organizer: 'Caring Hearts Club',
    organizerContact: 'caringhearts@example.com',
    image: 'https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=800&h=400&fit=crop&crop=center',
    galleryImages: [
      'https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop&crop=center'
    ],
    requirements: [
      'Minimum age: 16 years old',
      'Food handling knowledge preferred',
      'Patient and friendly personality',
      'Able to carry light loads'
    ],
    whatToBring: [
      'Comfortable shoes',
      'Friendly smile',
      'Hand sanitizer'
    ],
    benefits: [
      'Community service certificate',
      'Meal provided',
      'Thank you card from residents'
    ]
  },
  {
    id: 3,
    title: 'Tree Planting Initiative',
    description: 'Plant trees in the neighborhood park to create a greener environment for future generations.',
    fullDescription: 'Join our tree planting initiative to help create a greener Singapore. We will be planting native species that support local wildlife and improve air quality. This hands-on environmental activity is perfect for those who want to make a lasting impact on their community.',
    date: '2025-07-22',
    time: '07:30 AM',
    duration: '4 hours',
    location: 'Bishan Park',
    meetingPoint: 'Bishan Park connector bridge entrance',
    maxVolunteers: 35,
    currentVolunteers: 35,
    category: 'Environment',
    organizer: 'Nature Lovers Society',
    organizerContact: 'naturelovers@example.com',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop&crop=center',
    galleryImages: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1574263867128-95bc526bd019?w=400&h=300&fit=crop&crop=center'
    ],
    requirements: [
      'Minimum age: 14 years old',
      'Physical fitness required',
      'Wear old clothes',
      'Gardening experience helpful but not required'
    ],
    whatToBring: [
      'Gardening gloves (if you have)',
      'Water bottle',
      'Change of clothes',
      'Towel'
    ],
    benefits: [
      'Environmental service certificate',
      'Breakfast provided',
      'Tree adoption certificate',
      'Photo with your planted tree'
    ]
  },
  {
    id: 4,
    title: 'Reading Program for Kids',
    description: 'Volunteer to read stories and help children improve their reading skills at the local library.',
    fullDescription: 'Our reading program pairs volunteers with children aged 6-12 to help improve their reading skills and foster a love for books. You\'ll read stories, play educational games, and help with basic reading exercises. This is a rewarding experience that helps shape young minds.',
    date: '2025-07-12',
    time: '02:00 PM',
    duration: '2 hours',
    location: 'Tampines Regional Library',
    meetingPoint: 'Children\'s section, Level 2',
    maxVolunteers: 15,
    currentVolunteers: 12,
    category: 'Education',
    organizer: 'Book Buddies Club',
    organizerContact: 'bookbuddies@example.com',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&crop=center',
    galleryImages: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop&crop=center'
    ],
    requirements: [
      'Minimum age: 18 years old',
      'Good command of English',
      'Patient with children',
      'Background check required'
    ],
    whatToBring: [
      'Valid ID',
      'Your favorite children\'s book',
      'Positive attitude'
    ],
    benefits: [
      'Volunteer certificate',
      'Book voucher',
      'Thank you card from children'
    ]
  },
  {
    id: 5,
    title: 'Animal Shelter Care',
    description: 'Spend time caring for rescued animals, help with feeding, cleaning, and giving them love.',
    fullDescription: 'Help care for rescued animals at our partner shelter. Activities include feeding, cleaning enclosures, socializing with animals, and helping with basic medical care under supervision. This is perfect for animal lovers who want to make a difference in the lives of abandoned pets.',
    date: '2025-07-18',
    time: '09:00 AM',
    duration: '3.5 hours',
    location: 'SPCA Singapore',
    meetingPoint: 'SPCA main reception',
    maxVolunteers: 25,
    currentVolunteers: 19,
    category: 'Animal Welfare',
    organizer: 'Animal Lovers Unite',
    organizerContact: 'animallovers@example.com',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=400&fit=crop&crop=center',
    galleryImages: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=center'
    ],
    requirements: [
      'Minimum age: 16 years old',
      'Not afraid of animals',
      'Physical activity involved',
      'Animal handling briefing required'
    ],
    whatToBring: [
      'Closed-toe shoes',
      'Old clothes',
      'Hand sanitizer',
      'Love for animals'
    ],
    benefits: [
      'Animal care certificate',
      'SPCA merchandise',
      'Animal adoption discount',
      'Photo with the animals'
    ]
  }
];

// Helper function to safely format event date
const getFormattedDate = (event) => {
  try {
    // First try to use the pre-formatted date string if it exists
    if (event.date && typeof event.date === 'string' && !event.date.includes('Invalid')) {
      return event.date;
    }
    
    // If no pre-formatted date, try to parse from various date fields
    let dateObj;
    if (event.startDateTime && !isNaN(new Date(event.startDateTime).getTime())) {
      dateObj = new Date(event.startDateTime);
    } else if (event.startDate && !isNaN(new Date(event.startDate).getTime())) {
      dateObj = new Date(event.startDate);
    } else if (event.date && !isNaN(new Date(event.date).getTime())) {
      dateObj = new Date(event.date);
    } else {
      return "Date not available";
    }
    
    // Format the date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Date not available";
  }
};

// Helper function to safely format event time
const getFormattedTime = (event) => {
  try {
    // First try to use the pre-formatted time string if it exists
    if (event.time && typeof event.time === 'string' && !event.time.includes('Invalid')) {
      return event.time;
    }
    
    // Log values for debugging
    console.log('Time formatting - available fields:', {
      startDateTime: event.startDateTime,
      startDate: event.startDate, 
      date: event.date,
      time: event.time
    });
    
    // If no pre-formatted time, try to parse from various date fields
    let dateObj;
    if (event.startDateTime && !isNaN(new Date(event.startDateTime).getTime())) {
      dateObj = new Date(event.startDateTime);
      console.log('Using startDateTime:', event.startDateTime);
    } else if (event.startDate && !isNaN(new Date(event.startDate).getTime())) {
      dateObj = new Date(event.startDate);
      console.log('Using startDate:', event.startDate);
    } else if (event.date && !isNaN(new Date(event.date).getTime())) {
      dateObj = new Date(event.date);
      console.log('Using date:', event.date);
    } 
    
    // If we couldn't parse a date, try once more with the direct time field
    if (!dateObj || isNaN(dateObj.getTime())) {
      if (event.time) {
        // Just return the time string directly if it exists
        return event.time;
      }
      return "Time not specified";
    }
    
    // Format the time
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log('Formatted time result:', formattedTime);
    return formattedTime;
  } catch (error) {
    console.error('Error formatting time:', error);
    if (event.time) {
      // Fallback to just showing the time string as is
      return event.time;
    }
    return "Time not specified";
  }
};

const getCategoryColor = (category) => {
  const colors = {
    'Environment': '#10b981',
    'Community Service': '#f59e0b',
    'Education': '#8b5cf6',
    'Animal Welfare': '#ec4899',
    'Health': '#ef4444'
  };
  return colors[category] || '#6b7280';
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  
  // Function to get auth token from storage
  const getAuthToken = async () => {
    try {
      console.log('Inside getAuthToken function');
      // Try multiple token keys that might be used
      const tokenKeys = ['authToken', 'userToken', 'token', 'accessToken'];
      let token = null;
      
      for (const key of tokenKeys) {
        token = await AsyncStorage.getItem(key);
        if (token) {
          console.log(`Found token with key: ${key}`);
          break;
        }
      }
      
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Function to fetch event data from API
  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      let successfulEndpoint = null;
      let eventData = null;
      let fetchErrors = [];
      
      // Try to fetch from the new endpoint format: events/[eventid]/route.tsx
      const apiUrl = `${netconfig.API_BASE_URL}/api/events/${id}/route.tsx`;
      console.log(`Fetching event data from: ${apiUrl}`);
      
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          console.log('API Response from primary endpoint:', data);
          
          // Handle different possible API response structures
          eventData = data.event || data.data || data;
          
          if (eventData) {
            successfulEndpoint = 'primary';
          } else {
            fetchErrors.push('Primary endpoint returned empty data');
          }
        } else {
          fetchErrors.push(`Primary endpoint returned status: ${response.status}`);
        }
      } catch (primaryError) {
        console.log('Error with primary endpoint:', primaryError.message);
        fetchErrors.push(`Primary endpoint error: ${primaryError.message}`);
      }
      
      // If primary endpoint didn't succeed, try alternative direct endpoint
      if (!successfulEndpoint) {
        try {
          const alternateUrl = `${netconfig.API_BASE_URL}/api/events/${id}`;
          console.log(`Trying alternate endpoint: ${alternateUrl}`);
          const alternateResponse = await fetch(alternateUrl);
          
          if (alternateResponse.ok) {
            const alternateData = await alternateResponse.json();
            eventData = alternateData.event || alternateData.data || alternateData;
            
            if (eventData) {
              successfulEndpoint = 'alternate';
            } else {
              fetchErrors.push('Alternate endpoint returned empty data');
            }
          } else {
            fetchErrors.push(`Alternate endpoint returned status: ${alternateResponse.status}`);
          }
        } catch (alternateError) {
          console.log('Alternate endpoint error:', alternateError.message);
          fetchErrors.push(`Alternate endpoint error: ${alternateError.message}`);
        }
      }
      
      // If we have event data from any source, use it
      if (eventData) {
        // Normalize the event data for consistent handling
        const normalizedEvent = normalizeEventData(eventData);
        
        // Ensure date and time fields are properly formatted
        if (!normalizedEvent.date || normalizedEvent.date === "Invalid Date") {
          if (normalizedEvent.startDateTime) {
            try {
              const dateObj = new Date(normalizedEvent.startDateTime);
              if (!isNaN(dateObj.getTime())) {
                normalizedEvent.date = dateObj.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                normalizedEvent.time = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            } catch (e) {
              console.error('Error parsing date:', e);
            }
          }
        }
        
        // Make sure we preserve the time from the original data if available
        if (eventData.time && (!normalizedEvent.time || normalizedEvent.time === "Invalid Date")) {
          normalizedEvent.time = eventData.time;
          console.log('Using original time value:', eventData.time);
        }
        
        // Special handling for organizer field which might be a string or object
        if (typeof normalizedEvent.organizer === 'string') {
          normalizedEvent.organizer = { name: normalizedEvent.organizer };
        } else if (!normalizedEvent.organizer) {
          normalizedEvent.organizer = { name: "Unknown" };
        }
        
        console.log(`Successfully retrieved event data from ${successfulEndpoint} endpoint`);
        console.log('Normalized event data:', normalizedEvent);
        setEvent(normalizedEvent);
      } else {
        // Only show error if all methods failed
        throw new Error(`Could not find event data. Attempted: ${fetchErrors.join(', ')}`);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError(`Failed to load event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user is already registered for this event
  const checkRegistrationStatus = async () => {
    try {
      console.log('Attempting to get auth token...');
      const token = await getAuthToken();
      console.log('Auth token result:', token ? 'Token found' : 'No token found');
      
      if (!token) {
        console.log('No auth token, skipping registration check');
        return;
      }
      
      const apiUrl = `${netconfig.API_BASE_URL}/api/events/mobile/registrations?eventId=${id}`;
      console.log(`Checking registration status at: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.log(`Registration check failed with status: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      console.log('Registration status:', data);
      
      if (data.isRegistered) {
        setIsApplied(true);
        setRegistrationStatus(data.registration);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  // Fetch event data and check registration when component mounts or ID changes
  useEffect(() => {
    fetchEventData();
    checkRegistrationStatus();
  }, [id]);
  
  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }
  
  // Error state - only show if we truly failed to get any data
  if (error && !event) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.backButton, {marginTop: 10}]} 
            onPress={() => fetchEventData()}
          >
            <Text style={styles.backButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Not found state
  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // For capacity calculation
  const currentVolunteers = event.currentVolunteers || event.registeredCount || 0;
  const maxVolunteers = event.maxVolunteers || event.maxCapacity || event.maxParticipants || 50;
  const isFull = currentVolunteers >= maxVolunteers;
  
  // Function to handle event registration
  const handleApply = async () => {
    if (isFull) {
      Alert.alert('Event Full', 'This event has reached maximum capacity.');
      return;
    }
    
    if (isApplied) {
      Alert.alert('Already Applied', 'You have already applied for this event.');
      return;
    }

    Alert.alert(
      'Apply for Event',
      `Are you sure you want to apply for "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              setRegistrationLoading(true);
              
              // Get the auth token from storage (you'll need to implement this)
              const token = await getAuthToken();
              
              if (!token) {
                promptLogin();
                return;
              }
              
              // Call the registration API endpoint with potential fallbacks
              const apiEndpoints = [
                `${netconfig.API_BASE_URL}/api/events/mobile/registrations`,
                `${netconfig.API_BASE_URL}/api/events/mobile/registrations`, // Added /api prefix
                `${netconfig.API_BASE_URL}/api/events/register`
              ];
              
              const apiUrl = apiEndpoints[0];
              console.log(`Registering for event at: ${apiUrl} (with fallbacks available)`);
              
              // Check if the API endpoint is accessible (OPTIONS request)
              try {
                const checkResponse = await fetch(apiUrl, { 
                  method: 'OPTIONS',
                  headers: { 'Content-Type': 'application/json' }
                });
                console.log(`API endpoint check: ${checkResponse.status}`);
              } catch (checkError) {
                console.warn('API endpoint check failed:', checkError.message);
                // Continue anyway, the main request might still work
              }
              
              console.log(`Making POST request to ${apiUrl}`);
              
              // Create a timeout for the request
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
              
              // Try all endpoints until one works
              let response = null;
              let lastError = null;
              
              for (let i = 0; i < apiEndpoints.length; i++) {
                const currentUrl = apiEndpoints[i];
                console.log(`Trying endpoint ${i + 1}/${apiEndpoints.length}: ${currentUrl}`);
                
                try {
                  // Create a new controller for each attempt
                  const currentController = new AbortController();
                  const currentTimeout = setTimeout(() => currentController.abort(), 8000); // 8 second timeout
                  
                  response = await fetch(currentUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      eventId: id,
                      eventRole: 'participant'
                    }),
                    signal: currentController.signal
                  });
                  
                  clearTimeout(currentTimeout);
                  console.log(`Response from endpoint ${i + 1}: Status ${response.status}`);
                  
                  // If this endpoint returned a success response, break the loop
                  if (response.ok) {
                    console.log(`Endpoint ${i + 1} succeeded!`);
                    break;
                  }
                } catch (endpointError) {
                  console.warn(`Error with endpoint ${i + 1}:`, endpointError.message);
                  lastError = endpointError;
                }
              }
              
              // If we've tried all endpoints and none worked, throw the last error
              if (!response) {
                throw new Error(`All API endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`);
              }
              
              clearTimeout(timeout);
              
              // Log response details for debugging
              console.log(`Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
              
              // Get response text first
              const responseText = await response.text();
              console.log('Response first 100 chars:', responseText.substring(0, 100));
              
              // Try to parse as JSON
              let data;
              try {
                data = JSON.parse(responseText);
              } catch (parseError) {
                console.error('JSON parse error:', parseError);
                // If response contains HTML, it might be a server error page
                if (responseText.includes('<html') || responseText.startsWith('<')) {
                  throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
                } else {
                  throw new Error(`Invalid JSON response. Status: ${response.status}`);
                }
              }
              
              if (!response.ok) {
                throw new Error(data?.error || data?.message || `Failed to register for event. Status: ${response.status}`);
              }
              
              // Registration successful
              console.log('Registration successful:', data);
              setIsApplied(true);
              setRegistrationStatus(data);
              
              // Show success message
              Alert.alert(
                'Success!', 
                'Your application has been submitted. You will receive a confirmation email shortly.',
                [{ text: 'OK' }]
              );
              
              // Refresh event data to get updated registration counts
              fetchEventData();
              
            } catch (error) {
              console.error('Error registering for event:', error);
              
              // Log additional details about the API being used
              console.log('API Base URL:', netconfig.API_BASE_URL);
              console.log('Event ID being registered:', id);
              
              // Determine a more user-friendly error message
              let userMessage = 'Something went wrong. Please try again.';
              
              if (error.message.includes('JSON Parse')) {
                userMessage = 'The server response was invalid. Our team has been notified.';
              } else if (error.message.includes('Network request failed')) {
                userMessage = 'Network connection error. Please check your internet connection.';
              } else if (error.message.includes('timed out')) {
                userMessage = 'The request timed out. Please try again later.';
              } else if (error.message.includes('404')) {
                userMessage = 'The registration service is currently unavailable. Please try again later.';
              } else if (error.message.includes('401')) {
                userMessage = 'Your session has expired. Please log in again.';
              } else if (error.message.includes('403')) {
                userMessage = 'You do not have permission to register for this event.';
              } else if (error.message.includes('500')) {
                userMessage = 'There was a server error. Our team has been notified.';
              }
              
              Alert.alert(
                'Registration Failed', 
                userMessage,
                [{ text: 'OK' }]
              );
            } finally {
              setRegistrationLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // We already defined getAuthToken at the top of the component

  const promptLogin = () => {
    Alert.alert(
      'Login Required', 
      'Please login to apply for events',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/auth/login') }
      ]
    );
  };

  const handleViewOnly = () => {
    Alert.alert('Login Required', 'Please login to apply for events.');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: event.image || event.coverImage }}
            style={styles.heroImage}
            resizeMode="cover"
            defaultSource={{ uri: getDefaultImageForCategory(event.category) }}
            onError={(e) => {
              console.log('Image failed to load, using default');
              e.target.src = getDefaultImageForCategory(event.category);
            }}
          />
          <View style={styles.heroOverlay} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <LinearGradient 
              colors={isFull ? ['#ef4444', '#dc2626'] : ['#f97316', '#ef4444']}
              style={styles.categoryBadge}
            >
              <Text style={styles.categoryText}>
                {isFull ? 'FULL' : event.category}
              </Text>
            </LinearGradient>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.organizer}>
              Organized by {event.organizer?.name || event.organizer || (event.club?.name || "Unknown")}
            </Text>
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Feather name="calendar" size={20} color="#f97316" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>
                {getFormattedDate(event)}
              </Text>
              <Text style={styles.infoSubValue}>
                {getFormattedTime(event)}
                {event.duration && ` (${event.duration})`}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Feather name="map-pin" size={20} color="#f97316" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location || event.venue || 'TBD'}</Text>
              {event.meetingPoint && <Text style={styles.infoSubValue}>{event.meetingPoint}</Text>}
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Feather name="users" size={20} color="#f97316" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Participants</Text>
              <Text style={styles.infoValue}>
                {currentVolunteers}/{maxVolunteers} signed up
              </Text>
              {isFull && <Text style={styles.fullBadge}>FULL</Text>}
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <LinearGradient
                  colors={isFull ? ['#ef4444', '#dc2626'] : ['#f97316', '#ef4444']}
                  style={[styles.progressFill, { width: `${Math.min((currentVolunteers / maxVolunteers) * 100, 100)}%` }]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Gallery Section */}
        {event.galleryImages && event.galleryImages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Gallery</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.galleryContainer}
            >
              {event.galleryImages.map((imageUri, index) => (
                <View key={index} style={styles.galleryImageContainer}>
                  <Image 
                    source={{ uri: imageUri }} 
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.fullDescription || event.description || 'No description available'}</Text>
        </View>

        {/* Requirements */}
        {event.requirements && event.requirements.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <View style={styles.listContainer}>
              {event.requirements.map((req, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bulletContainer}>
                    <Feather name="check-circle" size={16} color="#f97316" />
                  </View>
                  <Text style={styles.listText}>{typeof req === 'string' ? req : JSON.stringify(req)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* What to Bring */}
        {event.whatToBring && event.whatToBring.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What to Bring</Text>
            <View style={styles.listContainer}>
              {event.whatToBring.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bulletContainer}>
                    <Feather name="package" size={16} color="#f97316" />
                  </View>
                  <Text style={styles.listText}>{typeof item === 'string' ? item : JSON.stringify(item)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Benefits */}
        {event.benefits && event.benefits.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Get</Text>
            <View style={styles.listContainer}>
              {event.benefits.map((benefit, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.bulletContainer}>
                    <Feather name="star" size={16} color="#f97316" />
                  </View>
                  <Text style={styles.listText}>{typeof benefit === 'string' ? benefit : JSON.stringify(benefit)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Contact */}
        {event.organizerContact || event.contactEmail || (event.organizer && event.organizer.email) || (event.club && event.club.email) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <TouchableOpacity style={styles.contactContainer}>
              <View style={styles.contactIconContainer}>
                <Feather name="mail" size={20} color="#ffffff" />
              </View>
              <Text style={styles.contactText}>
                {event.organizerContact || event.contactEmail || (event.organizer && event.organizer.email) || (event.club && event.club.email)}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>
      

      {/* Apply Button */}
      <View style={styles.buttonContainer}>
  {isApplied ? (
    <View style={styles.buttonGroup}>
      <TouchableOpacity 
        style={styles.qrButton}
        onPress={() => router.push(`/event/qr/${event.id}`)}
      >
        <LinearGradient
          colors={['#f97316', '#f97316']}
          style={styles.qrButtonGradient}
        >
          <Feather name="grid" size={20} color="#ffffff" />
          <Text style={styles.qrButtonText}>Generate QR Code</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.applyButton, styles.disabledButton]} 
        disabled={true}
      >
        <LinearGradient
          colors={['#9ca3af', '#9ca3af']}
          style={styles.applyButtonGradient}
        >
          <Feather name="check" size={20} color="#ffffff" />
          <Text style={styles.applyButtonText}>Applied Successfully</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity 
      style={[styles.applyButton, 
              (isFull || event.status === 'completed' || event.status === 'cancelled' || registrationLoading) && styles.disabledButton]}
      onPress={handleApply}
      disabled={isFull || event.status === 'completed' || event.status === 'cancelled' || registrationLoading}
    >
      <LinearGradient
        colors={isFull ? ['#9ca3af', '#6b7280'] : 
                (event.status === 'completed' || event.status === 'cancelled') ? ['#9ca3af', '#6b7280'] : 
                ['#f97316', '#ef4444']}
        style={styles.applyButtonGradient}
      >
        {registrationLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Feather name={isFull ? "x" : "user-plus"} size={20} color="#ffffff" />
            <Text style={styles.applyButtonText}>
              {isFull ? 'Event Full' : 
               (event.status === 'completed') ? 'Event Completed' :
               (event.status === 'cancelled') ? 'Event Cancelled' :
               registrationLoading ? 'Processing...' : 'Apply Now'}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )}
</View>
      

    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Hero Image Section
  heroContainer: {
    position: 'relative',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 38,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  organizer: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 20,
  },

  // Quick Info Cards
  quickInfoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoSubValue: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  fullBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
    width: 60,
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Gallery Section
  galleryContainer: {
    marginTop: 12,
  },
  galleryImageContainer: {
    marginRight: 12,
  },
  galleryImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },

  // Sections
  section: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    fontWeight: '400',
  },

  // Lists
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  listText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 24,
    fontWeight: '400',
  },

  // Contact
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
    flex: 1,
  },

  // Apply Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  applyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Error handling
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  buttonGroup: {
    gap: 12,
  },
  qrButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#9f5cf6ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  qrButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  qrButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});