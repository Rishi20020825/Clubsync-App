import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Modal, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from '../../netconfig';

export default function WalletScreen() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchCertificates = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('You must be logged in to view certificates');
            
            // Get current user from storage
            const userData = await AsyncStorage.getItem('user');
            if (!userData) throw new Error('User data not found');
            
            const user = JSON.parse(userData);
            console.log('User data from storage:', user);
            
            // Make sure we have a valid user ID, use _id if id is not available
            const userId = user.id || user._id;
            
            if (!userId) {
                console.error('User ID is undefined or null!', user);
                throw new Error('Could not determine user ID from stored data');
            }
            
            console.log('Using user ID for certificate fetch:', userId);
            
            // Try a different endpoint format - some backends use user_id instead of userId
            // or want it as part of the path rather than a query parameter
            const certificatesUrl = `${netconfig.API_BASE_URL}/api/certificates/display?userId=${userId}&user_id=${userId}`;
            console.log('Fetching certificates from:', certificatesUrl);
            
            const response = await fetch(certificatesUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-ID': userId // Add userId in headers as well in case backend reads from there
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                } else {
                    throw new Error(`Failed to fetch certificates (${response.status})`);
                }
            }
            
            let data;
            try {
                data = await response.json();
                console.log('Certificate response:', data);
            } catch (jsonError) {
                console.error('Error parsing API response as JSON:', jsonError);
                throw new Error('Invalid response from server');
            }
            
            // Function to filter certificates by user ID if needed
            const filterByUserId = (certificates) => {
                if (certificates.length === 0) return certificates;
                
                console.log('Certificate data structure (first item):', certificates[0]);
                
                // Check for various possible user ID field names
                if (certificates[0].userId) {
                    console.log('Filtering by userId field');
                    return certificates.filter(cert => cert.userId === userId);
                } else if (certificates[0].user_id) {
                    console.log('Filtering by user_id field');
                    return certificates.filter(cert => cert.user_id === userId);
                } else if (certificates[0].user && certificates[0].user.id) {
                    console.log('Filtering by user.id field');
                    return certificates.filter(cert => cert.user.id === userId);
                } else if (certificates[0].user && certificates[0].user._id) {
                    console.log('Filtering by user._id field');
                    return certificates.filter(cert => cert.user._id === userId);
                }
                
                // If we can't find a way to filter, log a warning and return all
                console.warn('Could not determine how to filter certificates by user ID. Check certificate data structure:', certificates[0]);
                return certificates;
            };
            
            // Check if certificates array exists in the response
            if (Array.isArray(data.certificates)) {
                // Filter certificates to ensure they belong to this user
                const userCertificates = filterByUserId(data.certificates);
                setCertificates(userCertificates);
                console.log(`Loaded ${userCertificates.length} certificates for user ${userId}`);
            } else if (Array.isArray(data)) {
                // Filter certificates to ensure they belong to this user
                const userCertificates = filterByUserId(data);
                setCertificates(userCertificates);
                console.log(`Loaded ${userCertificates.length} certificates for user ${userId}`);
            } else {
                console.warn('Unexpected API response format:', data);
                setCertificates([]);
            }
        } catch (err) {
            console.error('Error fetching certificates:', err);
            setError(err.message);
            
            // Show an alert for critical errors
            if (err.message.includes('session has expired')) {
                Alert.alert(
                    "Session Expired",
                    "Your session has expired. Please log in again.",
                    [{ text: "OK" }]
                );
            } else if (!refreshing) { // Don't show alerts during pull-to-refresh
                Alert.alert(
                    "Error Loading Certificates",
                    err.message || "There was a problem loading your certificates.",
                    [{ text: "OK" }]
                );
            }
        } finally {
            if (showLoading) setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchCertificates(false);
    };

    useEffect(() => {
        fetchCertificates();
    }, []);
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                style={styles.pageContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#f97316']} />
                }
            >
                <LinearGradient colors={['#f97316', '#ef4444']} style={styles.pageHeader}>
                    <Feather name="award" size={32} color="#ffffff" />
                    <Text style={styles.pageTitle}>Your Wallet</Text>
                    <Text style={styles.pageSubtitle}>Track your achievements and certificates</Text>
                </LinearGradient>
                
                <View style={styles.certificatesContainer}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#f97316" />
                            <Text style={styles.loadingText}>Loading your certificates...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Feather name="alert-circle" size={48} color="#ef4444" style={styles.errorIcon} />
                            <Text style={styles.errorTitle}>Unable to load certificates</Text>
                            <Text style={styles.errorMessage}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={() => fetchCertificates()}>
                                <Text style={styles.retryText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    ) : certificates.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Feather name="award" size={48} color="#d1d5db" style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>No Certificates Yet</Text>
                            <Text style={styles.emptyMessage}>
                                Attend events and complete activities to earn certificates that will appear here.
                            </Text>
                        </View>
                    ) : (
                        certificates.map(certificate => (
                            <TouchableOpacity 
                                key={certificate.id} 
                                style={styles.certificateCard}
                                onPress={() => {
                                    setSelectedCertificate(certificate);
                                    setModalVisible(true);
                                }}
                            >
                                <View style={styles.certificateHeader}>
                                    <LinearGradient 
                                        colors={['#f59e0b', '#d97706']} 
                                        style={styles.certificateIcon}
                                    >
                                        <Feather name='award' size={20} color="#ffffff" />
                                    </LinearGradient>
                                    <View style={styles.certificateInfo}>
                                        <Text style={styles.certificateTitle}>{certificate.title}</Text>
                                        <Text style={styles.certificateIssuer}>by {certificate.issuer}</Text>
                                        <Text style={styles.certificateDate}>
                                            {new Date(certificate.dateEarned).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.certificateDescription}>
                                    {certificate.description || 'No description available'}
                                </Text>
                                <View style={styles.skillsContainer}>
                                    {Array.isArray(certificate.skills) ? (
                                        certificate.skills.map((skill, index) => (
                                            <View key={index} style={styles.skillChip}>
                                                <Text style={styles.skillChipText}>{skill}</Text>
                                            </View>
                                        ))
                                    ) : null}
                                </View>
                                <View style={styles.certificateFooter}>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{certificate.status || 'Issued'}</Text>
                                    </View>
                                    <Text style={styles.credentialId}>ID: {certificate.credentialId || certificate.id}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Certificate Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedCertificate && (
                            <>
                                <LinearGradient 
                                    colors={['#f97316', '#ef4444']} 
                                    style={styles.certificateModalHeader}
                                >
                                    <View style={styles.certificateIconLarge}>
                                        <Feather name="award" size={32} color="#ffffff" />
                                    </View>
                                    <Text style={styles.certificateModalTitle}>{selectedCertificate.title}</Text>
                                    <Text style={styles.certificateModalIssuer}>Issued by {selectedCertificate.issuer}</Text>
                                </LinearGradient>

                                <ScrollView style={styles.certificateModalBody}>
                                    <View style={styles.certificateDetailSection}>
                                        <Text style={styles.certificateDetailLabel}>Date Earned</Text>
                                        <Text style={styles.certificateDetailValue}>
                                            {new Date(selectedCertificate.dateEarned).toLocaleDateString('en-US', {
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric'
                                            })}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.certificateDetailSection}>
                                        <Text style={styles.certificateDetailLabel}>Description</Text>
                                        <Text style={styles.certificateDetailValue}>
                                            {selectedCertificate.description || 'No description available'}
                                        </Text>
                                    </View>

                                    {selectedCertificate.imageUrl && (
                                        <View style={styles.certificateImageContainer}>
                                            <Image
                                                source={{ uri: selectedCertificate.imageUrl }}
                                                style={styles.certificateImage}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    )}
                                    
                                    {Array.isArray(selectedCertificate.skills) && selectedCertificate.skills.length > 0 && (
                                        <View style={styles.certificateDetailSection}>
                                            <Text style={styles.certificateDetailLabel}>Skills Verified</Text>
                                            <View style={styles.skillsContainerLarge}>
                                                {selectedCertificate.skills.map((skill, index) => (
                                                    <View key={index} style={styles.skillChipLarge}>
                                                        <Text style={styles.skillChipTextLarge}>{skill}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                    
                                    <View style={styles.certificateDetailSection}>
                                        <Text style={styles.certificateDetailLabel}>Credential ID</Text>
                                        <Text style={styles.certificateDetailValue}>
                                            {selectedCertificate.credentialId || selectedCertificate.id}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.certificateDetailSection}>
                                        <Text style={styles.certificateDetailLabel}>Status</Text>
                                        <View style={[styles.statusBadge, styles.statusBadgeLarge]}>
                                            <Text style={styles.statusText}>{selectedCertificate.status || 'Issued'}</Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    pageContainer: { flex: 1 },
    pageHeader: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, alignItems: 'center' },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginTop: 12, marginBottom: 8, textAlign: 'center' },
    pageSubtitle: { fontSize: 16, color: '#ffffff', opacity: 0.9, textAlign: 'center' },
    certificatesContainer: { paddingHorizontal: 24, paddingTop: 20 },
    certificateCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, borderWidth: 1, borderColor: '#f3f4f6' },
    certificateHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    certificateIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    certificateInfo: { flex: 1 },
    certificateTitle: { fontSize: 16, fontWeight: '700', color: '#000000', marginBottom: 4 },
    certificateIssuer: { fontSize: 14, color: '#f97316', fontWeight: '600', marginBottom: 2 },
    certificateDescription: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    skillChip: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 4 },
    skillChipText: { fontSize: 10, color: '#6b7280', fontWeight: '500' },
    
    // Certificate modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        width: '90%',
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '90%',
    },
    certificateModalHeader: {
        padding: 24,
        alignItems: 'center',
    },
    certificateIconLarge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    certificateModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
    },
    certificateModalIssuer: {
        fontSize: 16,
        color: '#ffffff',
        opacity: 0.9,
        textAlign: 'center',
    },
    certificateModalBody: {
        padding: 24,
        maxHeight: 500,
    },
    certificateDetailSection: {
        marginBottom: 20,
    },
    certificateDetailLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 6,
        fontWeight: '500',
    },
    certificateDetailValue: {
        fontSize: 16,
        color: '#111827',
        lineHeight: 22,
    },
    skillsContainerLarge: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    skillChipLarge: {
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    skillChipTextLarge: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    statusBadgeLarge: {
        alignSelf: 'flex-start',
    },
    certificateImageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    certificateImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    modalFooter: {
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        padding: 16,
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    
    // Existing styles for empty state and loading
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        minHeight: 300,
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 12,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        minHeight: 300,
    },
    errorIcon: {
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        minHeight: 300,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    certificateDate: {
        fontSize: 12, 
        color: '#9ca3af',
    },
    certificateFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    statusBadge: {
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '500',
    },
    credentialId: {
        fontSize: 12,
        color: '#9ca3af',
    },
});