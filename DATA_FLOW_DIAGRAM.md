# 🔄 Data Flow Diagram - Volunteer Stats

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER OPENS PROFILE TAB                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              profile.jsx Component Mounts                    │
│                                                               │
│  useEffect(() => {                                           │
│    fetchUser()           ← Existing                          │
│    fetchVolunteerStats() ← NEW                              │
│  }, [])                                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              fetchVolunteerStats() Executes                  │
│                                                               │
│  1. setLoadingStats(true)  → Show loading spinner           │
│  2. Get token from AsyncStorage                              │
│  3. Get user data from AsyncStorage                          │
│  4. Parse user.id                                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Request Sent                           │
│                                                               │
│  URL: ${API_BASE_URL}/api/users/${userId}/stats            │
│  Method: GET                                                 │
│  Headers:                                                    │
│    Authorization: Bearer {jwt_token}                         │
│    Content-Type: application/json                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API Processing                      │
│         (ClubSync-Web/app/api/users/[id]/stats)             │
│                                                               │
│  1. Validate JWT token                                       │
│  2. Extract user ID from params                              │
│  3. Query Prisma database:                                   │
│     - VolunteerStats.findUnique({ userId })                 │
│  4. Calculate badge based on points                          │
│  5. Calculate progress to next badge                         │
│  6. Calculate total events                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Response Received                       │
│                                                               │
│  Status: 200 OK                                              │
│  Body: {                                                     │
│    totalPoints: 1250,                                        │
│    eventsParticipated: 45,                                   │
│    eventsOrganized: 12,                                      │
│    totalEvents: 57,                                          │
│    badge: "Gold",                                            │
│    nextBadge: "Diamond",                                     │
│    progress: 80                                              │
│  }                                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              profile.jsx Processes Response                  │
│                                                               │
│  if (response.ok) {                                          │
│    const data = await response.json()                        │
│    setVolunteerStats(data)  → Update state                  │
│  }                                                           │
│  setLoadingStats(false)   → Hide loading                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                Component Re-renders                          │
│                                                               │
│  <StatsCard                                                  │
│    stats={volunteerStats}    ← Populated with data          │
│    loading={loadingStats}    ← Set to false                 │
│  />                                                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              StatsCard Component Renders                     │
│                                                               │
│  1. Check loading state (false - skip loading view)         │
│  2. Check stats data (exists - proceed)                      │
│  3. Call getBadgeIcon("Gold") → "🥇"                        │
│  4. Call getBadgeColor("Gold") → ["#ffd700", "#ffed4e"]     │
│  5. Format points: 1250 → "1,250"                           │
│  6. Render all UI elements                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    USER SEES STATS CARD                      │
│                                                               │
│  ╔════════════════════════════════════════════╗             │
│  ║  🏆 Volunteer Rewards                     ║             │
│  ╠════════════════════════════════════════════╣             │
│  ║  1,250          🥇                        ║             │
│  ║  Points         Gold                       ║             │
│  ║                                            ║             │
│  ║  📅 45      ⚡ 12      ✓ 57              ║             │
│  ║  Participated Organized Total              ║             │
│  ║                                            ║             │
│  ║  Progress to Diamond              80%     ║             │
│  ║  ████████████████████░░░░░░░░░░░          ║             │
│  ╚════════════════════════════════════════════╝             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Screen Focus Flow

When user navigates away and returns to profile:

```
User switches to Events tab
        ↓
Profile tab loses focus
        ↓
User switches back to Profile tab
        ↓
useFocusEffect triggered
        ↓
fetchUser() + fetchVolunteerStats() called
        ↓
Fresh data fetched from backend
        ↓
Stats updated automatically
        ↓
User sees latest stats
```

---

## 📊 State Management Flow

```
Component Mount
    ↓
Initial State:
  user: { name: '', email: '' }
  volunteerStats: null         ← No data yet
  loadingStats: false          ← Not loading
    ↓
fetchVolunteerStats() called
    ↓
setLoadingStats(true)          ← Start loading
    ↓
State Update:
  volunteerStats: null
  loadingStats: true           ← Loading state
    ↓
Component Re-render
    ↓
StatsCard shows: "⟳ Loading stats..."
    ↓
API call completes
    ↓
setVolunteerStats(data)        ← Data received
setLoadingStats(false)         ← Stop loading
    ↓
Final State:
  volunteerStats: { ...data }  ← Full data
  loadingStats: false          ← Not loading
    ↓
Component Re-render
    ↓
StatsCard shows: Full stats display
```

---

## 🎨 Component Hierarchy Flow

```
App
 └── Navigation
      └── Tabs
           └── Profile Tab
                └── ScrollView
                     ├── Profile Header (Gradient)
                     │    ├── Avatar
                     │    ├── User Info
                     │    └── Edit Button
                     │
                     ├── StatsCard ← NEW COMPONENT
                     │    └── LinearGradient (Card)
                     │         ├── Header (Icon + Title)
                     │         ├── Main Stats Row
                     │         │    ├── Points Box
                     │         │    └── Badge Box (Gradient)
                     │         ├── Events Row
                     │         │    ├── Participated Stat
                     │         │    ├── Organized Stat
                     │         │    └── Total Stat
                     │         └── Progress Section
                     │              ├── Progress Header
                     │              └── Progress Bar
                     │
                     ├── Your Impact Section
                     ├── Recent Achievements
                     └── Menu Sections
```

---

## 🔐 Authentication Flow

```
User logs in
    ↓
Backend generates JWT token
    ↓
Token stored in AsyncStorage
    key: 'token'
    value: 'eyJhbGc...'
    ↓
User data stored in AsyncStorage
    key: 'user'
    value: { id: 'abc123', ... }
    ↓
Profile tab opened
    ↓
fetchVolunteerStats() retrieves:
  - token from AsyncStorage
  - user.id from AsyncStorage
    ↓
API request includes:
  Authorization: Bearer {token}
    ↓
Backend validates token
    ↓
If valid: Return stats
If invalid: Return 401 error
    ↓
Mobile app handles response
```

---

## 📡 API Request/Response Flow

```
Mobile App                     Backend Server
    │                               │
    │  GET /api/users/123/stats    │
    │  Authorization: Bearer xxx    │
    ├──────────────────────────────>│
    │                               │
    │                               │ Validate JWT
    │                               │ Query Database
    │                               │ Calculate Badge
    │                               │ Calculate Progress
    │                               │
    │   200 OK                      │
    │   {                           │
    │     totalPoints: 1250,        │
    │     badge: "Gold",            │
    │     ...                       │
    │   }                           │
    │<──────────────────────────────┤
    │                               │
    │ Parse JSON                    │
    │ Update State                  │
    │ Re-render                     │
    │                               │
```

---

## 🎯 Badge Calculation Flow

```
Backend receives stats request
    ↓
Fetch totalPoints from database
    Example: totalPoints = 1250
    ↓
Check points against thresholds:
    
    if totalPoints >= 5000
        → badge = "Diamond"
        → nextBadge = null
        → progress = 100
    
    else if totalPoints >= 2000
        → badge = "Gold"
        → nextBadge = "Diamond"
        → progress = ((points - 2000) / 3000) × 100
    
    else if totalPoints >= 500
        → badge = "Silver"
        → nextBadge = "Gold"
        → progress = ((points - 500) / 1500) × 100
        → Example: ((1250 - 500) / 1500) × 100 = 50%
    
    else
        → badge = "Bronze"
        → nextBadge = "Silver"
        → progress = (points / 500) × 100
    ↓
Return calculated values to frontend
```

---

## 🎨 Rendering Flow

```
StatsCard receives props
    ↓
Check loading prop
    if true → Show loading spinner
    if false → Continue
    ↓
Check stats prop
    if null → Return null (hide component)
    if exists → Continue
    ↓
Extract values:
  - totalPoints: 1250
  - badge: "Gold"
  - eventsParticipated: 45
  - eventsOrganized: 12
  - totalEvents: 57
  - progress: 50
  - nextBadge: "Diamond"
    ↓
Call helper functions:
  - getBadgeIcon("Gold") → "🥇"
  - getBadgeColor("Gold") → ["#ffd700", "#ffed4e"]
    ↓
Format display values:
  - totalPoints: 1250 → "1,250"
  - progress: 50 → "50%"
    ↓
Render JSX with:
  - LinearGradient (card background)
  - Header section
  - Points and badge
  - Events stats
  - Progress bar (width: 50%)
    ↓
Apply styles from StyleSheet
    ↓
Display to user
```

---

## 🔄 Data Refresh Flow

```
User Profile Tab Active
    ↓
User navigates to Events tab
    ↓
Profile unmounts (but state persists)
    ↓
User performs actions in Events tab
  (maybe registers for new event)
    ↓
User navigates back to Profile tab
    ↓
Profile remounts
    ↓
useFocusEffect detects focus
    ↓
Callback triggered:
  fetchUser()
  fetchVolunteerStats()
    ↓
Fresh API call to backend
    ↓
New stats fetched
  (maybe totalEvents increased)
    ↓
State updated with new data
    ↓
Component re-renders
    ↓
User sees updated stats
```

---

## 🐛 Error Handling Flow

```
fetchVolunteerStats() called
    ↓
Try to get token/user from AsyncStorage
    │
    ├─ Token missing?
    │   └─> setLoadingStats(false)
    │       return (exit early)
    │       StatsCard not shown
    │
    └─ Token exists
        ↓
        Make API request
        │
        ├─ Network error?
        │   └─> catch block
        │       console.error()
        │       setLoadingStats(false)
        │       StatsCard not shown
        │
        ├─ Response not ok? (401, 404, 500)
        │   └─> console.log()
        │       setLoadingStats(false)
        │       StatsCard not shown
        │
        └─ Response OK (200)
            └─> Parse JSON
                setVolunteerStats(data)
                setLoadingStats(false)
                StatsCard shown with data
```

---

## ⚡ Performance Flow

```
Profile tab opened
    ↓
Component mounts (< 16ms)
    ↓
useEffect runs
    ↓
fetchUser() + fetchVolunteerStats() called
  (Parallel execution)
    ↓
Loading states set (< 1ms)
    ↓
Re-render with loading UI (< 16ms)
    ↓
API calls in progress (~200-500ms)
    ↓
Responses received
    ↓
State updates (< 1ms)
    ↓
Final re-render with data (< 16ms)
    ↓
Total time to display: ~500-800ms
```

---

## 📊 State Lifecycle

```
Component Lifecycle         State Values
─────────────────────────────────────────────
Mount                       stats: null
                           loading: false
    ↓
useEffect runs             stats: null
                           loading: true
    ↓
API call                   stats: null
                           loading: true
    ↓
Response received          stats: { data }
                           loading: false
    ↓
User navigates away        stats: { data }
(state persists)           loading: false
    ↓
User returns               stats: { data }
useFocusEffect runs        loading: true
    ↓
Fresh API call             stats: { data }
                           loading: true
    ↓
New response               stats: { new data }
                           loading: false
    ↓
Component unmounts         [State destroyed]
```

---

## 🎯 Complete User Journey

```
1. User opens app
2. User logs in
3. JWT token saved to AsyncStorage
4. User navigates to Profile tab
5. Profile component mounts
6. Loading spinner shows in StatsCard area
7. API request sent to backend
8. Backend validates token
9. Backend queries database
10. Backend calculates badge & progress
11. Backend sends response
12. Mobile app receives data
13. State updated
14. Component re-renders
15. User sees their volunteer stats!
```

---

This diagram shows the complete data flow from user action to final display! 🎉

