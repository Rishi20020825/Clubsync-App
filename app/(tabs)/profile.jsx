// app/(tabs)/profile.js - Enhanced Profile Screen
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

  return (
    <LinearGradient colors={["#f3f4f6", "#e0e7ff", "#fff"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <LinearGradient colors={["#cb8916ff", "#e39308ff"]} style={styles.headerGradient}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.userdata?.name ? user.userdata.name[0] : 'U'}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <Text style={styles.name}>{user?.name || 'No Name'}</Text>
            <Text style={styles.email}>{user?.email || 'No Email'}</Text>
            
          </LinearGradient>

          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <LinearGradient colors={["#10b981", "#059669"]} style={styles.statIcon}>
                  <Text style={styles.statEmoji}>🎯</Text>
                </LinearGradient>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Events Joined</Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient colors={["#f59e0b", "#d97706"]} style={styles.statIcon}>
                  <Text style={styles.statEmoji}>⏰</Text>
                </LinearGradient>
                <Text style={styles.statValue}>36</Text>
                <Text style={styles.statLabel}>Hours Volunteered</Text>
              </View>
              <View style={styles.statItem}>
                <LinearGradient colors={["#8b5cf6", "#7c3aed"]} style={styles.statIcon}>
                  <Text style={styles.statEmoji}>🏆</Text>
                </LinearGradient>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Certificates</Text>
              </View>
            </View>
          </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Applications</Text>
          <TouchableOpacity style={styles.menuItem}>
            
            <Text style={styles.menuText}>Applied Events</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
           
            <Text style={styles.menuText}>Completed Events</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.menuItem}>
            
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profileupdate/update-profile')}>
            
            <Text style={styles.menuText}>Edit Profile</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient colors={["#bf4e4eff", "#be4c4cff"]} style={styles.logoutGradient}>
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#f59e0b',
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#c7d2fe',
    fontStyle: 'italic',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 16,
    color: '#fff',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
});