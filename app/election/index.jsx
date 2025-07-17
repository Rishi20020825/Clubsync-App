import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from "../../netconfig";

export default function ElectionPage() {
    const router = useRouter();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);

    // Function to issue voting token
    const issueVotingToken = async () => {
        setIsLoading(true);
        try {
            // Get auth token from storage
            const authToken = await AsyncStorage.getItem('token');
            if (!authToken) {
                Alert.alert('Error', 'Please login to continue');
                return;
            }

            // Make API call to issue token
            const response = await fetch(`${netconfig.API_BASE_URL}/api/voting/issue-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    electionId: String(1) // Replace with actual election ID
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store the voting token and navigate to voting page
                await AsyncStorage.setItem('votingToken', data.token);
                // set election ID in storage if needed
                await AsyncStorage.setItem('currentElectionId', String(1)); // Replace with actual election ID
                router.push('/election/voting');
            } else {
                Alert.alert('Error', data.error || 'Failed to issue voting token');
            }
        } catch (error) {
            console.error('Token issue error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderVoteButton = () => (
        <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={issueVotingToken}
            disabled={isLoading}
        >
            <MaterialCommunityIcons
                name={isLoading ? "loading" : "vote"}
                size={24}
                color="#fff"
            />
            <Text style={styles.primaryButtonText}>
                {isLoading ? 'Loading...' : 'Cast Your Vote'}
            </Text>
        </TouchableOpacity>
    );

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const electionStats = {
        totalPositions: 8,
        totalCandidates: 24,
        votingEnds: "March 15, 2025",
        status: "Active",
        totalVotes: 1560,
        daysLeft: 7
    };

    const positions = [
        { id: 1, title: "President", icon: "account-tie", candidates: 4, color: "#f97316" },
        { id: 2, title: "Vice President", icon: "account-supervisor", candidates: 3, color: "#ef4444" },
        { id: 3, title: "Secretary", icon: "notebook", candidates: 5, color: "#f59e0b" },
        { id: 4, title: "Treasurer", icon: "cash", candidates: 3, color: "#10b981" },
        { id: 5, title: "Events Director", icon: "calendar", candidates: 4, color: "#3b82f6" },
        { id: 6, title: "Marketing Director", icon: "bullhorn", candidates: 2, color: "#8b5cf6" },
        { id: 7, title: "Tech Lead", icon: "code-braces", candidates: 2, color: "#ec4899" },
        { id: 8, title: "Social Media Manager", icon: "instagram", candidates: 1, color: "#6366f1" },
    ];

    return (
        <LinearGradient colors={['#fff7ed', '#fff', '#fff']} style={styles.gradient}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#f97316" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Club Elections 2025</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
                        <Text style={styles.statusText}>ACTIVE</Text>
                    </View>
                </View>

                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                            onPress={() => setActiveTab('overview')}
                        >
                            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'positions' && styles.activeTab]}
                            onPress={() => setActiveTab('positions')}
                        >
                            <Text style={[styles.tabText, activeTab === 'positions' && styles.activeTabText]}>Positions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'results' && styles.activeTab]}
                            onPress={() => setActiveTab('results')}
                        >
                            <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>Results</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'overview' && (
                        <>
                            <View style={styles.heroSection}>
                                <View style={styles.electionIcon}>
                                    <MaterialCommunityIcons name="vote" size={36} color="#f97316" />
                                </View>
                                <Text style={styles.title}>ClubSync Elections 2025</Text>
                                <Text style={styles.subtitle}>Shape the future of our community</Text>
                                <Text style={styles.description}>
                                    Cast your vote for the upcoming Club Elections. Choose your preferred candidates
                                    and make your voice heard in shaping our club's future.
                                </Text>
                            </View>

                            <View style={styles.statsContainer}>
                                <View style={styles.statsGrid}>
                                    <View style={styles.statCard}>
                                        <MaterialCommunityIcons name="briefcase-variant" size={24} color="#f97316" />
                                        <Text style={styles.statNumber}>{electionStats.totalPositions}</Text>
                                        <Text style={styles.statLabel}>Positions</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <MaterialCommunityIcons name="account-group" size={24} color="#f97316" />
                                        <Text style={styles.statNumber}>{electionStats.totalCandidates}</Text>
                                        <Text style={styles.statLabel}>Candidates</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Feather name="users" size={24} color="#f97316" />
                                        <Text style={styles.statNumber}>{electionStats.totalVotes}</Text>
                                        <Text style={styles.statLabel}>Votes Cast</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Feather name="clock" size={24} color="#f97316" />
                                        <Text style={styles.statNumber}>{electionStats.daysLeft}</Text>
                                        <Text style={styles.statLabel}>Days Left</Text>
                                    </View>
                                </View>

                                <View style={styles.timelineCard}>
                                    <View style={styles.timelineHeader}>
                                        <Feather name="clock" size={20} color="#f97316" />
                                        <Text style={styles.timelineTitle}>Voting Deadline</Text>
                                    </View>
                                    <Text style={styles.timelineDate}>{electionStats.votingEnds}</Text>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: '65%' }]} />
                                    </View>
                                    <Text style={styles.progressText}>65% of members have voted</Text>
                                </View>
                            </View>

                            <View style={styles.actionSection}>
                                {renderVoteButton()}
                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={() => router.push('/election/candidates')}
                                >
                                    <Feather name="users" size={20} color="#f97316" />
                                    <Text style={styles.secondaryButtonText}>Meet the Candidates</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {activeTab === 'positions' && (
                        <View style={styles.positionsContainer}>
                            <Text style={styles.sectionTitle}>Available Positions</Text>
                            <Text style={styles.sectionSubtitle}>Select a position to view candidates</Text>

                            {positions.map(position => (
                                <TouchableOpacity
                                    key={position.id}
                                    style={styles.positionCard}
                                    onPress={() => router.push(`/election/position/${position.id}`)}
                                >
                                    <LinearGradient
                                        colors={[position.color, `${position.color}90`]}
                                        style={styles.positionIcon}
                                    >
                                        <MaterialCommunityIcons name={position.icon} size={24} color="#fff" />
                                    </LinearGradient>
                                    <View style={styles.positionInfo}>
                                        <Text style={styles.positionTitle}>{position.title}</Text>
                                        <Text style={styles.positionCandidates}>{position.candidates} candidates</Text>
                                    </View>
                                    <Feather name="chevron-right" size={24} color="#9ca3af" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {activeTab === 'results' && (
                        <View style={styles.resultsContainer}>
                            <Text style={styles.sectionTitle}>Election Results</Text>
                            <Text style={styles.sectionSubtitle}>Available after voting closes on {electionStats.votingEnds}</Text>

                            <View style={styles.resultsPlaceholder}>
                                <MaterialCommunityIcons name="poll" size={60} color="#d1d5db" />
                                <Text style={styles.resultsPlaceholderText}>Results will appear here once voting is complete</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    statusBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#fff',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    activeTabText: {
        color: '#f97316',
        fontWeight: '600',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    electionIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#f97316',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    statsContainer: {
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    timelineCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    timelineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginLeft: 8,
    },
    timelineDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f97316',
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#f97316',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#6b7280',
    },
    featureCard: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIcon: {
        marginRight: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },
    featureDesc: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 'auto',
        textAlign: 'right',
        flex: 1,
    },
    actionSection: {
        marginBottom: 24,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f97316',
        borderRadius: 16,
        paddingVertical: 18,
        marginBottom: 12,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 18,
        borderWidth: 2,
        borderColor: '#f97316',
    },
    secondaryButtonText: {
        color: '#f97316',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    positionsContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    positionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    positionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    positionInfo: {
        flex: 1,
    },
    positionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 4,
    },
    positionCandidates: {
        fontSize: 14,
        color: '#6b7280',
    },
    resultsContainer: {
        marginBottom: 24,
    },
    resultsPlaceholder: {
        backgroundColor: '#fff',
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    resultsPlaceholderText: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 16,
    },
});