import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
              <Text style={styles.heading}>Join the ClubSync Community</Text>
              <Text style={styles.subheading}>Start your journey with us! Create your account to access exclusive club features, events, and volunteer opportunities.</Text>
            </LinearGradient>
        {/* Features */}
        
        
        {/* Form */}
        <View style={styles.form}>
          {errors.general ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.error}>{errors.general}</Text>
            </View>
          ) : null}
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
          {errors.agree ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.error}>{errors.agree}</Text>
            </View>
          ) : null}
          
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <LinearGradient 
              colors={['#f97316', '#ef4444']} 
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.linkCenter}>Already have an account? Sign in</Text>
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
    flex: 1,
  },
  button: { 
    borderRadius: 12, 
    marginBottom: 16,
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
  linkCenter: { 
    color: '#f97316', 
    textAlign: 'center', 
    marginTop: 16, 
    fontWeight: '600',
    fontSize: 16,
  },
});