# React Native Certificate Feature Implementation Guide

## Overview
This guide will help you implement the certificate feature from the ClubSync web application into your React Native mobile app. The certificate feature allows users to view and download certificates for events they participated in.

---

## 📋 Prerequisites

Before starting, ensure your React Native project has:
- Database connection to the same Prisma database (shared backend)
- User authentication system
- Access to the same API endpoints or ability to create similar endpoints

---

## 🗄️ Database Schema

Your React Native app should connect to the same database with this schema:

```prisma
model Certificate {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventId       String
  event         Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  certificateId String   @unique
  userName      String
  eventName     String
  clubName      String
  eventDate     String
  issuedAt      DateTime @default(now())
  createdAt     DateTime @default(now())

  @@unique([userId, eventId])
  @@map("certificates")
}
```

---

## 🎨 Certificate Template Design

The certificate uses a standard design with these elements:
- **Dimensions**: 1200px × 850px (landscape)
- **Decorative borders**: Double border with corner decorations
- **Content sections**:
  - Header: "CERTIFICATE OF PARTICIPATION"
  - User name (large, centered)
  - Event name (italicized)
  - Club name
  - Event date
  - Certificate ID
  - ClubSync branding

### Color Palette
```javascript
const colors = {
  white: '#ffffff',
  black: '#000000',
  neutral900: '#171717',
  neutral800: '#262626',
  neutral700: '#404040',
  neutral600: '#525252',
  neutral500: '#737373',
  neutral400: '#a3a3a3',
  neutral300: '#d4d4d4',
};
```

---

## 📦 Required React Native Packages

Install these packages in your React Native project:

```bash
npm install react-native-view-shot
npm install react-native-share
npm install react-native-fs
npm install react-native-svg
```

Or with yarn:
```bash
yarn add react-native-view-shot react-native-share react-native-fs react-native-svg
```

### Package Purposes:
- **react-native-view-shot**: Capture React Native components as images
- **react-native-share**: Share generated certificates
- **react-native-fs**: File system operations
- **react-native-svg**: Render decorative SVG icons

---

## 🏗️ Implementation Steps

### Step 1: Create Certificate Component

Create a file: `components/Certificate.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CertificateProps {
  userName: string;
  eventName: string;
  clubName: string;
  eventDate: string;
  certificateId?: string;
}

const Certificate: React.FC<CertificateProps> = ({
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
```

---

### Step 2: Create Certificate Generator Utility

Create a file: `utils/certificateGenerator.ts`

```typescript
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

export interface CertificateData {
  userName: string;
  eventName: string;
  clubName: string;
  eventDate: string;
  certificateId?: string;
}

/**
 * Capture certificate component as image
 */
export async function captureCertificate(
  viewRef: any,
  format: 'png' | 'jpg' = 'png',
  quality: number = 1.0
): Promise<string> {
  try {
    const uri = await captureRef(viewRef, {
      format,
      quality,
      result: 'tmpfile',
    });
    return uri;
  } catch (error) {
    console.error('Error capturing certificate:', error);
    throw new Error('Failed to capture certificate');
  }
}

/**
 * Download certificate to device
 */
export async function downloadCertificate(
  imageUri: string,
  fileName: string
): Promise<void> {
  try {
    const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
    await RNFS.copyFile(imageUri, downloadPath);
    console.log('Certificate downloaded to:', downloadPath);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw new Error('Failed to download certificate');
  }
}

/**
 * Share certificate
 */
export async function shareCertificate(
  imageUri: string,
  message?: string
): Promise<void> {
  try {
    await Share.open({
      url: `file://${imageUri}`,
      message: message || 'Check out my certificate!',
    });
  } catch (error) {
    console.error('Error sharing certificate:', error);
    // User cancelled share - not an error
  }
}
```

---

### Step 3: Create API Service

Create a file: `services/certificateService.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = 'YOUR_API_BASE_URL'; // Replace with your API URL

export interface Certificate {
  id: string;
  userId: string;
  eventId: string;
  certificateId: string;
  userName: string;
  eventName: string;
  clubName: string;
  eventDate: string;
  issuedAt: string;
  createdAt: string;
}

/**
 * Fetch all certificates for the current user
 */
export async function getUserCertificates(token: string): Promise<Certificate[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/certificates`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.certificates;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw new Error('Failed to fetch certificates');
  }
}

/**
 * Create a new certificate
 */
export async function createCertificate(
  eventId: string,
  userId: string,
  certificateData: any,
  token: string
): Promise<Certificate> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/certificates`,
      {
        eventId,
        userId,
        certificateData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.certificate;
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw new Error('Failed to create certificate');
  }
}
```

---

### Step 4: Create Wallet Screen

Create a file: `screens/WalletScreen.tsx`

```tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { getUserCertificates, Certificate as CertificateType } from '../services/certificateService';
import Certificate from '../components/Certificate';
import {
  captureCertificate,
  downloadCertificate,
  shareCertificate,
} from '../utils/certificateGenerator';

const WalletScreen = () => {
  const [certificates, setCertificates] = useState<CertificateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const certificateRef = useRef<View>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      // Get token from your auth context/storage
      const token = 'YOUR_AUTH_TOKEN'; // Replace with actual token retrieval
      const data = await getUserCertificates(token);
      setCertificates(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (certificate: CertificateType) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !selectedCertificate) return;

    try {
      const uri = await captureCertificate(certificateRef.current, 'png', 1.0);
      const fileName = `Certificate_${selectedCertificate.certificateId}.png`;
      await downloadCertificate(uri, fileName);
      Alert.alert('Success', 'Certificate downloaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to download certificate');
    }
  };

  const handleShare = async () => {
    if (!certificateRef.current || !selectedCertificate) return;

    try {
      const uri = await captureCertificate(certificateRef.current, 'png', 1.0);
      await shareCertificate(uri, `My certificate for ${selectedCertificate.eventName}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to share certificate');
    }
  };

  const renderCertificateItem = ({ item }: { item: CertificateType }) => (
    <TouchableOpacity
      style={styles.certificateCard}
      onPress={() => handleViewCertificate(item)}
    >
      <Text style={styles.eventName}>{item.eventName}</Text>
      <Text style={styles.clubName}>{item.clubName}</Text>
      <Text style={styles.date}>{item.eventDate}</Text>
      <Text style={styles.certificateId}>ID: {item.certificateId}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#262626" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Certificates</Text>
      {certificates.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No certificates yet</Text>
        </View>
      ) : (
        <FlatList
          data={certificates}
          renderItem={renderCertificateItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Certificate Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.certificateContainer}
            maximumZoomScale={3}
            minimumZoomScale={0.5}
            showsHorizontalScrollIndicator={false}
          >
            {selectedCertificate && (
              <View ref={certificateRef} collapsable={false}>
                <Certificate
                  userName={selectedCertificate.userName}
                  eventName={selectedCertificate.eventName}
                  clubName={selectedCertificate.clubName}
                  eventDate={selectedCertificate.eventDate}
                  certificateId={selectedCertificate.certificateId}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleDownload}>
              <Text style={styles.buttonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleShare}>
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  listContainer: {
    padding: 16,
  },
  certificateCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clubName: {
    fontSize: 14,
    color: '#525252',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#737373',
    marginBottom: 8,
  },
  certificateId: {
    fontSize: 10,
    color: '#a3a3a3',
  },
  emptyText: {
    fontSize: 16,
    color: '#737373',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  certificateContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  button: {
    backgroundColor: '#262626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#737373',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WalletScreen;
```

---

## 🔄 Backend Integration

If you need to create the API endpoints, here's the reference:

### POST /api/certificates
Creates a new certificate for a user.

**Request Body:**
```json
{
  "eventId": "string",
  "userId": "string",
  "certificateData": {}
}
```

**Response:**
```json
{
  "success": true,
  "certificate": {
    "id": "string",
    "userId": "string",
    "eventId": "string",
    "certificateId": "CERT-1234567890-ABCD1234",
    "userName": "John Doe",
    "eventName": "Annual Tech Conference",
    "clubName": "Tech Club",
    "eventDate": "January 15, 2025",
    "issuedAt": "2025-01-15T10:00:00Z",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

### GET /api/certificates
Retrieves all certificates for the authenticated user.

**Response:**
```json
{
  "certificates": [
    {
      "id": "string",
      "userId": "string",
      "eventId": "string",
      "certificateId": "CERT-1234567890-ABCD1234",
      "userName": "John Doe",
      "eventName": "Annual Tech Conference",
      "clubName": "Tech Club",
      "eventDate": "January 15, 2025",
      "issuedAt": "2025-01-15T10:00:00Z",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## 📱 Platform-Specific Configuration

### iOS Setup

1. Update `Info.plist` for photo library access:
```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>We need access to save certificates</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library</string>
```

2. Link native dependencies:
```bash
cd ios && pod install && cd ..
```

### Android Setup

1. Update `AndroidManifest.xml` for storage permissions:
```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

2. For Android 11+ (API 30+), add to `AndroidManifest.xml`:
```xml
<application android:requestLegacyExternalStorage="true">
  ...
</application>
```

---

## 🎯 Key Features to Implement

1. **View Certificates**: Display list of user's certificates
2. **Certificate Details**: Full-screen view of certificate
3. **Download**: Save certificate to device storage
4. **Share**: Share certificate via social media/messaging apps
5. **Zoom**: Allow pinch-to-zoom for certificate details

---

## 🧪 Testing Checklist

- [ ] Certificate renders correctly with all data
- [ ] Certificate maintains proper aspect ratio on different screen sizes
- [ ] Download functionality works on both iOS and Android
- [ ] Share functionality works with various apps
- [ ] API calls handle authentication properly
- [ ] Error handling displays user-friendly messages
- [ ] Loading states are shown appropriately
- [ ] Empty state displays when no certificates exist

---

## 🚀 Optional Enhancements

1. **PDF Generation**: Use `react-native-pdf-lib` to generate PDFs
2. **QR Code**: Add QR code with verification URL using `react-native-qrcode-svg`
3. **Offline Support**: Cache certificates locally
4. **Push Notifications**: Notify when new certificate is issued
5. **Certificate Verification**: Add public verification feature

---

## 📝 Summary

This implementation provides:
- ✅ Same certificate template as web app
- ✅ Database integration (shared Prisma schema)
- ✅ Download and share functionality
- ✅ User wallet to view all certificates
- ✅ Mobile-optimized viewing experience

Follow the steps in order, and adjust the API endpoints and authentication to match your specific setup.
