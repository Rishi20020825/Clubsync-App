// app/event/[id].js - Event Details Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

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
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: event.image }} 
            style={styles.heroImage}
            resizeMode="cover"
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
            <Text style={styles.organizer}>Organized by {event.organizer}</Text>
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
              <Text style={styles.infoValue}>{event.date}</Text>
              <Text style={styles.infoSubValue}>{event.time} ({event.duration})</Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Feather name="map-pin" size={20} color="#f97316" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
              <Text style={styles.infoSubValue}>{event.meetingPoint}</Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Feather name="users" size={20} color="#f97316" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Volunteers</Text>
              <Text style={styles.infoValue}>
                {event.currentVolunteers}/{event.maxVolunteers} signed up
              </Text>
              {isFull && <Text style={styles.fullBadge}>FULL</Text>}
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <LinearGradient
                  colors={isFull ? ['#ef4444', '#dc2626'] : ['#f97316', '#ef4444']}
                  style={[styles.progressFill, { width: `${Math.min((event.currentVolunteers / event.maxVolunteers) * 100, 100)}%` }]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Gallery Section */}
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

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.fullDescription}</Text>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.listContainer}>
            {event.requirements.map((req, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletContainer}>
                  <Feather name="check-circle" size={16} color="#f97316" />
                </View>
                <Text style={styles.listText}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* What to Bring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Bring</Text>
          <View style={styles.listContainer}>
            {event.whatToBring.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletContainer}>
                  <Feather name="package" size={16} color="#f97316" />
                </View>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Get</Text>
          <View style={styles.listContainer}>
            {event.benefits.map((benefit, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletContainer}>
                  <Feather name="star" size={16} color="#f97316" />
                </View>
                <Text style={styles.listText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TouchableOpacity style={styles.contactContainer}>
            <View style={styles.contactIconContainer}>
              <Feather name="mail" size={20} color="#ffffff" />
            </View>
            <Text style={styles.contactText}>{event.organizerContact}</Text>
          </TouchableOpacity>
        </View>

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
      style={styles.applyButton}
      onPress={handleApply}
    >
      <LinearGradient
        colors={['#f97316', '#ef4444']}
        style={styles.applyButtonGradient}
      >
        <Feather name="user-plus" size={20} color="#ffffff" />
        <Text style={styles.applyButtonText}>Apply Now</Text>
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