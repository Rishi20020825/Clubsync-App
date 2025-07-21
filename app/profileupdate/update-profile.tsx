// app/(tabs)/update-profile.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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
    Alert.alert('Success', 'Profile updated successfully.');
    router.replace('/dashboard');
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>Update Profile</Text>

        <View style={styles.avatarContainer}>
          {image ? (
            <View style={styles.avatarShadow}>
              <View style={styles.avatarCircle}>
                <Image source={{ uri: image }} style={styles.avatar} />
              </View>
            </View>
          ) : (
            <View style={styles.avatarShadow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarPlaceholder}>👤</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          style={styles.input}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Profile Image (URL)</Text>
        <TextInput
          value={image}
          onChangeText={setImage}
          placeholder="Paste image URL or base64"
          style={styles.input}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '95%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#fb923c',
    textAlign: 'center',
    letterSpacing: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarShadow: {
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    fontSize: 38,
    color: '#fb923c',
  },
  label: {
    fontSize: 15,
    marginBottom: 4,
    color: '#fb923c',
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#feeac7ff',
    backgroundColor: '#f3f4f6',
    padding: 13,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#fb923c',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
