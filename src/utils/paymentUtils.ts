import { Booking, BookingStatus, PaymentRecord } from '../types';

export interface BookingFinancials {
  totalAmount: number;
  totalCost: number;
  depositAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentStatus: 'Unpaid' | 'Deposit Paid' | 'Fully Paid';
  isFullyPaid: boolean;
  isCheckInAllowed: boolean;
  isCheckInBlocked: boolean;
  isHistoricalCheckedInWithBalance: boolean;
}

/**
 * Single source of truth for booking financial calculations.
 * Ensures consistent handling of total, deposit, amount paid, and outstanding balance across the app.
 */
export const calculateBookingFinancials = (
  booking: Partial<Booking> | null | undefined
): BookingFinancials => {
  if (!booking) {
    return {
      totalAmount: 0,
      totalCost: 0,
      depositAmount: 0,
      amountPaid: 0,
      outstandingBalance: 0,
      paymentStatus: 'Unpaid',
      isFullyPaid: false,
      isCheckInAllowed: false,
      isCheckInBlocked: true,
      isHistoricalCheckedInWithBalance: false,
    };
  }

  const totalAmount = Math.max(0, Number(booking.totalAmount) || 0);
  const depositAmount = Math.max(0, Number(booking.depositAmount) || 0);

  // 1. Determine Amount Paid:
  // Preference 1: Explicitly tracked booking.amountPaid field
  // Preference 2: Sum of recorded payment transactions
  // Preference 3: Inferred from legacy paymentStatus and depositAmount
  let amountPaid = 0;
  if (typeof booking.amountPaid === 'number' && !isNaN(booking.amountPaid)) {
    amountPaid = booking.amountPaid;
  } else if (Array.isArray(booking.payments) && booking.payments.length > 0) {
    amountPaid = booking.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  } else {
    if (booking.paymentStatus === 'Fully Paid') {
      amountPaid = totalAmount;
    } else if (booking.paymentStatus === 'Deposit Paid') {
      amountPaid = depositAmount > 0 ? depositAmount : Math.round(totalAmount * 0.5);
    } else {
      amountPaid = 0;
    }
  }

  // Safety caps: amount paid cannot exceed total amount (unless custom business logic explicitly allows it),
  // and cannot be less than 0.
  amountPaid = Math.min(totalAmount, Math.max(0, amountPaid));

  // 2. Outstanding Balance:
  const outstandingBalance = Math.max(0, totalAmount - amountPaid);

  // 3. Normalized Payment Status:
  let paymentStatus: 'Unpaid' | 'Deposit Paid' | 'Fully Paid' = 'Unpaid';
  if (amountPaid >= totalAmount && totalAmount > 0) {
    paymentStatus = 'Fully Paid';
  } else if (amountPaid > 0) {
    paymentStatus = 'Deposit Paid';
  } else {
    paymentStatus = 'Unpaid';
  }

  const isFullyPaid = outstandingBalance === 0;
  const isCheckInAllowed = isFullyPaid;
  const isCheckInBlocked = !isFullyPaid;
  const isHistoricalCheckedInWithBalance =
    booking.status === 'Checked In' && outstandingBalance > 0;

  return {
    totalAmount,
    totalCost: totalAmount,
    depositAmount,
    amountPaid,
    outstandingBalance,
    paymentStatus,
    isFullyPaid,
    isCheckInAllowed,
    isCheckInBlocked,
    isHistoricalCheckedInWithBalance,
  };
};

/**
 * Standard currency formatter for Philippine Pesos
 */
export const formatCurrency = (amount: number, includeDecimals = false): string => {
  const safe = isNaN(amount) ? 0 : amount;
  if (includeDecimals) {
    return '₱' + safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '₱' + Math.round(safe).toLocaleString('en-US');
};

/**
 * Returns badge styling and text for payment status
 */
export const getPaymentBadgeProps = (
  paymentStatus: 'Unpaid' | 'Deposit Paid' | 'Fully Paid',
  balance: number,
  bookingStatus?: BookingStatus
) => {
  if (bookingStatus === 'Checked In' && balance > 0) {
    return {
      label: `Attention: ₱${balance.toLocaleString()} Due`,
      bgClass: 'bg-amber-950/80',
      textClass: 'text-amber-300',
      borderClass: 'border-amber-600/80',
    };
  }

  switch (paymentStatus) {
    case 'Fully Paid':
      return {
        label: 'Fully Paid',
        bgClass: 'bg-emerald-950/80',
        textClass: 'text-emerald-300',
        borderClass: 'border-emerald-600/80',
      };
    case 'Deposit Paid':
      return {
        label: `Deposit Paid (₱${balance.toLocaleString()} Due)`,
        bgClass: 'bg-amber-950/80',
        textClass: 'text-amber-300',
        borderClass: 'border-amber-600/80',
      };
    case 'Unpaid':
    default:
      return {
        label: `Unpaid (₱${balance.toLocaleString()} Due)`,
        bgClass: 'bg-red-950/80',
        textClass: 'text-red-300',
        borderClass: 'border-red-600/80',
      };
  }
};

/**
 * Validates check-in action. Returns whether check-in is allowed or blocked by payment gate.
 */
export const validateCheckInAttempt = (
  booking: Booking
): { allowed: boolean; balance: number; reason?: string } => {
  const financials = calculateBookingFinancials(booking);
  if (financials.isCheckInBlocked) {
    return {
      allowed: false,
      balance: financials.outstandingBalance,
      reason: `Cannot check in guest: Outstanding balance of ${formatCurrency(financials.outstandingBalance, true)} must be paid in full before check-in.`,
    };
  }
  return {
    allowed: true,
    balance: 0,
  };
};

/**
 * Generates an initial synthetic payment record for existing bookings that had a deposit/payment
 * but do not yet have a recorded payment in their payments array.
 */
export const ensurePaymentHistory = (booking: Booking): PaymentRecord[] => {
  if (Array.isArray(booking.payments) && booking.payments.length > 0) {
    return booking.payments;
  }

  const financials = calculateBookingFinancials(booking);
  if (financials.amountPaid > 0) {
    const initialRecord: PaymentRecord = {
      id: `pay-init-${booking.id}`,
      bookingId: booking.id,
      bookingRef: booking.referenceNumber || booking.id,
      guestName: booking.guestName,
      amount: financials.amountPaid,
      paymentMethod: booking.selectedPaymentChannel || booking.paymentMethod || 'Online Deposit',
      paymentReference: booking.paymentReferenceCode || 'INITIAL-DEPOSIT',
      receiptUrl: booking.paymentReceiptUrl,
      paidAt: booking.createdAt || new Date().toISOString(),
      collectedBy: 'Online Reservation',
      notes: financials.paymentStatus === 'Fully Paid' ? 'Full booking payment' : 'Initial 50% reservation deposit',
    };
    return [initialRecord];
  }

  return [];
};
