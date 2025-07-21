import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventsScreen from './(tabs)/events';
import ProfileScreen from './(tabs)/profile';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'events', label: 'Events', icon: 'calendar' },
  { key: 'clubs', label: 'Clubs', icon: 'users' },
  { key: 'wallet', label: 'Wallet', icon: 'award' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

export default function Dashboard() {
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);

  // Feed data for home page
  const feedData = [
    {
      id: 1,
      type: 'club',
      title: 'New Club: Eco Warriors 🌿',
      description: 'Join our mission to promote sustainability on campus!',
      image: require('../assets/3.png'),
      time: 'Just now',
    },
    {
      id: 2,
      type: 'post',
      title: 'Music Club – Annual Night Recap 🎶',
      description: 'Relive the magic from our Annual Music Night!',
      image: require('../assets/1.jpeg'),
      time: '2 hours ago',
    },
    {
      id: 3,
      type: 'event',
      title: 'Hackathon 2025 – Register Now!',
      description: 'Solve real-world problems in 24 hours. Prizes worth $5000!',
      image: require('../assets/2.png'),
      time: '4 hours ago',
    },
    {
      id: 4,
      type: 'club',
      title: 'Join the Debate Club 🗣️',
      description: 'Sharpen your skills and represent our college in national debates.',
      image: require('../assets/vote.jpg'),
      time: '1 day ago',
    },
    {
      id: 5,
      type: 'post',
      title: 'AI Club Project Showcase 🤖',
      description: 'Check out the amazing AI projects built by our members.',
      image: require('../assets/vote.jpg'),
      time: '2 days ago',
    },
  ];

  // Clubs data
  const clubsData = [
    {
      id: 1,
      name: 'Eco Warriors',
      category: 'Environment',
      members: 45,
      description: 'Promoting sustainability and environmental awareness on campus.',
      role: 'Member',
      joined: '2024-09-15',
      status: 'Active',
      image: require('../assets/3.png'),
      nextEvent: 'Tree Planting Drive - July 28',
      achievements: ['Green Campus Award 2024', 'Best Environmental Initiative'],
    },
    {
      id: 2,
      name: 'Music Society',
      category: 'Arts',
      members: 78,
      description: 'Celebrating music and organizing cultural events throughout the year.',
      role: 'Core Member',
      joined: '2024-08-20',
      status: 'Active',
      image: require('../assets/1.jpeg'),
      nextEvent: 'Music Festival - August 5',
      achievements: ['Best Cultural Club 2024', 'Outstanding Performance Award'],
    },
    {
      id: 3,
      name: 'Debate Club',
      category: 'Academic',
      members: 32,
      description: 'Enhancing public speaking and critical thinking skills.',
      role: 'Vice President',
      joined: '2024-07-10',
      status: 'Active',
      image: require('../assets/vote.jpg'),
      nextEvent: 'Inter-College Debate - August 12',
      achievements: ['National Debate Championship 2024', 'Best Orator Award'],
    },
    {
      id: 4,
      name: 'AI & Robotics Club',
      category: 'Technology',
      members: 56,
      description: 'Exploring artificial intelligence and robotics innovations.',
      role: 'Member',
      joined: '2024-06-25',
      status: 'Active',
      image: require('../assets/2.png'),
      nextEvent: 'AI Workshop - July 30',
      achievements: ['Tech Innovation Award 2024', 'Best Project Showcase'],
    },
    {
      id: 5,
      name: 'Photography Club',
      category: 'Arts',
      members: 29,
      description: 'Capturing moments and improving photography skills together.',
      role: 'Member',
      joined: '2024-05-18',
      status: 'Inactive',
      image: require('../assets/3.png'),
      nextEvent: 'Photo Walk - August 3',
      achievements: ['Best Photography Exhibition 2024'],
    },
  ];

  // Wallet/Certificates data
  const certificatesData = [
    {
      id: 1,
      title: 'Environmental Leadership Certificate',
      issuer: 'Eco Warriors Club',
      dateEarned: '2024-06-15',
      type: 'Leadership',
      status: 'Verified',
      description: 'Awarded for outstanding leadership in environmental initiatives.',
      skills: ['Environmental Awareness', 'Team Leadership', 'Project Management'],
      credentialId: 'EW-2024-LEA-001',
    },
    {
      id: 2,
      title: 'Public Speaking Excellence',
      issuer: 'Debate Club',
      dateEarned: '2024-05-20',
      type: 'Skill',
      status: 'Verified',
      description: 'Recognition for exceptional public speaking and debate skills.',
      skills: ['Public Speaking', 'Critical Thinking', 'Communication'],
      credentialId: 'DC-2024-PSE-045',
    },
    {
      id: 3,
      title: 'Music Performance Certificate',
      issuer: 'Music Society',
      dateEarned: '2024-04-18',
      type: 'Performance',
      status: 'Verified',
      description: 'Awarded for outstanding musical performance at Annual Night.',
      skills: ['Musical Performance', 'Stage Presence', 'Teamwork'],
      credentialId: 'MS-2024-MPC-078',
    },
    {
      id: 4,
      title: 'AI Project Innovation Award',
      issuer: 'AI & Robotics Club',
      dateEarned: '2024-03-25',
      type: 'Achievement',
      status: 'Verified',
      description: 'Recognition for innovative AI project development.',
      skills: ['Artificial Intelligence', 'Machine Learning', 'Programming'],
      credentialId: 'ARC-2024-AIA-023',
    },
    {
      id: 5,
      title: 'Photography Excellence',
      issuer: 'Photography Club',
      dateEarned: '2024-02-14',
      type: 'Skill',
      status: 'Verified',
      description: 'Awarded for exceptional photography skills and creativity.',
      skills: ['Photography', 'Visual Composition', 'Digital Editing'],
      credentialId: 'PC-2024-PHE-067',
    },
    {
      id: 6,
      title: 'Community Service Recognition',
      issuer: 'Student Council',
      dateEarned: '2024-01-30',
      type: 'Service',
      status: 'Verified',
      description: 'Recognition for 50+ hours of community service.',
      skills: ['Community Service', 'Social Impact', 'Volunteer Management'],
      credentialId: 'SC-2024-CSR-112',
    },
    {
      id: 7,
      title: 'Event Management Certificate',
      issuer: 'Cultural Committee',
      dateEarned: '2023-12-10',
      type: 'Management',
      status: 'Verified',
      description: 'Certified for successfully managing multiple campus events.',
      skills: ['Event Planning', 'Team Coordination', 'Budget Management'],
      credentialId: 'CC-2023-EMC-089',
    },
    {
      id: 8,
      title: 'Digital Marketing Workshop',
      issuer: 'Business Club',
      dateEarned: '2023-11-15',
      type: 'Skill',
      status: 'Verified',
      description: 'Completed comprehensive digital marketing workshop.',
      skills: ['Digital Marketing', 'Social Media', 'Content Strategy'],
      credentialId: 'BC-2023-DMW-156',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.homeContainer}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>
                Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋
              </Text>
              <Text style={styles.welcomeSubtitle}>Ready to explore new opportunities?</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient colors={['#10b981', '#059669']} style={styles.statIconContainer}>
                  <Feather name="calendar" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Events Attended</Text>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.statIconContainer}>
                  <Feather name="users" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Clubs Joined</Text>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.statIconContainer}>
                  <Feather name="award" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Certificates</Text>
              </View>
            </View>

            {/* Feed Header */}
            <View style={styles.feedHeaderContainer}>
              <Text style={styles.feedHeader}>Latest Updates</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <Feather name="arrow-right" size={16} color="#f97316" />
              </TouchableOpacity>
            </View>

            {/* Feed Items */}
            <View style={styles.feedContainer}>
              {feedData.map(item => (
                <TouchableOpacity key={item.id} style={styles.feedCard}>
                  {item.image && (
                    <View style={styles.feedImageContainer}>
                      <Image source={item.image} style={styles.feedImage} />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.feedImageOverlay}
                      />
                      <View style={styles.feedTypeBadge}>
                        <Text style={styles.feedTypeBadgeText}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View style={styles.feedContent}>
                    <Text style={styles.feedTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.feedDescription} numberOfLines={3}>{item.description}</Text>
                    
                    <View style={styles.feedFooter}>
                      <View style={styles.feedTimeContainer}>
                        <Feather name="clock" size={14} color="#9ca3af" />
                        <Text style={styles.feedTime}>{item.time}</Text>
                      </View>
                      {(item.type === 'event' || item.type === 'club') && (
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            item.type === 'event' ? styles.eventButton : styles.clubButton,
                          ]}
                          onPress={() => {
                            if (item.type === 'event') {
                              router.push(`/event/apply?id=${item.id}`);
                            }
                          }}
                        >
                          <Text style={styles.actionButtonText}>
                            {item.type === 'event' ? 'Apply Now' : 'Join Club'}
                          </Text>
                          <Feather name="arrow-right" size={14} color="#ffffff" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'events':
        return <EventsScreen />;
      case 'clubs':
        return (
          <ScrollView 
            style={styles.pageContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pageScrollContent}
          >
            <LinearGradient 
              colors={['#f97316', '#ef4444']} 
              style={styles.pageHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="users" size={32} color="#ffffff" />
              <Text style={styles.pageTitle}>Your Clubs</Text>
              <Text style={styles.pageSubtitle}>Connect and collaborate with amazing communities</Text>
            </LinearGradient>

            {/* Clubs Stats */}
            <View style={styles.clubsStatsContainer}>
              <View style={styles.clubStatCard}>
                <Text style={styles.clubStatNumber}>{clubsData.length}</Text>
                <Text style={styles.clubStatLabel}>Clubs Joined</Text>
              </View>
              <View style={styles.clubStatCard}>
                <Text style={styles.clubStatNumber}>{clubsData.filter(club => club.status === 'Active').length}</Text>
                <Text style={styles.clubStatLabel}>Active Memberships</Text>
              </View>
              <View style={styles.clubStatCard}>
                <Text style={styles.clubStatNumber}>{clubsData.filter(club => club.role.includes('President') || club.role.includes('Vice')).length}</Text>
                <Text style={styles.clubStatLabel}>Leadership Roles</Text>
              </View>
            </View>

            {/* Clubs List */}
            <View style={styles.clubsListContainer}>
              <View style={styles.clubsListHeader}>
                <Text style={styles.clubsListTitle}>My Clubs</Text>
                <TouchableOpacity style={styles.joinNewClubButton}>
                  <Feather name="plus" size={16} color="#f97316" />
                  <Text style={styles.joinNewClubText}>Join New</Text>
                </TouchableOpacity>
              </View>

              {clubsData.map(club => (
                <TouchableOpacity key={club.id} style={styles.clubCard}>
                  <View style={styles.clubCardHeader}>
                    <View style={styles.clubImageContainer}>
                      <Image source={club.image} style={styles.clubImage} />
                      <View style={[styles.clubStatusBadge, club.status === 'Active' ? styles.activeStatusBadge : styles.inactiveStatusBadge]}>
                        <Text style={[styles.clubStatusText, club.status === 'Active' ? styles.activeStatusText : styles.inactiveStatusText]}>
                          {club.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.clubInfo}>
                      <Text style={styles.clubName}>{club.name}</Text>
                      <Text style={styles.clubCategory}>{club.category}</Text>
                      <View style={styles.clubMembersRow}>
                        <Feather name="users" size={14} color="#6b7280" />
                        <Text style={styles.clubMembersText}>{club.members} members</Text>
                      </View>
                    </View>
                    <View style={styles.clubRoleContainer}>
                      <LinearGradient
                        colors={club.role.includes('President') || club.role.includes('Vice') ? ['#f59e0b', '#d97706'] : ['#3b82f6', '#1d4ed8']}
                        style={styles.clubRoleBadge}
                      >
                        <Text style={styles.clubRoleText}>{club.role}</Text>
                      </LinearGradient>
                    </View>
                  </View>
                  
                  <Text style={styles.clubDescription}>{club.description}</Text>
                  
                  <View style={styles.clubDetailsRow}>
                    <View style={styles.clubDetailItem}>
                      <Feather name="calendar" size={14} color="#6b7280" />
                      <Text style={styles.clubDetailText}>Joined {new Date(club.joined).toLocaleDateString()}</Text>
                    </View>
                  </View>

                  {club.nextEvent && (
                    <View style={styles.nextEventContainer}>
                      <Feather name="clock" size={14} color="#f97316" />
                      <Text style={styles.nextEventText}>Next: {club.nextEvent}</Text>
                    </View>
                  )}

                  <View style={styles.clubFooter}>
                    <View style={styles.achievementsContainer}>
                      <Feather name="award" size={14} color="#10b981" />
                      <Text style={styles.achievementsText}>{club.achievements.length} achievements</Text>
                    </View>
                    <TouchableOpacity style={styles.viewClubButton}>
                      <Text style={styles.viewClubButtonText}>View Details</Text>
                      <Feather name="arrow-right" size={14} color="#f97316" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );
      case 'wallet':
        return (
          <ScrollView 
            style={styles.pageContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pageScrollContent}
          >
            <LinearGradient 
              colors={['#f97316', '#ef4444']} 
              style={styles.pageHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="award" size={32} color="#ffffff" />
              <Text style={styles.pageTitle}>Your Wallet</Text>
              <Text style={styles.pageSubtitle}>Track your achievements and certificates</Text>
            </LinearGradient>

            {/* Wallet Stats */}
            <View style={styles.walletStatsContainer}>
              <View style={styles.walletStatCard}>
                <LinearGradient colors={['#10b981', '#059669']} style={styles.walletStatIcon}>
                  <Feather name="award" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.walletStatNumber}>{certificatesData.length}</Text>
                <Text style={styles.walletStatLabel}>Total Certificates</Text>
              </View>
              <View style={styles.walletStatCard}>
                <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.walletStatIcon}>
                  <Feather name="shield-check" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.walletStatNumber}>{certificatesData.filter(cert => cert.status === 'Verified').length}</Text>
                <Text style={styles.walletStatLabel}>Verified</Text>
              </View>
              <View style={styles.walletStatCard}>
                <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.walletStatIcon}>
                  <Feather name="trending-up" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.walletStatNumber}>{new Set(certificatesData.flatMap(cert => cert.skills)).size}</Text>
                <Text style={styles.walletStatLabel}>Skills Earned</Text>
              </View>
            </View>

            {/* Certificates List */}
            <View style={styles.certificatesContainer}>
              <View style={styles.certificatesHeader}>
                <Text style={styles.certificatesTitle}>My Certificates</Text>
                <TouchableOpacity style={styles.shareCredentialsButton}>
                  <Feather name="share" size={16} color="#f97316" />
                  <Text style={styles.shareCredentialsText}>Share</Text>
                </TouchableOpacity>
              </View>

              {certificatesData.map(certificate => (
                <TouchableOpacity key={certificate.id} style={styles.certificateCard}>
                  <View style={styles.certificateHeader}>
                    <LinearGradient
                      colors={certificate.type === 'Leadership' ? ['#f59e0b', '#d97706'] :
                             certificate.type === 'Skill' ? ['#3b82f6', '#1d4ed8'] :
                             certificate.type === 'Achievement' ? ['#10b981', '#059669'] :
                             certificate.type === 'Performance' ? ['#ec4899', '#db2777'] :
                             certificate.type === 'Service' ? ['#8b5cf6', '#7c3aed'] :
                             ['#6b7280', '#4b5563']}
                      style={styles.certificateIcon}
                    >
                      <Feather 
                        name={certificate.type === 'Leadership' ? 'users' :
                             certificate.type === 'Skill' ? 'book' :
                             certificate.type === 'Achievement' ? 'trophy' :
                             certificate.type === 'Performance' ? 'music' :
                             certificate.type === 'Service' ? 'heart' :
                             'award'} 
                        size={20} 
                        color="#ffffff" 
                      />
                    </LinearGradient>
                    <View style={styles.certificateInfo}>
                      <Text style={styles.certificateTitle}>{certificate.title}</Text>
                      <Text style={styles.certificateIssuer}>by {certificate.issuer}</Text>
                      <Text style={styles.certificateDate}>Earned on {new Date(certificate.dateEarned).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.certificateStatusContainer}>
                      <View style={[styles.certificateStatusBadge, styles.verifiedStatusBadge]}>
                        <Feather name="check-circle" size={12} color="#10b981" />
                        <Text style={styles.certificateStatusText}>{certificate.status}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.certificateDescription}>{certificate.description}</Text>

                  <View style={styles.skillsContainer}>
                    <Text style={styles.skillsLabel}>Skills:</Text>
                    <View style={styles.skillsRow}>
                      {certificate.skills.slice(0, 3).map((skill, index) => (
                        <View key={index} style={styles.skillChip}>
                          <Text style={styles.skillChipText}>{skill}</Text>
                        </View>
                      ))}
                      {certificate.skills.length > 3 && (
                        <View style={styles.skillChip}>
                          <Text style={styles.skillChipText}>+{certificate.skills.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.certificateFooter}>
                    <Text style={styles.credentialId}>ID: {certificate.credentialId}</Text>
                    <TouchableOpacity style={styles.viewCertificateButton}>
                      <Text style={styles.viewCertificateText}>View Certificate</Text>
                      <Feather name="external-link" size={14} color="#f97316" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );
      case 'profile':
        return <ProfileScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#fff7ed', '#fef2f2', '#fff']} style={styles.gradient}>
        <View style={styles.container}>
          {/* Compact Header */}
          <View style={styles.compactHeader}>
            <View style={styles.headerContent}>
              <View style={styles.brandRow}>
                <LinearGradient 
                  colors={['#f97316', '#ef4444']} 
                  style={styles.brandIcon}
                >
                  <Feather name="zap" size={20} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.brandText}>ClubSync</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Feather name="bell" size={20} color="#f97316" />
              </TouchableOpacity>
            </View>
          </View>

        {/* Content Area */}
        <View style={styles.content}>
          {activeTab === 'home' ? (
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {renderContent()}
            </ScrollView>
          ) : (
            renderContent()
          )}
        </View>

        {/* Floating Bottom Tab Bar */}
        <View style={styles.floatingTabContainer}>
          <LinearGradient 
            colors={['#ffffff', '#f9fafb']} 
            style={styles.floatingTabBar}
          >
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.floatingTabButton, activeTab === tab.key && styles.activeFloatingTabButton]}
                onPress={() => setActiveTab(tab.key)}
              >
                {activeTab === tab.key ? (
                  <LinearGradient
                    colors={['#f97316', '#ef4444']}
                    style={styles.activeTabIconContainer}
                  >
                    <Feather
                      name={tab.icon}
                      size={24}
                      color="#ffffff"
                    />
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveTabIconContainer}>
                    <Feather
                      name={tab.icon}
                      size={20}
                      color="#6b7280"
                    />
                  </View>
                )}
                {activeTab === tab.key && (
                  <Text style={styles.activeTabText}>{tab.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </LinearGradient>
        </View>
      </View>
    </LinearGradient>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  gradient: { 
    flex: 1 
  },
  container: { 
    flex: 1 
  },
  
  // Compact Header Styles
  compactHeader: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  brandText: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#000000' 
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },

  // Content Styles
  content: { 
    flex: 1,
    paddingBottom: 20, // Reduced padding for floating tab bar
  },
  scrollContainer: { 
    paddingBottom: 120 // Extra space for floating tabs
  },

  // Floating Tab Bar Styles
  floatingTabContainer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  floatingTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 56,
  },
  floatingTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    minWidth: 44,
    minHeight: 44,
  },
  activeFloatingTabButton: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    minWidth: 80,
    borderRadius: 24,
  },
  activeTabIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inactiveTabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
  },
  
  // Home Page Styles
  homeContainer: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Feed Styles
  feedHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  feedHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    marginRight: 4,
  },
  feedContainer: {
    paddingHorizontal: 24,
  },
  feedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  feedImageContainer: {
    position: 'relative',
  },
  feedImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
  },
  feedImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  feedTypeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  feedTypeBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  feedContent: {
    padding: 20,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 24,
  },
  feedDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  feedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventButton: {
    backgroundColor: '#f97316',
  },
  clubButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },

  // Page Styles (Clubs, Wallet)
  pageContainer: {
    flex: 1,
  },
  pageScrollContent: {
    paddingBottom: 140, // Extra space for floating tabs
  },
  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },

  // Clubs Page Styles
  clubsStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  clubStatCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  clubStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f97316',
    marginBottom: 4,
  },
  clubStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  clubsListContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  clubsListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  clubsListTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  joinNewClubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  joinNewClubText: {
    fontSize: 14,
    color: '#f97316',
    marginLeft: 4,
    fontWeight: '600',
  },
  clubCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  clubCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clubImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  clubImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  clubStatusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeStatusBadge: {
    backgroundColor: '#dcfce7',
  },
  inactiveStatusBadge: {
    backgroundColor: '#fef3c7',
  },
  clubStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#16a34a',
  },
  inactiveStatusText: {
    color: '#ca8a04',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  clubCategory: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    marginBottom: 6,
  },
  clubMembersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubMembersText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  clubRoleContainer: {
    alignItems: 'flex-end',
  },
  clubRoleBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clubRoleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  clubDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  clubDetailsRow: {
    marginBottom: 12,
  },
  clubDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubDetailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  nextEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  nextEventText: {
    fontSize: 12,
    color: '#f97316',
    marginLeft: 6,
    fontWeight: '600',
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementsText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
    fontWeight: '600',
  },
  viewClubButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewClubButtonText: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '600',
    marginRight: 4,
  },

  // Wallet Page Styles
  walletStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  walletStatCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  walletStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  walletStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  walletStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  certificatesContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  certificatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  certificatesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  shareCredentialsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  shareCredentialsText: {
    fontSize: 14,
    color: '#f97316',
    marginLeft: 4,
    fontWeight: '600',
  },
  certificateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  certificateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  certificateIssuer: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    marginBottom: 2,
  },
  certificateDate: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  certificateStatusContainer: {
    alignItems: 'flex-end',
  },
  certificateStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedStatusBadge: {
    backgroundColor: '#dcfce7',
  },
  certificateStatusText: {
    fontSize: 10,
    color: '#16a34a',
    marginLeft: 4,
    fontWeight: '600',
  },
  certificateDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  skillChipText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  certificateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credentialId: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  viewCertificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCertificateText: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '600',
    marginRight: 4,
  },

  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Legacy styles for compatibility
  centerContent: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1 
  },
  heading: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#222', 
    marginBottom: 12 
  },
  subheading: { 
    color: '#666', 
    fontSize: 16, 
    textAlign: 'center' 
  },
});
