import React, { useState, useEffect } from 'react';
                import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
                import { LinearGradient } from 'expo-linear-gradient';
                import { Feather } from '@expo/vector-icons';
                import { useRouter } from 'expo-router';

                export default function ElectionPage() {
                    const router = useRouter();
                    const [fadeAnim] = useState(new Animated.Value(0));
                    const [slideAnim] = useState(new Animated.Value(50));

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
                        totalPositions: 5,
                        totalCandidates: 12,
                        votingEnds: "March 15, 2025",
                        status: "Active"
                    };

                    return (
                        <LinearGradient colors={['#fff7ed', '#fff', '#fef2f2']} style={styles.gradient}>
                            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                                <View style={styles.header}>
                                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                        <Feather name="arrow-left" size={24} color="#fb923c" />
                                    </TouchableOpacity>
                                    <Text style={styles.headerTitle}>Mock Election 2025</Text>
                                    <View style={styles.statusBadge}>
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
                                    <View style={styles.heroSection}>
                                        <View style={styles.electionIcon}>
                                            <Feather name="users" size={32} color="#fb923c" />
                                        </View>
                                        <Text style={styles.title}>Mock Election 2025</Text>
                                        <Text style={styles.subtitle}>by ClubSync</Text>
                                        <Text style={styles.description}>
                                            Cast your vote for the upcoming Mock Election 2025.
                                            Choose your preferred candidates and make your voice heard in shaping our club's future.
                                        </Text>
                                    </View>

                                    <View style={styles.statsContainer}>
                                        <View style={styles.statsGrid}>
                                            <View style={styles.statCard}>
                                                <Feather name="briefcase" size={20} color="#fb923c" />
                                                <Text style={styles.statNumber}>{electionStats.totalPositions}</Text>
                                                <Text style={styles.statLabel}>Positions</Text>
                                            </View>
                                            <View style={styles.statCard}>
                                                <Feather name="user" size={20} color="#fb923c" />
                                                <Text style={styles.statNumber}>{electionStats.totalCandidates}</Text>
                                                <Text style={styles.statLabel}>Candidates</Text>
                                            </View>
                                        </View>

                                        <View style={styles.timelineCard}>
                                            <View style={styles.timelineHeader}>
                                                <Feather name="clock" size={20} color="#fb923c" />
                                                <Text style={styles.timelineTitle}>Voting Deadline</Text>
                                            </View>
                                            <Text style={styles.timelineDate}>{electionStats.votingEnds}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.actionSection}>
                                        <TouchableOpacity
                                            style={styles.primaryButton}
                                            onPress={() => router.push('/election/voting')}
                                        >
                                            <Feather name="check-circle" size={20} color="#fff" />
                                            <Text style={styles.primaryButtonText}>Start Voting</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.secondaryButton}
                                            onPress={() => router.push('/election/candidates')}
                                        >
                                            <Feather name="eye" size={20} color="#fb923c" />
                                            <Text style={styles.secondaryButtonText}>View Candidates</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.infoSection}>
                                        <View style={styles.infoCard}>
                                            <Feather name="info" size={16} color="#fb923c" />
                                            <Text style={styles.infoText}>
                                                Your vote is anonymous and secure. You can only vote once per position.
                                            </Text>
                                        </View>
                                    </View>
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
                        padding: 24,
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
                        fontSize: 32,
                        fontWeight: 'bold',
                        color: '#222',
                        textAlign: 'center',
                        marginBottom: 4,
                    },
                    subtitle: {
                        fontSize: 16,
                        color: '#fb923c',
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
                        marginBottom: 32,
                    },
                    statsGrid: {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 16,
                    },
                    statCard: {
                        flex: 1,
                        backgroundColor: '#fff',
                        padding: 20,
                        borderRadius: 16,
                        alignItems: 'center',
                        marginHorizontal: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                    },
                    statNumber: {
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#222',
                        marginTop: 8,
                    },
                    statLabel: {
                        fontSize: 14,
                        color: '#666',
                        marginTop: 4,
                    },
                    timelineCard: {
                        backgroundColor: '#fff',
                        padding: 20,
                        borderRadius: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
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
                        color: '#fb923c',
                    },
                    actionSection: {
                        marginBottom: 24,
                    },
                    primaryButton: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fb923c',
                        borderRadius: 16,
                        paddingVertical: 18,
                        marginBottom: 12,
                        shadowColor: '#fb923c',
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
                        borderColor: '#fb923c',
                    },
                    secondaryButtonText: {
                        color: '#fb923c',
                        fontSize: 16,
                        fontWeight: '600',
                        marginLeft: 8,
                    },
                    infoSection: {
                        marginTop: 16,
                    },
                    infoCard: {
                        flexDirection: 'row',
                        backgroundColor: '#fef3f2',
                        padding: 16,
                        borderRadius: 12,
                        borderLeftWidth: 4,
                        borderLeftColor: '#fb923c',
                    },
                    infoText: {
                        flex: 1,
                        fontSize: 14,
                        color: '#666',
                        marginLeft: 12,
                        lineHeight: 20,
                    },
                });