# 🔍 Direct API Test

## Please Test the API Directly

Since the stats are showing 0 in mobile but not on web, let's test the API endpoint directly.

### Method 1: Use Browser/Postman

1. **Get your user ID and token** from the mobile app console logs
2. **Open your browser** or Postman
3. **Make a GET request**:

```
URL: http://10.21.143.137:3000/api/users/YOUR_USER_ID/stats

Headers:
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

4. **Check the response** - does it show the correct points?

---

### Method 2: Add Test Button (Temporary)

Add this button temporarily to your profile page to test the API:

**In profile.jsx, add this function before the return statement:**

```javascript
const testAPIDirectly = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userData = await AsyncStorage.getItem('user');
    const user = JSON.parse(userData);
    
    console.log('\n========== DIRECT API TEST ==========');
    console.log('User ID:', user.id);
    console.log('Token:', token?.substring(0, 30) + '...');
    
    const url = `${netconfig.API_BASE_URL}/api/users/${user.id}/stats`;
    console.log('Calling URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify([...response.headers]));
    
    const text = await response.text();
    console.log('Raw response text:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Failed to parse as JSON');
    }
    
    console.log('========== TEST END ==========\n');
  } catch (error) {
    console.error('Test failed:', error);
  }
};
```

**Then add this button in the render (after profile header):**

```jsx
{/* TEMPORARY TEST BUTTON - REMOVE AFTER DEBUGGING */}
<TouchableOpacity 
  onPress={testAPIDirectly}
  style={{
    backgroundColor: '#3b82f6',
    padding: 15,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center'
  }}
>
  <Text style={{ color: 'white', fontWeight: 'bold' }}>
    🧪 TEST API DIRECTLY
  </Text>
</TouchableOpacity>
```

**Press the button and check console logs!**

---

### Method 3: Compare API Calls

#### Web App Makes This Call:
```javascript
// Check your web app network tab
GET /api/users/{userId}/stats
Headers:
  Authorization: Bearer xxx
  Cookie: next-auth.session-token=xxx
```

#### Mobile App Makes This Call:
```javascript
GET /api/users/{userId}/stats
Headers:
  Authorization: Bearer xxx
  Content-Type: application/json
```

**Question**: Are they using the same user ID?

---

### Common Issues to Check:

#### 1. Different User IDs?
- Web might be using a different user account
- Check: `user.id` in mobile vs web

#### 2. Different Authentication?
- Web uses NextAuth session cookies
- Mobile uses JWT Bearer tokens
- Backend might handle them differently

#### 3. Different API Endpoints?
- Web might call `/api/users/{userId}/stats`
- Mobile might call something slightly different

#### 4. Backend Logic Issue?
- Backend might check authentication differently
- Backend might filter data based on auth method

---

### Debug Checklist:

#### A. Check Console Logs After Adding More Logging:

Look for these specific logs:
```
✅ Full API response: { ... }
```

**Is the response showing?**
- YES → Continue to B
- NO → API call is failing

#### B. Check if Response Has Data:

```
✅ Stats data extracted: { ... }
```

**Does it show your points?**
- YES → Continue to C
- NO → Backend is returning empty data

#### C. Check Mapped Data:

```
✅ Mapped stats data: { totalPoints: XXX, ... }
```

**Is totalPoints > 0?**
- YES → Continue to D
- NO → Mapping is failing

#### D. Check State Update:

```
🔄 volunteerStats state updated: { ... }
```

**Is it showing the correct data?**
- YES → Component rendering issue
- NO → State not updating

#### E. Check Component Render:

```
📊 StatsCard render - loading: false stats: { ... }
```

**What does stats show?**
- Correct data → UI rendering issue
- Wrong data → State passing issue

---

### Likely Culprits:

#### 🎯 Most Likely: User ID Mismatch
Web and mobile might be using different users.

**Test**: 
1. Check user ID in web (browser console): `localStorage.getItem('user')`
2. Check user ID in mobile (app console): Look for `👤 User ID:` log
3. **Are they the same?**

#### 🎯 Second Likely: Authentication Difference
Backend might return different data for JWT vs NextAuth.

**Test**:
1. Call API from Postman with mobile's JWT token
2. Does it return data?
3. Compare with web's response

#### 🎯 Third Likely: API URL Different
Mobile might be calling wrong endpoint.

**Test**:
1. Check mobile logs for: `📡 API URL:`
2. Check web network tab
3. Are they identical?

---

### What to Share:

Please share these console logs:
1. `👤 User ID:` - What user ID is being used?
2. `📡 API URL:` - What URL is being called?
3. `✅ Full API response:` - What did the backend return?
4. `🔄 volunteerStats state updated:` - What is the final state?

This will tell us exactly where the issue is! 🎯

