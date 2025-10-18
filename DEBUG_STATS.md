# 🐛 Debug Guide - Volunteer Stats Not Showing

## Common Issues & Solutions

### Issue: Stats show "Loading..." then disappear

This happens when the API call fails. Here's how to debug:

---

## 🔍 Step 1: Check Console Logs

After implementing the debug logs, open your app and check the console for these messages:

### Expected Log Sequence:
```
🔍 Fetching volunteer stats...
Token exists: true
User data exists: true
👤 User ID: cmcybb1dt0000v9hciwtyycn9
📡 API URL: http://10.21.143.137:3000/api/users/cmcybb1dt0000v9hciwtyycn9/stats
📥 Response status: 200
✅ Stats data received: { totalPoints: 1250, ... }
📊 StatsCard render - loading: false stats: { totalPoints: 1250, ... }
```

### If you see this instead:
```
❌ Failed to fetch volunteer stats: 404
Error details: Cannot GET /api/users/xxx/stats
```
**Problem**: Backend endpoint doesn't exist or wrong path

```
❌ Failed to fetch volunteer stats: 401
Error details: Unauthorized
```
**Problem**: Invalid JWT token

```
❌ Error fetching volunteer stats: TypeError: Network request failed
```
**Problem**: Backend server not running or wrong URL

---

## 🔧 Step 2: Verify Backend Server

### 1. Check if backend is running:
```powershell
# In your ClubSync-Web directory
npm run dev
# Should show: Server running on http://localhost:3000
```

### 2. Test the endpoint directly:
Open browser or Postman:
```
GET http://10.21.143.137:3000/api/users/{YOUR_USER_ID}/stats
Headers:
  Authorization: Bearer {YOUR_JWT_TOKEN}
```

### 3. Check if endpoint exists:
File should exist at:
```
ClubSync-Web/app/api/users/[id]/stats/route.ts
```

---

## 🌐 Step 3: Check Network Configuration

### For Android Emulator:
Change in `netconfig.js`:
```javascript
API_BASE_URL: 'http://10.0.2.2:3000',
```

### For iOS Simulator:
```javascript
API_BASE_URL: 'http://localhost:3000',
```

### For Physical Device:
Use your computer's local IP address:
```javascript
API_BASE_URL: 'http://192.168.X.X:3000',
```

To find your IP:
```powershell
# Windows
ipconfig
# Look for "IPv4 Address" under your active network
```

---

## 🔐 Step 4: Verify Authentication

### Check if token is valid:
```javascript
// Add to profile.jsx temporarily
const token = await AsyncStorage.getItem('token');
console.log('Token:', token);
```

### Check if user ID is correct:
```javascript
const userData = await AsyncStorage.getItem('user');
const user = JSON.parse(userData);
console.log('User ID:', user.id);
```

---

## 🎯 Step 5: Test with Default Data

The updated code now shows default data (Bronze, 0 points) if API fails.

### You should see:
```
┌───────────────────────────────────────┐
│ 🏆 Volunteer Rewards                  │
├───────────────────────────────────────┤
│ 0              🥉                     │
│ Points         Bronze                  │
│                                        │
│ 📅 0       ⚡ 0       ✓ 0            │
│ Participated Organized Total           │
│                                        │
│ Progress to Silver                0%   │
│ ░░░░░░░░░░░░░░░░░░░░                  │
└───────────────────────────────────────┘
```

If you see this, the component works! The issue is just with the API.

---

## 🛠️ Quick Fixes

### Fix 1: Backend Not Running
```powershell
cd "C:\Users\Shashith\Desktop\clubsync project\ClubSync-Web"
npm run dev
```

### Fix 2: Wrong API URL
1. Find your computer's IP address
2. Update `netconfig.js`:
```javascript
API_BASE_URL: 'http://YOUR_IP:3000',
```
3. Restart Expo dev server

### Fix 3: Endpoint Missing
If backend doesn't have the stats endpoint, create it:

**File**: `ClubSync-Web/app/api/users/[id]/stats/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stats = await prisma.volunteerStats.findUnique({
      where: { userId: id },
    });

    if (!stats) {
      return NextResponse.json({
        totalPoints: 0,
        eventsParticipated: 0,
        eventsOrganized: 0,
        totalEvents: 0,
        badge: "Bronze",
        nextBadge: "Silver",
        progress: 0,
      });
    }

    // Calculate badge
    let badge = "Bronze";
    let nextBadge = "Silver";
    let progress = 0;

    if (stats.totalPoints >= 5000) {
      badge = "Diamond";
      nextBadge = null;
      progress = 100;
    } else if (stats.totalPoints >= 2000) {
      badge = "Gold";
      nextBadge = "Diamond";
      progress = ((stats.totalPoints - 2000) / 3000) * 100;
    } else if (stats.totalPoints >= 500) {
      badge = "Silver";
      nextBadge = "Gold";
      progress = ((stats.totalPoints - 500) / 1500) * 100;
    } else {
      badge = "Bronze";
      nextBadge = "Silver";
      progress = (stats.totalPoints / 500) * 100;
    }

    return NextResponse.json({
      totalPoints: stats.totalPoints,
      eventsParticipated: stats.eventsParticipated,
      eventsOrganized: stats.eventsOrganized,
      totalEvents: stats.eventsParticipated + stats.eventsOrganized,
      badge,
      nextBadge,
      progress: Math.round(progress),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
```

### Fix 4: Database Missing VolunteerStats Table
Run Prisma migration:
```powershell
cd ClubSync-Web
npx prisma migrate dev
```

---

## 📊 Testing Checklist

After making changes:

1. **Restart Backend Server**
   ```powershell
   cd ClubSync-Web
   npm run dev
   ```

2. **Restart Mobile App**
   ```powershell
   cd Clubsync-App
   # Press 'r' in Expo terminal to reload
   ```

3. **Check Console Logs**
   - Look for the debug messages
   - Note any error codes

4. **Test API Directly**
   - Open browser
   - Go to: `http://10.21.143.137:3000/api/users/{userId}/stats`
   - Should see JSON response

5. **Verify Component Shows**
   - Should see either real data or default (Bronze, 0 points)
   - Should NOT disappear after loading

---

## 🎯 Expected Console Output

### Successful Load:
```
🔍 Fetching volunteer stats...
Token exists: true
User data exists: true
👤 User ID: abc123
📡 API URL: http://10.21.143.137:3000/api/users/abc123/stats
📥 Response status: 200
✅ Stats data received: {
  totalPoints: 1250,
  eventsParticipated: 45,
  eventsOrganized: 12,
  totalEvents: 57,
  badge: "Gold",
  nextBadge: "Diamond",
  progress: 80
}
📊 StatsCard render - loading: false stats: {...}
```

### Failed Load (with fallback):
```
🔍 Fetching volunteer stats...
Token exists: true
User data exists: true
👤 User ID: abc123
📡 API URL: http://10.21.143.137:3000/api/users/abc123/stats
📥 Response status: 404
❌ Failed to fetch volunteer stats: 404
Error details: Cannot GET /api/users/abc123/stats
📊 StatsCard render - loading: false stats: {
  totalPoints: 0,
  badge: "Bronze",
  ...
}
```

---

## 💡 Need More Help?

1. Copy all console logs
2. Check which step fails
3. Share the error messages

The component should now ALWAYS show (even with default data) so you can debug the API issue separately!

