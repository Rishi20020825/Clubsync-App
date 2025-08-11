import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { netconfig } from '../../netconfig'; // adjust the path if needed
export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Update the fetchEvents function in your OrganizerDashboard component
const fetchEvents = async () => {
  try {
    const user = JSON.parse(await AsyncStorage.getItem('user'));
    const token = await AsyncStorage.getItem('token');

    console.log('User:', user); // Debug log
    console.log('Token:', token ? 'Present' : 'Missing'); // Debug log

    if (!user?.id || !token) {
      console.log('Missing user or token, redirecting to login');
      router.replace('/login');
      return;
    }

    const url = `${netconfig.API_BASE_URL}/api/events/organizer/${user.id}`;
    console.log('Fetching URL:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status); // Debug log

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData); // Debug log
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched events:', data.length); // Debug log
    setEvents(data);
  } catch (error) {
    console.error('Error details:', error);
    Alert.alert(
      'Error',
      'Failed to fetch events. Please try again.',
      [{ text: 'OK', onPress: () => console.log('Alert closed') }]
    );
  }
};
    fetchEvents();



  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Your Events</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={events}
        
        keyExtractor={item => item.id.toString()}
        
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => 
            {
                console.log('Clicked Event ID:', item.id);
                router.push(`/organizer/event/${item.id}`);}}

          >
            <Text style={styles.eventTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { fontSize: 24, fontWeight: 'bold' },
  signOutBtn: { backgroundColor: '#ef4444', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  signOutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  eventCard: { padding: 16, backgroundColor: '#f3f4f6', borderRadius: 12, marginBottom: 12 },
  eventTitle: { fontSize: 18, fontWeight: '600' },

});