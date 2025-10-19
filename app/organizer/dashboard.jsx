import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { netconfig } from '../../netconfig'; // adjust the path if needed
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#fff7ed', '#fef2f2', '#fff']} style={styles.gradient}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient colors={['#f97316', '#ef4444']} style={styles.headerIcon}>
                <Feather name="clipboard" size={24} color="#ffffff" />
              </LinearGradient>
              <View>
                <Text style={styles.headerTitle}>Organizer</Text>
                <Text style={styles.headerSubtitle}>Manage Your Events</Text>
              </View>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={20} color="#f97316" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButtonDanger} 
                onPress={handleSignOut}
              >
                <Feather name="log-out" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <LinearGradient colors={['#f97316', '#ef4444']} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="calendar" size={24} color="#ffffff" />
              <Text style={styles.statNumber}>{events.length}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </LinearGradient>
            <View style={styles.statCardWhite}>
              <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.statIconContainer}>
                <Feather name="clock" size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.statNumberDark}>
                {events.filter(e => new Date(e.date) > new Date()).length}
              </Text>
              <Text style={styles.statLabelDark}>Upcoming</Text>
            </View>
          </View>

          {/* Events List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f97316" />
              <Text style={styles.loadingText}>Loading your events...</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient colors={['#f97316', '#ef4444']} style={styles.emptyIcon}>
                <Feather name="calendar" size={48} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.emptyText}>No Events Yet</Text>
              <Text style={styles.emptySubText}>You are not an organizer for any events yet</Text>
              <TouchableOpacity 
                style={styles.refreshButtonContainer}
                onPress={onRefresh}
              >
                <LinearGradient colors={['#f97316', '#ef4444']} style={styles.refreshButton}>
                  <Feather name="refresh-cw" size={18} color="#ffffff" />
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.eventsSection}>
              <Text style={styles.sectionTitle}>Your Events</Text>
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
                    <LinearGradient colors={['#f97316', '#ef4444']} style={styles.eventCardIcon}>
                      <Feather name="calendar" size={20} color="#ffffff" />
                    </LinearGradient>
                    <View style={styles.eventCardContent}>
                      <Text style={styles.eventTitle}>{item.title}</Text>
                      {item.date && (
                        <View style={styles.eventMetaRow}>
                          <Feather name="clock" size={14} color="#6b7280" />
                          <Text style={styles.eventDate}>{item.date}</Text>
                        </View>
                      )}
                      {item.location && (
                        <View style={styles.eventMetaRow}>
                          <Feather name="map-pin" size={14} color="#6b7280" />
                          <Text style={styles.eventLocation}>{item.location}</Text>
                        </View>
                      )}
                    </View>
                    <Feather name="chevron-right" size={24} color="#f97316" />
                  </TouchableOpacity>
                )}
                refreshing={refreshing}   
                onRefresh={onRefresh}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListFooterComponent={<View style={{ height: 20 }} />}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff7ed' 
  },
  gradient: { 
    flex: 1 
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 20,
    paddingHorizontal: 4
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12
  },
  headerIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#000000' 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#6b7280', 
    fontWeight: '500' 
  },
  headerButtons: { 
    flexDirection: 'row', 
    gap: 8 
  },
  iconButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fff7ed', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  iconButtonDanger: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fef2f2', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  statsContainer: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 24 
  },
  statCard: { 
    flex: 1, 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8
  },
  statCardWhite: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8
  },
  statIconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 8
  },
  statNumber: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#ffffff', 
    marginTop: 8, 
    marginBottom: 4 
  },
  statLabel: { 
    fontSize: 12, 
    color: 'rgba(255, 255, 255, 0.9)', 
    fontWeight: '600' 
  },
  statNumberDark: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#000000', 
    marginTop: 8, 
    marginBottom: 4 
  },
  statLabelDark: { 
    fontSize: 12, 
    color: '#6b7280', 
    fontWeight: '600' 
  },
  eventsSection: { 
    flex: 1 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#000000', 
    marginBottom: 16 
  },
  eventCard: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4
  },
  eventCardIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12
  },
  eventCardContent: { 
    flex: 1 
  },
  eventTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#000000', 
    marginBottom: 6 
  },
  eventMetaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginBottom: 4 
  },
  eventDate: { 
    fontSize: 14, 
    color: '#6b7280', 
    fontWeight: '500' 
  },
  eventLocation: { 
    fontSize: 14, 
    color: '#6b7280', 
    fontWeight: '500' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#6b7280',
    fontWeight: '500'
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  emptyIcon: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  emptyText: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 8, 
    textAlign: 'center',
    color: '#000000'
  },
  emptySubText: { 
    fontSize: 16, 
    color: '#6b7280', 
    marginBottom: 24, 
    textAlign: 'center',
    fontWeight: '500'
  },
  refreshButtonContainer: { 
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  refreshButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14, 
    paddingHorizontal: 28
  },
  refreshButtonText: { 
    color: '#ffffff', 
    fontWeight: '700', 
    fontSize: 16 
  },
});