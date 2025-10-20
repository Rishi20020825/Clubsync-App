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
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { netconfig } from '../../../netconfig';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SuccessScreen from '../../../components/SuccessScreen';

export default function OrganizerEventScreen() {
  const { id: eventId } = useLocalSearchParams();
  const router = useRouter();

  const [attended, setAttended] = useState([]);
  const [notAttended, setNotAttended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showScanSuccess, setShowScanSuccess] = useState(false);
  const [scannedUserName, setScannedUserName] = useState('');

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
        // Find the user name from the attendance list
        const user = result.user || { firstName: 'User', lastName: '' };
        const userName = `${user.firstName} ${user.lastName}`.trim() || 'User';
        setScannedUserName(userName);
        setShowScanSuccess(true);
        
        // Auto-hide success screen and refresh attendance
        setTimeout(() => {
          setShowScanSuccess(false);
          fetchAttendance();
        }, 2500);
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
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#fff7ed', '#fef2f2', '#fff']} style={styles.gradient}>
          <View style={styles.centerContainer}>
            <LinearGradient colors={['#f97316', '#ef4444']} style={styles.permissionIcon}>
              <Feather name="camera-off" size={48} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>We need camera access to scan QR codes for attendance</Text>
            <TouchableOpacity style={styles.permissionButtonContainer} onPress={requestPermission}>
              <LinearGradient colors={['#f97316', '#ef4444']} style={styles.permissionButton}>
                <Feather name="unlock" size={18} color="#ffffff" />
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (showScanSuccess) {
    return (
      <SuccessScreen
        title="Attendance Marked!"
        message={`${scannedUserName}'s attendance has been successfully recorded.`}
        type="scanned"
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#fff7ed', '#fef2f2', '#fff']} style={styles.gradient}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#f97316" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Event Attendance</Text>
              <Text style={styles.headerSubtitle}>ID: {eventId}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading attendance...</Text>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              {/* Stats Cards */}
              <View style={styles.statsRow}>
                <View style={styles.statCardContainer}>
                  <LinearGradient colors={['#10b981', '#059669']} style={styles.statCard}>
                    <Feather name="check-circle" size={28} color="#ffffff" />
                    <Text style={styles.statNumber}>{attended.length}</Text>
                    <Text style={styles.statLabel}>Arrived</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statCardContainer}>
                  <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.statCard}>
                    <Feather name="clock" size={28} color="#ffffff" />
                    <Text style={styles.statNumber}>{notAttended.length}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Attendance Lists */}
              <ScrollView style={styles.listsContainer} showsVerticalScrollIndicator={false}>
                {/* Arrived List */}
                <View style={styles.listSection}>
                  <View style={styles.listHeader}>
                    <Feather name="check-circle" size={20} color="#10b981" />
                    <Text style={styles.listTitle}>Arrived ({attended.length})</Text>
                  </View>
                  <View>
                    {attended.map((item) => (
                      <View key={item.userId} style={styles.userCard}>
                        <View style={styles.userIconContainer}>
                          <LinearGradient colors={['#10b981', '#059669']} style={styles.userIcon}>
                            <Feather name="user" size={16} color="#ffffff" />
                          </LinearGradient>
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{item.userName}</Text>
                          <View style={styles.timeRow}>
                            <Feather name="clock" size={12} color="#10b981" />
                            <Text style={styles.timeText}>{formatTime(item.arrivedTime)}</Text>
                          </View>
                        </View>
                        <Feather name="check" size={20} color="#10b981" />
                      </View>
                    ))}
                    {attended.length === 0 && (
                      <View style={styles.emptyList}>
                        <Feather name="inbox" size={32} color="#d1d5db" />
                        <Text style={styles.emptyListText}>No arrivals yet</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Not Arrived List */}
                <View style={styles.listSection}>
                  <View style={styles.listHeader}>
                    <Feather name="clock" size={20} color="#f59e0b" />
                    <Text style={styles.listTitle}>Pending ({notAttended.length})</Text>
                  </View>
                  <View>
                    {notAttended.map((item) => (
                      <View key={item.userId} style={styles.userCard}>
                        <View style={styles.userIconContainer}>
                          <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.userIcon}>
                            <Feather name="user" size={16} color="#ffffff" />
                          </LinearGradient>
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{item.userName}</Text>
                        </View>
                        <Feather name="more-horizontal" size={20} color="#d1d5db" />
                      </View>
                    ))}
                    {notAttended.length === 0 && (
                      <View style={styles.emptyList}>
                        <Feather name="users" size={32} color="#d1d5db" />
                        <Text style={styles.emptyListText}>All checked in!</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={{ height: 100 }} />
              </ScrollView>

              {/* Scan Button */}
              <TouchableOpacity 
                style={styles.scanButtonContainer} 
                onPress={() => setScanning(true)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#f97316', '#ef4444']} style={styles.scanButton}>
                  <Feather name="camera" size={24} color="#ffffff" />
                  <Text style={styles.scanButtonText}>Scan QR Code</Text>
                </LinearGradient>
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
                  
                  {/* Scanner UI */}
                  <View style={styles.scannerUI}>
                    <Text style={styles.scannerTitle}>Scan Attendance QR</Text>
                    <Text style={styles.scannerSubtitle}>Align QR code within the frame</Text>
                  </View>
                  
                  <View style={styles.guideFrame}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.cancelButtonContainer} 
                    onPress={() => setScanning(false)}
                  >
                    <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.cancelButton}>
                      <Feather name="x" size={20} color="#ffffff" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </Modal>
            </View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff7ed' 
  },
  gradient: { 
    flex: 1 
  },
  container: { 
    flex: 1 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fff7ed', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  headerTitleContainer: { 
    flex: 1, 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#000000' 
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: '#6b7280', 
    fontWeight: '500',
    marginTop: 2
  },
  contentContainer: { 
    flex: 1, 
    padding: 20 
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 24 
  },
  statCardContainer: { 
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  statCard: { 
    padding: 20, 
    alignItems: 'center'
  },
  statNumber: { 
    fontSize: 36, 
    fontWeight: '800', 
    color: '#ffffff', 
    marginTop: 8,
    marginBottom: 4
  },
  statLabel: { 
    fontSize: 13, 
    color: 'rgba(255, 255, 255, 0.9)', 
    fontWeight: '600' 
  },
  listsContainer: { 
    flex: 1,
    paddingBottom: 100
  },
  listSection: { 
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4
  },
  listHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  listTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#000000' 
  },
  listScroll: { 
    flex: 1 
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  userIconContainer: { 
    marginRight: 10 
  },
  userIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  userInfo: { 
    flex: 1 
  },
  userName: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#000000',
    marginBottom: 4
  },
  timeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  timeText: { 
    fontSize: 12, 
    color: '#10b981', 
    fontWeight: '500' 
  },
  emptyList: { 
    alignItems: 'center', 
    paddingVertical: 40 
  },
  emptyListText: { 
    fontSize: 14, 
    color: '#9ca3af', 
    marginTop: 8,
    fontWeight: '500'
  },
  scanButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18
  },
  scanButtonText: { 
    color: '#ffffff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    fontSize: 16, 
    color: '#6b7280',
    fontWeight: '500'
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 40
  },
  permissionIcon: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10
  },
  permissionTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center'
  },
  permissionText: { 
    fontSize: 16, 
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
    lineHeight: 24
  },
  permissionButtonContainer: { 
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  permissionButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32
  },
  permissionButtonText: { 
    color: '#ffffff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  fullScreenWrapper: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  camera: { 
    ...StyleSheet.absoluteFillObject 
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.6)' 
  },
  scannerUI: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  scannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8
  },
  scannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500'
  },
  guideFrame: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    width: '70%',
    height: '30%'
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#f97316',
    borderWidth: 4
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12
  },
  cancelButtonContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32
  },
  cancelButtonText: { 
    color: '#ffffff', 
    fontWeight: '700', 
    fontSize: 16 
  }
});