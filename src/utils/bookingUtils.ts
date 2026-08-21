import { Room, Booking } from '../types';

/**
 * Checks if a room/cottage is occupied for a given date range.
 * Occupied means:
 * 1. Room is marked isAvailable === false (blocked by admin)
 * 2. Room is marked isComingSoon === true
 * 3. Room has blockedDates matching the range
 * 4. There is an active confirmed booking ('Confirmed' or 'Checked In') overlapping the dates.
 * Note: 'Pending' bookings remain open and bookable for other guests until confirmed by management.
 */
export const checkRoomOccupied = (
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  rooms: Room[],
  bookings: Booking[]
): { isOccupied: boolean; isComingSoon?: boolean; reason?: string; bookingRef?: string } => {
  if (!roomId) return { isOccupied: false };

  const room = rooms.find((r) => r.id === roomId);
  if (!room) return { isOccupied: false };

  // 1. Coming Soon status -> Currently Unavailable
  if (room.isComingSoon) {
    return {
      isOccupied: true,
      isComingSoon: true,
      reason: COMING_SOON_MESSAGE,
    };
  }

  // 2. Blocked by admin
  if (room.isAvailable === false) {
    return { isOccupied: true, reason: 'Unit is currently blocked by administration' };
  }

  if (!checkInDate || !checkOutDate) return { isOccupied: false };

  // Helper date range overlap
  const isOverlap = (startA: string, endA: string, startB: string, endB: string) => {
    if (startA === endA || startB === endB) {
      return startA <= endB && endA >= startB;
    }
    return startA < endB && endA > startB;
  };

  // 3. Blocked dates on room
  if (room.blockedDates && room.blockedDates.length > 0) {
    const hasBlockedDate = room.blockedDates.some((bd) => bd >= checkInDate && bd <= checkOutDate);
    if (hasBlockedDate) {
      return { isOccupied: true, reason: 'Unit is reserved on selected dates' };
    }
  }

  // 4. Check existing active bookings:
  // Only 'Confirmed' and 'Checked In' bookings mark the accommodation as occupied.
  // 'Pending', 'Cancelled', and 'Checked Out' bookings do NOT block the unit, allowing other guests to book it.
  const activeBooking = bookings.find((b) => {
    const isThisRoomBooked = b.roomId === roomId || b.allocatedRooms?.some((ar) => ar.id === roomId);
    if (!isThisRoomBooked) return false;
    if (b.status !== 'Confirmed' && b.status !== 'Checked In') return false;
    return isOverlap(checkInDate, checkOutDate, b.checkInDate, b.checkOutDate);
  });

  if (activeBooking) {
    return {
      isOccupied: true,
      reason: `Occupied by reference ${activeBooking.referenceNumber} (${activeBooking.status})`,
      bookingRef: activeBooking.referenceNumber,
    };
  }

  return { isOccupied: false };
};

export const OCCUPIED_UNIT_MESSAGE = "Apologies, the unit is currently in occupied. Please select another";
export const COMING_SOON_MESSAGE = "Apologies, this unit is currently unavailable (Coming Soon). Please select another accommodation.";

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export const getTodayFormatted = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns tomorrow's date (or day after given checkIn date) as YYYY-MM-DD
 */
export const getTomorrowFormatted = (fromDateStr?: string): string => {
  let d = new Date();
  if (fromDateStr) {
    const parsed = new Date(fromDateStr);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  }
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Validates check-in and check-out dates against past schedule and valid range
 */
export const validateBookingDates = (
  checkInDate: string,
  checkOutDate: string
): { isValid: boolean; errorMessage?: string } => {
  if (!checkInDate || !checkOutDate) {
    return { isValid: false, errorMessage: "Please select both Check-In and Check-Out dates." };
  }

  const today = getTodayFormatted();

  if (checkInDate < today) {
    return {
      isValid: false,
      errorMessage: `Invalid Check-In Date (${checkInDate}): Check-in cannot be in the past or behind schedule. Please select today (${today}) or a future date.`,
    };
  }

  if (checkOutDate <= checkInDate) {
    return {
      isValid: false,
      errorMessage: `Invalid Check-Out Date (${checkOutDate}): Check-out date must be strictly after your check-in date (${checkInDate}). Minimum stay duration is 1 day/night.`,
    };
  }

  return { isValid: true };
};
