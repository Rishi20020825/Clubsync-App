// app/profileupdate/update-profile.tsx - Enhanced Update Profile Screen
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function UpdateProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setName(parsed.name || '');
        setEmail(parsed.email || '');
        setPhone(parsed.phone || '');
        setImage(parsed.image || '');
      }
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Validation Error', 'Name, Email, and Phone are required.');
      return;
    }

    const updatedUser = { name, email, phone, image };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => router.replace('/dashboard') }
    ]);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <LinearGradient colors={["#f3f4f6", "#e0e7ff", "#fff"]} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <LinearGradient colors={["#cb8916ff", "#e39308ff"]} style={styles.headerGradient}>
            <Text style={styles.title}>Update Profile</Text>
            <View style={styles.avatarContainer}>
              {image ? (
                <View style={styles.avatarShadow}>
                  <View style={styles.avatarCircle}>
                    <Image source={{ uri: image }} style={styles.avatar} />
                  </View>
                  <View style={styles.editBadge}>
                    <Text style={styles.editIcon}>📷</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.avatarShadow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarPlaceholder}>👤</Text>
                  </View>
                  <View style={styles.editBadge}>
                    <Text style={styles.editIcon}>📷</Text>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profile Image URL</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={image}
                  onChangeText={setImage}
                  placeholder="Paste image URL or leave empty"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  multiline={true}
                  numberOfLines={2}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <LinearGradient colors={["#f59e0b", "#f59e0b"]} style={styles.saveGradient}>
                  <Text style={styles.saveText}> Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    minHeight: '100%',
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarShadow: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    fontSize: 40,
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#dac106ff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editIcon: {
    fontSize: 14,
    color: '#fff',
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  saveButton: {
    flex:1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6b6e0bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
