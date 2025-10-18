import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const StatsCard = ({ stats, loading }) => {
  // Debug logging
  console.log('📊 StatsCard render - loading:', loading, 'stats:', stats);

  if (loading) {
    return (
      <LinearGradient
        colors={['#f97316', '#ef4444']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContainer}>
          <Feather name="loader" size={24} color="#ffffff" />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Always show component even if stats is null
  if (!stats) {
    console.log('⚠️ No stats data - showing default');
    // Show default data instead of hiding
    const defaultStats = {
      totalPoints: 0,
      eventsParticipated: 0,
      eventsOrganized: 0,
      totalEvents: 0,
      badge: 'Bronze',
      nextBadge: 'Silver',
      progress: 0
    };
    // Update stats to use default
    stats = defaultStats;
  }

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'Diamond': return '💎';
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      default: return '⭐';
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Diamond': return ['#b9f2ff', '#89e2ff'];
      case 'Gold': return ['#ffd700', '#ffed4e'];
      case 'Silver': return ['#c0c0c0', '#e8e8e8'];
      case 'Bronze': return ['#cd7f32', '#e8a87c'];
      default: return ['#cbd5e1', '#e2e8f0'];
    }
  };

  return (
    <LinearGradient
      colors={['#f97316', '#ef4444']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Feather name="award" size={24} color="#ffffff" />
        <Text style={styles.title}>Volunteer Rewards</Text>
      </View>

      {/* Points and Badge Row */}
      <View style={styles.mainStats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalPoints?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>

        <LinearGradient
          colors={getBadgeColor(stats.badge)}
          style={styles.badgeBox}
        >
          <Text style={styles.badgeIcon}>{getBadgeIcon(stats.badge)}</Text>
          <Text style={styles.badgeText}>{stats.badge || 'Bronze'}</Text>
        </LinearGradient>
      </View>

      {/* Events Stats */}
      <View style={styles.eventsRow}>
        <View style={styles.eventStat}>
          <Feather name="calendar" size={16} color="#ffffff" />
          <Text style={styles.eventValue}>{stats.eventsParticipated || 0}</Text>
          <Text style={styles.eventLabel}>Participated</Text>
        </View>

        <View style={styles.eventStat}>
          <Feather name="zap" size={16} color="#ffffff" />
          <Text style={styles.eventValue}>{stats.eventsOrganized || 0}</Text>
          <Text style={styles.eventLabel}>Organized</Text>
        </View>

        <View style={styles.eventStat}>
          <Feather name="check-circle" size={16} color="#ffffff" />
          <Text style={styles.eventValue}>{stats.totalEvents || 0}</Text>
          <Text style={styles.eventLabel}>Total Events</Text>
        </View>
      </View>

      {/* Progress Bar */}
      {stats.nextBadge && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Progress to {stats.nextBadge}
            </Text>
            <Text style={styles.progressPercentage}>{stats.progress || 0}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stats.progress || 0}%` }]} />
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '600',
  },
  badgeBox: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  eventsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eventStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  eventValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  eventLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
});

export default StatsCard;
