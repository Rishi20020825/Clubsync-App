// app/event/[id].js - Event Details Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
  
  // Find the event by ID
  const event = MOCK_EVENTS.find(e => e.id === parseInt(id));
  
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

  const isFull = event.currentVolunteers >= event.maxVolunteers;
  
  const handleApply = () => {
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
          onPress: () => {
            setIsApplied(true);
            Alert.alert('Success!', 'Your application has been submitted. You will receive a confirmation email shortly.');
          }
        }
      ]
    );
  };

  const handleViewOnly = () => {
    Alert.alert('Login Required', 'Please login to apply for events.');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: getCategoryColor(event.category) }]}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.organizer}>Organized by {event.organizer}</Text>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📅</Text>
            <View>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{event.date}</Text>
              <Text style={styles.infoValue}>{event.time} ({event.duration})</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📍</Text>
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
              <Text style={styles.infoSubValue}>{event.meetingPoint}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>👥</Text>
            <View>
              <Text style={styles.infoLabel}>Volunteers</Text>
              <Text style={styles.infoValue}>
                {event.currentVolunteers}/{event.maxVolunteers} signed up
              </Text>
              {isFull && <Text style={styles.fullBadge}>FULL</Text>}
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.fullDescription}</Text>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {event.requirements.map((req, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listBullet}>•</Text>
              <Text style={styles.listText}>{req}</Text>
            </View>
          ))}
        </View>

        {/* What to Bring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Bring</Text>
          {event.whatToBring.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listBullet}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Get</Text>
          {event.benefits.map((benefit, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listBullet}>✓</Text>
              <Text style={styles.listText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.contactText}>{event.organizerContact}</Text>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.applyButton, 
            (isFull || isApplied) && styles.disabledButton
          ]} 
          onPress={handleApply}
          disabled={isFull || isApplied}
        >
          <Text style={styles.applyButtonText}>
            {isApplied ? 'Applied ✓' : isFull ? 'Event Full' : 'Apply Now'}
          </Text>
        </TouchableOpacity>
        
        {/* For non-logged in users */}
        {/* <TouchableOpacity style={styles.viewOnlyButton} onPress={handleViewOnly}>
          <Text style={styles.viewOnlyButtonText}>Login to Apply</Text>
        </TouchableOpacity> */}
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
  heroSection: {
    padding: 20,
    paddingTop: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 34,
  },
  organizer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickInfo: {
    padding: 20,
    backgroundColor: '#fff',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  infoSubValue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  fullBadge: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  listBullet: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
    marginTop: 2,
  },
  listText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  contactText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  applyButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewOnlyButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewOnlyButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
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
  backButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});