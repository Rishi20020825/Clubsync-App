import React, { useState, useEffect } from 'react';

import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator , Alert , ScrollView , KeyboardAvoidingView,Platform,Image} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CLIENT_ID} from '@env';
import { netconfig } from "../../netconfig";
// Removed duplicate imports

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState('');
  const router = useRouter();



  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
  });

  // Handle Google Sign-In Response
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        handleGoogleLogin(idToken);
      } else {
        Alert.alert("Google Sign-In Error", "No ID token received from Google.");
      }
    }
  }, [response]);

  const handleChange = (name, value) => setForm({ ...form, [name]: value });

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${netconfig.API_BASE_URL}/api/mobile/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      // Save token/user info as needed
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
     if (data.user.role === 'eventOrganizer') {
        router.replace('/organizer/dashboard');
      } else {  
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // FIX: Send idToken, not googleToken, to backend
  const handleGoogleLogin = async (idToken) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${netconfig.API_BASE_URL}/api/auth/mobile/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }), // <-- field name must match backend
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
      Alert.alert("Google Login Error", err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (err) {
      setError('Google sign-in failed');
    }
  };

  return (
    <LinearGradient colors={['#fff7ed', '#fef2f2', '#fff']} style={styles.gradient}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Hero Section */}
            <LinearGradient 
              colors={['#fb923c', '#ef4444']} 
              style={styles.heroSection}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.brandRow}>
                <LinearGradient 
                  colors={['#f97316', '#ef4444']} 
                  style={styles.brandIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather name="zap" size={32} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.brandText}>ClubSync</Text>
              </View>
              <Text style={styles.heading}>Welcome Back to ClubSync</Text>
              <Text style={styles.subheading}>Connect with your community, manage events, and track your volunteer journey all in one place.</Text>
            </LinearGradient>
        {/* Features */}
      
        
        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}
          <Input
            icon="mail"
            placeholder="Email Address"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            keyboardType="email-address"
          />
          <Input
            icon="lock"
            placeholder="Password"
            value={form.password}
            onChangeText={v => handleChange('password', v)}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />
          <View style={styles.row}>
            <TouchableOpacity onPress={() => handleChange('remember', !form.remember)} style={styles.checkbox}>
              {form.remember ? <Feather name="check-square" size={20} color="#fb923c" /> : <Feather name="square" size={20} color="#aaa" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Remember me</Text>
            <TouchableOpacity style={{ marginLeft: 'auto' }}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <LinearGradient 
              colors={['#f97316', '#ef4444']} 
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
            <View style={styles.googleButtonContent}>
              <Image
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkCenter}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
</LinearGradient>
  );
}

function Feature({ icon, text }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Feather name={icon} size={20} color="#fb923c" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function Input({ icon, rightIcon, onRightIconPress, error, ...props }) {
  return (
    <View style={styles.inputContainer}>
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        <Feather name={icon} size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput 
          style={styles.input} 
          placeholderTextColor="#9ca3af" 
          {...props} 
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.inputRightIcon}>
            <Feather name={rightIcon} size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { 
    flex: 1 
  },
  keyboardAvoidingView: { 
    flex: 1 
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingTop: 40, 
    paddingBottom: 40 
  },
  container: { 
    alignItems: 'center', 
    padding: 24, 
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center'
  },
  heroSection: {
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  brandRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 24 
  },
  brandIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  brandText: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#ffffff' 
  },
  heading: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#ffffff', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  subheading: { 
    color: '#ffffff', 
    fontSize: 16, 
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  features: { 
    marginBottom: 32,
    width: '100%',
  },
  featureRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#fed7aa', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  featureText: { 
    color: '#374151', 
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  form: { 
    backgroundColor: '#ffffff', 
    borderRadius: 24, 
    padding: 32, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, 
    shadowRadius: 20, 
    elevation: 10, 
    width: '100%', 
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  error: { 
    color: '#ef4444', 
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f9fafb', 
    borderRadius: 12, 
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    minHeight: 56,
  },
  inputRowError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#000000',
    fontWeight: '400',
    paddingVertical: 16,
  },
  inputRightIcon: { 
    marginLeft: 12,
    padding: 4,
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  checkbox: { 
    marginRight: 12 
  },
  checkboxLabel: { 
    color: '#374151', 
    fontSize: 15,
    fontWeight: '400',
  },
  link: { 
    color: '#f97316', 
    fontWeight: '600', 
    fontSize: 15 
  },
  button: { 
    borderRadius: 12, 
    marginBottom: 24,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: { 
    color: '#ffffff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: { 
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12, 
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  googleButtonContent: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: { 
    color: '#374151', 
    fontWeight: '600', 
    fontSize: 16, 
    marginLeft: 12 
  },
  linkCenter: { 
    color: '#f97316', 
    textAlign: 'center', 
    fontWeight: '600',
    fontSize: 16,
  },
}); 