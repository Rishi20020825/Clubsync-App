// utils/eventUtils.js

/**
 * Normalizes event data from API response to a consistent format
 * @param {Object} apiEvent - Raw event data from API
 * @returns {Object} - Normalized event data
 */
export const normalizeEventData = (apiEvent) => {
  if (!apiEvent) return null;
  
  return {
    id: apiEvent.id,
    title: apiEvent.title || 'Untitled Event',
    description: apiEvent.description || 'No description available',
    fullDescription: apiEvent.fullDescription || apiEvent.description || 'No description available',
    date: formatDateString(apiEvent.date || apiEvent.startDateTime || apiEvent.startDate),
    time: formatTimeString(apiEvent.time || apiEvent.startDateTime || apiEvent.startDate),
    duration: apiEvent.duration || getDurationString(apiEvent.startDateTime, apiEvent.endDateTime),
    location: apiEvent.location || apiEvent.venue || 'TBD',
    meetingPoint: apiEvent.meetingPoint || '',
    maxVolunteers: apiEvent.maxVolunteers || apiEvent.maxParticipants || apiEvent.maxCapacity || 50,
    currentVolunteers: apiEvent.currentVolunteers || apiEvent.registeredCount || 0,
    category: apiEvent.category || 'General',
    organizer: getOrganizerName(apiEvent),
    organizerContact: apiEvent.organizerContact || apiEvent.contactEmail || getOrganizerEmail(apiEvent),
    image: getEventImage(apiEvent),
    galleryImages: apiEvent.galleryImages || [],
    requirements: apiEvent.requirements || [],
    whatToBring: apiEvent.whatToBring || [],
    benefits: apiEvent.benefits || [],
    status: apiEvent.status || 'active'
  };
};

/**
 * Returns a default image based on event category
 * @param {string} category - Event category
 * @returns {string} - URL to image
 */
export const getDefaultImageForCategory = (category) => {
  const defaultImages = {
    'Environment': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
    'Community Service': 'https://images.unsplash.com/photo-1593113598332-cd288d649433',
    'Education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    'Animal Welfare': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
    'Health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528',
    'Culture': 'https://images.unsplash.com/photo-1577805947697-89e18249d767',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    'Technology': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    'Arts': 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5',
    'Youth': 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70'
  };
  
  return defaultImages[category] || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205';
};

/**
 * Gets the event image or a default one based on category
 * @param {Object} event - Event data
 * @returns {string} - Image URL
 */
export const getEventImage = (event) => {
  // Try different possible image properties
  const imageUrl = event.image || event.coverImage || event.imageUrl || event.bannerImage;
  
  // If no image found, return default based on category
  if (!imageUrl) {
    return getDefaultImageForCategory(event.category);
  }
  
  return imageUrl;
};

/**
 * Format date string to user-friendly format
 * @param {string} dateString - Date string or ISO string
 * @returns {string} - Formatted date
 */
const formatDateString = (dateString) => {
  if (!dateString) return 'TBD';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

/**
 * Format time string to user-friendly format
 * @param {string} timeString - Time string or ISO string
 * @returns {string} - Formatted time
 */
const formatTimeString = (timeString) => {
  if (!timeString) return 'TBD';
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return timeString;
  }
};

/**
 * Calculate duration between two timestamps
 * @param {string} startTime - Start time ISO string
 * @param {string} endTime - End time ISO string
 * @returns {string} - Duration string
 */
const getDurationString = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours} hr ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} hours`;
    } else {
      return `${minutes} minutes`;
    }
  } catch (e) {
    return '';
  }
};

/**
 * Get organizer name from different possible data structures
 * @param {Object} event - Event data
 * @returns {string} - Organizer name
 */
const getOrganizerName = (event) => {
  if (event.organizer) {
    return typeof event.organizer === 'string' ? event.organizer : event.organizer.name || 'Event Organizer';
  }
  
  if (event.club) {
    return typeof event.club === 'string' ? event.club : event.club.name || 'Event Organizer';
  }
  
  return event.organizerName || 'Event Organizer';
};

/**
 * Get organizer email from different possible data structures
 * @param {Object} event - Event data
 * @returns {string} - Organizer email
 */
const getOrganizerEmail = (event) => {
  if (event.organizer && event.organizer.email) {
    return event.organizer.email;
  }
  
  if (event.club && event.club.email) {
    return event.club.email;
  }
  
  return event.organizerEmail || event.contactEmail || 'contact@example.com';
};
