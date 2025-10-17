# 🚀 Backend API Quick Reference - User Clubs Endpoint

## Endpoint Details

**URL**: `GET /api/clubs/user/:userId`  
**Method**: `GET`  
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`

---

## Request Example

```http
GET /api/clubs/user/clxyz123abc HTTP/1.1
Host: yourdomain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## Response Format

```json
{
  "clubs": [
    {
      "id": "club-uuid-1",
      "name": "Eco Warriors Club",
      "about": "Promoting sustainability and environmental awareness",
      "description": "Alternative description field",
      "profileImage": "https://example.com/images/eco-warriors.jpg",
      "coverImage": "https://example.com/images/eco-cover.jpg",
      "category": "Environment",
      "isActive": true,
      "memberCount": 45,
      "role": "member",
      "joinedAt": "2024-09-15T10:30:00.000Z",
      "nextEvent": "Tree Planting Drive - July 28",
      "achievements": ["Green Campus Award 2024", "Best Initiative"]
    }
  ]
}
```

---

## Field Mapping (Prisma Schema → API Response)

| Prisma Field | API Response Field | Type | Required | Notes |
|--------------|-------------------|------|----------|-------|
| `club.id` | `id` | String | ✅ Yes | Primary key |
| `club.name` | `name` | String | ✅ Yes | Club name |
| `club.about` | `about` | String | ❌ No | Main description |
| `club.mission` | `description` | String | ❌ No | Alternative desc |
| `club.profileImage` | `profileImage` | String (URL) | ❌ No | Profile picture |
| `club.coverImage` | `coverImage` | String (URL) | ❌ No | Cover image |
| N/A | `category` | String | ❌ No | Hardcode or derive |
| `club.isActive` | `isActive` | Boolean | ✅ Yes | Club status |
| `_count.members` | `memberCount` | Number | ✅ Yes | Total members |
| `members[0].role` | `role` | String | ✅ Yes | User's role |
| `members[0].joinedAt` | `joinedAt` | DateTime | ✅ Yes | Join date |
| TBD | `nextEvent` | String | ❌ No | Upcoming event |
| TBD | `achievements` | String[] | ❌ No | Awards list |

---

## Prisma Query Template

```typescript
const userClubs = await prisma.club.findMany({
  where: {
    isActive: true,
    isDeleted: false,
    members: {
      some: {
        userId: userId,
        membershipStatus: 'active'
      }
    }
  },
  include: {
    members: {
      where: { userId: userId },
      select: { 
        role: true,
        joinedAt: true
      }
    },
    _count: {
      select: { members: true }
    }
  }
});
```

---

## Role Enum Values (from schema.prisma)

```typescript
enum MembershipRole {
  member
  president
  secretary
  treasurer
  webmaster
}
```

**Send as lowercase string**: `"member"`, `"president"`, etc.

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch clubs"
}
```

---

## Security Checklist

- ✅ Verify JWT token in Authorization header
- ✅ Decode token to get authenticated user
- ✅ Validate userId matches token (optional but recommended)
- ✅ Only return clubs where user is active member
- ✅ Filter out deleted/inactive clubs
- ✅ Sanitize output (no sensitive data)

---

## Test Data Example

```sql
-- User has 3 club memberships
SELECT 
  c.id, 
  c.name, 
  cm.role, 
  cm.membership_status 
FROM clubs c
JOIN club_members cm ON c.id = cm.club_id
WHERE cm.user_id = 'user-123'
  AND cm.membership_status = 'active'
  AND c.is_active = true
  AND c.is_deleted = false;
```

---

## Implementation Priority

1. **Phase 1** (MVP): Basic club data
   - ✅ id, name, about, isActive
   - ✅ memberCount, role, joinedAt

2. **Phase 2** (Nice to have): Images
   - ✅ profileImage, coverImage

3. **Phase 3** (Future): Enhanced data
   - ⏳ nextEvent (query from events table)
   - ⏳ achievements (TBD structure)
   - ⏳ category mapping

---

## Deployment Notes

- Endpoint must be accessible from mobile app
- Update CORS if needed
- Test with ngrok/local network IP during development
- Update `netconfig.js` in mobile app with correct URL

---

**Ready to implement? Check `CLUBS_API_IMPLEMENTATION.md` for full details!**
