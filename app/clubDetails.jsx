import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Linking, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from '../netconfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import JoinRequestModal from '../components/JoinRequestModal'; // Adjust this path if your component is elsewhere

export default function ClubDetailsScreen() {
    const { clubId, isMember } = useLocalSearchParams();
    const router = useRouter();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joinRequestStatus, setJoinRequestStatus] = useState(null);
    const [submittingRequest, setSubmittingRequest] = useState(false);

    // State to control the modal's visibility
    const [isModalVisible, setModalVisible] = useState(false);
    // Feedback form state
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackError, setFeedbackError] = useState(null);

    useEffect(() => {
        fetchClubDetails();
        if (isMember === 'false') {
            checkJoinRequestStatus();
        }
    }, [clubId]);

    const fetchClubDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${netconfig.API_BASE_URL}/api/clubs/${clubId}/mobile?detailed=${isMember}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!response.ok) throw new Error('Failed to fetch club details');
            const data = await response.json();
            setClub(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkJoinRequestStatus = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) {
                return;
            }
            const localUser = JSON.parse(userData);

            const response = await fetch(`${netconfig.API_BASE_URL}/api/clubs/${clubId}/join-requests/status?userId=${localUser.id}`);

            if (response.ok) {
                const data = await response.json();
                setJoinRequestStatus(data.status);
            }
        } catch (err) {
            console.error('Error checking join request status:', err);
        }
    };

    // This function handles the API submission with data from the modal
    const submitJoinRequest = async ({ motivation, relevantSkills, socialLinks }) => {
        setSubmittingRequest(true);
        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) {
                throw new Error('You must be logged in to join.');
            }
            const localUser = JSON.parse(userData);

            const response = await fetch(`${netconfig.API_BASE_URL}/api/clubs/${clubId}/join-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: localUser.id,
                    motivation,
                    relevantSkills,
                    socialLinks,
                })
            });

            if (response.ok) {
                setModalVisible(false); // Close modal on success
                Alert.alert('Success', 'Your join request has been submitted!');
                setJoinRequestStatus('pendingReview');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit join request');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setSubmittingRequest(false);
        }
    };


    const openLink = (url) => {
        if (url) Linking.openURL(url);
    };

    const submitFeedback = async () => {
        if (!feedbackComment.trim()) {
            setFeedbackError('Please add a short comment.');
            return;
        }

        setSubmittingFeedback(true);
        setFeedbackError(null);

        try {
            const userData = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');
            const localUser = userData ? JSON.parse(userData) : null;

            const body = {
                clubId: clubId,
                userId: localUser?.id ?? null,
                rating: Number(feedbackRating),
                comment: feedbackComment,
            };

            const res = await fetch(`${netconfig.API_BASE_URL}/api/clubs/${clubId}/feedbacks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to submit feedback (${res.status})`);
            }

            // On success, clear form, show alert and refresh club details or feedback status
            setFeedbackComment('');
            setFeedbackRating(5);
            Alert.alert('Thank you', 'Your feedback has been submitted.');

            // Optionally refetch club details to update any counts if the API returns updated data
            fetchClubDetails();
        } catch (err) {
            setFeedbackError(err instanceof Error ? err.message : String(err));
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#f97316" />
                    <Text style={styles.loadingText}>Loading club details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !club) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerContainer}>
                    <Feather name="alert-circle" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>{error || 'Club not found'}</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isFullDetails = isMember === 'true';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {/* Header with Cover Image */}
                <View style={styles.headerContainer}>
                    {club.coverImage ? (
                        <Image source={{ uri: club.coverImage }} style={styles.coverImage} />
                    ) : (
                        <LinearGradient colors={['#f97316', '#ef4444']} style={styles.coverImage} />
                    )}
                    <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <Image
                        source={club.profileImage ? { uri: club.profileImage } : require('../assets/3.png')}
                        style={styles.profileImage}
                    />
                    <Text style={styles.clubName}>{club.name}</Text>
                    {club.motto && <Text style={styles.motto}>{club.motto}</Text>}
                    <Text style={styles.memberCount}>{club._count?.members || 0} members</Text>
                </View>

                {/* Join Button for Non-Members */}
                {!isFullDetails && (
                    <View style={styles.actionSection}>
                        {joinRequestStatus ? (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>
                                    Request {joinRequestStatus === 'pendingReview' ? 'Pending' : joinRequestStatus}
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.joinButton}
                                onPress={() => setModalVisible(true)}
                                disabled={submittingRequest}
                            >
                                <Text style={styles.joinButtonText}>Request to Join</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* About Section */}
                {club.about && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.sectionText}>{club.about}</Text>
                    </View>
                )}

                {/* Mission (Full Details Only) */}
                {isFullDetails && club.mission && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mission</Text>
                        <Text style={styles.sectionText}>{club.mission}</Text>
                    </View>
                )}

                {/* Values (Full Details Only) */}
                {isFullDetails && club.values?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Values</Text>
                        {club.values.map((value, index) => (
                            <View key={index} style={styles.listItem}>
                                <Feather name="check-circle" size={16} color="#f97316" />
                                <Text style={styles.listText}>{value}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Avenues (Full Details Only) */}
                {isFullDetails && club.avenues?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Avenues</Text>
                        {club.avenues.map((avenue, index) => (
                            <View key={index} style={styles.listItem}>
                                <Feather name="arrow-right" size={16} color="#f97316" />
                                <Text style={styles.listText}>{avenue}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Contact Info (Full Details Only) */}
                {isFullDetails && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                        {club.email && (
                            <TouchableOpacity style={styles.contactItem} onPress={() => openLink(`mailto:${club.email}`)}>
                                <Feather name="mail" size={20} color="#f97316" />
                                <Text style={styles.contactText}>{club.email}</Text>
                            </TouchableOpacity>
                        )}
                        {club.phone && (
                            <TouchableOpacity style={styles.contactItem} onPress={() => openLink(`tel:${club.phone}`)}>
                                <Feather name="phone" size={20} color="#f97316" />
                                <Text style={styles.contactText}>{club.phone}</Text>
                            </TouchableOpacity>
                        )}
                        {club.website && (
                            <TouchableOpacity style={styles.contactItem} onPress={() => openLink(club.website)}>
                                <Feather name="globe" size={20} color="#f97316" />
                                <Text style={styles.contactText}>{club.website}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Social Media */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Connect With Us</Text>
                    <View style={styles.socialLinks}>
                        {club.instagram && (
                            <TouchableOpacity style={styles.socialButton} onPress={() => openLink(club.instagram)}>
                                <Feather name="instagram" size={24} color="#f97316" />
                            </TouchableOpacity>
                        )}
                        {club.facebook && (
                            <TouchableOpacity style={styles.socialButton} onPress={() => openLink(club.facebook)}>
                                <Feather name="facebook" size={24} color="#f97316" />
                            </TouchableOpacity>
                        )}
                        {club.linkedIn && (
                            <TouchableOpacity style={styles.socialButton} onPress={() => openLink(club.linkedIn)}>
                                <Feather name="linkedin" size={24} color="#f97316" />
                            </TouchableOpacity>
                        )}
                        {club.twitter && (
                            <TouchableOpacity style={styles.socialButton} onPress={() => openLink(club.twitter)}>
                                <Feather name="twitter" size={24} color="#f97316" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Feedback form (mobile users) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Leave Feedback</Text>
                    <Text style={styles.sectionText}>Share your experience with this club — rate and leave a short comment.</Text>

                    <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
                        {[1,2,3,4,5].map((i) => (
                            <TouchableOpacity key={i} onPress={() => setFeedbackRating(i)} style={{ marginRight: 8 }}>
                                <Feather name="star" size={28} color={i <= feedbackRating ? '#f97316' : '#e5e7eb'} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        value={feedbackComment}
                        onChangeText={setFeedbackComment}
                        placeholder="Write a short comment (required)"
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        style={styles.feedbackInput}
                    />

                    {feedbackError ? <Text style={{ color: '#ef4444', marginTop: 8 }}>{feedbackError}</Text> : null}

                    <View style={{ marginTop: 12 }}>
                        <TouchableOpacity
                            style={[styles.joinButton, submittingFeedback && { opacity: 0.6 }]}
                            onPress={submitFeedback}
                            disabled={submittingFeedback}
                        >
                            {submittingFeedback ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.joinButtonText}>Submit Feedback</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>

            {/* Render the Modal */}
            <JoinRequestModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={submitJoinRequest}
                submitting={submittingRequest}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
    errorText: { marginTop: 16, fontSize: 16, color: '#ef4444', textAlign: 'center' },
    backButton: { marginTop: 12, fontSize: 14, color: '#f97316', fontWeight: '600' },
    headerContainer: { position: 'relative', height: 200 },
    coverImage: { width: '100%', height: 200 },
    backIconButton: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
    profileSection: { alignItems: 'center', marginTop: -50, paddingHorizontal: 24 },
    profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff', backgroundColor: '#f3f4f6' },
    clubName: { fontSize: 24, fontWeight: '700', color: '#000', marginTop: 12 },
    motto: { fontSize: 14, color: '#6b7280', fontStyle: 'italic', marginTop: 4, textAlign: 'center' },
    memberCount: { fontSize: 14, color: '#6b7280', marginTop: 4 },
    actionSection: { paddingHorizontal: 24, marginTop: 20 },
    joinButton: { backgroundColor: '#f97316', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    joinButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    statusBadge: { backgroundColor: '#fef3c7', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
    statusText: { fontSize: 14, fontWeight: '600', color: '#d97706' },
    section: { paddingHorizontal: 24, marginTop: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 12 },
    sectionText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
    listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    listText: { fontSize: 14, color: '#6b7280', marginLeft: 8, flex: 1 },
    contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    contactText: { fontSize: 14, color: '#6b7280', marginLeft: 12 },
    socialLinks: { flexDirection: 'row', gap: 16 },
    socialButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff1e6', justifyContent: 'center', alignItems: 'center' },
});
