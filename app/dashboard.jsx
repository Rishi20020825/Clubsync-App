import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventsScreen from './(tabs)/events';
import ProfileScreen from './(tabs)/profile';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { netconfig } from '../netconfig';


const { width } = Dimensions.get('window');

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
  const [userClubs, setUserClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [clubsError, setClubsError] = useState(null);
  const [expandedClubs, setExpandedClubs] = useState({}); // Track which clubs are expanded
  const router = useRouter();

  const [loading, setLoading] = useState(false);      // ✅ Add this
  const [error, setError] = useState('');             // ✅ Add this
  const [clubsData, setClubsData] = useState([]);     // ✅ Add this


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        console.log('Retrieved user data:', userData);
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user:', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('No user data found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUser();
    fetchClubs(); // Fetch clubs when component mounts
  }, []);

  // Fetch user's clubs when clubs tab is active
  useEffect(() => {
    if (activeTab === 'clubs' && user?.id) {
      fetchUserClubs();
    }
  }, [activeTab, user?.id]);

  // Function to toggle club description expansion
  const toggleClubDescription = (clubId) => {
    setExpandedClubs(prev => ({
      ...prev,
      [clubId]: !prev[clubId]
    }));
  };

  // Function to truncate description
  const getTruncatedDescription = (description, clubId, maxLength = 100) => {
    if (!description) return 'No description available';
    
    const isExpanded = expandedClubs[clubId];
    
    if (description.length <= maxLength) {
      return description;
    }
    
    if (isExpanded) {
      return description;
    }
    
    return description.substring(0, maxLength) + '...';
  };

  const fetchUserClubs = async () => {
    setLoadingClubs(true);
    setClubsError(null);
    
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      console.log('🔑 Token:', token ? 'exists' : 'missing');
      console.log('👤 User Data:', userData);
      
      if (!token || !userData) {
        setClubsError('Please login to view your clubs');
        setLoadingClubs(false);
        return;
      }

      const userObj = JSON.parse(userData);
      console.log('📝 Parsed User:', userObj);

      // Use query parameter to filter clubs by userId
      const apiUrl = `${netconfig.API_BASE_URL}/api/clubs/mobile?userId=${userObj.id}`;
      console.log('🌐 API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response Status:', response.status);
      console.log('📊 Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to fetch clubs: ${response.status}`);
      }

      const clubs = await response.json();
      console.log('✅ Fetched Clubs:', clubs);
      
      // Map the API response to match the existing UI structure
      const mappedClubs = clubs.map(club => ({
        id: club.id,
        name: club.name,
        category: 'Community',
        members: club._count?.members || 0,
        description: club.about || club.mission || 'No description available',
        role: club.members?.[0]?.role || 'member',
        joined: club.members?.[0]?.joinedAt || club.createdAt,
        status: club.isActive ? 'Active' : 'Inactive',
        image: club.profileImage ? { uri: club.profileImage } : require('../assets/3.png'),
        nextEvent: null,
        achievements: [],
      }));

      console.log('📋 Mapped Clubs:', mappedClubs);
      setUserClubs(mappedClubs);
      
    } catch (error) {
      console.error('❌ Error fetching user clubs:', error);
      console.error('❌ Error details:', error.message);
      setClubsError('Failed to load your clubs. Please try again.');
    } finally {
      setLoadingClubs(false);
    }
  };

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
      title: 'Music Club - Annual Night Recap 🎶',
      description: 'Relive the magic from our Annual Music Night!',
      image: require('../assets/1.jpeg'),
      time: '2 hours ago',
    },
    {
      id: 3,
      type: 'event',
      title: 'Hackathon 2025 - Register Now!',
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

  // Function to fetch clubs from database
  const fetchClubs = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (!userData || !token) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userData);
      const userId = user.id || user.userId || user.user_id;
      
      const res = await fetch(`${netconfig.API_BASE_URL}/api/clubs?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch clubs');
      const data = await res.json();
      
      console.log('Clubs API Response:', data);
      setClubsData(data.clubs || data || []);
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError(err.message);
      // Set empty array as fallback
      setClubsData([]);
    }
    setLoading(false);
  };

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
          <ScrollView 
            style={styles.homeContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.homeScrollContent}
          >
            {/* Hero Section */}
            <LinearGradient
              colors={['#f97316', '#ef4444']}
              style={styles.heroSection}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroContent}>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>Good Afternoon!</Text>
                  <Text style={styles.userNameText}>
                    {user?.firstName || user?.name?.split(' ')[0] || user?.first_name || 'Welcome!'}
                  </Text>
                  <Text style={styles.motivationText}>Ready to make today amazing? ✨</Text>
                </View>
                <TouchableOpacity style={styles.profileImageButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.3)']}
                    style={styles.profileImageContainer}
                  >
                    <Feather name="user" size={24} color="#ffffff" />
                  </LinearGradient>
                  <View style={styles.onlineIndicator} />
                </TouchableOpacity>
              </View>
              
              {/* Quick Stats Cards */}
              <View style={styles.heroStatsContainer}>
                <View style={styles.heroStatCard}>
                  <Feather name="calendar" size={16} color="#ffffff" />
                  <Text style={styles.heroStatNumber}>12</Text>
                  <Text style={styles.heroStatLabel}>Events</Text>
                </View>
                <View style={styles.heroStatCard}>
                  <Feather name="users" size={16} color="#ffffff" />
                  <Text style={styles.heroStatNumber}>5</Text>
                  <Text style={styles.heroStatLabel}>Clubs</Text>
                </View>
                <View style={styles.heroStatCard}>
                  <Feather name="award" size={16} color="#ffffff" />
                  <Text style={styles.heroStatNumber}>8</Text>
                  <Text style={styles.heroStatLabel}>Certificates</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => setActiveTab('events')}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#1d4ed8']}
                    style={styles.quickActionIcon}
                  >
                    <Feather name="calendar" size={20} color="#ffffff" />
                  </LinearGradient>
                  <Text style={styles.quickActionTitle}>Browse Events</Text>
                  <Text style={styles.quickActionSubtitle}>Discover new opportunities</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => setActiveTab('clubs')}
                >
                  <LinearGradient
                    colors={['#8b5cf6', '#7c3aed']}
                    style={styles.quickActionIcon}
                  >
                    <Feather name="users" size={20} color="#ffffff" />
                  </LinearGradient>
                  <Text style={styles.quickActionTitle}>Find Clubs</Text>
                  <Text style={styles.quickActionSubtitle}>Connect with communities</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => setActiveTab('wallet')}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.quickActionIcon}
                  >
                    <Feather name="award" size={20} color="#ffffff" />
                  </LinearGradient>
                  <Text style={styles.quickActionTitle}>Certificates</Text>
                  <Text style={styles.quickActionSubtitle}>View achievements</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/election')}
                >
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    style={styles.quickActionIcon}
                  >
                    <Feather name="check-square" size={20} color="#ffffff" />
                  </LinearGradient>
                  <Text style={styles.quickActionTitle}>Elections</Text>
                  <Text style={styles.quickActionSubtitle}>Cast your vote</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Upcoming Events */}
            <View style={styles.upcomingEventsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <TouchableOpacity onPress={() => setActiveTab('events')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                <TouchableOpacity style={styles.upcomingEventCard}>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=200&h=120&fit=crop' }}
                    style={styles.upcomingEventImage}
                  />
                  <View style={styles.upcomingEventOverlay} />
                  <View style={styles.upcomingEventContent}>
                    <Text style={styles.upcomingEventTitle}>Beach Cleanup</Text>
                    <Text style={styles.upcomingEventDate}>July 25, 8:00 AM</Text>
                    <View style={styles.upcomingEventStatus}>
                      <Text style={styles.upcomingEventStatusText}>Applied</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.upcomingEventCard}>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop' }}
                    style={styles.upcomingEventImage}
                  />
                  <View style={styles.upcomingEventOverlay} />
                  <View style={styles.upcomingEventContent}>
                    <Text style={styles.upcomingEventTitle}>Coding Workshop</Text>
                    <Text style={styles.upcomingEventDate}>July 28, 2:00 PM</Text>
                    <View style={styles.upcomingEventStatus}>
                      <Text style={styles.upcomingEventStatusText}>Registered</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.upcomingEventCard}>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=120&fit=crop' }}
                    style={styles.upcomingEventImage}
                  />
                  <View style={styles.upcomingEventOverlay} />
                  <View style={styles.upcomingEventContent}>
                    <Text style={styles.upcomingEventTitle}>Art Exhibition</Text>
                    <Text style={styles.upcomingEventDate}>Aug 2, 10:00 AM</Text>
                    <View style={styles.upcomingEventStatus}>
                      <Text style={styles.upcomingEventStatusText}>Interested</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* My Clubs Preview */}
            <View style={styles.clubsPreviewSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Active Clubs</Text>
                <TouchableOpacity onPress={() => setActiveTab('clubs')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {loading ? (
                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                  <Text style={{ color: '#6b7280' }}>Loading clubs...</Text>
                </View>
              ) : error ? (
                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                  <Text style={{ color: 'red', fontSize: 14 }}>Failed to load clubs</Text>
                  <TouchableOpacity onPress={fetchClubs} style={{ marginTop: 8 }}>
                    <Text style={{ color: '#f97316', fontSize: 12 }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : clubsData && clubsData.length > 0 ? (
                clubsData.slice(0, 2).map((club) => (
                  <TouchableOpacity key={club.id} style={styles.clubPreviewCard}>
                    <Image 
                      source={club.image ? { uri: club.image } : require('../assets/3.png')}
                      style={styles.clubPreviewImage}
                    />
                    <View style={styles.clubPreviewInfo}>
                      <Text style={styles.clubPreviewName}>{club.name || 'Club Name'}</Text>
                      <Text style={styles.clubPreviewCategory}>
                        {club.category || 'Category'} • {club.members || 0} members
                      </Text>
                      {club.nextEvent && (
                        <View style={styles.clubPreviewNext}>
                          <Feather name="calendar" size={12} color="#f97316" />
                          <Text style={styles.clubPreviewNextText}>{club.nextEvent}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.clubPreviewRole}>
                      <Text style={styles.clubPreviewRoleText}>{club.role || 'Member'}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                  <Text style={{ color: '#6b7280', fontSize: 14 }}>No active clubs found</Text>
                  <TouchableOpacity onPress={() => setActiveTab('clubs')} style={{ marginTop: 8 }}>
                    <Text style={{ color: '#f97316', fontSize: 12 }}>Join clubs</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Recent Activity */}
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              
              <View style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: '#10b981' }]}>
                  <Feather name="award" size={16} color="#ffffff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Earned Environmental Leadership Certificate</Text>
                  <Text style={styles.activitySubtitle}>From Eco Warriors Club</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>

              <View style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: '#3b82f6' }]}>
                  <Feather name="calendar-check" size={16} color="#ffffff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Attended Community Service Workshop</Text>
                  <Text style={styles.activitySubtitle}>Caring Hearts Club</Text>
                  <Text style={styles.activityTime}>1 day ago</Text>
                </View>
              </View>

              <View style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: '#8b5cf6' }]}>
                  <Feather name="users" size={16} color="#ffffff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Joined Photography Club</Text>
                  <Text style={styles.activitySubtitle}>Now member of 5 clubs</Text>
                  <Text style={styles.activityTime}>3 days ago</Text>
                </View>
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 20 }} />
          </ScrollView>
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
                <Text style={styles.clubStatNumber}>{userClubs.length}</Text>
                <Text style={styles.clubStatLabel}>Clubs Joined</Text>
              </View>
              <View style={styles.clubStatCard}>
                <Text style={styles.clubStatNumber}>{userClubs.filter(club => club.status === 'Active').length}</Text>
                <Text style={styles.clubStatLabel}>Active{'\n'}Memberships</Text>
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

              {loadingClubs ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading your clubs...</Text>
                </View>
              ) : clubsError ? (
                <View style={styles.errorMessageContainer}>
                  <Feather name="alert-circle" size={24} color="#ef4444" />
                  <Text style={styles.errorMessageText}>{clubsError}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={fetchUserClubs}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : userClubs.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Feather name="users" size={48} color="#d1d5db" />
                  <Text style={styles.emptyStateTitle}>No Clubs Yet</Text>
                  <Text style={styles.emptyStateText}>You haven't joined any clubs yet. Start exploring!</Text>
                </View>
              ) : (
                userClubs.map(club => (
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
                  
                  <View>
                    <Text style={styles.clubDescription}>
                      {getTruncatedDescription(club.description, club.id)}
                    </Text>
                    {club.description && club.description.length > 100 && (
                      <TouchableOpacity 
                        onPress={() => toggleClubDescription(club.id)}
                        style={styles.seeMoreButton}
                      >
                        <Text style={styles.seeMoreText}>
                          {expandedClubs[club.id] ? 'See Less' : 'See More'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
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
              ))
              )}
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
                  <Feather name="check-circle" size={20} color="#ffffff" />
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
          {renderContent()}
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
    backgroundColor: '#fff7ed',
  },
  homeScrollContent: {
    paddingBottom: 80,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, y: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '800',
    marginBottom: 6,
  },
  motivationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  profileImageButton: {
    position: 'relative',
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  heroStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroStatNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 72) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
  },

  // Upcoming Events
  upcomingEventsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  horizontalScroll: {
    marginLeft: -24,
    paddingLeft: 24,
  },
  upcomingEventCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  upcomingEventImage: {
    width: '100%',
    height: 120,
  },
  upcomingEventOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  upcomingEventContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  upcomingEventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  upcomingEventDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 6,
  },
  upcomingEventStatus: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  upcomingEventStatusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Clubs Preview
  clubsPreviewSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  clubPreviewCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clubPreviewImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  clubPreviewInfo: {
    flex: 1,
  },
  clubPreviewName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  clubPreviewCategory: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  clubPreviewNext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clubPreviewNextText: {
    fontSize: 11,
    color: '#f97316',
    fontWeight: '600',
  },
  clubPreviewRole: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  clubPreviewRoleText: {
    fontSize: 10,
    color: '#f97316',
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Activity Section
  activitySection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#9ca3af',
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
    marginBottom: 8,
  },
  seeMoreButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  seeMoreText: {
    fontSize: 13,
    color: '#f97316',
    fontWeight: '600',
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

  // Loading, Error, and Empty State Styles
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorMessageContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    marginVertical: 20,
  },
  errorMessageText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
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
