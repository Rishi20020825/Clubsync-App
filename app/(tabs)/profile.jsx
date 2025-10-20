// app/(tabs)/profile.js - ClubSync Profile Screen
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { netconfig } from '../../netconfig';
import StatsCard from '../../components/volunteer/StatsCard';

export default function ProfileScreen() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [volunteerStats, setVolunteerStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      console.log('📋 fetchUser - userData exists:', !!userData);
      console.log('📋 fetchUser - token exists:', !!token);
      
      if (userData) {
        const localUser = JSON.parse(userData);
        console.log('📋 fetchUser - User ID:', localUser.id);
        console.log('📋 fetchUser - User object keys:', Object.keys(localUser));
        setUser(localUser);
        
        // If we have a token, try to fetch fresh data from server
        if (token && localUser.id) {
          try {
            const response = await fetch(`${netconfig.API_BASE_URL}/api/users/${localUser.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const freshUserData = await response.json();
              // Update both state and local storage with fresh data
              setUser(freshUserData);
              await AsyncStorage.setItem('user', JSON.stringify(freshUserData));
            }
          } catch (error) {
            console.log('Failed to fetch fresh user data:', error);
            // Continue with local data if server request fails
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchVolunteerStats = async () => {
    console.log('🚀 fetchVolunteerStats function STARTED');
    try {
      setLoadingStats(true);
      console.log('⏳ Loading stats set to TRUE');
      
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      console.log('🔍 Fetching volunteer stats...');
      console.log('🔑 Token exists:', !!token);
      console.log('📜 Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'NULL');
      console.log('👤 User data exists:', !!userData);
      console.log('👤 Raw user data:', userData ? userData.substring(0, 100) + '...' : 'NULL');
      
      if (!token) {
        console.log('❌ Missing token! Cannot fetch stats.');
        setLoadingStats(false);
        // Set default data so component shows
        setVolunteerStats({
          totalPoints: 0,
          eventsParticipated: 0,
          eventsOrganized: 0,
          totalEvents: 0,
          badge: 'Bronze',
          nextBadge: 'Silver',
          progress: 0
        });
        return;
      }
      
      if (!userData) {
        console.log('❌ Missing user data! Cannot fetch stats.');
        setLoadingStats(false);
        // Set default data so component shows
        setVolunteerStats({
          totalPoints: 0,
          eventsParticipated: 0,
          eventsOrganized: 0,
          totalEvents: 0,
          badge: 'Bronze',
          nextBadge: 'Silver',
          progress: 0
        });
        return;
      }

      const localUser = JSON.parse(userData);
      console.log('👤 User ID:', JSON.stringify(localUser.id));
      console.log('👤 Full user object:', JSON.stringify(localUser, null, 2));
      
      // Try different API endpoint patterns that might work
      const possibleUrls = [
        `${netconfig.API_BASE_URL}/api/volunteers/stats/${localUser.id}`, // Correct endpoint matching web API
        `${netconfig.API_BASE_URL}/api/users/${localUser.id}/stats`,
        `${netconfig.API_BASE_URL}/api/volunteer/stats?userId=${localUser.id}`,
        `${netconfig.API_BASE_URL}/api/stats/volunteer/${localUser.id}`,
        `${netconfig.API_BASE_URL}/api/volunteer-stats/${localUser.id}`,
      ];
      
      console.log('📡 Trying API URLs:', possibleUrls);
      console.log('🌐 API_BASE_URL from netconfig:', netconfig.API_BASE_URL);
      console.log('🆔 User ID being used:', localUser.id);
      
      let finalResponse = null;
      let workingUrl = null;
      
      // Try each URL until one works
      for (const url of possibleUrls) {
        console.log('🔍 Trying URL:', url);
        try {
          const testResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log(`📥 ${url} - Status:`, testResponse.status);
          
          if (testResponse.ok) {
            finalResponse = testResponse;
            workingUrl = url;
            console.log('✅ Found working URL:', workingUrl);
            break;
          }
        } catch (error) {
          console.log(`❌ ${url} - Error:`, error.message);
        }
      }
      
      if (!finalResponse) {
        console.log('❌ None of the API URLs worked!');
        // Set default data
        setVolunteerStats({
          totalPoints: 0,
          eventsParticipated: 0,
          eventsOrganized: 0,
          totalEvents: 0,
          badge: 'Bronze',
          nextBadge: 'Silver',
          progress: 0
        });
        setLoadingStats(false);
        return;
      }
      
      console.log('✅ Using working URL:', workingUrl);
      const response = finalResponse;

      console.log('📥 Response received! Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Full API response:', JSON.stringify(result, null, 2));
        
        // Backend returns data inside { success: true, data: {...} }
        if (result.success && result.data) {
          console.log('✅ Stats data extracted:', JSON.stringify(result.data, null, 2));
          
          // Log badge structure
          console.log('🏅 Badge object:', result.data.badge);
          console.log('🏅 Badge type:', typeof result.data.badge);
          console.log('🏅 NextBadge object:', result.data.nextBadge);
          
          // Map the badge object to just the badge name/level
          // Handle progress object - extract percentage if it's an object
          let progressValue = 0;
          if (result.data.progress) {
            if (typeof result.data.progress === 'object') {
              // If progress is an object like {current, target, percentage, eventsNeeded}
              progressValue = result.data.progress.percentage || 0;
              console.log('🔄 Progress is object:', result.data.progress, 'Using percentage:', progressValue);
            } else if (typeof result.data.progress === 'number') {
              // If progress is already a number
              progressValue = result.data.progress;
              console.log('🔄 Progress is number:', progressValue);
            }
          }
          
          const statsData = {
            totalPoints: result.data.totalPoints,
            eventsParticipated: result.data.eventsParticipated,
            eventsOrganized: result.data.eventsOrganized,
            totalEvents: result.data.totalEvents,
            badge: result.data.badge?.name || result.data.badge?.level || result.data.badge || 'Bronze',
            nextBadge: result.data.nextBadge?.name || result.data.nextBadge?.level || result.data.nextBadge || 'Silver',
            progress: progressValue
          };
          
          console.log('✅ Mapped stats data:', JSON.stringify(statsData, null, 2));
          console.log('📊 Setting volunteerStats to:', statsData);
          setVolunteerStats(statsData);
        } else {
          console.log('⚠️ API returned success=false or no data');
          console.log('⚠️ Result object:', JSON.stringify(result, null, 2));
          // Set default data
          setVolunteerStats({
            totalPoints: 0,
            eventsParticipated: 0,
            eventsOrganized: 0,
            totalEvents: 0,
            badge: 'Bronze',
            nextBadge: 'Silver',
            progress: 0
          });
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Failed to fetch volunteer stats! Status:', response.status);
        console.log('❌ Error response body:', errorText);
        // Set default data instead of hiding component
        setVolunteerStats({
          totalPoints: 0,
          eventsParticipated: 0,
          eventsOrganized: 0,
          totalEvents: 0,
          badge: 'Bronze',
          nextBadge: 'Silver',
          progress: 0
        });
      }
    } catch (error) {
      console.error('❌ EXCEPTION in fetchVolunteerStats:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      // Set default data instead of hiding component
      setVolunteerStats({
        totalPoints: 0,
        eventsParticipated: 0,
        eventsOrganized: 0,
        totalEvents: 0,
        badge: 'Bronze',
        nextBadge: 'Silver',
        progress: 0
      });
    } finally {
      console.log('✅ Finally block - setting loadingStats to FALSE');
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchVolunteerStats();
  }, []);

  // Debug: Log when volunteerStats changes
  useEffect(() => {
    console.log('🔄 volunteerStats state updated:', volunteerStats);
  }, [volunteerStats]);

  // Refresh data when screen comes into focus (e.g., after editing profile)
  useFocusEffect(
    React.useCallback(() => {
      fetchUser();
      fetchVolunteerStats();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/(auth)/login');
  };

  // Profile stats data
  const profileStats = [
    { icon: 'calendar', value: '12', label: 'Events Joined', color: ['#10b981', '#059669'] },
    { icon: 'clock', value: '48', label: 'Hours Volunteered', color: ['#3b82f6', '#1d4ed8'] },
    { icon: 'award', value: '8', label: 'Certificates', color: ['#f59e0b', '#d97706'] },
    { icon: 'users', value: '5', label: 'Clubs Joined', color: ['#ec4899', '#db2777'] },
  ];

  // Recent achievements
  const recentAchievements = [
    { id: 1, title: 'Environmental Leader', issuer: 'Eco Warriors', date: '2024-06-15', type: 'Leadership' },
    { id: 2, title: 'Community Champion', issuer: 'Volunteer Hub', date: '2024-05-20', type: 'Service' },
    { id: 3, title: 'Event Organizer', issuer: 'Music Society', date: '2024-04-18', type: 'Management' },
  ];

  // Menu items
  const menuSections = [
    {
      title: 'My Activity',
      items: [
        { id: 'applied-events', icon: 'calendar-check', title: 'Applied Events', subtitle: '3 upcoming events', badge: '3' },
        { id: 'completed-events', icon: 'check-circle', title: 'Completed Events', subtitle: '12 events completed', badge: null },
        { id: 'my-clubs', icon: 'users', title: 'My Clubs', subtitle: '5 active memberships', badge: null },
        { id: 'certificates', icon: 'award', title: 'My Certificates', subtitle: '8 certificates earned', badge: 'New' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { id: 'notifications', icon: 'bell', title: 'Notifications', subtitle: 'Manage your preferences', badge: null },
        { id: 'edit-profile', icon: 'user-edit', title: 'Edit Profile', subtitle: 'Update your information', badge: null },
        { id: 'privacy', icon: 'shield', title: 'Privacy & Security', subtitle: 'Manage your privacy', badge: null },
        { id: 'help', icon: 'help-circle', title: 'Help & Support', subtitle: 'Get assistance', badge: null },
      ]
    }
  ];

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Header */}
      <LinearGradient 
        colors={['#f97316', '#ef4444']} 
        style={styles.profileHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileInfo}>
          <LinearGradient
            colors={['#ffffff', '#f9fafb']}
            style={styles.avatarContainer}
          >
            <Text style={styles.avatarText}>
              {user?.firstName ? user.firstName[0] : user?.name ? user.name[0] : 'U'}
            </Text>
          </LinearGradient>
          <Text style={styles.userName}>
            {user?.firstName 
              ? [user.firstName, user.lastName].filter(Boolean).join(' ')
              : user?.name || 'ClubSync User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'user@clubsync.app'}</Text>
          <View style={styles.membershipBadge}>
            <Feather name="star" size={12} color="#f97316" />
            <Text style={styles.membershipText}>Active Member</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profileupdate/update-profile')}>
          <Feather name="edit-2" size={16} color="#f97316" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Volunteer Stats Card */}
      <View style={styles.statsCardContainer}>
        <StatsCard stats={volunteerStats} loading={loadingStats} />
      </View>

      {/* Profile Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        <View style={styles.statsGrid}>
          {profileStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <LinearGradient colors={stat.color} style={styles.statIcon}>
                <Feather name={stat.icon} size={18} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.achievementsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="arrow-right" size={14} color="#f97316" />
          </TouchableOpacity>
        </View>
        
        {recentAchievements.map(achievement => (
          <TouchableOpacity key={achievement.id} style={styles.achievementCard}>
            <LinearGradient
              colors={achievement.type === 'Leadership' ? ['#f59e0b', '#d97706'] :
                     achievement.type === 'Service' ? ['#10b981', '#059669'] :
                     ['#3b82f6', '#1d4ed8']}
              style={styles.achievementIcon}
            >
              <Feather name="award" size={16} color="#ffffff" />
            </LinearGradient>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementIssuer}>by {achievement.issuer}</Text>
              <Text style={styles.achievementDate}>{new Date(achievement.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.achievementTypeBadge}>
              <Text style={styles.achievementTypeText}>{achievement.type}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => {
                if (item.id === 'edit-profile') {
                  router.push('/profileupdate/update-profile');
                } else if (item.id === 'help') {
                  router.push('/profile/help-support');
                } else if (item.id === 'notifications') {
                  router.push('/profile/notifications');
                } else if (item.id === 'privacy') {
                  router.push('/profile/privacy-security');
                }
                // Add other navigation logic here
              }}
            >
              <View style={styles.menuItemLeft}>
                <LinearGradient
                  colors={['#f97316', '#ef4444']}
                  style={styles.menuIcon}
                >
                  <Feather name={item.icon} size={16} color="#ffffff" />
                </LinearGradient>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                {item.badge && (
                  <View style={[styles.menuBadge, item.badge === 'New' && styles.newBadge]}>
                    <Text style={[styles.menuBadgeText, item.badge === 'New' && styles.newBadgeText]}>
                      {item.badge}
                    </Text>
                  </View>
                )}
                <Feather name="chevron-right" size={18} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.logoutGradient}
          >
            <Feather name="log-out" size={18} color="#ffffff" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
    marginTop: 30,
  },
  scrollContent: {
    paddingBottom: 140, // Space for floating tabs
  },

  // Profile Header Styles
  profileHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    position: 'relative',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f97316',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 12,
    textAlign: 'center',
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  membershipText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    position: 'absolute',
    top: 32,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Stats Card Container
  statsCardContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Stats Section Styles
  statsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Achievements Section Styles
  achievementsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    marginRight: 4,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  achievementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  achievementIssuer: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '500',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },
  achievementTypeBadge: {
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  achievementTypeText: {
    fontSize: 10,
    color: '#f97316',
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Menu Section Styles
  menuSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  newBadge: {
    backgroundColor: '#ef4444',
  },
  newBadgeText: {
    color: '#ffffff',
  },

  // Logout Section Styles
  logoutSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});