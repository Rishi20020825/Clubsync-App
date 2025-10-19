import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from '../../netconfig';
import { useOrganizer } from '../../context/OrganizerContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [clubsData, setClubsData] = useState([]);
    const { isOrganizer, loading: organizerLoading, checkStatus } = useOrganizer();
    const router = useRouter();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
            fetchClubs();
            // The organizer status is automatically checked by the OrganizerProvider
            // We can optionally refresh it here
            checkStatus();
        };
        fetchInitialData();
    }, []);

    const fetchClubs = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('User not authenticated');

            const res = await fetch(`${netconfig.API_BASE_URL}/api/clubs/mobile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch clubs');
            const data = await res.json();
            setClubsData(data.slice(0, 2) || []); // Only take first 2 for preview
        } catch (err) {
            setError(err.message);
            setClubsData([]);
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#fff7ed', '#fef2f2', '#fff']} style={styles.gradient}>
                <View style={styles.container}>
                    <View style={styles.compactHeader}>
                        <View style={styles.headerContent}>
                            <View style={styles.brandRow}>
                                <LinearGradient colors={['#f97316', '#ef4444']} style={styles.brandIcon}>
                                    <Feather name="zap" size={20} color="#ffffff" />
                                </LinearGradient>
                                <Text style={styles.brandText}>ClubSync</Text>
                            </View>
                            <TouchableOpacity style={styles.notificationButton}>
                                <Feather name="bell" size={20} color="#f97316" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeScrollContent}>
                        <LinearGradient colors={['#f97316', '#ef4444']} style={styles.heroSection} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <View style={styles.heroContent}>
                                <View style={styles.greetingContainer}>
                                    <Text style={styles.greetingText}>Good Afternoon!</Text>
                                    <Text style={styles.userNameText}>{user?.firstName || 'Welcome!'}</Text>
                                    <Text style={styles.motivationText}>Ready to make today amazing? ✨</Text>
                                </View>
                            </View>
                            <View style={styles.heroStatsContainer}>
                                <View style={styles.heroStatCard}><Feather name="calendar" size={16} color="#ffffff" /><Text style={styles.heroStatNumber}>12</Text><Text style={styles.heroStatLabel}>Events</Text></View>
                                <View style={styles.heroStatCard}><Feather name="users" size={16} color="#ffffff" /><Text style={styles.heroStatNumber}>5</Text><Text style={styles.heroStatLabel}>Clubs</Text></View>
                                <View style={styles.heroStatCard}><Feather name="award" size={16} color="#ffffff" /><Text style={styles.heroStatNumber}>8</Text><Text style={styles.heroStatLabel}>Certs</Text></View>
                            </View>
                        </LinearGradient>

                        <View style={styles.quickActionsSection}>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>
                            <View style={styles.quickActionsGrid}>
                                <Link href="/(tabs)/events" asChild><TouchableOpacity style={styles.quickActionCard}><LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.quickActionIcon}><Feather name="calendar" size={20} color="#ffffff" /></LinearGradient><Text style={styles.quickActionTitle}>Browse Events</Text><Text style={styles.quickActionSubtitle}>Discover opportunities</Text></TouchableOpacity></Link>
                                <Link href="/(tabs)/clubs" asChild><TouchableOpacity style={styles.quickActionCard}><LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.quickActionIcon}><Feather name="users" size={20} color="#ffffff" /></LinearGradient><Text style={styles.quickActionTitle}>Find Clubs</Text><Text style={styles.quickActionSubtitle}>Connect with peers</Text></TouchableOpacity></Link>
                                
                                {organizerLoading ? (
                                    <TouchableOpacity style={styles.quickActionCard} disabled={true}>
                                        <View style={styles.loadingIconContainer}>
                                            <ActivityIndicator size="small" color="#f97316" />
                                        </View>
                                        <Text style={styles.quickActionTitle}>Loading...</Text>
                                        <Text style={styles.quickActionSubtitle}>Please wait</Text>
                                    </TouchableOpacity>
                                ) : isOrganizer ? (
                                    <Link href="/organizer/dashboard" asChild>
                                        <TouchableOpacity style={styles.quickActionCard}>
                                            <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.quickActionIcon}>
                                                <Feather name="clipboard" size={20} color="#ffffff" />
                                            </LinearGradient>
                                            <Text style={styles.quickActionTitle}>Organizer</Text>
                                            <Text style={styles.quickActionSubtitle}>Manage events</Text>
                                        </TouchableOpacity>
                                    </Link>
                                ) : (
                                    <Link href="/(tabs)/wallet" asChild>
                                        <TouchableOpacity style={styles.quickActionCard}>
                                            <LinearGradient colors={['#10b981', '#059669']} style={styles.quickActionIcon}>
                                                <Feather name="award" size={20} color="#ffffff" />
                                            </LinearGradient>
                                            <Text style={styles.quickActionTitle}>Certificates</Text>
                                            <Text style={styles.quickActionSubtitle}>View achievements</Text>
                                        </TouchableOpacity>
                                    </Link>
                                )}
                                
                                <Link href="/election" asChild><TouchableOpacity style={styles.quickActionCard}><LinearGradient colors={['#f59e0b', '#d97706']} style={styles.quickActionIcon}><Feather name="check-square" size={20} color="#ffffff" /></LinearGradient><Text style={styles.quickActionTitle}>Elections</Text><Text style={styles.quickActionSubtitle}>Cast your vote</Text></TouchableOpacity></Link>
                            </View>
                        </View>

                        <View style={styles.clubsPreviewSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>My Active Clubs</Text>
                                <Link href="/(tabs)/clubs" asChild><TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity></Link>
                            </View>
                            {loading ? <Text>Loading clubs...</Text> : error ? <Text>Error: {error}</Text> : clubsData.length > 0 ? (
                                clubsData.map((club) => (
                                    <TouchableOpacity key={club.id} style={styles.clubPreviewCard}>
                                        <Image source={club.profileImage ? { uri: club.profileImage } : require('../../assets/3.png')} style={styles.clubPreviewImage} />
                                        <View style={styles.clubPreviewInfo}><Text style={styles.clubPreviewName}>{club.name}</Text><Text style={styles.clubPreviewCategory}>{club.category || 'Community'} • {club._count?.members || 0} members</Text></View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text>No active clubs found.</Text>
                            )}
                        </View>

                        <View style={{ height: 120 }} />
                    </ScrollView>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7ed' },
    gradient: { flex: 1 },
    container: { flex: 1 },
    compactHeader: { backgroundColor: '#ffffff', paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    brandRow: { flexDirection: 'row', alignItems: 'center' },
    brandIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    brandText: { fontSize: 20, fontWeight: '700', color: '#000000' },
    notificationButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fed7aa' },
    homeContainer: { flex: 1, backgroundColor: 'transparent' },
    homeScrollContent: { paddingBottom: 80 },
    heroSection: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32, marginHorizontal: 16, marginTop: 16, borderRadius: 24 },
    heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greetingContainer: { flex: 1 },
    greetingText: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500', marginBottom: 4 },
    userNameText: { fontSize: 28, color: '#ffffff', fontWeight: '800', marginBottom: 6 },
    motivationText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' },
    heroStatsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    heroStatCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
    heroStatNumber: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginTop: 4, marginBottom: 2 },
    heroStatLabel: { fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500', textAlign: 'center' },
    quickActionsSection: { paddingHorizontal: 24, marginTop: 32 },
    sectionTitle: { fontSize: 22, fontWeight: '700', color: '#000000', marginBottom: 16 },
    quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    quickActionCard: { width: (width - 72) / 2, backgroundColor: '#ffffff', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
    quickActionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    loadingIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12, backgroundColor: '#f3f4f6' },
    quickActionTitle: { fontSize: 16, fontWeight: '700', color: '#000000', textAlign: 'center', marginBottom: 4 },
    quickActionSubtitle: { fontSize: 12, color: '#6b7280', textAlign: 'center', fontWeight: '500' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    viewAllText: { fontSize: 14, color: '#f97316', fontWeight: '600' },
    clubsPreviewSection: { paddingHorizontal: 24, marginTop: 32 },
    clubPreviewCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center' },
    clubPreviewImage: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
    clubPreviewInfo: { flex: 1 },
    clubPreviewName: { fontSize: 16, fontWeight: '700', color: '#000000', marginBottom: 4 },
    clubPreviewCategory: { fontSize: 13, color: '#6b7280' },
});