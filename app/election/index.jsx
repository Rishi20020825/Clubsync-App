import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from "../../netconfig";

const ElectionListPage = () => {
    const router = useRouter();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const tabSlideAnim = React.useRef(new Animated.Value(0)).current;

    const fetchElections = async () => {
        try {
            setLoading(true);
            setError(null);
            const authToken = await AsyncStorage.getItem('token');
            if (!authToken) {
                setError("You must be logged in to view elections.");
                return;
            }

            const response = await fetch(`${netconfig.API_BASE_URL}/api/elections`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch elections from the server.');
            }

            const data = await response.json();
            setElections(data.elections || []);

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
                })
            ]).start();
        } catch (err) {
            console.error("Fetch elections error:", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchElections();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchElections().then(() => setRefreshing(false));
    }, []);

    const getStatusInfo = (election) => {
        const now = new Date();
        const startDate = new Date(election.votingStart);
        const endDate = new Date(election.votingEnd);

        if (now < startDate) {
            return { text: 'UPCOMING', color: '#ff6b00', bgColor: '#fff4e6', isPast: false };
        }
        if (now >= startDate && now <= endDate) {
            return { text: 'ACTIVE', color: '#ff6b00', bgColor: '#fff4e6', isPast: false };
        }
        return { text: 'COMPLETED', color: '#94a3b8', bgColor: '#f1f5f9', isPast: true };
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        Animated.spring(tabSlideAnim, {
            toValue: tab === 'active' ? 0 : 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    };

    const getFilteredElections = () => {
        return elections.filter(election => {
            const status = getStatusInfo(election);
            if (activeTab === 'active') {
                return !status.isPast;
            } else {
                return status.isPast;
            }
        });
    };

    const filteredElections = getFilteredElections();

    if (loading && !refreshing) {
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
                    <Text style={styles.loadingText}>Loading Elections...</Text>
                    <Text style={styles.loadingSubtext}>Please wait while we fetch the data</Text>
                </View>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={['#fff4e6', '#ffffff']} style={styles.gradient}>
                <View style={styles.centered}>
                    <View style={styles.errorIconContainer}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ff6b00" />
                    </View>
                    <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchElections}>
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

    return (
        <LinearGradient colors={['#fff4e6', '#ffffff']} style={styles.gradient}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <View style={styles.backButtonInner}>
                        <Feather name="arrow-left" size={24} color="#ff6b00" />
                    </View>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Elections</Text>
                    <Text style={styles.headerSubtitle}>Vote for your leaders</Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            <View style={styles.tabContainer}>
                <View style={styles.tabWrapper}>
                    <Animated.View
                        style={[
                            styles.tabIndicator,
                            {
                                transform: [{
                                    translateX: tabSlideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 170],
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
                        onPress={() => switchTab('active')}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name="vote"
                            size={20}
                            color={activeTab === 'active' ? '#ffffff' : '#94a3b8'}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'active' && styles.tabTextActive
                        ]}>
                            Active & Upcoming
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => switchTab('past')}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name="history"
                            size={20}
                            color={activeTab === 'past' ? '#ffffff' : '#94a3b8'}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'past' && styles.tabTextActive
                        ]}>
                            Past Elections
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#ff6b00"]}
                        tintColor="#ff6b00"
                    />
                }
            >
                {filteredElections.length === 0 ? (
                    <Animated.View
                        style={[
                            styles.emptyContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <View style={styles.emptyIconContainer}>
                            <LinearGradient
                                colors={['#ffedd5', '#fff4e6']}
                                style={styles.emptyIconGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <MaterialCommunityIcons
                                    name={activeTab === 'active' ? 'vote-outline' : 'history'}
                                    size={64}
                                    color="#ff6b00"
                                />
                            </LinearGradient>
                        </View>
                        <Text style={styles.emptyTitle}>
                            {activeTab === 'active' ? 'No Active Elections' : 'No Past Elections'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {activeTab === 'active'
                                ? 'Check back later for upcoming elections and make your voice heard!'
                                : 'No completed elections to show at the moment.'}
                        </Text>
                    </Animated.View>
                ) : (
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }}
                    >
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <LinearGradient
                                    colors={['#ff6b00', '#ff8c00']}
                                    style={styles.statIconContainer}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <MaterialCommunityIcons name="vote" size={24} color="#ffffff" />
                                </LinearGradient>
                                <Text style={styles.statNumber}>{filteredElections.length}</Text>
                                <Text style={styles.statLabel}>
                                    {activeTab === 'active' ? 'Active/Upcoming' : 'Completed'}
                                </Text>
                            </View>
                            <View style={styles.statCard}>
                                <LinearGradient
                                    colors={['#ff8c00', '#ffa500']}
                                    style={styles.statIconContainer}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <MaterialCommunityIcons name="account-group" size={24} color="#ffffff" />
                                </LinearGradient>
                                <Text style={styles.statNumber}>
                                    {filteredElections.reduce((sum, e) => sum + e.positions.length, 0)}
                                </Text>
                                <Text style={styles.statLabel}>Total Positions</Text>
                            </View>
                        </View>

                        {filteredElections.map((election, index) => {
                            const status = getStatusInfo(election);
                            return (
                                <TouchableOpacity
                                    key={election.id}
                                    style={styles.card}
                                    onPress={() => router.push(`/election/${election.id}`)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.cardGradient}>
                                        <View style={styles.cardContent}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.cardTitleContainer}>
                                                    <Text style={styles.cardTitle}>{election.title}</Text>
                                                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                                                        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                                                        <Text style={[styles.statusText, { color: status.color }]}>
                                                            {status.text}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={styles.clubContainer}>
                                                <View style={styles.clubIconWrapper}>
                                                    <MaterialCommunityIcons name="account-group" size={14} color="#ff6b00" />
                                                </View>
                                                <Text style={styles.cardClub}>{election.club.name}</Text>
                                            </View>

                                            <View style={styles.divider} />

                                            <View style={styles.cardFooter}>
                                                <View style={styles.footerItem}>
                                                    <View style={styles.iconContainer}>
                                                        <Feather name="calendar" size={16} color="#ff6b00" />
                                                    </View>
                                                    <View>
                                                        <Text style={styles.footerLabel}>Ends on</Text>
                                                        <Text style={styles.footerText}>
                                                            {new Date(election.votingEnd).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View style={styles.footerItem}>
                                                    <View style={styles.iconContainer}>
                                                        <Feather name="users" size={16} color="#ff6b00" />
                                                    </View>
                                                    <View>
                                                        <Text style={styles.footerLabel}>Positions</Text>
                                                        <Text style={styles.footerText}>
                                                            {election.positions.length} Available
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <TouchableOpacity
                                                style={styles.cardAction}
                                                onPress={() => router.push(`/election/${election.id}`)}
                                                activeOpacity={0.8}
                                            >
                                                <LinearGradient
                                                    colors={['#ff6b00', '#ff8c00']}
                                                    style={styles.cardActionGradient}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                >
                                                    <Text style={styles.cardActionText}>View Details</Text>
                                                    <Feather name="arrow-right" size={18} color="#ffffff" />
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        <View style={styles.bottomPadding} />
                    </Animated.View>
                )}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
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
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    headerRight: {
        width: 44,
    },
    tabContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    tabWrapper: {
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 4,
        flexDirection: 'row',
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: 162,
        height: 44,
        borderRadius: 12,
        overflow: 'hidden',
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
        paddingVertical: 12,
        gap: 8,
        zIndex: 1,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94a3b8',
    },
    tabTextActive: {
        color: '#ffffff',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
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
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        marginTop: 8,
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
        textAlign: 'center',
    },
    errorIconContainer: {
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
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
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
    card: {
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#ff6b00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    cardGradient: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#ffedd5',
    },
    cardContent: {
        padding: 20,
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardTitleContainer: {
        gap: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
        lineHeight: 26,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
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
    clubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    clubIconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff4e6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardClub: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 16,
    },
    footerItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff4e6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginBottom: 2,
        fontWeight: '500',
    },
    footerText: {
        fontSize: 13,
        color: '#1f2937',
        fontWeight: '600',
    },
    cardAction: {
        marginTop: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cardActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    cardActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginBottom: 24,
    },
    emptyIconGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    bottomPadding: {
        height: 40,
    },
});

export default ElectionListPage;