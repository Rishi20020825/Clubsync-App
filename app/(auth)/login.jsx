import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {GOOGLE_CLIENT_ID} from '@env';
import { netconfig } from "../../netconfig";
// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Google Auth Request - Using the same Client ID for all platforms
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
  });

  // Handle Google Sign-In Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.authentication;
      handleGoogleLogin(id_token);
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
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async (idToken) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${netconfig.API_BASE_URL}/api/mobile/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken: idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
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
    <LinearGradient colors={['#fff7ed', '#fff', '#fef2f2']} style={styles.gradient}>
      <View style={styles.container}>
        {/* Branding */}
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Feather name="zap" size={32} color="#fff" />
          </View>
          <Text style={styles.brandText}>ClubSync</Text>
        </View>
        <Text style={styles.heading}>Welcome Back to <Text style={styles.gradientText}>ClubSync</Text></Text>
        <Text style={styles.subheading}>Connect with your community, manage events, and track your volunteer journey all in one place.</Text>
        {/* Features */}
        <View style={styles.features}>
          <Feature icon="users" text="Connect with 100+ active clubs" />
          <Feature icon="shield" text="Secure digital certificates" />
          <Feature icon="smartphone" text="QR code check-ins" />
        </View>
        {/* Form */}
        <View style={styles.form}>
          {error ? <Text style={styles.error}><Feather name="alert-circle" /> {error}</Text> : null}
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
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()}>
            <FontAwesome name="google" size={20} color="#fff" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkCenter}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </View>
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

function Input({ icon, rightIcon, onRightIconPress, ...props }) {
  return (
    <View style={styles.inputRow}>
      <Feather name={icon} size={20} color="#aaa" style={styles.inputIcon} />
      <TextInput style={styles.input} placeholderTextColor="#aaa" {...props} />
      {rightIcon &&
        <TouchableOpacity onPress={onRightIconPress} style={styles.inputRightIcon}>
          <Feather name={rightIcon} size={20} color="#aaa" />
        </TouchableOpacity>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  brandIcon: { width: 48, height: 48, backgroundColor: '#fb923c', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  brandText: { fontSize: 32, fontWeight: 'bold', color: '#222' },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  gradientText: { color: '#fb923c' },
  subheading: { color: '#666', fontSize: 16, marginBottom: 16 },
  features: { marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureIcon: { width: 32, height: 32, backgroundColor: '#ffedd5', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  featureText: { color: '#444', fontSize: 15 },
  form: { backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  error: { color: '#dc2626', marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, marginBottom: 12, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 16, color: '#222' },
  inputRightIcon: { marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { marginRight: 6 },
  checkboxLabel: { color: '#444', fontSize: 15 },
  link: { color: '#fb923c', fontWeight: 'bold', fontSize: 15 },
  button: { backgroundColor: '#fb923c', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkCenter: { color: '#fb923c', textAlign: 'center', marginTop: 8, fontWeight: 'bold' },
  googleButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ea4335', borderRadius: 12, paddingVertical: 12, justifyContent: 'center', marginBottom: 8 },
  googleButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
}); 