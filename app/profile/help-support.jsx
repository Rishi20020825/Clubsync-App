// app/profile/help-support.jsx - Help & Support Screen
// This screen provides comprehensive help and support features for ClubSync users including:
// - Quick action buttons for email, phone, live chat, and feedback
// - Expandable FAQ section with common questions and answers
// - Support categories for organized help topics
// - Additional resources links
// - Contact information and business hours
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: "How do I apply for volunteer events?",
      answer: "To apply for events, navigate to the Events tab, browse available opportunities, and click 'Apply Now' on any event that interests you. Make sure your profile is complete before applying."
    },
    {
      id: 2,
      question: "How can I track my volunteer hours?",
      answer: "Your volunteer hours are automatically tracked when you complete events. You can view your total hours in the Profile section under 'Your Impact' stats."
    },
    {
      id: 3,
      question: "Where can I view my certificates?",
      answer: "All your earned certificates are available in the Wallet section accessible from the Dashboard. You can also find them in your Profile under 'My Certificates'."
    },
    {
      id: 4,
      question: "How do I join a club?",
      answer: "Browse clubs in the Dashboard, select a club that interests you, and click 'Join Club'. Some clubs may require approval from administrators."
    },
    {
      id: 5,
      question: "What if I can't attend an event I applied for?",
      answer: "If you can't attend, please withdraw your application as soon as possible to allow others to participate. You can do this from your 'Applied Events' in the Profile section."
    },
    {
      id: 6,
      question: "How do I update my profile information?",
      answer: "Go to Profile > Edit Profile to update your personal information, interests, and preferences. Make sure to save your changes."
    },
    {
      id: 7,
      question: "How are election votes counted?",
      answer: "All votes are anonymous and securely encrypted. Results are tallied automatically and made available after the voting period ends."
    }
  ];

  // Support categories
  const supportCategories = [
    {
      id: 1,
      title: 'Account & Profile',
      icon: 'user',
      description: 'Profile settings, account issues',
      color: ['#3b82f6', '#1d4ed8']
    },
    {
      id: 2,
      title: 'Events & Volunteering',
      icon: 'calendar',
      description: 'Event applications, volunteering',
      color: ['#10b981', '#059669']
    },
    {
      id: 3,
      title: 'Clubs & Communities',
      icon: 'users',
      description: 'Club memberships, community',
      color: ['#f59e0b', '#d97706']
    },
    {
      id: 4,
      title: 'Elections & Voting',
      icon: 'check-square',
      description: 'Voting process, elections',
      color: ['#ec4899', '#db2777']
    }
  ];

  const handleEmailSupport = () => {
    const email = 'support@clubsync.app';
    const subject = 'ClubSync Support Request';
    const body = 'Please describe your issue or question here...';
    
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const handlePhoneSupport = () => {
    const phoneNumber = '+1-800-CLUBSYNC';
    Alert.alert(
      'Contact Support',
      `Call us at ${phoneNumber}\n\nSupport Hours:\nMonday - Friday: 9 AM - 6 PM\nSaturday: 10 AM - 4 PM`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL(`tel:${phoneNumber}`) }
      ]
    );
  };

  const handleLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Live chat is available during business hours. Would you like to be redirected to our chat portal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Chat', onPress: () => {
          // In a real app, this would open a chat widget or navigate to a chat screen
          Alert.alert('Chat', 'Live chat feature would open here in the full app.');
        }}
      ]
    );
  };

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      Alert.alert(
        'Feedback Submitted',
        'Thank you for your feedback! We appreciate your input and will review it carefully.',
        [{ text: 'OK', onPress: () => {
          setFeedbackText('');
          setShowFeedbackForm(false);
        }}]
      );
    } else {
      Alert.alert('Error', 'Please enter your feedback before submitting.');
    }
  };

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <LinearGradient 
        colors={['#f97316', '#ef4444']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Feather name="help-circle" size={32} color="#ffffff" />
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>We're here to help you succeed</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Get Quick Help</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleEmailSupport}>
            <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.quickActionIcon}>
              <Feather name="mail" size={20} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.quickActionTitle}>Email Support</Text>
            <Text style={styles.quickActionSubtitle}>Get detailed help</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={handlePhoneSupport}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.quickActionIcon}>
              <Feather name="phone" size={20} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.quickActionTitle}>Call Us</Text>
            <Text style={styles.quickActionSubtitle}>Speak to an agent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={handleLiveChat}>
            <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.quickActionIcon}>
              <Feather name="message-circle" size={20} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.quickActionTitle}>Live Chat</Text>
            <Text style={styles.quickActionSubtitle}>Chat with support</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => setShowFeedbackForm(!showFeedbackForm)}
          >
            <LinearGradient colors={['#ec4899', '#db2777']} style={styles.quickActionIcon}>
              <Feather name="edit" size={20} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.quickActionTitle}>Feedback</Text>
            <Text style={styles.quickActionSubtitle}>Share your thoughts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feedback Form */}
      {showFeedbackForm && (
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Send Us Feedback</Text>
          <View style={styles.feedbackForm}>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell us what you think or suggest improvements..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              value={feedbackText}
              onChangeText={setFeedbackText}
            />
            <TouchableOpacity style={styles.submitFeedbackButton} onPress={handleSubmitFeedback}>
              <LinearGradient colors={['#f97316', '#ef4444']} style={styles.submitButtonGradient}>
                <Feather name="send" size={16} color="#ffffff" />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Support Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <View style={styles.categoriesGrid}>
          {supportCategories.map(category => (
            <TouchableOpacity key={category.id} style={styles.categoryCard}>
              <LinearGradient colors={category.color} style={styles.categoryIcon}>
                <Feather name={category.icon} size={20} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqData.map(faq => (
          <TouchableOpacity 
            key={faq.id} 
            style={styles.faqItem} 
            onPress={() => toggleFaq(faq.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Feather 
                name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6b7280" 
              />
            </View>
            {expandedFaq === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Additional Resources */}
      <View style={styles.resourcesSection}>
        <Text style={styles.sectionTitle}>Additional Resources</Text>
        
        <TouchableOpacity style={styles.resourceItem}>
          <Feather name="book-open" size={20} color="#f97316" />
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle}>User Guide</Text>
            <Text style={styles.resourceDescription}>Complete guide to using ClubSync</Text>
          </View>
          <Feather name="external-link" size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resourceItem}>
          <Feather name="video" size={20} color="#f97316" />
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle}>Video Tutorials</Text>
            <Text style={styles.resourceDescription}>Step-by-step video guides</Text>
          </View>
          <Feather name="external-link" size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.resourceItem}>
          <Feather name="message-square" size={20} color="#f97316" />
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle}>Community Forum</Text>
            <Text style={styles.resourceDescription}>Connect with other users</Text>
          </View>
          <Feather name="external-link" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Still Need Help?</Text>
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Feather name="mail" size={16} color="#6b7280" />
            <Text style={styles.contactText}>support@clubsync.app</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="phone" size={16} color="#6b7280" />
            <Text style={styles.contactText}>+1-800-CLUBSYNC</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="clock" size={16} color="#6b7280" />
            <Text style={styles.contactText}>Mon-Fri 9AM-6PM, Sat 10AM-4PM</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  scrollContent: {
    paddingBottom: 140,
  },

  // Header Styles
  header: {
    paddingTop: 50,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },

  // Section Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },

  // Quick Actions
  quickActions: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Feedback Form
  feedbackSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  feedbackForm: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 100,
  },
  submitFeedbackButton: {
    borderRadius: 12,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Categories
  categoriesSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },

  // FAQ Styles
  faqSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  faqItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    paddingRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },

  // Resources
  resourcesSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Contact
  contactSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
  },
});
