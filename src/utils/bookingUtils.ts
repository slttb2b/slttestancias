import { Room, Package, Booking } from '../types';

/**
 * Normalizes any booking status string to a standard lowercase hyphenated format.
 * Handles variations such as:
 * - 'pending', 'Pending' -> 'pending'
 * - 'confirmed', 'Confirmed' -> 'confirmed'
 * - 'checked-in', 'checked_in', 'checkedIn', 'Checked In' -> 'checked-in'
 * - 'cancelled', 'canceled', 'Cancelled', 'Canceled' -> 'cancelled'
 * - 'rejected', 'declined', 'Declined', 'Rejected' -> 'rejected' / 'declined'
 * - 'checked-out', 'checked_out', 'checkedOut', 'Checked Out', 'completed' -> 'checked-out' / 'completed'
 */
export const normalizeBookingStatus = (status?: string): string => {
  if (!status) return '';
  const cleaned = String(status).trim().toLowerCase();
  
  // Handle camelCase like checkedIn / checkedOut
  const unCamelled = cleaned.replace(/([a-z])([A-Z])/g, '$1-$2');
  
  // Replace underscores and spaces with hyphens
  const formatted = unCamelled.replace(/[\s_]+/g, '-');

  if (formatted === 'canceled') return 'cancelled';
  if (formatted === 'checkedin') return 'checked-in';
  if (formatted === 'checkedout') return 'checked-out';

  return formatted;
};

/**
 * Determines whether a booking status is an active blocking status.
 *
 * EXACT RULES:
 * 1. PENDING ('pending') -> NEVER BLOCKS availability (returns false)
 * 2. CONFIRMED ('confirmed') -> BLOCKS availability (returns true)
 * 3. CHECKED-IN ('checked-in') -> BLOCKS availability (returns true)
 * 4. CANCELLED ('cancelled', 'canceled') -> NEVER BLOCKS availability (returns false)
 * 5. REJECTED / DECLINED ('rejected', 'declined') -> NEVER BLOCKS availability (returns false)
 * 6. COMPLETED / CHECKED-OUT ('checked-out', 'completed') -> NEVER BLOCKS availability (returns false)
 */
export const isBlockingBookingStatus = (status?: string): boolean => {
  const normalized = normalizeBookingStatus(status);
  const blockingStatuses = ['confirmed', 'checked-in'];
  return blockingStatuses.includes(normalized);
};

/**
 * Checks whether two date ranges overlap.
 * startA/endA = Requested booking dates
 * startB/endB = Existing confirmed/checked-in booking dates
 */
export const isDateRangeOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean => {
  if (!startA || !endA || !startB || !endB) return false;

  // Single-day bookings (e.g., day cottages or day-tour packages where checkIn === checkOut)
  if (startA === endA || startB === endB) {
    return startA <= endB && endA >= startB;
  }

  // Standard overnight stays: [startA, endA) overlaps with [startB, endB)
  return startA < endB && endA > startB;
};

/**
 * Checks if an accommodation (Room, Cottage, Filipino Kubo) is occupied for a given date range.
 * Occupied means:
 * 1. Room is marked isComingSoon === true
 * 2. Room is marked isAvailable === false (blocked by admin)
 * 3. Room has blockedDates matching the range
 * 4. There is an active CONFIRMED or CHECKED-IN booking overlapping the dates.
 *    (Pending, Cancelled, Rejected, Declined, Checked-out bookings NEVER block).
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

  // 3. Blocked dates on room
  if (room.blockedDates && room.blockedDates.length > 0) {
    const hasBlockedDate = room.blockedDates.some((bd) => bd >= checkInDate && bd <= checkOutDate);
    if (hasBlockedDate) {
      return { isOccupied: true, reason: 'Unit is reserved on selected dates' };
    }
  }

  // 4. Check existing active blocking bookings (Confirmed and Checked In ONLY)
  const activeBlockingBooking = bookings.find((b) => {
    if (b.roomId !== roomId) return false;
    if (!isBlockingBookingStatus(b.status)) return false;
    return isDateRangeOverlap(checkInDate, checkOutDate, b.checkInDate, b.checkOutDate);
  });

  if (activeBlockingBooking) {
    return {
      isOccupied: true,
      reason: `Occupied by reference ${activeBlockingBooking.referenceNumber} (${activeBlockingBooking.status})`,
      bookingRef: activeBlockingBooking.referenceNumber,
    };
  }

  return { isOccupied: false };
};

/**
 * Checks if a resort package is occupied/blocked for a given date range by a confirmed/checked-in booking.
 */
export const checkPackageOccupied = (
  packageId: string,
  checkInDate: string,
  checkOutDate: string,
  packages: Package[],
  bookings: Booking[]
): { isOccupied: boolean; reason?: string; bookingRef?: string } => {
  if (!packageId) return { isOccupied: false };

  const pkg = packages.find((p) => p.id === packageId);
  if (!pkg) return { isOccupied: false };

  if (!checkInDate || !checkOutDate) return { isOccupied: false };

  // Check existing confirmed/checked-in package bookings
  const activeBlockingBooking = bookings.find((b) => {
    if (b.roomId !== packageId) return false;
    if (!isBlockingBookingStatus(b.status)) return false;
    return isDateRangeOverlap(checkInDate, checkOutDate, b.checkInDate, b.checkOutDate);
  });

  if (activeBlockingBooking) {
    return {
      isOccupied: true,
      reason: `Package reserved by reference ${activeBlockingBooking.referenceNumber} (${activeBlockingBooking.status})`,
      bookingRef: activeBlockingBooking.referenceNumber,
    };
  }

  return { isOccupied: false };
};

export const OCCUPIED_UNIT_MESSAGE = "Apologies, the unit is currently in occupied. Please select another";
export const OCCUPIED_PACKAGE_MESSAGE = "Apologies, this package is currently reserved/occupied for the selected dates. Please select another";
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

/**
 * Pre-submission validator to prevent double-bookings or race conditions.
 * Validates that no Confirmed or Checked In bookings conflict with the requested dates.
 */
export const validateBookingAvailability = (
  category: 'room' | 'package',
  itemId: string,
  checkInDate: string,
  checkOutDate: string,
  rooms: Room[],
  packages: Package[],
  bookings: Booking[],
  attachedRoomId?: string
): { isValid: boolean; errorMessage?: string; reason?: string } => {
  // 1. Validate dates
  const dateCheck = validateBookingDates(checkInDate, checkOutDate);
  if (!dateCheck.isValid) {
    return { isValid: false, errorMessage: dateCheck.errorMessage };
  }

  // 2. Validate unit availability
  if (category === 'package') {
    const pkgCheck = checkPackageOccupied(itemId, checkInDate, checkOutDate, packages, bookings);
    if (pkgCheck.isOccupied) {
      return {
        isValid: false,
        errorMessage: OCCUPIED_PACKAGE_MESSAGE,
        reason: pkgCheck.reason,
      };
    }

    if (attachedRoomId) {
      const roomCheck = checkRoomOccupied(attachedRoomId, checkInDate, checkOutDate, rooms, bookings);
      if (roomCheck.isOccupied) {
        return {
          isValid: false,
          errorMessage: roomCheck.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE,
          reason: roomCheck.reason,
        };
      }
    }
  } else {
    const roomCheck = checkRoomOccupied(itemId, checkInDate, checkOutDate, rooms, bookings);
    if (roomCheck.isOccupied) {
      return {
        isValid: false,
        errorMessage: roomCheck.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE,
        reason: roomCheck.reason,
      };
    }
  }

  return { isValid: true };
};

