// app/profile/notifications.jsx - Notification Settings Page
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from '../../netconfig';

export default function NotificationSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Notification preferences state
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    eventReminders: false,
    eventUpdates: false,
    clubAnnouncements: true,
    volunteerOpportunities: true,
    achievementBadges: false,
    weeklyDigest: false,
    emailNotifications: false,
    smsNotifications: false,
  });

  // Notification categories
  const notificationCategories = [
    {
      title: 'General Notifications',
      items: [
        {
          key: 'pushNotifications',
          title: 'Push Notifications',
          subtitle: 'Receive push notifications on your device',
          icon: 'bell',
        },
        {
          key: 'emailNotifications',
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          icon: 'mail',
        },
        {
          key: 'smsNotifications',
          title: 'SMS Notifications',
          subtitle: 'Receive important notifications via SMS',
          icon: 'message-square',
        },
      ]
    },
    {
      title: 'Event Notifications',
      items: [
        {
          key: 'eventReminders',
          title: 'Event Reminders',
          subtitle: 'Get reminded about upcoming events you joined',
          icon: 'calendar',
        },
        {
          key: 'eventUpdates',
          title: 'Event Updates',
          subtitle: 'Get notified when event details change',
          icon: 'refresh-cw',
        },
        {
          key: 'volunteerOpportunities',
          title: 'New Volunteer Opportunities',
          subtitle: 'Get notified about new volunteer events',
          icon: 'users',
        },
      ]
    },
    {
      title: 'Club & Community',
      items: [
        {
          key: 'clubAnnouncements',
          title: 'Club Announcements',
          subtitle: 'Receive updates from clubs you joined',
          icon: 'megaphone',
        },
        {
          key: 'achievementBadges',
          title: 'Achievement Badges',
          subtitle: 'Get notified when you earn new badges',
          icon: 'award',
        },
        {
          key: 'weeklyDigest',
          title: 'Weekly Digest',
          subtitle: 'Weekly summary of activities and updates',
          icon: 'book-open',
        },
      ]
    },
  ];

  // Load notification preferences on component mount
  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    setLoading(true);
    try {
      // First try to get from local storage
      const localPrefs = await AsyncStorage.getItem('notificationPreferences');
      if (localPrefs) {
        setPreferences(JSON.parse(localPrefs));
      }

      // Then try to get from server
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        const response = await fetch(`${netconfig.API_BASE_URL}/api/users/${user.id}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const serverPrefs = await response.json();
          setPreferences(serverPrefs);
          await AsyncStorage.setItem('notificationPreferences', JSON.stringify(serverPrefs));
        }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Only save to local storage for better UX, server save happens on "Save" button
    await AsyncStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
  };

  const saveToServer = async (prefs) => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        await fetch(`${netconfig.API_BASE_URL}/api/users/${user.id}/notifications`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(prefs)
        });
      }
    } catch (error) {
      console.error('Error saving to server:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    Alert.alert(
      'Reset to Default',
      'Are you sure you want to reset all notification settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultPrefs = {
              pushNotifications: true,
              eventReminders: false,
              eventUpdates: false,
              clubAnnouncements: true,
              volunteerOpportunities: true,
              achievementBadges: false,
              weeklyDigest: false,
              emailNotifications: false,
              smsNotifications: false,
            };
            setPreferences(defaultPrefs);
            AsyncStorage.setItem('notificationPreferences', JSON.stringify(defaultPrefs));
            saveToServer(defaultPrefs);
          }
        }
      ]
    );
  };

  const NotificationItem = ({ item, categoryTitle }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationLeft}>
        <LinearGradient
          colors={['#f97316', '#ef4444']}
          style={styles.notificationIcon}
        >
          <Feather name={item.icon} size={16} color="#ffffff" />
        </LinearGradient>
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Switch
        value={preferences[item.key]}
        onValueChange={(value) => updatePreference(item.key, value)}
        trackColor={{ false: '#e5e7eb', true: '#f97316' }}
        thumbColor={preferences[item.key] ? '#ffffff' : '#ffffff'}
        ios_backgroundColor="#e5e7eb"
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#fff7ed', '#fef2f2', '#fff']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>Loading notification settings...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#fff7ed', '#fef2f2', '#fff']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#f97316" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
            <Feather name="refresh-cw" size={20} color="#f97316" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Info */}
          <LinearGradient 
            colors={['#f97316', '#ef4444']} 
            style={styles.headerSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="bell" size={32} color="#ffffff" />
            <Text style={styles.headerSectionTitle}>Manage Your Notifications</Text>
            <Text style={styles.headerSectionSubtitle}>
              Customize how and when you want to receive notifications
            </Text>
          </LinearGradient>

          {/* Notification Categories */}
          {notificationCategories.map((category, index) => (
            <View key={index} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.categoryCard}>
                {category.items.map((item, itemIndex) => (
                  <View key={item.key}>
                    <NotificationItem item={item} categoryTitle={category.title} />
                    {itemIndex < category.items.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Save and Cancel Buttons */}
          <View style={styles.buttonSection}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]} 
                onPress={async () => {
                  // Save preferences and go back
                  await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
                  saveToServer(preferences);
                  router.back();
                }}
                disabled={saving}
              >
                <LinearGradient
                  colors={saving ? ['#9ca3af', '#6b7280'] : ['#f97316', '#ef4444']}
                  style={styles.saveButtonGradient}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Feather name="save" size={16} color="#ffffff" />
                  )}
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  resetButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  headerSection: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  headerSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSectionSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  categorySection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 68,
  },
  buttonSection: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
