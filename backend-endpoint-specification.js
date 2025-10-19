// Backend API Endpoint Specification for /api/users/check-organizer
// This file demonstrates how to implement the backend endpoint that checks if a user is an event organizer

/**
 * Example implementation using Prisma:
 * 
 * This endpoint checks if the logged-in user is registered as an organizer for any events
 * by querying the event_registration table for entries with role = "organizer"
 */

// Example route for Express.js
/*
app.get('/api/users/check-organizer', authenticateToken, async (req, res) => {
  try {
    // Get user ID from the JWT token (req.user.id)
    const userId = req.user.id;
    
    // Query the database to check if user is an organizer for any events
    const organizerEvents = await prisma.event_registration.findMany({
      where: {
        userId: userId,
        role: "organizer"
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            // Add other event fields you want to return
          }
        }
      }
    });
    
    // If user is an organizer for at least one event
    const isOrganizer = organizerEvents.length > 0;
    
    // Return the result to the client
    res.json({
      isOrganizer,
      events: organizerEvents.map(reg => reg.event)
    });
  } catch (error) {
    console.error('Error checking organizer status:', error);
    res.status(500).json({ message: 'Failed to check organizer status', error: error.message });
  }
});
*/

/**
 * Example response for a user who is an organizer:
 * 
 * Status: 200 OK
 * {
 *   "isOrganizer": true,
 *   "events": [
 *     {
 *       "id": "1",
 *       "title": "Beach Cleanup Drive",
 *       "startDateTime": "2025-07-15T08:00:00.000Z"
 *     },
 *     {
 *       "id": "3",
 *       "title": "Tree Planting Initiative",
 *       "startDateTime": "2025-07-22T07:30:00.000Z"
 *     }
 *   ]
 * }
 * 
 * Example response for a user who is not an organizer:
 * 
 * Status: 200 OK
 * {
 *   "isOrganizer": false,
 *   "events": []
 * }
 */
