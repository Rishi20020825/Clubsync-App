# 🧪 Quick Test Script

## Copy-Paste This Into Your Profile.jsx Temporarily

Add this test function after `fetchVolunteerStats()`:

```javascript
// TEST FUNCTION - Remove after debugging
const testVolunteerStatsAPI = async () => {
  console.log('\n========== API TEST START ==========');
  
  try {
    const token = await AsyncStorage.getItem('token');
    const userData = await AsyncStorage.getItem('user');
    
    if (!token) {
      console.log('❌ NO TOKEN FOUND');
      return;
    }
    
    if (!userData) {
      console.log('❌ NO USER DATA FOUND');
      return;
    }
    
    const user = JSON.parse(userData);
    console.log('✅ User ID:', user.id);
    console.log('✅ Token:', token.substring(0, 20) + '...');
    
    // Test 1: Check if backend is reachable
    console.log('\n--- Test 1: Backend Reachability ---');
    const healthUrl = `${netconfig.API_BASE_URL}/api/events`;
    console.log('Testing URL:', healthUrl);
    
    try {
      const healthResponse = await fetch(healthUrl);
      console.log('✅ Backend is reachable! Status:', healthResponse.status);
    } catch (error) {
      console.log('❌ Backend not reachable:', error.message);
      return;
    }
    
    // Test 2: Check stats endpoint
    console.log('\n--- Test 2: Stats Endpoint ---');
    const statsUrl = `${netconfig.API_BASE_URL}/api/users/${user.id}/stats`;
    console.log('Stats URL:', statsUrl);
    
    const response = await fetch(statsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify([...response.headers.entries()]));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Data received:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ ERROR Response:', errorText);
    }
    
  } catch (error) {
    console.log('❌ TEST FAILED:', error.message);
    console.log('Stack:', error.stack);
  }
  
  console.log('========== API TEST END ==========\n');
};
```

## How to Use

1. **Add the test function** to your profile.jsx (after fetchVolunteerStats)

2. **Call it in useEffect**:
```javascript
useEffect(() => {
  fetchUser();
  testVolunteerStatsAPI(); // ADD THIS LINE
  fetchVolunteerStats();
}, []);
```

3. **Open the app** and check console logs

4. **Read the output** - it will tell you exactly what's wrong

---

## Interpreting Results

### ✅ Perfect (Everything Works):
```
========== API TEST START ==========
✅ User ID: abc123
✅ Token: eyJhbGc...

--- Test 1: Backend Reachability ---
Testing URL: http://10.21.143.137:3000/api/events
✅ Backend is reachable! Status: 200

--- Test 2: Stats Endpoint ---
Stats URL: http://10.21.143.137:3000/api/users/abc123/stats
Response status: 200
✅ SUCCESS! Data received:
{
  "totalPoints": 1250,
  "badge": "Gold",
  ...
}
========== API TEST END ==========
```
**Solution**: API works! The issue might be with state management. Check if volunteerStats is being set correctly.

---

### ❌ Backend Not Reachable:
```
❌ Backend not reachable: Network request failed
```
**Solutions**:
1. Start your backend server
2. Check if API_BASE_URL is correct
3. For emulator, use `http://10.0.2.2:3000`
4. For physical device, use your computer's IP

---

### ❌ Endpoint Not Found (404):
```
✅ Backend is reachable! Status: 200
Response status: 404
❌ ERROR Response: Cannot GET /api/users/abc123/stats
```
**Solution**: Backend doesn't have this endpoint. You need to create:
`ClubSync-Web/app/api/users/[id]/stats/route.ts`

---

### ❌ Unauthorized (401):
```
Response status: 401
❌ ERROR Response: Unauthorized
```
**Solutions**:
1. Token might be expired - try logging out and back in
2. Backend might not be validating tokens correctly
3. Check if backend expects different auth format

---

### ❌ No Token or User Data:
```
❌ NO TOKEN FOUND
```
**Solution**: User not logged in. Go to login screen and log in again.

---

## After Debugging

Once you find the issue, **REMOVE** the test function and the test call from useEffect!

```javascript
// Remove this line:
testVolunteerStatsAPI();
```

