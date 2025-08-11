import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from "../../../netconfig";

const CastVotePage = () => {
    const router = useRouter();
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
    const [positions, setPositions] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [votes, setVotes] = useState([]); // Store all votes before submission
    const [electionId, setElectionId] = useState(null);
    const [votingToken, setVotingToken] = useState(null);

    useEffect(() => {
        // Prevent screenshots when component mounts
        const preventScreenshot = async () => {
            await ScreenCapture.preventScreenCaptureAsync();
        };
        preventScreenshot();

        // Get election ID and voting token from storage or navigation params
        const initializeVoting = async () => {
            try {
                const storedElectionId = await AsyncStorage.getItem('currentElectionId');
                const storedVotingToken = await AsyncStorage.getItem('votingToken');

                if (!storedElectionId || !storedVotingToken) {
                    Alert.alert('Error', 'No voting session found. Please start from the election page.');
                    router.back();
                    return;
                }

                setElectionId(storedElectionId);
                setVotingToken(storedVotingToken);

                // Fetch election data
                await fetchElectionData(storedElectionId);
            } catch (err) {
                console.error('Error initializing voting:', err);
                setError('Failed to initialize voting session');
            }
        };

        initializeVoting();

        // Re-enable screenshots when component unmounts
        return () => {
            ScreenCapture.allowScreenCaptureAsync();
        };
    }, []);

    const fetchElectionData = async (electionId) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch positions and candidates with better error handling
            const [positionsResponse, candidatesResponse] = await Promise.all([
                fetch(`${netconfig.API_BASE_URL}/api/voting/positions?electionId=${electionId}`),
                fetch(`${netconfig.API_BASE_URL}/api/voting/candidates?electionId=${electionId}`)
            ]);

            // Check each response individually for better error messages
            if (!positionsResponse.ok) {
                const errorText = await positionsResponse.text();
                throw new Error(`Failed to fetch positions: ${positionsResponse.status} - ${errorText}`);
            }

            if (!candidatesResponse.ok) {
                const errorText = await candidatesResponse.text();
                throw new Error(`Failed to fetch candidates: ${candidatesResponse.status} - ${errorText}`);
            }

            const positionsData = await positionsResponse.json();
            const candidatesData = await candidatesResponse.json();

            // Validate that we received arrays
            if (!Array.isArray(positionsData) || !Array.isArray(candidatesData)) {
                throw new Error('Invalid data format received from server');
            }

            // Group candidates by position
            const positionsWithCandidates = positionsData.map(position => ({
                ...position,
                candidates: candidatesData.filter(candidate => candidate.positionId === position.id)
            }));

            setPositions(positionsWithCandidates);
            setCandidates(candidatesData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching election data:', err);
            setError(`Failed to load election data: ${err.message}`);
            setLoading(false);
        }
    };

    const handleVote = () => {
        if (!selectedCandidate) return;

        const currentPosition = positions[currentPositionIndex];

        // Add vote to the votes array
        const newVote = {
            positionId: currentPosition.id,
            candidateId: selectedCandidate.id,
            positionName: currentPosition.name,
            candidateName: selectedCandidate.name
        };

        const updatedVotes = [...votes, newVote];
        setVotes(updatedVotes);

        console.log(`Selected ${selectedCandidate.name} for ${currentPosition.name}`);

        const isLastPosition = currentPositionIndex === positions.length - 1;

        if (isLastPosition) {
            // Submit all votes
            submitAllVotes(updatedVotes);
        } else {
            // Move to next position
            setCurrentPositionIndex(currentPositionIndex + 1);
            setSelectedCandidate(null);
        }
    };

    const submitAllVotes = async (allVotes) => {
        try {
            setLoading(true);

            const votePayload = {
                votingToken: votingToken,
                votes: allVotes.map(vote => ({
                    positionId: vote.positionId,
                    candidateId: vote.candidateId
                }))
            };

            const response = await fetch(`${netconfig.API_BASE_URL}/api/voting/submit-vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(votePayload)
            });

            const result = await response.json();

            if (response.ok) {
                // Clear voting session data
                await AsyncStorage.multiRemove(['currentElectionId', 'votingToken']);

                // Navigate to confirmation page
                router.push({
                    pathname: '/dashboard',
                    params: {
                        success: true,
                        votesCount: result.votesCount
                    }
                });
            } else {
                Alert.alert('Vote Submission Failed', result.error || 'Failed to submit votes');
            }
        } catch (err) {
            console.error('Error submitting votes:', err);
            Alert.alert('Error', 'Failed to submit votes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUri = (candidate) => {
        // Use candidate's image if available, otherwise generate avatar
        if (candidate.image && candidate.image.trim() !== '') {
            return { uri: candidate.image };
        }
        return { uri: `https://api.dicebear.com/7.x/pixel-art/png?seed=${candidate.id}` };
    };

    if (loading) {
        return (
            <LinearGradient colors={['#fff7ed', '#fff']} style={styles.gradient}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f97316" />
                    <Text style={styles.loadingText}>Loading election data...</Text>
                </View>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={['#fff7ed', '#fff']} style={styles.gradient}>
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => electionId && fetchElectionData(electionId)}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    if (positions.length === 0) {
        return (
            <LinearGradient colors={['#fff7ed', '#fff']} style={styles.gradient}>
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="vote-outline" size={48} color="#6b7280" />
                    <Text style={styles.errorText}>No positions available for voting</Text>
                </View>
            </LinearGradient>
        );
    }

    const currentPosition = positions[currentPositionIndex];
    const isLastPosition = currentPositionIndex === positions.length - 1;

    return (
        <LinearGradient colors={['#fff7ed', '#fff']} style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#f97316" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cast Your Vote</Text>
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>{currentPositionIndex + 1}/{positions.length}</Text>
                    </View>
                </View>

                <View style={styles.positionInfo}>
                    <Text style={styles.positionTitle}>{currentPosition.name}</Text>
                    <Text style={styles.positionDescription}>
                        {currentPosition.description || `Vote for the ${currentPosition.name} position`}
                    </Text>
                    <View style={styles.stepIndicator}>
                        {positions.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.stepDot,
                                    index === currentPositionIndex && styles.activeStepDot,
                                    index < currentPositionIndex && styles.completedStepDot
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Select Your Candidate</Text>

                <View style={styles.candidatesContainer}>
                    {currentPosition.candidates.map(candidate => (
                        <TouchableOpacity
                            key={candidate.id}
                            style={[
                                styles.candidateCard,
                                selectedCandidate?.id === candidate.id && styles.selectedCandidateCard
                            ]}
                            onPress={() => setSelectedCandidate(candidate)}
                        >
                            <Image source={getAvatarUri(candidate)} style={styles.candidateAvatar} />
                            <View style={styles.candidateInfo}>
                                <Text style={styles.candidateName}>{candidate.name}</Text>
                                <Text style={styles.candidateBio}>
                                    {candidate.vision || 'No vision statement provided'}
                                </Text>
                            </View>
                            {selectedCandidate?.id === candidate.id && (
                                <View style={styles.selectedIndicator}>
                                    <Feather name="check-circle" size={24} color="#10b981" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {currentPosition.candidates.length === 0 && (
                    <View style={styles.noCandidatesContainer}>
                        <MaterialCommunityIcons name="account-off" size={48} color="#6b7280" />
                        <Text style={styles.noCandidatesText}>No candidates available for this position</Text>
                    </View>
                )}

                <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="shield-checkmark" size={20} color="#f97316" />
                    <Text style={styles.infoText}>
                        Your vote is anonymous and secure. You cannot change your vote after submission.
                    </Text>
                </View>

                {votes.length > 0 && (
                    <View style={styles.voteSummary}>
                        <Text style={styles.voteSummaryTitle}>Your Votes So Far:</Text>
                        {votes.map((vote, index) => (
                            <Text key={index} style={styles.voteSummaryItem}>
                                {vote.positionName}: {vote.candidateName}
                            </Text>
                        ))}
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.voteButton,
                        (!selectedCandidate || loading) && styles.disabledButton
                    ]}
                    disabled={!selectedCandidate || loading}
                    onPress={handleVote}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.voteButtonText}>
                                {isLastPosition ? 'Submit All Votes' : 'Continue to Next Position'}
                            </Text>
                            <Feather
                                name={isLastPosition ? "check-circle" : "arrow-right"}
                                size={20}
                                color="#fff"
                                style={{ marginLeft: 8 }}
                            />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1
    },
    container: {
        paddingBottom: 100,
        paddingHorizontal: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    noCandidatesContainer: {
        alignItems: 'center',
        padding: 40,
    },
    noCandidatesText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
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
        fontSize: 20,
        fontWeight: '600',
        color: '#222',
    },
    progressContainer: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
    },
    positionInfo: {
        marginBottom: 24,
        alignItems: 'center',
    },
    positionTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
        textAlign: 'center',
    },
    positionDescription: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    stepIndicator: {
        flexDirection: 'row',
        marginTop: 8,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d1d5db',
        marginHorizontal: 4,
    },
    activeStepDot: {
        backgroundColor: '#f97316',
        width: 16,
    },
    completedStepDot: {
        backgroundColor: '#10b981',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    candidatesContainer: {
        marginBottom: 24,
    },
    candidateCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedCandidateCard: {
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4',
    },
    candidateAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    candidateInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    candidateName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    candidateBio: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    selectedIndicator: {
        justifyContent: 'center',
        paddingLeft: 8,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#ffedd5',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#f97316',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#9a3412',
        marginLeft: 12,
        lineHeight: 20,
    },
    voteSummary: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f0fdf4',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    voteSummaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    voteSummaryItem: {
        fontSize: 14,
        color: '#059669',
        marginBottom: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    voteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f97316',
        borderRadius: 16,
        paddingVertical: 16,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#d1d5db',
        shadowColor: '#9ca3af',
    },
    voteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CastVotePage;