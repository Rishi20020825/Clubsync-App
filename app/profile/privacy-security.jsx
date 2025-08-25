// app/profile/privacy-security.jsx - Privacy & Security Settings Page
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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from '../../netconfig';

export default function PrivacySecuritySettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Privacy and security preferences state
  const [preferences, setPreferences] = useState({
    profileVisibility: 'public', // public, friends, private
    showEmail: false,
    showPhone: false,
    showVolunteerHours: true,
    allowEventInvitations: true,
    allowClubInvitations: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
    dataCollection: true,
    analyticsTracking: false,
    locationTracking: false,
    twoFactorAuth: false,
  });

  // Privacy categories
  const privacyCategories = [
    {
      title: 'Profile Privacy',
      items: [
        {
          key: 'showEmail',
          title: 'Show Email Address',
          subtitle: 'Display your email address on your public profile',
          icon: 'mail',
          type: 'switch'
        },
        {
          key: 'showPhone',
          title: 'Show Phone Number',
          subtitle: 'Display your phone number on your profile',
          icon: 'phone',
          type: 'switch'
        },
        {
          key: 'showVolunteerHours',
          title: 'Show Volunteer Hours',
          subtitle: 'Display your volunteer hours and achievements',
          icon: 'clock',
          type: 'switch'
        },
        {
          key: 'showOnlineStatus',
          title: 'Show Online Status',
          subtitle: 'Let others see when you are active',
          icon: 'circle',
          type: 'switch'
        },
      ]
    },
    {
      title: 'Communication',
      items: [
        {
          key: 'allowEventInvitations',
          title: 'Event Invitations',
          subtitle: 'Allow organizers to invite you to events',
          icon: 'calendar',
          type: 'switch'
        },
        {
          key: 'allowClubInvitations',
          title: 'Club Invitations',
          subtitle: 'Allow clubs to send you invitations',
          icon: 'users',
          type: 'switch'
        },
        {
          key: 'allowDirectMessages',
          title: 'Direct Messages',
          subtitle: 'Allow other users to send you direct messages',
          icon: 'message-circle',
          type: 'switch'
        },
      ]
    },
    {
      title: 'Data & Tracking',
      items: [
        {
          key: 'dataCollection',
          title: 'Data Collection',
          subtitle: 'Allow app to collect usage data for improvements',
          icon: 'database',
          type: 'switch'
        },
        {
          key: 'analyticsTracking',
          title: 'Analytics Tracking',
          subtitle: 'Help improve the app with anonymous usage analytics',
          icon: 'bar-chart',
          type: 'switch'
        },
        {
          key: 'locationTracking',
          title: 'Location Services',
          subtitle: 'Allow app to access your location for event suggestions',
          icon: 'map-pin',
          type: 'switch'
        },
      ]
    },
    {
      title: 'Security',
      items: [
        {
          key: 'twoFactorAuth',
          title: 'Two-Factor Authentication',
          subtitle: 'Add an extra layer of security to your account',
          icon: 'shield',
          type: 'switch'
        },
      ]
    },
  ];

  // Security actions
  const securityActions = [
    {
      id: 'change-password',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: 'lock',
      action: () => handleChangePassword(),
    },
    {
      id: 'login-history',
      title: 'Login History',
      subtitle: 'View your recent login activity',
      icon: 'activity',
      action: () => handleViewLoginHistory(),
    },
    {
      id: 'active-sessions',
      title: 'Active Sessions',
      subtitle: 'Manage devices logged into your account',
      icon: 'smartphone',
      action: () => handleViewActiveSessions(),
    },
    {
      id: 'download-data',
      title: 'Download My Data',
      subtitle: 'Request a copy of your personal data',
      icon: 'download',
      action: () => handleDownloadData(),
    },
    {
      id: 'delete-account',
      title: 'Delete Account',
      subtitle: 'Permanently delete your account and all data',
      icon: 'trash-2',
      action: () => handleDeleteAccount(),
      danger: true,
    },
  ];

  // Load privacy preferences on component mount
  useEffect(() => {
    loadPrivacyPreferences();
  }, []);

  const loadPrivacyPreferences = async () => {
    setLoading(true);
    try {
      // First try to get from local storage
      const localPrefs = await AsyncStorage.getItem('privacyPreferences');
      if (localPrefs) {
        setPreferences(JSON.parse(localPrefs));
      }

      // Then try to get from server
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        const response = await fetch(`${netconfig.API_BASE_URL}/api/users/${user.id}/privacy`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const serverPrefs = await response.json();
          setPreferences(serverPrefs);
          await AsyncStorage.setItem('privacyPreferences', JSON.stringify(serverPrefs));
        }
      }
    } catch (error) {
      console.error('Error loading privacy preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Save to local storage immediately for better UX
    await AsyncStorage.setItem('privacyPreferences', JSON.stringify(newPreferences));
  };

  const saveToServer = async (prefs) => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        const response = await fetch(`${netconfig.API_BASE_URL}/api/users/${user.id}/privacy`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(prefs)
        });

        if (!response.ok) {
          throw new Error('Failed to save privacy settings');
        }
      }
    } catch (error) {
      console.error('Error saving to server:', error);
      Alert.alert('Error', 'Failed to save privacy settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Security action handlers
  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature will redirect you to change your password.');
  };

  const handleViewLoginHistory = () => {
    Alert.alert('Login History', 'This feature will show your recent login activity.');
  };

  const handleViewActiveSessions = () => {
    Alert.alert('Active Sessions', 'This feature will show devices logged into your account.');
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Data',
      'We will prepare your data for download and send you an email when ready.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Data', onPress: () => console.log('Data download requested') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'This will permanently delete your account, events, and all associated data.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete Forever', style: 'destructive', onPress: () => console.log('Account deletion requested') }
              ]
            );
          }
        }
      ]
    );
  };

  const ProfileVisibilitySelector = () => {
    const options = [
      { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
      { value: 'friends', label: 'Club Members', desc: 'Only club members can see your profile' },
      { value: 'private', label: 'Private', desc: 'Only you can see your profile' },
    ];

    return (
      <View style={styles.visibilitySection}>
        <Text style={styles.categoryTitle}>Profile Visibility</Text>
        <View style={styles.categoryCard}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.visibilityOption,
                index < options.length - 1 && styles.visibilityOptionBorder
              ]}
              onPress={() => updatePreference('profileVisibility', option.value)}
            >
              <View style={styles.visibilityLeft}>
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radioButton,
                    preferences.profileVisibility === option.value && styles.radioButtonSelected
                  ]}>
                    {preferences.profileVisibility === option.value && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
                <View style={styles.visibilityInfo}>
                  <Text style={styles.visibilityLabel}>{option.label}</Text>
                  <Text style={styles.visibilityDesc}>{option.desc}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const PrivacyItem = ({ item }) => (
    <View style={styles.privacyItem}>
      <View style={styles.privacyLeft}>
        <LinearGradient
          colors={['#f97316', '#ef4444']}
          style={styles.privacyIcon}
        >
          <Feather name={item.icon} size={16} color="#ffffff" />
        </LinearGradient>
        <View style={styles.privacyInfo}>
          <Text style={styles.privacyTitle}>{item.title}</Text>
          <Text style={styles.privacySubtitle}>{item.subtitle}</Text>
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

  const SecurityActionItem = ({ item }) => (
    <TouchableOpacity style={styles.securityActionItem} onPress={item.action}>
      <View style={styles.securityActionLeft}>
        <LinearGradient
          colors={item.danger ? ['#ef4444', '#dc2626'] : ['#f97316', '#ef4444']}
          style={styles.securityActionIcon}
        >
          <Feather name={item.icon} size={16} color="#ffffff" />
        </LinearGradient>
        <View style={styles.securityActionInfo}>
          <Text style={[styles.securityActionTitle, item.danger && styles.securityActionDanger]}>
            {item.title}
          </Text>
          <Text style={styles.securityActionSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#fff7ed', '#fef2f2', '#fff']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>Loading privacy settings...</Text>
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
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={styles.headerSpacer} />
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
            <Feather name="shield" size={32} color="#ffffff" />
            <Text style={styles.headerSectionTitle}>Your Privacy Matters</Text>
            <Text style={styles.headerSectionSubtitle}>
              Control who can see your information and how your data is used
            </Text>
          </LinearGradient>

          {/* Profile Visibility */}
          <ProfileVisibilitySelector />

          {/* Privacy Categories */}
          {privacyCategories.map((category, index) => (
            <View key={index} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.categoryCard}>
                {category.items.map((item, itemIndex) => (
                  <View key={item.key}>
                    <PrivacyItem item={item} />
                    {itemIndex < category.items.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Security Actions */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Security Actions</Text>
            <View style={styles.categoryCard}>
              {securityActions.map((item, index) => (
                <View key={item.id}>
                  <SecurityActionItem item={item} />
                  {index < securityActions.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          </View>

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
                  await AsyncStorage.setItem('privacyPreferences', JSON.stringify(preferences));
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
                    {saving ? 'Saving...' : 'Save Settings'}
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
  headerSpacer: {
    width: 40,
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
  visibilitySection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  visibilityOption: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  visibilityOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  visibilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#f97316',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f97316',
  },
  visibilityInfo: {
    flex: 1,
  },
  visibilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  visibilityDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  privacyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  privacySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  securityActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  securityActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityActionInfo: {
    flex: 1,
  },
  securityActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  securityActionDanger: {
    color: '#ef4444',
  },
  securityActionSubtitle: {
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
