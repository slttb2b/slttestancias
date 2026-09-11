import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CreditCard,
  Receipt,
  Upload,
  Clock,
  ArrowRight,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
import { Booking } from '../types';
import { calculateBookingFinancials, formatCurrency } from '../utils/paymentUtils';
import { uploadImageToFirebaseStorage } from '../services/storageService';
import { useResort } from '../context/ResortContext';

export interface PaymentGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  initialMode?: 'required' | 'collect';
  collectorName?: string;
  onPaymentComplete?: (updatedBooking: Booking) => void;
  onCollectPayment?: (
    bookingId: string,
    paymentData: {
      amount: number;
      paymentMethod: string;
      paymentReference?: string;
      receiptUrl?: string;
      collectedBy?: string;
      notes?: string;
    },
    checkInImmediately?: boolean
  ) => Promise<{ success: boolean; updatedBooking?: Booking; error?: string }>;
}

export const PaymentGateModal: React.FC<PaymentGateModalProps> = ({
  isOpen,
  onClose,
  booking,
  initialMode = 'required',
  collectorName,
  onPaymentComplete,
  onCollectPayment,
}) => {
  const { collectBookingPayment, currentAdminUser } = useResort();
  const effectiveCollector = collectorName || currentAdminUser?.fullName || 'Front Desk Staff';

  const [mode, setMode] = useState<'required' | 'collect'>(initialMode);
  const [paymentMethod, setPaymentMethod] = useState<string>('GCash');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<boolean>(false);
  const [checkInImmediately, setCheckInImmediately] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever booking or initialMode changes
  useEffect(() => {
    if (booking) {
      const financials = calculateBookingFinancials(booking);
      setAmountInput(financials.outstandingBalance.toString());
      setMode(initialMode);
      setPaymentReference('');
      setReceiptUrl('');
      setNotes('');
      setErrorMessage(null);
      setPaymentMethod(booking.selectedPaymentChannel || 'GCash');
      setCheckInImmediately(true);
    }
  }, [booking, initialMode, isOpen]);

  if (!isOpen || !booking) return null;

  const financials = calculateBookingFinancials(booking);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingReceipt(true);
      setErrorMessage(null);
      const url = await uploadImageToFirebaseStorage(file, 'payment_receipts');
      if (url) {
        setReceiptUrl(url);
      }
    } catch (err: any) {
      console.error('Error uploading payment receipt proof:', err);
      setErrorMessage('Failed to upload receipt image. You may proceed by entering the reference number.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const enteredAmount = parseFloat(amountInput);
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount greater than ₱0.');
      return;
    }

    if (enteredAmount > financials.outstandingBalance) {
      setErrorMessage(
        `Payment amount cannot exceed the outstanding balance of ${formatCurrency(financials.outstandingBalance, true)}.`
      );
      return;
    }

    // If checkInImmediately is requested, verify the amount covers the full balance
    if (checkInImmediately && enteredAmount < financials.outstandingBalance) {
      setErrorMessage(
        `Full payment of ${formatCurrency(financials.outstandingBalance, true)} is strictly required to Check In. To record a partial collection without checking in, uncheck "Check In immediately".`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const collectFn = onCollectPayment || collectBookingPayment;
      const result = await collectFn(
        booking.id,
        {
          amount: enteredAmount,
          paymentMethod,
          paymentReference: paymentReference.trim() || undefined,
          receiptUrl: receiptUrl || undefined,
          collectedBy: effectiveCollector,
          notes: notes.trim() || undefined,
        },
        checkInImmediately
      );

      if (result.success && result.updatedBooking) {
        if (onPaymentComplete) {
          onPaymentComplete(result.updatedBooking);
        }
        onClose();
      } else {
        setErrorMessage(result.error || 'Failed to record payment. Please try again.');
      }
    } catch (err: any) {
      console.error('Submit payment error:', err);
      setErrorMessage(err?.message || 'Unexpected error occurred while saving payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-xl w-full bg-[#132016] border border-[#606e60] rounded-3xl shadow-2xl p-6 my-8 space-y-6 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-[#0e1710] hover:bg-[#1c2a20] text-[#c3ccc0] hover:text-white transition-colors cursor-pointer border border-[#606e60]/60 disabled:opacity-50"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ---------------------------------------------------- */}
        {/* MODE 1: PAYMENT REQUIRED BEFORE CHECK-IN GATE        */}
        {/* ---------------------------------------------------- */}
        {mode === 'required' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 border-b border-[#606e60]/60 pb-5">
              <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-600/70 text-amber-400 shrink-0 shadow-lg">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-600/80 inline-block mb-1">
                  Payment Gate Protection
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#ebe5de]">
                  Payment Required
                </h2>
                <p className="text-xs text-[#c3ccc0] mt-0.5">
                  Guest check-in cannot proceed while an outstanding balance remains.
                </p>
              </div>
            </div>

            {/* Guest & Stay Context Card */}
            <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#606e60]/40 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#ad9e92] block">Guest Name</span>
                  <span className="text-sm font-bold text-[#ebe5de]">{booking.guestName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#ad9e92] block">Booking Ref</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{booking.referenceNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#c3ccc0]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#ad9e92] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#ad9e92] block">Accommodation</span>
                    <span className="font-semibold text-[#ebe5de]">{booking.roomName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#ad9e92] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#ad9e92] block">Stay Schedule</span>
                    <span className="font-medium text-[#ebe5de]">
                      {booking.checkInDate} → {booking.checkOutDate} ({booking.numberOfNights}n)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#ad9e92] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#ad9e92] block">Contact Mobile</span>
                    <span className="font-mono text-[#ebe5de]">{booking.mobile}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#ad9e92] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#ad9e92] block">Current Status</span>
                    <span className="font-bold text-amber-400">
                      {booking.status} • {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3.5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60">
                <span className="text-[10px] font-bold text-[#ad9e92] uppercase block">Total Bill</span>
                <p className="text-base sm:text-lg font-bold font-serif text-[#ebe5de] mt-0.5">
                  {formatCurrency(financials.totalAmount)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">Amount Paid</span>
                <p className="text-base sm:text-lg font-bold font-serif text-emerald-300 mt-0.5">
                  {formatCurrency(financials.amountPaid)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-600/70">
                <span className="text-[10px] font-bold text-red-400 uppercase block">Balance Due</span>
                <p className="text-base sm:text-lg font-bold font-serif text-red-300 mt-0.5">
                  {formatCurrency(financials.outstandingBalance)}
                </p>
              </div>
            </div>

            {/* Policy Enforcement Warning Box */}
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-700/60 text-xs text-amber-200/90 flex items-start gap-3">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 mb-0.5">Check-In Policy Enforcement</p>
                <p className="text-[11px] leading-relaxed text-[#c3ccc0]">
                  This booking has an outstanding balance. Full payment must be collected before the guest can be checked in. This reservation will safely remain in <strong>Confirmed</strong> status until payment is finalized.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#606e60]/60">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0e1710] hover:bg-[#1c2a20] border border-[#606e60] text-[#c3ccc0] hover:text-white font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Cancel / Keep Confirmed
              </button>

              <button
                type="button"
                onClick={() => setMode('collect')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Collect Payment (₱{financials.outstandingBalance.toLocaleString()})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE 2: COLLECT FULL PAYMENT FORM                   */}
        {/* ---------------------------------------------------- */}
        {mode === 'collect' && (
          <form onSubmit={handleSubmitPayment} className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4 border-b border-[#606e60]/60 pb-4">
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-400 shrink-0 shadow-lg">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-600/80 inline-block mb-1">
                  Payment Collection
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#ebe5de]">
                  Collect Full Payment
                </h2>
                <p className="text-xs text-[#c3ccc0] mt-0.5">
                  Guest: <strong className="text-white">{booking.guestName}</strong> • Ref:{' '}
                  <span className="font-mono text-amber-300">{booking.referenceNumber}</span>
                </p>
              </div>
            </div>

            {/* Outstanding Balance Banner */}
            <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#ad9e92] block">
                  Required Collection Amount
                </span>
                <p className="text-2xl font-bold font-serif text-emerald-400">
                  {formatCurrency(financials.outstandingBalance)}
                </p>
                <p className="text-[10px] text-[#c3ccc0]">
                  (Total Bill: {formatCurrency(financials.totalAmount)} • Already Paid:{' '}
                  {formatCurrency(financials.amountPaid)})
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#ad9e92] block">
                  Logged Staff
                </span>
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1 justify-end">
                  <User className="w-3.5 h-3.5" />
                  {collectorName}
                </span>
              </div>
            </div>

            {/* Error Banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-700 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1.5">
                  Payment Method:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['GCash', 'BPI', 'Cash (Over the Counter)', 'Credit/Debit Card'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === pm
                          ? 'bg-emerald-950/70 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                          : 'bg-[#0e1710] border-[#606e60]/60 text-[#c3ccc0] hover:border-[#ad9e92]'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount to Collect & Payment Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Amount Collected (₱):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={financials.outstandingBalance}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0e1710] border border-[#606e60] text-sm text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                  />
                  <p className="text-[10px] text-[#ad9e92] mt-1">
                    Full balance settlement of {formatCurrency(financials.outstandingBalance)} required for check-in.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Payment Reference / Receipt Code:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GCash 100238491, Cash OR #124"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0e1710] border border-[#606e60] text-xs font-mono text-[#ebe5de] focus:outline-none focus:border-emerald-400"
                  />
                  <p className="text-[10px] text-[#ad9e92] mt-1">
                    Reference # from GCash, bank confirmation, or manual cash receipt.
                  </p>
                </div>
              </div>

              {/* Optional Receipt / Proof Attachment */}
              <div className="p-3.5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-2">
                <label className="text-[11px] font-bold text-[#c3ccc0] uppercase flex items-center justify-between">
                  <span>Attach Payment Receipt / Proof (Optional):</span>
                  {isUploadingReceipt && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading proof...
                    </span>
                  )}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    disabled={isUploadingReceipt || isSubmitting}
                    className="text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1c2a20] file:text-[#ebe5de] file:border file:border-[#606e60] cursor-pointer"
                  />
                  {receiptUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={receiptUrl}
                        alt="Receipt Proof"
                        className="w-10 h-10 object-cover rounded-lg border border-emerald-500"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Attached
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Check-In Immediately Checkbox */}
              <div className="p-3.5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="checkInImmediatelyCheckbox"
                  checked={checkInImmediately}
                  onChange={(e) => setCheckInImmediately(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 bg-[#1c2a20] border-[#606e60] cursor-pointer"
                />
                <label htmlFor="checkInImmediatelyCheckbox" className="cursor-pointer">
                  <span className="font-bold text-[#ebe5de] block">
                    Check In guest immediately upon payment completion
                  </span>
                  <span className="text-[10px] text-[#c3ccc0]">
                    Once recorded, booking will be updated to <strong>Fully Paid</strong> and status changed to <strong>Checked In</strong>. Unit turns Occupied on the live board.
                  </span>
                </label>
              </div>

              {/* Staff Notes */}
              <div>
                <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1">
                  Internal Remarks / Collector Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid at counter upon arrival; keys handed over."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0e1710] border border-[#606e60] text-xs text-[#ebe5de] focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#606e60]/60">
              <button
                type="button"
                onClick={() => setMode('required')}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0e1710] hover:bg-[#1c2a20] border border-[#606e60] text-[#c3ccc0] hover:text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isUploadingReceipt}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recording Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {checkInImmediately ? 'Confirm Payment & Check In' : 'Confirm Payment Record'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
