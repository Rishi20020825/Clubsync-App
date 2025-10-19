import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from "../../netconfig";

const PositionResultCard = ({ position }) => {
    const totalVotesInPosition = position.candidates.reduce((sum, c) => sum + c.voteCount, 0);
    const sortedCandidates = [...position.candidates].sort((a, b) => b.voteCount - a.voteCount);

    return (
        <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
                <MaterialCommunityIcons name="trophy" size={24} color="#ff6b00" />
                <Text style={styles.resultPositionTitle}>{position.positionName}</Text>
            </View>
            {sortedCandidates.map((candidate, index) => {
                const votePercentage = totalVotesInPosition > 0 ? (candidate.voteCount / totalVotesInPosition) * 100 : 0;
                const isWinner = index === 0;
                return (
                    <View key={candidate.id} style={[styles.candidateResult, isWinner && styles.winnerCard]}>
                        <View style={styles.candidateHeader}>
                            <View style={styles.candidateInfo}>
                                {isWinner && (
                                    <View style={styles.winnerBadge}>
                                        <MaterialCommunityIcons name="crown" size={16} color="#ff6b00" />
                                    </View>
                                )}
                                <Text style={[styles.candidateName, isWinner && styles.winnerName]}>
                                    {candidate.name}
                                </Text>
                            </View>
                            <View style={styles.voteInfo}>
                                <Text style={styles.voteCount}>{candidate.voteCount}</Text>
                                <Text style={styles.voteLabel}>votes</Text>
                            </View>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <LinearGradient
                                colors={isWinner ? ['#ff6b00', '#ff8c00'] : ['#cbd5e1', '#e2e8f0']}
                                style={[styles.progressBar, { width: `${votePercentage}%` }]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        </View>
                        <Text style={[styles.percentageText, isWinner && styles.winnerPercentage]}>
                            {votePercentage.toFixed(1)}%
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

export default function ElectionDetailPage() {
    const router = useRouter();
    const { id: electionId } = useLocalSearchParams();

    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const [activeTab, setActiveTab] = useState('overview');
    const [tabSlideAnim] = useState(new Animated.Value(0));

    const [isLoading, setIsLoading] = useState(false);
    const [electionData, setElectionData] = useState(null);
    const [loadingError, setLoadingError] = useState(null);

    const [resultsData, setResultsData] = useState(null);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [resultsError, setResultsError] = useState(null);

    const fetchElectionDetails = async () => {
        if (!electionId) return;
        setIsLoading(true);
        setLoadingError(null);
        try {
            const authToken = await AsyncStorage.getItem('token');
            const response = await fetch(`${netconfig.API_BASE_URL}/api/elections/${electionId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch election details.');

            const data = await response.json();
            setElectionData(data);

            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]).start();
        } catch (error) {
            console.error("Fetch details error:", error);
            setLoadingError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchResults = async () => {
        if (!electionId || resultsData) return;
        setResultsLoading(true);
        setResultsError(null);
        try {
            const authToken = await AsyncStorage.getItem('token');
            const response = await fetch(`${netconfig.API_BASE_URL}/api/elections/${electionId}/results`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            console.log("Results response status:", response.status);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch results.');

            setResultsData(data);
        } catch (error) {
            console.error("Fetch results error:", error);
            setResultsError(error.message);
        } finally {
            setResultsLoading(false);
        }
    };

    useEffect(() => {
        fetchElectionDetails();
    }, [electionId]);

    useEffect(() => {
        if (activeTab === 'results') {
            const votingEndDate = new Date(electionData?.votingEnd);
            const isCompleted = new Date() > votingEndDate;
            if (isCompleted) {
                fetchResults();
            }
        }
    }, [activeTab, electionData]);

    const switchTab = (tab) => {
        setActiveTab(tab);
        const tabIndex = tab === 'overview' ? 0 : tab === 'positions' ? 1 : 2;
        Animated.spring(tabSlideAnim, {
            toValue: tabIndex,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    };

    const issueVotingToken = async () => {
        setIsLoading(true);
        try {
            const authToken = await AsyncStorage.getItem('token');
            if (!authToken) {
                Alert.alert('Error', 'Please login to continue');
                return;
            }

            const response = await fetch(`${netconfig.API_BASE_URL}/api/voting/issue-token`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ electionId })
            });
            const data = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem('votingToken', data.token);
                await AsyncStorage.setItem('currentElectionId', electionId);
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

    if (isLoading && !electionData) {
        return (
            <LinearGradient colors={['#fff4e6', '#ffffff']} style={styles.gradient}>
                <View style={styles.centered}>
                    <View style={styles.loaderContainer}>
                        <LinearGradient
                            colors={['#ff6b00', '#ff8c00']}
                            style={styles.loaderGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <ActivityIndicator size="large" color="#ffffff" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.loadingText}>Loading Election Details...</Text>
                </View>
            </LinearGradient>
        );
    }

    if (loadingError) {
        return (
            <LinearGradient colors={['#fff4e6', '#ffffff']} style={styles.gradient}>
                <View style={styles.centered}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ff6b00" />
                    <Text style={styles.errorText}>{loadingError}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchElectionDetails}>
                        <LinearGradient
                            colors={['#ff6b00', '#ff8c00']}
                            style={styles.retryButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Feather name="refresh-cw" size={20} color="#ffffff" />
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    if (!electionData) return null;

    const { title, subtitle, description, votingEnd, positions, _count } = electionData;
    const totalCandidates = positions.reduce((sum, pos) => sum + pos.candidates.length, 0);
    const votingEndDate = new Date(votingEnd);
    const daysLeft = Math.max(0, Math.ceil((votingEndDate - new Date()) / (1000 * 60 * 60 * 24)));

    const now = new Date();
    const startDate = new Date(electionData.votingStart);
    const isUpcoming = now < startDate;
    const isActive = now >= startDate && now <= votingEndDate;
    const isCompleted = now > votingEndDate;

    let status = { text: 'COMPLETED', color: '#94a3b8', bgColor: '#f1f5f9' };
    if (isActive) status = { text: 'ACTIVE', color: '#ff6b00', bgColor: '#fff4e6' };
    if (isUpcoming) status = { text: 'UPCOMING', color: '#ff6b00', bgColor: '#fff4e6' };

    const renderVoteButton = () => {
        if (!isActive) return null;
        return (
            <TouchableOpacity
                style={styles.voteButton}
                onPress={issueVotingToken}
                disabled={isLoading}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#ff6b00', '#ff8c00']}
                    style={styles.voteButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <MaterialCommunityIcons
                        name={isLoading ? "loading" : "ballot"}
                        size={24}
                        color="#fff"
                    />
                    <Text style={styles.voteButtonText}>
                        {isLoading ? 'Loading...' : 'Cast Your Vote'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    const tabWidth = 100;

    return (
        <LinearGradient colors={['#fff4e6', '#ffffff', '#ffffff']} style={styles.gradient}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <View style={styles.backButtonInner}>
                        <Feather name="arrow-left" size={24} color="#ff6b00" />
                    </View>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                </View>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.tabsContainer}>
                        <View style={styles.tabs}>
                            <Animated.View
                                style={[
                                    styles.tabIndicator,
                                    {
                                        transform: [{
                                            translateX: tabSlideAnim.interpolate({
                                                inputRange: [0, 1, 2],
                                                outputRange: [4, tabWidth + 4, (tabWidth * 2) + 4],
                                            })
                                        }]
                                    }
                                ]}
                            >
                                <LinearGradient
                                    colors={['#ff6b00', '#ff8c00']}
                                    style={styles.tabIndicatorGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                            </Animated.View>

                            <TouchableOpacity
                                style={styles.tab}
                                onPress={() => switchTab('overview')}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="information"
                                    size={18}
                                    color={activeTab === 'overview' ? '#ffffff' : '#94a3b8'}
                                />
                                <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                                    Overview
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.tab}
                                onPress={() => switchTab('positions')}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="briefcase"
                                    size={18}
                                    color={activeTab === 'positions' ? '#ffffff' : '#94a3b8'}
                                />
                                <Text style={[styles.tabText, activeTab === 'positions' && styles.activeTabText]}>
                                    Positions
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.tab}
                                onPress={() => switchTab('results')}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="chart-bar"
                                    size={18}
                                    color={activeTab === 'results' ? '#ffffff' : '#94a3b8'}
                                />
                                <Text style={[styles.tabText, activeTab === 'results' && styles.activeTabText]}>
                                    Results
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {activeTab === 'overview' && (
                        <>
                            <View style={styles.heroSection}>
                                <View style={styles.electionIconContainer}>
                                    <LinearGradient
                                        colors={['#ff6b00', '#ff8c00']}
                                        style={styles.electionIcon}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <MaterialCommunityIcons name="ballot" size={40} color="#ffffff" />
                                    </LinearGradient>
                                </View>
                                <Text style={styles.title}>{title}</Text>
                                <Text style={styles.subtitle}>{subtitle || 'Shape the future of our community'}</Text>
                                {description && <Text style={styles.description}>{description}</Text>}
                            </View>

                            <View style={styles.statsContainer}>
                                <View style={styles.statsGrid}>
                                    <View style={styles.statCard}>
                                        <LinearGradient
                                            colors={['#ff6b00', '#ff8c00']}
                                            style={styles.statIconContainer}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <MaterialCommunityIcons name="briefcase-variant" size={22} color="#ffffff" />
                                        </LinearGradient>
                                        <Text style={styles.statNumber}>{positions.length}</Text>
                                        <Text style={styles.statLabel}>Positions</Text>
                                    </View>

                                    <View style={styles.statCard}>
                                        <LinearGradient
                                            colors={['#ff8c00', '#ffa500']}
                                            style={styles.statIconContainer}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <MaterialCommunityIcons name="account-group" size={22} color="#ffffff" />
                                        </LinearGradient>
                                        <Text style={styles.statNumber}>{totalCandidates}</Text>
                                        <Text style={styles.statLabel}>Candidates</Text>
                                    </View>

                                    <View style={styles.statCard}>
                                        <LinearGradient
                                            colors={['#ffa500', '#ffb732']}
                                            style={styles.statIconContainer}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <Feather name="users" size={22} color="#ffffff" />
                                        </LinearGradient>
                                        <Text style={styles.statNumber}>{_count.tokens}</Text>
                                        <Text style={styles.statLabel}>Votes Cast</Text>
                                    </View>

                                    <View style={styles.statCard}>
                                        <LinearGradient
                                            colors={['#ffb732', '#ffc966']}
                                            style={styles.statIconContainer}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <Feather name="clock" size={22} color="#ffffff" />
                                        </LinearGradient>
                                        <Text style={styles.statNumber}>{daysLeft}</Text>
                                        <Text style={styles.statLabel}>Days Left</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.actionSection}>
                                {renderVoteButton()}
                            </View>
                        </>
                    )}

                    {activeTab === 'positions' && (
                        <View style={styles.positionsContainer}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="briefcase-variant" size={24} color="#ff6b00" />
                                <Text style={styles.sectionTitle}>Available Positions</Text>
                            </View>
                            {positions.map((position, index) => (
                                <View key={position.id} style={styles.positionCard}>
                                    <View style={styles.positionIconWrapper}>
                                        <MaterialCommunityIcons name="account-tie" size={24} color="#ff6b00" />
                                    </View>
                                    <View style={styles.positionInfo}>
                                        <Text style={styles.positionTitle}>{position.name}</Text>
                                        <View style={styles.positionMeta}>
                                            <MaterialCommunityIcons name="account-multiple" size={14} color="#94a3b8" />
                                            <Text style={styles.positionCandidates}>
                                                {position.candidates.length} candidates running
                                            </Text>
                                        </View>
                                    </View>
                                    <Feather name="chevron-right" size={22} color="#cbd5e1" />
                                </View>
                            ))}
                        </View>
                    )}

                    {activeTab === 'results' && (
                        <View style={styles.resultsContainer}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="chart-bar" size={24} color="#ff6b00" />
                                <Text style={styles.sectionTitle}>Election Results</Text>
                            </View>
                            {!isCompleted ? (
                                <>
                                    <Text style={styles.sectionSubtitle}>
                                        {`Results will be available after voting closes on ${votingEndDate.toLocaleDateString()}`}
                                    </Text>
                                    <View style={styles.resultsPlaceholder}>
                                        <LinearGradient
                                            colors={['#ffedd5', '#fff4e6']}
                                            style={styles.placeholderIconContainer}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <MaterialCommunityIcons name="lock-clock" size={60} color="#ff6b00" />
                                        </LinearGradient>
                                        <Text style={styles.resultsPlaceholderText}>
                                            Results are sealed until voting ends.
                                        </Text>
                                        <Text style={styles.resultsPlaceholderSubtext}>
                                            Come back after the election closes to see the winners!
                                        </Text>
                                    </View>
                                </>
                            ) : resultsLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#ff6b00" />
                                    <Text style={styles.loadingText}>Calculating results...</Text>
                                </View>
                            ) : resultsError ? (
                                <View style={styles.resultsPlaceholder}>
                                    <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#ff6b00" />
                                    <Text style={[styles.resultsPlaceholderText, { color: '#ff6b00' }]}>
                                        {resultsError}
                                    </Text>
                                </View>
                            ) : resultsData ? (
                                <>
                                    <View style={styles.resultsHeader}>
                                        <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                                        <Text style={styles.sectionSubtitle}>
                                            {`Final results based on ${resultsData.totalVotesCast} votes cast`}
                                        </Text>
                                    </View>
                                    {resultsData.results.map(posResult => (
                                        <PositionResultCard key={posResult.positionId} position={posResult} />
                                    ))}
                                </>
                            ) : null}
                        </View>
                    )}
                </Animated.View>
                <View style={styles.bottomPadding} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1
    },
    container: {
        flex: 1
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loaderContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        marginBottom: 24,
    },
    loaderGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginTop: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    retryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
        gap: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: 'transparent',
    },
    backButton: {
        width: 44,
        height: 44,
    },
    backButtonInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    headerTitleContainer: {
        flex: 1,
        marginHorizontal: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    tabsContainer: {
        marginBottom: 24,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 4,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        width: 92,
        height: 40,
        borderRadius: 12,
        overflow: 'hidden',
        zIndex: 0,
    },
    tabIndicatorGradient: {
        flex: 1,
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
        zIndex: 1,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94a3b8',
    },
    activeTabText: {
        color: '#ffffff',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
        paddingTop: 8,
    },
    electionIconContainer: {
        marginBottom: 20,
    },
    electionIcon: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        color: '#ff6b00',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    statsContainer: {
        marginBottom: 28,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 4,
        fontWeight: '500',
    },
    actionSection: {
        marginBottom: 24,
    },
    voteButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    voteButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    voteButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    positionsContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1f2937',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
        lineHeight: 20,
    },
    positionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 18,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    positionIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff4e6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    positionInfo: {
        flex: 1,
    },
    positionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 6,
    },
    positionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    positionCandidates: {
        fontSize: 13,
        color: '#6b7280',
    },
    resultsContainer: {
        marginBottom: 24,
    },
    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    resultsPlaceholder: {
        backgroundColor: '#ffffff',
        padding: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    placeholderIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    resultsPlaceholderText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 8,
    },
    resultsPlaceholderSubtext: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    resultCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    resultCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#f1f5f9',
    },
    resultPositionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        flex: 1,
    },
    candidateResult: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
    },
    winnerCard: {
        backgroundColor: '#fff4e6',
        borderWidth: 2,
        borderColor: '#ff6b00',
    },
    candidateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    candidateInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    winnerBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#ffedd5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    candidateName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        flex: 1,
    },
    winnerName: {
        color: '#ff6b00',
        fontWeight: '700',
        fontSize: 17,
    },
    voteInfo: {
        alignItems: 'flex-end',
    },
    voteCount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
    },
    voteLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: '#e2e8f0',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 6,
    },
    percentageText: {
        fontSize: 13,
        color: '#6b7280',
        alignSelf: 'flex-end',
        fontWeight: '600',
    },
    winnerPercentage: {
        color: '#ff6b00',
        fontSize: 14,
        fontWeight: '700',
    },
    bottomPadding: {
        height: 40,
    },
});