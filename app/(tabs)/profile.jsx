// app/(tabs)/profile.js - ClubSync Profile Screen
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [user, setUser] = useState({ name: '', email: '' });
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
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.name || 'ClubSync User'}
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
    fontSize: 32,
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
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 12,
    textAlign: 'center',
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  membershipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  newBadge: {
    backgroundColor: '#ef4444',
  },
  menuBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
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