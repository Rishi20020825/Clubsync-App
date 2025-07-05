// app/(tabs)/events.js - Events List Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Beach Cleanup Drive',
    description: 'Join us for a community beach cleanup to help protect marine life and keep our beaches beautiful.',
    date: '2025-07-15',
    time: '08:00 AM',
    location: 'East Coast Park',
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
    location: 'Community Center Block 123',
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
    location: 'Bishan Park',
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

const EventCard = ({ event, onPress }) => {
  const isFull = event.currentVolunteers >= event.maxVolunteers;
  
  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={styles.eventImageContainer}>
        <View style={[styles.eventImagePlaceholder, { backgroundColor: getCategoryColor(event.category) }]}>
          <Text style={styles.eventImageText}>{event.category}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{event.date} at {event.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👥</Text>
            <Text style={styles.detailText}>
              {event.currentVolunteers}/{event.maxVolunteers} volunteers
            </Text>
            {isFull && <Text style={styles.fullBadge}>FULL</Text>}
          </View>
        </View>
        
        <Text style={styles.organizer}>by {event.organizer}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function EventsScreen() {
  const router = useRouter();

  const handleEventPress = (eventId) => {
    router.push(`/event/${eventId}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upcoming Events</Text>
          <Text style={styles.headerSubtitle}>Find volunteering opportunities near you</Text>
        </View>
        
        <View style={styles.eventsList}>
          {MOCK_EVENTS.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event.id)}
            />
          ))}
        </View>
      </ScrollView>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventsList: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImageContainer: {
    position: 'relative',
    height: 120,
  },
  eventImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  fullBadge: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  organizer: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});