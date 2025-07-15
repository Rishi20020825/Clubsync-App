import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { netconfig } from "../../netconfig";


export default function RegisterScreen() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', agree: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (name, value) => setForm({ ...form, [name]: value });

  const handleRegister = async () => {
    let errs = {};
    if (!form.firstName) errs.firstName = 'First name required';
    if (!form.lastName) errs.lastName = 'Last name required';
    if (!form.email) errs.email = 'Email required';
    if (!form.password) errs.password = 'Password required';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.agree) errs.agree = 'You must agree to the terms';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const res = await fetch(`${netconfig.API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          image: '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      // Optionally, auto-login or redirect to login
      router.replace('/(auth)/login');
    } catch (err) {
      setErrors({ general: err.message });
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#fff7ed', '#fff', '#fef2f2']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Branding */}
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Feather name="zap" size={32} color="#fff" />
          </View>
          <Text style={styles.brandText}>ClubSync</Text>
        </View>
        <Text style={styles.heading}>Join the <Text style={styles.gradientText}>ClubSync</Text> Community</Text>
        <Text style={styles.subheading}>Start your journey with us! Create your account to access exclusive club features, events, and volunteer opportunities.</Text>
        {/* Features */}
        <View style={styles.features}>
          <Feature icon="users" text="Connect with 100+ active clubs" />
          <Feature icon="shield" text="Secure digital certificates" />
          <Feature icon="smartphone" text="QR code check-ins" />
        </View>
        {/* Form */}
        <View style={styles.form}>
          {errors.general ? <Text style={styles.error}><Feather name="alert-circle" /> {errors.general}</Text> : null}
          <Input
            icon="user"
            placeholder="First Name"
            value={form.firstName}
            onChangeText={v => handleChange('firstName', v)}
            error={errors.firstName}
          />
          <Input
            icon="user"
            placeholder="Last Name"
            value={form.lastName}
            onChangeText={v => handleChange('lastName', v)}
            error={errors.lastName}
          />
          <Input
            icon="mail"
            placeholder="Email Address"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            icon="phone"
            placeholder="Phone"
            value={form.phone}
            onChangeText={v => handleChange('phone', v)}
            keyboardType="phone-pad"
          />
          <Input
            icon="lock"
            placeholder="Password"
            value={form.password}
            onChangeText={v => handleChange('password', v)}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={errors.password}
          />
          <Input
            icon="lock"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChangeText={v => handleChange('confirmPassword', v)}
            secureTextEntry={!showConfirm}
            rightIcon={showConfirm ? "eye-off" : "eye"}
            onRightIconPress={() => setShowConfirm(!showConfirm)}
            error={errors.confirmPassword}
          />
          <View style={styles.row}>
            <TouchableOpacity onPress={() => handleChange('agree', !form.agree)} style={styles.checkbox}>
              {form.agree ? <Feather name="check-square" size={20} color="#fb923c" /> : <Feather name="square" size={20} color="#aaa" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>I agree to the terms and conditions</Text>
          </View>
          {errors.agree ? <Text style={styles.error}><Feather name="alert-circle" /> {errors.agree}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.linkCenter}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    <>
      <View style={styles.inputRow}>
        <Feather name={icon} size={20} color="#aaa" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholderTextColor="#aaa" {...props} />
        {rightIcon &&
          <TouchableOpacity onPress={onRightIconPress} style={styles.inputRightIcon}>
            <Feather name={rightIcon} size={20} color="#aaa" />
          </TouchableOpacity>
        }
      </View>
      {error ? <Text style={styles.error}><Feather name="alert-circle" /> {error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
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
  button: { backgroundColor: '#fb923c', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkCenter: { color: '#fb923c', textAlign: 'center', marginTop: 8, fontWeight: 'bold' },
});