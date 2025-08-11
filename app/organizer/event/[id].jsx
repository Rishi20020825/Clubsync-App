import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { netconfig } from '../../../netconfig';

export default function OrganizerEventScreen() {
  const { id: eventId } = useLocalSearchParams();
  const router = useRouter();

  const [attended, setAttended] = useState([]);
  const [notAttended, setNotAttended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const slideAnim = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  useEffect(() => {
    if (eventId) fetchAttendance();
  }, [eventId]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: scanning ? 0 : 1000,
      duration: scanning ? 400 : 300,
      useNativeDriver: true,
    }).start();
  }, [scanning]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${netconfig.API_BASE_URL}/api/events/${eventId}/attendance`);
      const data = await res.json();
      setAttended(data.attended || []);
      setNotAttended(data.notAttended || []);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    setScanning(false);
    try {
      const { eventId: scannedEventId, userId } = JSON.parse(data);
      if (String(scannedEventId) !== String(eventId)) {
        Alert.alert('Invalid QR', 'This QR is not for this event.');
        return;
      }

      const res = await fetch(`${netconfig.API_BASE_URL}/api/events/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();
      if (result.success) {
        Alert.alert('Success', 'Attendance marked!');
        fetchAttendance();
      } else {
        Alert.alert('Error', result.message || 'User is not registered.');
      }
    } catch (err) {
      console.error('QR Scan error:', err);
      Alert.alert('Error', 'Invalid QR code format.');
    }
  };

  const formatTime = (date) => {
    try {
      return new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>No camera permission</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={requestPermission}>
          <Text style={styles.scanBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header with Back button and Title */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Event Attendance</Text>
      </View>

      <Text style={styles.subText}>Event ID: {eventId}</Text>

      {loading ? (
        <Text>Loading attendance...</Text>
      ) : (
        <>
          <View style={styles.tabs}>
            {/* Arrived List */}
            <View style={styles.tab}>
              <Text style={styles.tabTitle}>Arrived ({attended.length})</Text>
              <FlatList
                data={attended}
                keyExtractor={(item) => item.userId}
                renderItem={({ item }) => (
                  <View style={styles.userCard}>
                    <Text>{item.userName}</Text>
                    <Text style={styles.time}>{formatTime(item.arrivedTime)}</Text>
                  </View>
                )}
              />
            </View>

            {/* Not Arrived List */}
            <View style={styles.tab}>
              <Text style={styles.tabTitle}>Not Arrived ({notAttended.length})</Text>
              <FlatList
                data={notAttended}
                keyExtractor={(item) => item.userId}
                renderItem={({ item }) => (
                  <View style={styles.userCard}>
                    <Text>{item.userName}</Text>
                  </View>
                )}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.scanBtn} onPress={() => setScanning(true)}>
            <Text style={styles.scanBtnText}>Scan QR to Mark Attendance</Text>
          </TouchableOpacity>

          {/* Scanner Modal */}
          <Modal visible={scanning} animationType="fade" transparent>
            <Animated.View style={[styles.fullScreenWrapper, { transform: [{ translateY: slideAnim }] }]}>
              <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              />
              <View style={styles.overlay} />
              <View style={styles.guideFrame} />
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setScanning(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginRight: 12,
    elevation: 3,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subText: { fontSize: 14, color: '#555', marginBottom: 16 },
  tabs: { flexDirection: 'row', flex: 1 },
  tab: { flex: 1, marginHorizontal: 4 },
  tabTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  userCard: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
  },
  time: { color: '#10b981', fontSize: 13 },
  scanBtn: {
    position: 'absolute',
    bottom: 80,
    left: '10%',
    right: '10%',
    backgroundColor: '#f59e0b',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  scanBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  fullScreenWrapper: { flex: 1, backgroundColor: '#000' },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  guideFrame: {
    position: 'absolute',
    top: '35%',
    left: '20%',
    width: '60%',
    height: '30%',
    borderColor: '#f59e0b',
    borderWidth: 3,
    borderRadius: 8,
  },
  cancelBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
