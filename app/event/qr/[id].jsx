import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export default function EventQRScreen() {
  const { id } = useLocalSearchParams();
  const [qrData, setQrData] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

 useEffect(() => {
  const loadData = async () => {
    const userData = await AsyncStorage.getItem('user');
    const user = JSON.parse(userData);
    //console.log("RAW:" , userData);
     // Log the raw user data
    setUser(user);
    const qrPayload = {
      eventId: id,
      userId: user.id,
      timestamp: new Date().toISOString()
    };
    setQrData(JSON.stringify(qrPayload));
    console.log('QR Data:', qrPayload); // This will log the QR data in your terminal
  };
  loadData();
}, [id]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f97316', '#f97316']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.brandContainer}>
          <Feather name="zap" size={28} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.appName}>ClubSync</Text>
        </View>
      </LinearGradient>
      <View style={styles.qrContainer}>
        <Text style={styles.title}>Your Event QR Code</Text>
        <Text style={styles.subtitle}>Show this to mark your attendance</Text>
        {qrData && (
          <QRCode
            value={qrData}
            size={250}
            backgroundColor="white"
            color="black"
          />
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} ClubSync | All rights reserved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    
    marginBottom: 8,
    elevation: 8,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  backBtn: {
    marginRight: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#f3f4f6',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});