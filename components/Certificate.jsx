import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Certificate = ({
  userName,
  eventName,
  clubName,
  eventDate,
  certificateId,
}) => {
  return (
    <View style={styles.container}>
      {/* Decorative borders */}
      <View style={styles.outerBorder}>
        <View style={styles.innerBorder} />
      </View>

      {/* Corner decorations */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerDecoration}>
            <View style={styles.decorativeLine} />
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth={1.5}>
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </Svg>
            <View style={styles.decorativeLine} />
          </View>
          <Text style={styles.title}>CERTIFICATE</Text>
          <Text style={styles.subtitle}>OF PARTICIPATION</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.certifyText}>This is to certify that</Text>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.underline} />
          <Text style={styles.participatedText}>has successfully participated in</Text>
          <Text style={styles.eventName}>{eventName}</Text>
          <Text style={styles.organizedText}>organized by</Text>
          <Text style={styles.clubName}>{clubName}</Text>
          <Text style={styles.eventDate}>on {eventDate}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.brandingTitle}>ClubSync</Text>
          <Text style={styles.brandingSubtitle}>VOLUNTEER MANAGEMENT SYSTEM</Text>
          {certificateId && (
            <Text style={styles.certificateId}>Certificate ID: {certificateId}</Text>
          )}
        </View>
      </View>

      {/* Watermark */}
      <View style={styles.watermark}>
        <Svg width={384} height={384} viewBox="0 0 24 24" fill="#262626" opacity={0.05}>
          <Path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 1200,
    height: 850,
    backgroundColor: '#ffffff',
    padding: 64,
    position: 'relative',
  },
  outerBorder: {
    position: 'absolute',
    top: 16,
    right: 16,
    bottom: 16,
    left: 16,
    borderWidth: 2,
    borderColor: '#262626',
    borderRadius: 2,
  },
  innerBorder: {
    position: 'absolute',
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    borderWidth: 1,
    borderColor: '#a3a3a3',
  },
  corner: {
    position: 'absolute',
    width: 64,
    height: 64,
  },
  topLeft: {
    top: 32,
    left: 32,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#262626',
  },
  topRight: {
    top: 32,
    right: 32,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#262626',
  },
  bottomLeft: {
    bottom: 32,
    left: 32,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#262626',
  },
  bottomRight: {
    bottom: 32,
    right: 32,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#262626',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
  },
  headerDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  decorativeLine: {
    width: 96,
    height: 4,
    backgroundColor: '#262626',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    letterSpacing: 6,
    color: '#171717',
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 24,
    letterSpacing: 6,
    fontWeight: '300',
    color: '#525252',
  },
  body: {
    alignItems: 'center',
    maxWidth: 768,
    marginVertical: 10,
  },
  certifyText: {
    fontSize: 19,
    fontWeight: '300',
    color: '#404040',
    marginBottom: 20,
  },
  userName: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#171717',
    marginBottom: 14,
  },
  underline: {
    width: '100%',
    height: 2,
    backgroundColor: '#d4d4d4',
    marginBottom: 20,
  },
  participatedText: {
    fontSize: 19,
    fontWeight: '300',
    color: '#404040',
    marginBottom: 10,
  },
  eventName: {
    fontSize: 33,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#262626',
    marginBottom: 10,
    textAlign: 'center',
  },
  organizedText: {
    fontSize: 19,
    fontWeight: '300',
    color: '#404040',
    marginBottom: 10,
  },
  clubName: {
    fontSize: 25,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 16,
  },
  eventDate: {
    fontSize: 17,
    color: '#525252',
  },
  footer: {
    alignItems: 'center',
    gap: 16,
  },
  brandingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.6,
    color: '#171717',
  },
  brandingSubtitle: {
    fontSize: 11,
    letterSpacing: 2.2,
    color: '#737373',
  },
  certificateId: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#a3a3a3',
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default Certificate;
