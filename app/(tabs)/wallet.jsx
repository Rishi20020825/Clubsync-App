import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// This data is static for now, as in your original file.
const certificatesData = [
    { id: 1, title: 'Environmental Leadership Certificate', issuer: 'Eco Warriors Club', dateEarned: '2024-06-15', type: 'Leadership', status: 'Verified', description: 'Awarded for outstanding leadership in environmental initiatives.', skills: ['Environmental Awareness', 'Team Leadership', 'Project Management'], credentialId: 'EW-2024-LEA-001' },
    { id: 2, title: 'Public Speaking Excellence', issuer: 'Debate Club', dateEarned: '2024-05-20', type: 'Skill', status: 'Verified', description: 'Recognition for exceptional public speaking and debate skills.', skills: ['Public Speaking', 'Critical Thinking', 'Communication'], credentialId: 'DC-2024-PSE-045' },
    { id: 3, title: 'AI Project Innovation Award', issuer: 'AI & Robotics Club', dateEarned: '2024-03-25', type: 'Achievement', status: 'Verified', description: 'Recognition for innovative AI project development.', skills: ['Artificial Intelligence', 'Machine Learning', 'Programming'], credentialId: 'ARC-2024-AIA-023' },
];

export default function WalletScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.pageContainer}>
                <LinearGradient colors={['#f97316', '#ef4444']} style={styles.pageHeader}>
                    <Feather name="award" size={32} color="#ffffff" />
                    <Text style={styles.pageTitle}>Your Wallet</Text>
                    <Text style={styles.pageSubtitle}>Track your achievements and certificates</Text>
                </LinearGradient>
                <View style={styles.certificatesContainer}>
                    {certificatesData.map(certificate => (
                        <TouchableOpacity key={certificate.id} style={styles.certificateCard}>
                            <View style={styles.certificateHeader}>
                                <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.certificateIcon}>
                                    <Feather name='award' size={20} color="#ffffff" />
                                </LinearGradient>
                                <View style={styles.certificateInfo}>
                                    <Text style={styles.certificateTitle}>{certificate.title}</Text>
                                    <Text style={styles.certificateIssuer}>by {certificate.issuer}</Text>
                                </View>
                            </View>
                            <Text style={styles.certificateDescription}>{certificate.description}</Text>
                            <View style={styles.skillsContainer}>
                                {certificate.skills.map((skill, index) => (
                                    <View key={index} style={styles.skillChip}><Text style={styles.skillChipText}>{skill}</Text></View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>
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
});