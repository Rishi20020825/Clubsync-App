import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Mock event data (same structure as [id].jsx)
const EVENTS = [
  {
    id: 3,
    title: 'Hackathon 2025 – Register Now!',
    description: 'Solve real-world problems in 24 hours. Prizes worth $5000!',
    fullDescription: 'Join our hackathon to solve real-world problems. Work in teams, build solutions, and win prizes!',
    date: '2025-07-25',
    time: '09:00 AM',
    duration: '24 hours',
    location: 'Main Auditorium',
    meetingPoint: 'Auditorium Entrance',
    maxVolunteers: 100,
    currentVolunteers: 67,
    category: 'Technology',
    organizer: 'Tech Club',
    organizerContact: 'techclub@example.com',
    requirements: [
      'Minimum age: 16 years old',
      'Bring your own laptop',
      'Teamwork skills',
      'Basic coding knowledge'
    ],
    whatToBring: [
      'Laptop',
      'Charger',
      'Snacks',
      'Water bottle'
    ],
    benefits: [
      'Certificate of participation',
      'Prizes for winners',
      'Networking opportunities',
      'Free meals'
    ],
    image: require('../../assets/2.png'),
    timeAgo: '4 hours ago',
  },
];

export default function ApplyEvent() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');

  useEffect(() => {
    // Find event by id
    const found = EVENTS.find(e => String(e.id) === String(id));
    setEvent(found);
  }, [id]);

  const handleApply = () => {
    if (!applicantName || !applicantEmail) {
      Alert.alert('Error', 'Please enter your name and email.');
      return;
    }
    // Here you would send the application to your backend
    Alert.alert('Success', `Applied for ${event?.title}!`);
    router.replace('/dashboard');
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Event not found.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#f3f4f6", "#e0e7ff", "#fff"]} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <LinearGradient colors={["#6366f1", "#4f46e5"]} style={styles.headerGradient}>
            <Text style={styles.title}>{event.title}</Text>
            <Image source={event.image} style={styles.image} />
            <Text style={styles.time}>{event.timeAgo}</Text>
          </LinearGradient>
          <Text style={styles.description}>{event.fullDescription}</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>📍 Place:</Text>
            <Text style={styles.infoValue}>{event.location}</Text>
            <Text style={styles.infoLabel}>📅 When:</Text>
            <Text style={styles.infoValue}>{event.date} at {event.time} ({event.duration})</Text>
            <Text style={styles.infoLabel}>🧭 Meeting Point:</Text>
            <Text style={styles.infoValue}>{event.meetingPoint}</Text>
            <Text style={styles.infoLabel}>👥 Volunteers:</Text>
            <Text style={styles.infoValue}>{event.currentVolunteers}/{event.maxVolunteers}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Requirements:</Text>
            {event.requirements.map((req, idx) => (
              <Text key={idx} style={styles.infoValue}>• {req}</Text>
            ))}
            <Text style={styles.infoLabel}>What to Bring:</Text>
            {event.whatToBring.map((item, idx) => (
              <Text key={idx} style={styles.infoValue}>• {item}</Text>
            ))}
            <Text style={styles.infoLabel}>Benefits:</Text>
            {event.benefits.map((b, idx) => (
              <Text key={idx} style={styles.infoValue}>✓ {b}</Text>
            ))}
          </View>

          <View style={styles.formBox}>
            
            
            <TouchableOpacity style={styles.button} onPress={handleApply}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scrollContent: { padding: 24, alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 32,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  image: {
    width: 220,
    height: 120,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  time: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 2,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '700',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 8,
    marginBottom: 2,
  },
  formBox: {
    width: '100%',
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  formLabel: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 2,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#fff',
    padding: 13,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    color: '#374151',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  error: { color: 'red', fontSize: 18, marginTop: 40 },
});
