import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from '../../netconfig';
import { useRouter } from 'expo-router';
import LoadingAnimation from '../../components/LoadingAnimation';

export default function ClubsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('your');
    const [userClubs, setUserClubs] = useState([]);
    const [allClubs, setAllClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedClubs, setExpandedClubs] = useState({});

    useEffect(() => {
        if (activeTab === 'your') {
            fetchUserClubs();
        } else {
            fetchAllClubs();
        }
    }, [activeTab]);

    const fetchUserClubs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to view your clubs');
            }

            const userData = await AsyncStorage.getItem('user');
            const localUser = JSON.parse(userData);

            const response = await fetch(`${netconfig.API_BASE_URL}/api/clubs/mobile?userId=${localUser.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch clubs: ${response.status}`);
            }
            const clubs = await response.json();
            setUserClubs(clubs);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllClubs = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${netconfig.API_BASE_URL}/api/clubs`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch clubs: ${response.status}`);
            }
            const clubs = await response.json();
            setAllClubs(clubs);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleClubDescription = (clubId) => setExpandedClubs(prev => ({ ...prev, [clubId]: !prev[clubId] }));

    const getTruncatedDescription = (description, clubId, maxLength = 100) => {
        if (!description) return 'No description available';
        if (description.length <= maxLength || expandedClubs[clubId]) return description;
        return description.substring(0, maxLength) + '...';
    };

    const renderClubs = (clubs) => {
        if (loading) {
            return <LoadingAnimation 
                message="Loading Clubs" 
                subMessage="Discovering amazing clubs"
            />;
        }
        if (error) {
            return <View style={styles.centerStatus}><Feather name="alert-circle" size={48} color="#ef4444" /><Text style={styles.statusText}>{error}</Text><TouchableOpacity onPress={activeTab === 'your' ? fetchUserClubs : fetchAllClubs}><Text style={styles.retryText}>Try Again</Text></TouchableOpacity></View>;
        }
        if (clubs.length === 0) {
            return <View style={styles.centerStatus}><Feather name="users" size={48} color="#d1d5db" /><Text style={styles.statusText}>{activeTab === 'your' ? "You haven't joined any clubs yet." : "No clubs available to explore."}</Text></View>;
        }
        return clubs.map(club => (
            <TouchableOpacity key={club.id} style={styles.clubCard} onPress={() => router.push({
                pathname: '/clubDetails',
                params: {
                    clubId: club.id,
                    isMember: activeTab === 'your' ? 'true' : 'false'
                }
            })}>
                <View style={styles.clubCardHeader}>
                    <Image source={club.profileImage ? { uri: club.profileImage } : require('../../assets/3.png')} style={styles.clubImage} />
                    <View style={styles.clubInfo}>
                        <Text style={styles.clubName}>{club.name}</Text>
                        <Text style={styles.clubMembersText}>{club._count?.members || 0} members</Text>
                    </View>
                </View>
                <Text style={styles.clubDescription}>{getTruncatedDescription(club.about || club.mission, club.id)}</Text>
                { (club.about?.length > 100 || club.mission?.length > 100) &&
                    <TouchableOpacity onPress={() => toggleClubDescription(club.id)}><Text style={styles.seeMoreText}>{expandedClubs[club.id] ? 'See Less' : 'See More'}</Text></TouchableOpacity>
                }
            </TouchableOpacity>
        ));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.pageContainer}>
                <LinearGradient colors={['#f97316', '#ef4444']} style={styles.pageHeader}>
                    <Feather name="users" size={32} color="#ffffff" />
                    <Text style={styles.pageTitle}>Clubs</Text>
                    <Text style={styles.pageSubtitle}>Connect and collaborate with amazing communities</Text>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'your' && styles.activeTab]}
                            onPress={() => setActiveTab('your')}
                        >
                            <Text style={[styles.tabText, activeTab === 'your' && styles.activeTabText]}>Your Clubs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'explore' && styles.activeTab]}
                            onPress={() => setActiveTab('explore')}
                        >
                            <Text style={[styles.tabText, activeTab === 'explore' && styles.activeTabText]}>Explore</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={styles.clubsListContainer}>
                    {renderClubs(activeTab === 'your' ? userClubs : allClubs)}
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    pageContainer: { flex: 1 },
    pageHeader: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, alignItems: 'center' },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginTop: 12, marginBottom: 8, textAlign: 'center' },
    pageSubtitle: { fontSize: 16, color: '#ffffff', opacity: 0.9, textAlign: 'center', marginBottom: 20 },
    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 4, width: '100%', maxWidth: 320 },
    tab: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
    activeTab: { backgroundColor: '#ffffff' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#ffffff', opacity: 0.8 },
    activeTabText: { color: '#f97316', opacity: 1 },
    clubsListContainer: { paddingHorizontal: 24, paddingTop: 20 },
    centerStatus: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 300 },
    statusText: { marginTop: 16, fontSize: 16, color: '#6b7280', textAlign: 'center' },
    retryText: { marginTop: 12, fontSize: 14, color: '#f97316', fontWeight: '600' },
    clubCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, borderWidth: 1, borderColor: '#f3f4f6' },
    clubCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    clubImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#f3f4f6', marginRight: 12 },
    clubInfo: { flex: 1 },
    clubName: { fontSize: 18, fontWeight: '700', color: '#000000', marginBottom: 4 },
    clubMembersText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
    clubDescription: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 8 },
    seeMoreText: { fontSize: 13, color: '#f97316', fontWeight: '600', marginTop: 4 },
});