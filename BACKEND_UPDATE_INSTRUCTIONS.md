# 🔧 Backend Update - Copy & Paste Ready

## 📋 File to Update

**Location:** `ClubSync-Web/app/api/clubs/route.tsx`

---

## ✂️ Copy This Complete Updated File

Replace your entire `route.tsx` file with this:

````typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

// GET /api/clubs - Get all clubs or filter by query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const createdById = searchParams.get("createdById");
    const userId = searchParams.get("userId"); // ✅ NEW: Filter by user's clubs

    let whereClause: any = {
      isDeleted: false, // Don't return deleted clubs
    };

    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    if (createdById) {
      whereClause.createdById = createdById;
    }

    // ✅ NEW: Filter clubs where user is a member
    if (userId) {
      whereClause.members = {
        some: {
          userId: userId,
          membershipStatus: "active",
        },
      };
    }

    const clubs = await prisma.club.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        motto: true,
        founded: true,
        headquarters: true,
        coverImage: true,
        profileImage: true,
        about: true,
        mission: true,
        values: true,
        avenues: true,
        email: true,
        phone: true,
        website: true,
        googleMapURL: true,
        instagram: true,
        facebook: true,
        linkedIn: true,
        twitter: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        // ✅ NEW: Include member info when filtering by userId
        ...(userId && {
          members: {
            where: { userId: userId },
            select: {
              role: true,
              joinedAt: true,
            },
          },
          _count: {
            select: { members: true },
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 },
    );
  }
}

// POST /api/clubs - Create new club
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      motto,
      founded,
      headquarters,
      coverImage,
      profileImage,
      constitution,
      about,
      mission,
      values,
      avenues,
      email,
      phone,
      website,
      googleMapURL,
      instagram,
      facebook,
      linkedIn,
      twitter,
      createdById,
    } = body;

    // Check if club name already exists
    const existingClub = await prisma.club.findFirst({
      where: {
        name,
        isDeleted: false,
      },
    });

    if (existingClub) {
      return NextResponse.json(
        { error: "Club with this name already exists" },
        { status: 409 },
      );
    }

    const club = await prisma.club.create({
      data: {
        name,
        motto: motto || null,
        founded: founded || null,
        headquarters: headquarters || null,
        coverImage: coverImage || null,
        profileImage: profileImage || null,
        constitution: constitution || null,
        about: about || null,
        mission: mission || null,
        values: values || [],
        avenues: avenues || [],
        email: email || null,
        phone: phone || null,
        website: website || null,
        googleMapURL: googleMapURL || null,
        instagram: instagram || null,
        facebook: facebook || null,
        linkedIn: linkedIn || null,
        twitter: twitter || null,
        createdById,
      },
      select: {
        id: true,
        name: true,
        motto: true,
        founded: true,
        headquarters: true,
        coverImage: true,
        profileImage: true,
        about: true,
        mission: true,
        values: true,
        avenues: true,
        email: true,
        phone: true,
        website: true,
        googleMapURL: true,
        instagram: true,
        facebook: true,
        linkedIn: true,
        twitter: true,
        isActive: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(club, { status: 201 });
  } catch (error) {
    console.error("Error creating club:", error);
    return NextResponse.json(
      { error: "Failed to create club" },
      { status: 500 },
    );
  }
}
````

---

## 🎯 What Changed

### **Lines Added/Modified:**

**Line ~6:**
```typescript
const userId = searchParams.get("userId"); // ✅ NEW
```

**Lines ~18-25:**
```typescript
if (userId) {
  whereClause.members = {
    some: {
      userId: userId,
      membershipStatus: "active",
    },
  };
}
```

**Lines ~55-66:**
```typescript
...(userId && {
  members: {
    where: { userId: userId },
    select: {
      role: true,
      joinedAt: true,
    },
  },
  _count: {
    select: { members: true },
  },
}),
```

---

## 🚀 After Updating

1. **Save the file**
2. **Restart your web server:**
   ```bash
   cd ClubSync-Web
   npm run dev
   ```
3. **Test in browser:**
   ```
   http://localhost:3000/api/clubs?userId=cmcybb1dt0000v9hciwtyycn9
   ```
4. **Test in mobile app:**
   - Open app
   - Click Clubs tab
   - Should see only your clubs!

---

## ✅ API Usage Examples

### **Get ALL clubs:**
```
GET /api/clubs
```

### **Get user's clubs (NEW):**
```
GET /api/clubs?userId=cmcybb1dt0000v9hciwtyycn9
```

### **Get active clubs only:**
```
GET /api/clubs?isActive=true
```

### **Get user's active clubs:**
```
GET /api/clubs?userId=cmcybb1dt0000v9hciwtyycn9&isActive=true
```

### **Get clubs created by user:**
```
GET /api/clubs?createdById=cmcybb1dt0000v9hciwtyycn9
```

---

## 🎉 Done!

Once you update this file, the mobile app will work perfectly! 🚀
