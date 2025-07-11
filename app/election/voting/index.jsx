import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';


const CastVotePage = () => {

    useEffect(() => {
        // Prevent screenshots when component mounts
        const preventScreenshot = async () => {
            await ScreenCapture.preventScreenCaptureAsync();
        };
        preventScreenshot();

        // Re-enable screenshots when component unmounts
        return () => {
            ScreenCapture.allowScreenCaptureAsync();
        };
    }, []);

    const router = useRouter();
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);

    const positions = [
        {
            id: 1,
            title: "President",
            description: "Leads the club and represents members",
            candidates: [
                {
                    id: 101,
                    name: "Kasun Abeykoon",
                    bio: "3 years club experience, organized 10+ events",
                    avatar: { uri: `https://api.dicebear.com/7.x/pixel-art/png?seed=100` },
                },
                {
                    id: 102,
                    name: "Chamindu Dilshan",
                    bio: "Former VP, focused on member engagement",
                    avatar: { uri: `https://api.dicebear.com/7.x/pixel-art/png?seed=110` },
                },
                {
                    id: 103,
                    name: "Kalpani Perera",
                    bio: "Advocate for diversity and inclusion",
                    avatar: { uri: `https://api.dicebear.com/7.x/pixel-art/png?seed=120` },
                }
            ]
        },
        {
            id: 2,
            title: "Vice President",
            description: "Supports President and manages operations",
            candidates: [
                {
                    id: 201,
                    name: "Chathura Jayasinghe",
                    bio: "Event coordinator for 2 years",
                    avatar: { uri: `https://api.dicebear.com/7.x/pixel-art/png?seed=130` },
                },
                {
                    id: 202,
                    name: "Maheshi Fernando",
                    bio: "Strong leadership in community projects",
                    avatar: { uri: `https://api.dicebear.com/7.x/pixel-art/png?seed=140` },
                }
            ]
        }
    ];

    const currentPosition = positions[currentPositionIndex];
    const isLastPosition = currentPositionIndex === positions.length - 1;

    const handleVote = () => {
        if (!selectedCandidate) return;

        // Here you would typically send the vote to your backend
        console.log(`Voted for ${selectedCandidate.name} as ${currentPosition.title}`);

        if (isLastPosition) {
            router.push('/election/confirmation');
        } else {
            setCurrentPositionIndex(currentPositionIndex + 1);
            setSelectedCandidate(null);
        }
    };

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
                    <Text style={styles.positionTitle}>{currentPosition.title}</Text>
                    <Text style={styles.positionDescription}>{currentPosition.description}</Text>
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
                <Text style={styles.sectionSubtitle}>Tap on a candidate to view details and select</Text>

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
                            <Image source={candidate.avatar} style={styles.candidateAvatar} />
                            <View style={styles.candidateInfo}>
                                <Text style={styles.candidateName}>{candidate.name}</Text>
                                <Text style={styles.candidateBio}>{candidate.bio}</Text>
                            </View>
                            {selectedCandidate?.id === candidate.id && (
                                <View style={styles.selectedIndicator}>
                                    <Feather name="check-circle" size={24} color="#10b981" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="shield-check" size={20} color="#f97316" />
                    <Text style={styles.infoText}>
                        Your vote is anonymous and secure. You cannot change your vote after submission.
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.voteButton,
                        !selectedCandidate && styles.disabledButton
                    ]}
                    disabled={!selectedCandidate}
                    onPress={handleVote}
                >
                    <Text style={styles.voteButtonText}>
                        {isLastPosition ? 'Submit All Votes' : 'Continue to Next Position'}
                    </Text>
                    <Feather
                        name={isLastPosition ? "check-circle" : "arrow-right"}
                        size={20}
                        color="#fff"
                        style={{ marginLeft: 8 }}
                    />
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
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
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