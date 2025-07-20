import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import EventsScreen from './(tabs)/events';
import ProfileScreen from './(tabs)/profile';
import { useRouter } from 'expo-router';
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
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);

  // 15 feed items alternating club, post, event pattern
  const feedData = [
    {
      id: 1,
      type: 'club',
      title: 'New Club: Eco Warriors 🌿',
      description: 'Join our mission to promote sustainability on campus!',
      image: require('../assets/3.png'),
      time: 'Just now',
    },
    {
      id: 2,
      type: 'post',
      title: 'Music Club – Annual Night Recap 🎶',
      description: 'Relive the magic from our Annual Music Night!',
      image: require('../assets/1.jpeg'),
      time: '2 hours ago',
    },
    {
      id: 3,
      type: 'event',
      title: 'Hackathon 2025 – Register Now!',
      description: 'Solve real-world problems in 24 hours. Prizes worth $5000!',
      image: require('../assets/2.png'),
      time: '4 hours ago',
    },

    {
      id: 4,
      type: 'club',
      title: 'Join the Debate Club 🗣️',
      description: 'Sharpen your skills and represent our college in national debates.',
      image: require('../assets/vote.jpg'),
      time: '1 day ago',
    },
    {
      id: 5,
      type: 'post',
      title: 'AI Club Project Showcase 🤖',
      description: 'Check out the amazing AI projects built by our members.',
      image: require('../assets/vote.jpg'),
      time: '2 days ago',
    },
    
    
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View>
            <Text style={styles.feedHeader}>
              Welcome{user?.name ? `, ${user.name}` : ''}!
            </Text>
            <Text style={styles.feedSubheader}>Latest updates from clubs and events</Text>
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              {feedData.map(item => (
                <View key={item.id} style={styles.feedCard}>
                  {item.image && <Image source={item.image} style={styles.feedImage} />}
                  <View style={styles.feedContent}>
                    <Text style={styles.feedTitle}>{item.title}</Text>
                    <Text style={styles.feedDescription}>{item.description}</Text>

                    <View style={styles.actionRow}>
                      <Text style={styles.feedTime}>{item.time}</Text>
                      {(item.type === 'event' || item.type === 'club') && (
                        <TouchableOpacity
                          style={[
                            styles.smallButton,
                            item.type === 'event' ? styles.applyButton : styles.registerButton,
                          ]}
                          onPress={() => {
                            if (item.type === 'event') {
                              router.push(`/event/apply?id=${item.id}`);
                            }
                          }}
                        >
                          <Text style={styles.smallButtonText}>
                            {item.type === 'event' ? 'Apply' : 'Register'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
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
        return <ProfileScreen />;
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#fff7ed', '#fff', '#fef2f2']} style={styles.gradient}>
      <View style={styles.container}>
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
              <Text style={[styles.tabLabel, activeTab === tab.key && { color: '#fb923c' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {activeTab === 'home' ? (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {renderContent()}
            </ScrollView>
          ) : (
            renderContent()
          )}
        </View>
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
  },
  brandRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 40,
    marginLeft: 70,
  },
  brandIconAccent: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandTextAccent: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    elevation: 2,
  },
  tabButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeTabButton: {
    backgroundColor: '#ffedd5',
    borderRadius: 12,
  },
  tabLabel: { fontSize: 13, color: '#aaa', marginTop: 2, fontWeight: 'bold' },
  content: { flex: 1 },
  scrollContainer: { paddingBottom: 80 },
  centerContent: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  subheading: { color: '#666', fontSize: 16, textAlign: 'center' },
  feedHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  feedSubheader: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  feedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  feedImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
  },
  feedContent: {
    padding: 16,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#222',
  },
  feedDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  feedTime: {
    fontSize: 12,
    color: '#999',
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 2,
  },
  applyButton: {
    backgroundColor: '#fb923c',
  },
  registerButton: {
    backgroundColor: '#6d28d9',
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});
