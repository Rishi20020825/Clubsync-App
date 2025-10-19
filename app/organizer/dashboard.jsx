import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { netconfig } from '../../netconfig'; // adjust the path if needed
import { useFocusEffect } from '@react-navigation/native';
export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchEvents = async () => {
  try {
    setIsLoading(true);
    
    // Get user and token in parallel to save time
    const [userString, token] = await Promise.all([
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('token')
    ]);
    
    const user = userString ? JSON.parse(userString) : null;

    console.log('User:', user); // Debug log
    console.log('Token:', token ? 'Present' : 'Missing'); // Debug log

    if (!user?.id || !token) {
      console.log('Missing user or token, redirecting to login');
      router.replace('/auth/login');
      return;
    }

    const url = `${netconfig.API_BASE_URL}/api/events/organizer/${user.id}`;
    console.log('Fetching URL:', url); // Debug log
    
    // Create a timeout to abort fetch if it takes too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal // Add abort signal
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData); // Debug log
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      // Check for different possible response structures
      let eventsData;
      
      if (Array.isArray(responseData)) {
        // Direct array of events
        eventsData = responseData;
        console.log('Fetched events (array):', eventsData.length);
      } else if (responseData.events && Array.isArray(responseData.events)) {
        // Events nested in "events" property
        eventsData = responseData.events;
        console.log('Fetched events (events property):', eventsData.length);
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // Events nested in "data" property
        eventsData = responseData.data;
        console.log('Fetched events (data property):', eventsData.length);
      } else {
        // Unexpected response structure
        console.log('Unexpected response structure:', JSON.stringify(responseData).substring(0, 200));
        eventsData = [];
      }
      
      setEvents(eventsData || []);
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out after 10 seconds');
        Alert.alert(
          'Request Timeout',
          'The server took too long to respond. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      } else {
        throw fetchError; // Re-throw for the outer catch block
      }
    }
  } catch (error) {
    console.error('Error details:', error);
    Alert.alert(
      'Error',
      'Failed to fetch events. Please try again.',
      [{ text: 'OK', onPress: () => console.log('Alert closed') }]
    );
  } finally {
    setIsLoading(false);
    setRefreshing(false);
  }
};
  useEffect(() => {
    

    fetchEvents();
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );
  const onRefresh = async () => {
    setRefreshing(true);
    fetchEvents(); // No need for await since we handle loading state inside fetchEvents
  };
  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Your Events</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signOutBtn} 
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events found</Text>
          <Text style={styles.emptySubText}>You are not an organizer for any events yet</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => {
                console.log('Clicked Event ID:', item.id);
                router.push(`/organizer/event/${item.id}`);
              }}
            >
              <Text style={styles.eventTitle}>{item.title}</Text>
              {item.date && <Text style={styles.eventDate}>{item.date}</Text>}
              {item.location && <Text style={styles.eventLocation}>{item.location}</Text>}
            </TouchableOpacity>
          )}
          refreshing={refreshing}   
          onRefresh={onRefresh}
          initialNumToRender={5} // Optimize initial render
          maxToRenderPerBatch={10} // Batch rendering for better performance
          windowSize={5} // Controls how many items are rendered outside the viewport
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { fontSize: 24, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 8 },
  backBtn: { backgroundColor: '#3b82f6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  signOutBtn: { backgroundColor: '#ef4444', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  signOutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  eventCard: { padding: 16, backgroundColor: '#f3f4f6', borderRadius: 12, marginBottom: 12 },
  eventTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  eventDate: { fontSize: 14, color: '#4b5563', marginBottom: 2 },
  eventLocation: { fontSize: 14, color: '#4b5563', fontStyle: 'italic' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#4b5563' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  emptySubText: { fontSize: 16, color: '#4b5563', marginBottom: 24, textAlign: 'center' },
  refreshButton: { backgroundColor: '#f97316', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  refreshButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});