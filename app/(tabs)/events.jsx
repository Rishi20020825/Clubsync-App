// app/(tabs)/events.js - Events List Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { netconfig } from '../../netconfig';

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

const getCategoryGradient = (category) => {
  const gradients = {
    'Environment': ['#10b981', '#059669'],
    'Community Service': ['#f59e0b', '#d97706'],
    'Education': ['#8b5cf6', '#7c3aed'],
    'Animal Welfare': ['#ec4899', '#db2777'],
    'Health': ['#ef4444', '#dc2626']
  };
  return gradients[category] || ['#6b7280', '#4b5563'];
};

const EventCard = ({ event, onPress }) => {
  const isFull = event.currentVolunteers >= event.maxVolunteers;
  const categoryGradient = getCategoryGradient(event.category);
  const progressPercentage = (event.currentVolunteers / event.maxVolunteers) * 100;
  
  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={styles.eventImageContainer}>
        <Image 
          source={{ uri: event.image }} 
          style={styles.eventImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <LinearGradient 
          colors={isFull ? ['#ef4444', '#dc2626'] : categoryGradient}
          style={styles.categoryBadge}
        >
          <Text style={styles.categoryText}>
            {isFull ? 'FULL' : event.category}
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
              {event.currentVolunteers}/{event.maxVolunteers} volunteers
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
          <Text style={styles.organizer}>by {event.organizer}</Text>
          <TouchableOpacity 
            style={[styles.applyButton, isFull && styles.applyButtonDisabled]}
            disabled={isFull}
          >
            <Text style={[styles.applyButtonText, isFull && styles.applyButtonTextDisabled]}>
              {isFull ? 'Full' : 'Apply Now'}
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

  // Fetch events from database
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${netconfig.API_BASE_URL}/api/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data.events || data || []); // Handle different response structures
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
      Alert.alert(
        'Error',
        'Failed to load events. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: fetchEvents },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = ['All', 'Environment', 'Community Service', 'Education', 'Animal Welfare', 'Health'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventPress = (eventId) => {
    router.push(`/event/${eventId}`);
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.mainScrollContent}
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

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Unable to load events</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
                    {category}
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
              <TouchableOpacity style={styles.sortButton}>
                <Feather name="filter" size={16} color="#6b7280" />
                <Text style={styles.sortButtonText}>Sort</Text>
              </TouchableOpacity>
            </View>
            
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
              />
            ))}
            
            {filteredEvents.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={64} color="#fed7aa" />
                <Text style={styles.emptyStateTitle}>No Events Found</Text>
                <Text style={styles.emptyStateText}>
                  {events.length === 0 
                    ? "No events available at the moment. Check back later!" 
                    : "Try adjusting your search or filter criteria"
                  }
                </Text>
              </View>
            )}
          </View>
        </>
      )}
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
});