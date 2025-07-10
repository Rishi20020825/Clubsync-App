import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import EventsScreen from './(tabs)/events';
import ProfileScreen from './(tabs)/profile';
import { useRouter } from 'expo-router';
import  {  useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'events', label: 'Events', icon: 'calendar' },
  { key: 'clubs', label: 'Clubs', icon: 'users' },
  { key: 'wallet', label: 'Wallet', icon: 'award' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

export default function Dashboard() {
  const [user, setUser] = useState({});

useEffect(() => {
  const fetchUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };
  fetchUser();
}, []);
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();

  // Placeholder content for each tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.heading}>
            Welcome{user?.name ? `, ${user.name}` : ''}!
      </Text>
            <Text style={styles.subheading}>Quick stats, upcoming events, and more will appear here.</Text>
          </View>
        );
      case 'events':
        return <EventsScreen />;
      case 'clubs':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.heading}>Clubs</Text>
            <Text style={styles.subheading}>Your clubs and club info will be shown here.</Text>
          </View>
        );
      case 'wallet':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.heading}>Wallet</Text>
            <Text style={styles.subheading}>Certificates and rewards will be shown here.</Text>
          </View>
        );
      case 'profile':
        return <ProfileScreen/>;
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#fff7ed', '#fff', '#fef2f2']} style={styles.gradient}>
      <View style={styles.container}>
        {/* Custom App Header - solid accent color like event details */}
        <View style={styles.headerAccent}>
          <View style={styles.brandRowCenter}>
            <View style={styles.brandIconAccent}>
              <Feather name="zap" size={28} color="#fb923c" />
            </View>
            <Text style={styles.brandTextAccent}>ClubSync</Text>
          </View>
        </View>
        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Feather
                name={tab.icon}
                size={24}
                color={activeTab === tab.key ? '#fb923c' : '#aaa'}
              />
              <Text style={[styles.tabLabel, activeTab === tab.key && { color: '#fb923c' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.content}>{renderContent()}</View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  headerAccent: {
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 24,
    backgroundColor: '#fb923c',
    borderBottomWidth: 0,
  },
  brandRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 40,
    marginTop: 0,
    marginLeft: 70,
  },
  brandIconAccent: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  brandTextAccent: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderRadius: 0, // square
  },
  tabButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0, // square
  },
  activeTabButton: {
    backgroundColor: '#ffedd5',
    borderRadius: 0, // square
  },
  tabLabel: { fontSize: 13, color: '#aaa', marginTop: 2, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingTop: 48 },
  centerContent: { alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  subheading: { color: '#666', fontSize: 16, textAlign: 'center' },
}); 