import React, { useState, useMemo, useEffect } from 'react';
import { useResort } from '../context/ResortContext';
import { Room, Booking, PaymentMethod, PaymentChannel, BookingStatus } from '../types';
import { downloadVoucher } from '../utils/voucher';
import { getTodayFormatted, getTomorrowFormatted } from '../utils/bookingUtils';
import {
  X,
  Check,
  Building2,
  Users,
  Calendar,
  CreditCard,
  Banknote,
  Receipt,
  Download,
  Key,
  ShieldCheck,
  Car,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';

interface FrontDeskWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoom?: Room | null;
  initialDate?: string;
}

export const FrontDeskWalkInModal: React.FC<FrontDeskWalkInModalProps> = ({
  isOpen,
  onClose,
  initialRoom,
  initialDate,
}) => {
  const {
    rooms,
    addOns,
    resortInfo,
    addBooking,
    showToast,
    setSelectedRoomForBooking,
    setIsBookingModalOpen,
  } = useResort();

  const todayStr = useMemo(() => getTodayFormatted(), []);
  const defaultCheckIn = initialDate || todayStr;
  const defaultCheckOut = getTomorrowFormatted(defaultCheckIn);

  // Form State
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoom?.id || (rooms[0]?.id || ''));
  const [checkInDate, setCheckInDate] = useState<string>(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(defaultCheckOut);
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // Guest Details
  const [guestName, setGuestName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [idOrVehicleNote, setIdOrVehicleNote] = useState<string>('');
  const [keyNumber, setKeyNumber] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Add-Ons
  const [selectedAddOnQuantities, setSelectedAddOnQuantities] = useState<Record<string, number>>({});

  // Payment & Status
  const [paymentType, setPaymentType] = useState<'Cash' | 'Card' | 'GCash' | 'Maya' | 'BankTransfer' | 'PayAtCheckout'>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'Fully Paid' | 'Deposit Paid' | 'Unpaid'>('Fully Paid');
  const [initialStatus, setInitialStatus] = useState<BookingStatus>('Checked In');
  const [amountCollectedInput, setAmountCollectedInput] = useState<string>('');

  // Confirmation Success State
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // Synchronize when initialRoom changes
  useEffect(() => {
    if (initialRoom) {
      setSelectedRoomId(initialRoom.id);
    }
  }, [initialRoom]);

  // Synchronize initial date
  useEffect(() => {
    if (initialDate) {
      setCheckInDate(initialDate);
      setCheckOutDate(getTomorrowFormatted(initialDate));
    }
  }, [initialDate]);

  const currentRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || initialRoom || rooms[0];
  }, [rooms, selectedRoomId, initialRoom]);

  // Calculate nights
  const numberOfNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate + 'T00:00:00');
    const end = new Date(checkOutDate + 'T00:00:00');
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  // Calculations
  const roomPricePerNight = currentRoom?.pricePerNight || 0;
  const isCottageDayUse = currentRoom?.category === 'Cottages';
  const subtotal = roomPricePerNight * numberOfNights;

  const addOnsTotal = useMemo(() => {
    let total = 0;
    Object.entries(selectedAddOnQuantities).forEach(([addOnId, qty]) => {
      if (qty > 0) {
        const item = addOns.find((a) => a.id === addOnId);
        if (item) total += item.price * qty;
      }
    });
    return total;
  }, [selectedAddOnQuantities, addOns]);

  const totalAmount = subtotal + addOnsTotal;

  // Auto-set amount collected to total if Fully Paid
  useEffect(() => {
    if (paymentStatus === 'Fully Paid') {
      setAmountCollectedInput(totalAmount.toString());
    } else if (paymentStatus === 'Deposit Paid') {
      setAmountCollectedInput(Math.round(totalAmount * 0.5).toString());
    } else {
      setAmountCollectedInput('0');
    }
  }, [totalAmount, paymentStatus]);

  if (!isOpen) return null;

  const handleAddOnQuantityChange = (id: string, delta: number) => {
    setSelectedAddOnQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleOpenStandardWizard = () => {
    if (currentRoom) {
      setSelectedRoomForBooking(currentRoom);
    }
    setIsBookingModalOpen(true);
    onClose();
  };

  const handleSubmitWalkIn = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      showToast('Please enter the guest full name.', 'error');
      return;
    }

    if (!mobile.trim()) {
      showToast('Please enter guest contact number.', 'error');
      return;
    }

    if (!currentRoom) {
      showToast('Please select a valid accommodation unit.', 'error');
      return;
    }

    const refNum = `STE-WALK-${Date.now().toString().slice(-6)}`;
    const bookingId = `book-walkin-${Date.now()}`;

    // Map Payment Method & Channel matching PaymentMethod & PaymentChannel in types.ts
    let finalPaymentMethod: PaymentMethod = 'Full Payment';
    let finalPaymentChannel: PaymentChannel = 'Over the Counter';

    if (paymentStatus === 'Deposit Paid') {
      finalPaymentMethod = 'Partial Deposit (50%)';
    } else if (paymentStatus === 'Unpaid') {
      finalPaymentMethod = 'Pay at Resort';
    } else {
      finalPaymentMethod = 'Full Payment';
    }

    if (paymentType === 'GCash') {
      finalPaymentChannel = 'GCash';
    } else if (paymentType === 'BankTransfer' || paymentType === 'Card') {
      finalPaymentChannel = 'BPI';
    } else {
      finalPaymentChannel = 'Over the Counter';
    }

    // Build selected add-ons array
    const formattedAddOns = Object.entries(selectedAddOnQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = addOns.find((a) => a.id === id);
        return {
          id,
          name: item ? (qty > 1 ? `${item.name} (x${qty})` : item.name) : id,
          price: item?.price || 0,
          total: (item?.price || 0) * qty,
        };
      });

    const collectedNum = parseFloat(amountCollectedInput) || 0;

    // --- CHECK-IN PAYMENT GATE ENFORCEMENT ---
    if (initialStatus === 'Checked In' && collectedNum < totalAmount) {
      showToast(
        `Payment Gate: Cannot check in guest. Full payment of ₱${totalAmount.toLocaleString()} is required before Check-In. Remaining balance: ₱${(totalAmount - collectedNum).toLocaleString()}`,
        'error'
      );
      return;
    }

    const newBooking: Booking = {
      id: bookingId,
      referenceNumber: refNum,
      createdAt: new Date().toISOString(),
      guestName: guestName.trim(),
      email: email.trim() || `walkin.${refNum.toLowerCase()}@slttestancias.com`,
      mobile: mobile.trim(),
      roomId: currentRoom.id,
      roomName: currentRoom.name,
      roomPricePerNight: currentRoom.pricePerNight,
      checkInDate,
      checkOutDate,
      numberOfNights,
      adultsCount,
      childrenCount,
      allocatedRooms: [
        {
          id: currentRoom.id,
          name: currentRoom.name,
          category: currentRoom.category,
          pricePerNight: currentRoom.pricePerNight,
          maxGuests: currentRoom.maxGuests,
        },
      ],
      selectedAddOns: formattedAddOns,
      specialRequests: [
        keyNumber ? `Issued Room Key: ${keyNumber}` : null,
        idOrVehicleNote ? `ID / Vehicle: ${idOrVehicleNote}` : null,
        specialRequests ? `Notes: ${specialRequests}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
      paymentMethod: finalPaymentMethod,
      selectedPaymentChannel: finalPaymentChannel,
      paymentStatus,
      paymentReceiptUrl: undefined,
      paymentReferenceCode: `FRONTDESK-WALKIN-${paymentType.toUpperCase()}`,
      subtotal,
      addOnsTotal,
      taxAmount: 0,
      totalAmount,
      depositAmount: paymentStatus === 'Fully Paid' ? totalAmount : collectedNum,
      amountPaid: collectedNum,
      balanceAmount: Math.max(0, totalAmount - collectedNum),
      payments: collectedNum > 0 ? [
        {
          id: `pay-walkin-${Date.now()}`,
          bookingId,
          bookingRef: refNum,
          guestName: guestName.trim(),
          amount: collectedNum,
          paymentMethod: paymentType,
          paymentReference: `FRONTDESK-WALKIN-${paymentType.toUpperCase()}`,
          paidAt: new Date().toISOString(),
          collectedBy: 'Front Desk Staff',
          notes: 'Collected at front desk during walk-in reservation',
        },
      ] : [],
      status: initialStatus,
      adminNotes: `Front-Desk Walk-In reservation logged by staff. Payment: ${paymentType} (₱${collectedNum.toLocaleString()} collected). Key Issued: ${keyNumber || 'Standard'}.`,
    };

    addBooking(newBooking);
    setCompletedBooking(newBooking);
    showToast(`Walk-in guest ${guestName} successfully registered & ${initialStatus.toLowerCase()}!`, 'success');
  };

  const handleResetAndClose = () => {
    setCompletedBooking(null);
    setGuestName('');
    setMobile('');
    setEmail('');
    setIdOrVehicleNote('');
    setKeyNumber('');
    setSpecialRequests('');
    setSelectedAddOnQuantities({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#0e1710] border-b border-[#606e60]/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Front-Desk Reception
              </span>
              <span className="text-xs text-[#ad9e92] font-semibold">Walk-In Management</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#ebe5de] mt-1 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#ad9e92]" />
              Front-Desk Walk-In Check-In
            </h3>
            <p className="text-xs text-[#c3ccc0] mt-0.5">
              Register walk-in guests at the counter, accept payment, issue room keys, and immediately update unit occupancy.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-xl bg-[#1c2a20] hover:bg-[#25362a] text-[#c3ccc0] hover:text-[#ebe5de] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IF COMPLETED: SUCCESS VOUCHER VIEW */}
        {completedBooking ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400 shadow-xl animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                {completedBooking.status === 'Checked In' ? 'Guest Checked In & Unit Occupied' : 'Walk-In Confirmed'}
              </span>
              <h4 className="text-2xl font-bold font-serif text-[#ebe5de] mt-3">
                {completedBooking.guestName}
              </h4>
              <p className="text-sm text-[#ad9e92] font-mono mt-1">
                Ref Code: <strong className="text-[#ebe5de]">{completedBooking.referenceNumber}</strong>
              </p>
            </div>

            {/* Quick Summary Box */}
            <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-[#606e60]/40 pb-2">
                <span className="text-[#c3ccc0]">Assigned Unit:</span>
                <span className="font-bold text-[#ebe5de] font-serif">{completedBooking.roomName}</span>
              </div>
              <div className="flex justify-between border-b border-[#606e60]/40 pb-2">
                <span className="text-[#c3ccc0]">Stay Duration:</span>
                <span className="font-bold text-[#ebe5de]">
                  {completedBooking.checkInDate} → {completedBooking.checkOutDate} ({completedBooking.numberOfNights} {isCottageDayUse ? 'Day' : 'Nights'})
                </span>
              </div>
              <div className="flex justify-between border-b border-[#606e60]/40 pb-2">
                <span className="text-[#c3ccc0]">Guest Count:</span>
                <span className="font-bold text-[#ebe5de]">
                  {completedBooking.adultsCount} Adults{completedBooking.childrenCount > 0 ? `, ${completedBooking.childrenCount} Kids` : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#606e60]/40 pb-2">
                <span className="text-[#c3ccc0]">Payment Status:</span>
                <span className="font-bold text-emerald-400">
                  {completedBooking.paymentStatus} (₱{completedBooking.totalAmount.toLocaleString()})
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#c3ccc0]">Current Unit Status:</span>
                <span className="font-bold text-red-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Live Occupied on Board
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#606e60]/40">
              <button
                type="button"
                onClick={() => downloadVoucher(completedBooking, resortInfo)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print / Download Guest Voucher</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#ebe5de] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Done & View Occupancy Board
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmitWalkIn} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Step 1: Unit Selection & Dates */}
            <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#ad9e92] tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  1. Target Accommodation Unit
                </span>

                <button
                  type="button"
                  onClick={handleOpenStandardWizard}
                  className="text-[11px] text-[#c3ccc0] hover:text-[#ad9e92] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Use Online Wizard Instead</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1.5">
                    Select Unit / Room:
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] font-semibold focus:outline-none focus:border-[#ad9e92]"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id} disabled={r.isComingSoon}>
                        {r.name} ({r.category || 'Rooms and Suites'}) — ₱{r.pricePerNight.toLocaleString()}{r.isComingSoon ? ' [Coming Soon]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {currentRoom && (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/40">
                    <img
                      src={currentRoom.featuredImage}
                      alt={currentRoom.name}
                      className="w-14 h-14 rounded-lg object-cover border border-[#606e60]/50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-[#ebe5de] font-serif">{currentRoom.name}</p>
                      <p className="text-[11px] text-[#ad9e92] font-semibold">
                        ₱{currentRoom.pricePerNight.toLocaleString()} {isCottageDayUse ? '/ day' : '/ night'}
                      </p>
                      <p className="text-[10px] text-[#c3ccc0]">
                        Max Capacity: {currentRoom.maxGuests} Guests • {currentRoom.bedType}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates & Headcount */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#606e60]/40">
                <div>
                  <label className="text-[10px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Check-In Date:
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      if (e.target.value >= checkOutDate) {
                        setCheckOutDate(getTomorrowFormatted(e.target.value));
                      }
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Check-Out Date:
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Adults Count:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={currentRoom ? currentRoom.maxGuests + 6 : 20}
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Children Count:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                  />
                </div>
              </div>

              {currentRoom && (adultsCount + childrenCount > currentRoom.maxGuests) && (
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-600/50 text-[11px] text-amber-200">
                  ⚠️ Guest count ({adultsCount + childrenCount}) exceeds standard unit capacity ({currentRoom.maxGuests}). Consider adding Extra Mattress / Bed add-on below.
                </div>
              )}
            </div>

            {/* Step 2: Guest Details & Front Desk Keys */}
            <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-4">
              <span className="text-xs font-bold uppercase text-[#ad9e92] tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                2. Guest Profile & Room Assignment
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz"
                    className="w-full px-3 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] placeholder:text-[#606e60] focus:outline-none focus:border-[#ad9e92]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Mobile / Contact # *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 0917 123 4567"
                    className="w-full px-3 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] placeholder:text-[#606e60] focus:outline-none focus:border-[#ad9e92]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Email Address <span className="text-[#606e60] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com (or auto-generated)"
                    className="w-full px-3 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] placeholder:text-[#606e60] focus:outline-none focus:border-[#ad9e92]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Physical Key / Key Card #
                  </label>
                  <input
                    type="text"
                    value={keyNumber}
                    onChange={(e) => setKeyNumber(e.target.value)}
                    placeholder="e.g. Key Card #03 / RFID tag"
                    className="w-full px-3 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] placeholder:text-[#606e60] focus:outline-none focus:border-[#ad9e92]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-[#ad9e92]" />
                    ID / Vehicle Plate
                  </label>
                  <input
                    type="text"
                    value={idOrVehicleNote}
                    onChange={(e) => setIdOrVehicleNote(e.target.value)}
                    placeholder="e.g. Plate NAK-1234, Driver's License"
                    className="w-full px-3 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] placeholder:text-[#606e60] focus:outline-none focus:border-[#ad9e92]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1">
                    Special Notes / Requests
                  </label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Extra towels, late checkout request"
                    className="w-full px-3 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] placeholder:text-[#606e60] focus:outline-none focus:border-[#ad9e92]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Add-On Services (Optional) */}
            {addOns && addOns.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#ad9e92] tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    3. Optional Add-On Amenities & Services
                  </span>
                  <span className="text-xs text-[#ad9e92] font-semibold">
                    Add-ons: ₱{addOnsTotal.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {addOns.map((addon) => {
                    const qty = selectedAddOnQuantities[addon.id] || 0;
                    return (
                      <div
                        key={addon.id}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          qty > 0 ? 'bg-[#1c2a20] border-emerald-500' : 'bg-[#162018] border-[#606e60]/40'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="font-semibold text-[#ebe5de] truncate">{addon.name}</p>
                          <p className="text-[10px] text-[#ad9e92]">₱{addon.price.toLocaleString()} / {addon.unit}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {qty > 0 ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAddOnQuantityChange(addon.id, -1)}
                                className="w-6 h-6 rounded-lg bg-[#0e1710] border border-[#606e60] text-xs font-bold text-[#ebe5de] flex items-center justify-center hover:bg-[#25362a] cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-bold text-[#ebe5de]">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleAddOnQuantityChange(addon.id, 1)}
                                className="w-6 h-6 rounded-lg bg-[#0e1710] border border-[#606e60] text-xs font-bold text-[#ebe5de] flex items-center justify-center hover:bg-[#25362a] cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddOnQuantityChange(addon.id, 1)}
                              className="px-2 py-1 rounded-lg bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#c3ccc0] hover:text-[#ebe5de] text-[10px] font-bold cursor-pointer"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Front-Desk Payment & Live Status */}
            <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-4">
              <span className="text-xs font-bold uppercase text-[#ad9e92] tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4" />
                4. Front-Desk Billing & Initial Stay Status
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payment Method selection */}
                <div>
                  <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1.5">
                    Payment Method Used:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'Cash', label: 'Cash', icon: Banknote },
                      { id: 'Card', label: 'POS Card', icon: CreditCard },
                      { id: 'GCash', label: 'GCash QR', icon: CreditCard },
                      { id: 'Maya', label: 'Maya QR', icon: CreditCard },
                      { id: 'BankTransfer', label: 'Bank', icon: Building2 },
                      { id: 'PayAtCheckout', label: 'Post / Pay Later', icon: FileText },
                    ].map((p) => {
                      const Icon = p.icon;
                      const isSelected = paymentType === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPaymentType(p.id as any)}
                          className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#ad9e92] text-[#1c2a20] border-[#ad9e92] shadow-sm'
                              : 'bg-[#1c2a20] text-[#c3ccc0] border-[#606e60]/50 hover:bg-[#25362a]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Status */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1">
                      Payment Status:
                    </label>
                    <div className="flex rounded-xl bg-[#1c2a20] p-1 border border-[#606e60]/50 text-xs">
                      {(['Fully Paid', 'Deposit Paid', 'Unpaid'] as const).map((ps) => (
                        <button
                          key={ps}
                          type="button"
                          onClick={() => setPaymentStatus(ps)}
                          className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-all cursor-pointer ${
                            paymentStatus === ps
                              ? 'bg-[#ad9e92] text-[#1c2a20] shadow-sm'
                              : 'text-[#c3ccc0] hover:text-[#ebe5de]'
                          }`}
                        >
                          {ps}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1">
                      Amount Collected (₱):
                    </label>
                    <input
                      type="number"
                      value={amountCollectedInput}
                      onChange={(e) => setAmountCollectedInput(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] text-xs text-[#ebe5de] font-bold focus:outline-none focus:border-[#ad9e92]"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Status: Immediate Check-in vs Confirmed */}
              <div className="pt-3 border-t border-[#606e60]/40">
                <label className="text-[11px] font-bold text-[#c3ccc0] uppercase block mb-1.5">
                  Initial Reservation Status:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div
                    onClick={() => setInitialStatus('Checked In')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      initialStatus === 'Checked In'
                        ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500'
                        : 'bg-[#1c2a20] border-[#606e60]/50 hover:border-[#ad9e92]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-red-400 flex items-center justify-center shrink-0">
                      {initialStatus === 'Checked In' && <div className="w-2 h-2 rounded-full bg-red-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-[#ebe5de] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        Immediate Check-In (Keys Handed Over)
                      </p>
                      <p className="text-[10px] text-[#c3ccc0]">
                        Guest is at counter. Room turns <strong>Occupied (Red)</strong> on the board right now.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setInitialStatus('Confirmed')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      initialStatus === 'Confirmed'
                        ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-[#1c2a20] border-[#606e60]/50 hover:border-[#ad9e92]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-blue-400 flex items-center justify-center shrink-0">
                      {initialStatus === 'Confirmed' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-[#ebe5de] flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-blue-400" />
                        Confirmed (Arriving Later Today)
                      </p>
                      <p className="text-[10px] text-[#c3ccc0]">
                        Reserved walk-in. Displays as <strong>Arriving Today (Blue)</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Calculation Strip */}
              <div className="p-3.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#c3ccc0] uppercase font-bold">Total Bill:</span>
                  <p className="text-xl font-bold font-serif text-amber-300">
                    ₱{totalAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#ad9e92]">
                    (₱{roomPricePerNight.toLocaleString()} × {numberOfNights} {isCottageDayUse ? 'day' : 'night(s)'}{addOnsTotal > 0 ? ` + ₱${addOnsTotal.toLocaleString()} add-ons` : ''})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#c3ccc0] uppercase font-bold">Payment Status:</span>
                  <p className="text-sm font-bold text-emerald-400">
                    {paymentStatus} (₱{(parseFloat(amountCollectedInput) || 0).toLocaleString()} Collected)
                  </p>
                  {paymentStatus !== 'Fully Paid' && (
                    <p className="text-[10px] text-red-400 font-semibold">
                      Remaining Balance: ₱{Math.max(0, totalAmount - (parseFloat(amountCollectedInput) || 0)).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#606e60]/60">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#c3ccc0] hover:text-[#ebe5de] text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Complete Walk-In Check-In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
