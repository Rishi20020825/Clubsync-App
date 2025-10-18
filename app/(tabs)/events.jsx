// app/(tabs)/events.js - Events List Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { eventsService } from '../../services/api';

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

const EventCard = ({ event, onPress, onImageError }) => {
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
          <Text style={styles.organizer}>by {event.organizer?.name || (typeof event.organizer === 'string' ? event.organizer : 'Unknown')}</Text>
          <TouchableOpacity
            style={[styles.applyButton, isFull && styles.applyButtonDisabled]}
            disabled={isFull}
            onPress={onPress}
          >
            <Text style={[styles.applyButtonText, isFull && styles.applyButtonTextDisabled]}>
              {isFull ? 'Full' : 'View Details'}
            </Text>
            {!isFull && <Feather name="arrow-right" size={14} color="#ffffff" />}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function EventsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [categories, setCategories] = useState(['All', 'Environment', 'Community Service', 'Education', 'Animal Welfare', 'Health']);

  // Function to fetch events from the API
  const fetchEvents = async () => {
    try {
      setError(null);
      console.log('Fetching events directly from /api/events/all endpoint...');

      const startTime = Date.now();
      // Direct API call to /api/events/all for maximum speed
      const url = `${eventsService._baseUrl}/api/events/all`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fetchedEvents = data?.events || data?.data || data || [];
      const loadTime = Date.now() - startTime;

      console.log(`API returned ${fetchedEvents ? fetchedEvents.length : 0} events in ${loadTime}ms from ${url}`);

      if (fetchedEvents && fetchedEvents.length > 0) {
        // Simple data normalization to ensure we have consistent field names
        const normalizedEvents = fetchedEvents.map(event => {
          // Validate image URLs to make sure they're not empty strings or invalid URLs
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

            const searchTerm = category && baseCategories[category.toLowerCase()]
              ? baseCategories[category.toLowerCase()]
              : 'volunteer';

            return `https://source.unsplash.com/400x200/?${encodeURIComponent(searchTerm)}`;
          };

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date || new Date(event.startDateTime).toLocaleDateString(),
            time: event.time || new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: event.location || event.venue,
            maxVolunteers: event.maxVolunteers || event.maxCapacity || event.maxParticipants,
            currentVolunteers: event.currentVolunteers || event.registeredCount || 0,
            category: event.category,
            organizer: event.organizer || event.club || { name: 'Unknown' },
            coverImage: validImageUrl ? eventImage : getDefaultImageUrl(event.category) // Use default image URL if original is invalid
          };
        });

        setEvents(normalizedEvents);

        // Extract unique categories from fetched events and update categories list
        const eventCategories = normalizedEvents
          .map(event => {
            // Ensure consistent capitalization in the stored category data
            if (event.category) {
              // Preserve original category in data but ensure consistent format
              return event.category;
            }
            return null;
          })
          .filter(Boolean) // Remove null/undefined categories
          .reduce((unique, category) => {
            // Check for case-insensitive duplicates to avoid "Environment" and "environment" as separate filters
            const categoryLower = category.toLowerCase();
            if (!unique.some(cat => cat.toLowerCase() === categoryLower)) {
              unique.push(category);
            }
            return unique;
          }, [])
          .sort(); // Sort categories alphabetically

        // Update categories with 'All' at the beginning plus unique categories from events
        if (eventCategories.length > 0) {
          setCategories(['All', ...eventCategories]);
          console.log(`Updated categories list with ${eventCategories.length} unique categories`);
        }

        console.log('Successfully loaded and normalized events from /api/events/all');
      } else {
        console.warn('API returned empty events array, using mock data as fallback');
        setEvents(MOCK_EVENTS);

        // Extract unique categories from mock events
        const mockCategories = MOCK_EVENTS
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

        setCategories(['All', ...mockCategories]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');

      // Use mock events as fallback
      console.log('Using mock events as fallback due to API error');
      setEvents(MOCK_EVENTS);

      // Show error alert
      Alert.alert(
        'Error Loading Events',
        `Using local data instead.\n\nReason: ${err.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // Filter events based on search query and selected category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.mainScrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#f97316']}
        />
      }
    >
      {/* Header Section */}
      <LinearGradient
        colors={['#f97316', '#ef4444']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Feather name="calendar" size={32} color="#ffffff" />
          <Text style={styles.headerTitle}>Upcoming Events</Text>
          <Text style={styles.headerSubtitle}>
            Find volunteering opportunities and make a difference in your community
          </Text>
          {/* Refresh button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchEvents}
            disabled={loading}
          >
            <Feather
              name="refresh-cw"
              size={20}
              color="#ffffff"
              style={loading ? { opacity: 0.6 } : {}}
            />
          </TouchableOpacity>
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

      {/* Events List */}
      <View style={styles.eventsList}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsCount}>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
          </Text>
          <View style={{flexDirection: 'row', gap: 8}}>
            {__DEV__ && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "API Debug Info",
                    `API URL: ${eventsService._baseUrl}\n` +
                    `Endpoint: /api/events/all (direct fetch)\n` +
                    `Events: ${events.length}\n` +
                    `Source: ${events === MOCK_EVENTS ? "MOCK DATA" : "API DIRECT"}\n` +
                    `Error: ${error || "None"}`
                  );
                }}
                style={styles.debugButton}
              >
                <Feather name="info" size={16} color="#0369a1" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.sortButton}>
              <Feather name="filter" size={16} color="#6b7280" />
              <Text style={styles.sortButtonText}>Sort</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : (
          <>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  hasImageError: imageLoadErrors[event.id]
                }}
                onPress={() => handleEventPress(event.id)}
                onImageError={() => handleImageError(event.id)}
              />
            ))}

            {filteredEvents.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={64} color="#fed7aa" />
                <Text style={styles.emptyStateTitle}>No Events Found</Text>
                <Text style={styles.emptyStateText}>
                  {error ? 'Unable to load events from server. Try again later.' : 'Try adjusting your search or filter criteria'}
                </Text>
                {error && (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchEvents}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },

  mainScrollContent: {
    paddingBottom: 140, // Extra space for floating tabs
  },

  // Header Styles
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
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
  },

  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },

  // Error and Retry Styles
  retryButton: {
    marginTop: 16,
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Debug button
  debugButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
});