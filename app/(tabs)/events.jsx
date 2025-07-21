// app/(tabs)/events.js - Events List Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Beach Cleanup Drive',
    description: 'Join us for a community beach cleanup to help protect marine life and keep our beaches beautiful.',
    date: '2025-07-15',
    time: '08:00 AM',
    location: 'Mount Lavinia Beach',
    maxVolunteers: 50,
    currentVolunteers: 23,
    category: 'Environment',
    organizer: 'Green Earth Club',
    image: 'https://via.placeholder.com/300x150/4ade80/ffffff?text=Beach+Cleanup'
  },
  {
    id: 2,
    title: 'Food Distribution for Elderly',
    description: 'Help distribute meals to elderly residents in the community. Make a difference in their day!',
    date: '2025-07-08',
    time: '11:00 AM',
    location: 'Sarana Elder Home',
    maxVolunteers: 20,
    currentVolunteers: 8,
    category: 'Community Service',
    organizer: 'Caring Hearts Club',
    image: 'https://via.placeholder.com/300x150/f59e0b/ffffff?text=Food+Distribution'
  },
  {
    id: 3,
    title: 'Tree Planting Initiative',
    description: 'Plant trees in the neighborhood park to create a greener environment for future generations.',
    date: '2025-07-22',
    time: '07:30 AM',
    location: 'Gothatuwa Wetland Park',
    maxVolunteers: 35,
    currentVolunteers: 35,
    category: 'Environment',
    organizer: 'Nature Lovers Society',
    image: 'https://via.placeholder.com/300x150/10b981/ffffff?text=Tree+Planting'
  },
  {
    id: 4,
    title: 'Reading Program for Kids',
    description: 'Volunteer to read stories and help children improve their reading skills at the local library.',
    date: '2025-07-12',
    time: '02:00 PM',
    location: 'Tampines Regional Library',
    maxVolunteers: 15,
    currentVolunteers: 12,
    category: 'Education',
    organizer: 'Book Buddies Club',
    image: 'https://via.placeholder.com/300x150/8b5cf6/ffffff?text=Reading+Program'
  },
  {
    id: 5,
    title: 'Animal Shelter Care',
    description: 'Spend time caring for rescued animals, help with feeding, cleaning, and giving them love.',
    date: '2025-07-18',
    time: '09:00 AM',
    location: 'SPCA Singapore',
    maxVolunteers: 25,
    currentVolunteers: 19,
    category: 'Animal Welfare',
    organizer: 'Animal Lovers Unite',
    image: 'https://via.placeholder.com/300x150/ec4899/ffffff?text=Animal+Shelter'
  }
];

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
        <LinearGradient 
          colors={categoryGradient} 
          style={styles.eventImagePlaceholder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="calendar" size={32} color="#ffffff" />
          <Text style={styles.eventImageText}>{event.category}</Text>
        </LinearGradient>
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

  const categories = ['All', 'Environment', 'Community Service', 'Education', 'Animal Welfare', 'Health'];

  const filteredEvents = MOCK_EVENTS.filter(event => {
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
        
        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={64} color="#fed7aa" />
            <Text style={styles.emptyStateTitle}>No Events Found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
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
  },
  headerTitle: {
    fontSize: 28,
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
    height: 140,
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