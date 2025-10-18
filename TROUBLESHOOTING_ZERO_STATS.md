# 🐛 Troubleshooting: Stats Show 0 But Web Shows Real Data

## Current Situation
- ✅ Web app shows correct stats for the user
- ❌ Mobile app shows all 0s for the same user
- ✅ Backend API exists and works (proven by web)
- ❓ Mobile app is either:
  - Not receiving the data
  - Not parsing it correctly
  - Not updating state
  - Not rendering it

## Enhanced Debugging Added

### New Console Logs Added:

1. **Full API Response** (with JSON.stringify)
   - Shows EXACTLY what the backend returns
   - Will reveal if data is present or missing

2. **Badge Object Details**
   - Shows badge structure
   - Shows badge type (object vs string)

3. **State Update Tracking**
   - useEffect logs when volunteerStats changes
   - Will show if state is actually updating

4. **Mapped Data Logging**
   - Shows the transformed data before setting state
   - Will reveal if mapping is correct

## What to Check

### Step 1: Check Console Logs

After reloading the app, you should see this sequence:

```
🔍 Fetching volunteer stats...
Token exists: true
User data exists: true
👤 User ID: abc123...
📡 API URL: http://10.21.143.137:3000/api/users/abc123/stats
📥 Response status: 200
✅ Full API response: {
  "success": true,
  "data": {
    "totalPoints": XXXX,  ← Should NOT be 0
    ...
  }
}
✅ Stats data extracted: { ... }
🏅 Badge object: { name: "Gold", ... }
✅ Mapped stats data: { ... }
📊 Setting volunteerStats to: { ... }
🔄 volunteerStats state updated: { ... }
📊 StatsCard render - loading: false stats: { ... }
```

### Step 2: Identify Where It Breaks

**Scenario A: Response Status Not 200**
```
📥 Response status: 404
```
→ Backend endpoint doesn't exist or wrong path

**Scenario B: Response Has No Data**
```
✅ Full API response: {
  "success": true,
  "data": {
    "totalPoints": 0,  ← Backend returning 0
    ...
  }
}
```
→ Backend is returning 0 (different user? empty database?)

**Scenario C: Response Has success: false**
```
⚠️ API returned success=false or no data
⚠️ Result object: { ... }
```
→ Backend returned error

**Scenario D: State Not Updating**
```
✅ Mapped stats data: { "totalPoints": 1250, ... }
📊 Setting volunteerStats to: { "totalPoints": 1250, ... }
🔄 volunteerStats state updated: { "totalPoints": 0, ... }
```
→ State update issue (React problem)

**Scenario E: Component Not Receiving**
```
🔄 volunteerStats state updated: { "totalPoints": 1250, ... }
📊 StatsCard render - loading: false stats: { "totalPoints": 0, ... }
```
→ Props not passing correctly

## Possible Root Causes

### 1. Different User Accounts
**Web and mobile might be logged in as different users!**

Test:
- Check user ID in web browser console: `localStorage.getItem('user')`
- Check user ID in mobile console: Look for `👤 User ID:`
- **Are they identical?**

### 2. Backend Authorization Issue
**Backend might treat JWT tokens differently than NextAuth sessions**

The backend might be:
- Returning empty data for JWT auth
- Requiring different headers
- Filtering data based on auth method

### 3. Database Has Multiple Records
**User might have multiple stats records**

Backend might be:
- Returning wrong record
- Not finding the record for mobile user
- Using different user ID format

### 4. API URL Different
**Mobile might be calling slightly different endpoint**

Check if these match:
- Web: `/api/users/{userId}/stats`
- Mobile: Look for `📡 API URL:` in logs

## Quick Diagnostic Test

### Test 1: Copy User ID from Mobile to Web

1. Get user ID from mobile console: `👤 User ID: xxx`
2. Open web browser console
3. Run: `fetch('/api/users/xxx/stats').then(r => r.json()).then(console.log)`
4. Does it show data?

### Test 2: Check Same User in Database

```sql
-- In your database
SELECT * FROM "User" WHERE id = 'xxx';
SELECT * FROM "VolunteerStats" WHERE "userId" = 'xxx';
```

Does the user have stats in the database?

### Test 3: Test JWT Token

1. Copy JWT token from mobile console
2. Use Postman/Insomnia to call:
   ```
   GET http://10.21.143.137:3000/api/users/xxx/stats
   Headers:
     Authorization: Bearer {paste-token-here}
   ```
3. What does it return?

## Expected vs Actual

### Expected Flow:
```
Mobile calls API
→ Backend authenticates JWT
→ Backend finds user stats
→ Backend returns { success: true, data: {...} }
→ Mobile extracts data.totalPoints
→ Shows 1250 points
```

### Actual Flow (Current):
```
Mobile calls API
→ ???
→ Shows 0 points
```

## Next Steps

1. **Reload app and copy ALL console logs**
2. **Share the logs starting from** `🔍 Fetching volunteer stats...`
3. **I'll analyze them and tell you exactly what's wrong**

The detailed logs will reveal:
- What the API actually returns
- If the data is in the response
- Where the data gets lost
- Why 0 is being shown

