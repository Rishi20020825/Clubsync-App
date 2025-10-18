import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function JoinRequestModal({ visible, onClose, onSubmit, submitting }) {
    const [motivation, setMotivation] = useState('');
    const [skills, setSkills] = useState('');
    const [links, setLinks] = useState('');

    const handleSubmit = () => {
        // Convert comma-separated strings to arrays of strings
        const relevantSkills = skills ? skills.split(',').map(s => s.trim()) : [];
        const socialLinks = links ? links.split(',').map(l => l.trim()) : [];

        onSubmit({ motivation, relevantSkills, socialLinks });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.centeredView}
            >
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Feather name="x" size={24} color="#6b7280" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Join Request Application</Text>
                    <Text style={styles.modalSubtitle}>Tell the club a little about yourself.</Text>

                    <Text style={styles.label}>Why do you want to join?</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Share your motivation..."
                        value={motivation}
                        onChangeText={setMotivation}
                        multiline
                    />

                    <Text style={styles.label}>Relevant Skills (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., graphic design, public speaking"
                        value={skills}
                        onChangeText={setSkills}
                        helperText="Separate skills with a comma"
                    />
                    <Text style={styles.helperText}>Separate skills with commas</Text>


                    <Text style={styles.label}>Social/Portfolio Links (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., LinkedIn, GitHub, Behance"
                        value={links}
                        onChangeText={setLinks}
                        autoCapitalize="none"
                    />
                    <Text style={styles.helperText}>Separate links with commas</Text>


                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={submitting || !motivation}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Request</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'stretch',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    modalTitle: {
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
    },
    modalSubtitle: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
        color: '#6b7280',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#374151',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#f9fafb',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: '#f97316',
        borderRadius: 12,
        paddingVertical: 14,
        elevation: 2,
        marginTop: 10,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
});