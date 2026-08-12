import React, { useState, useEffect } from 'react';
import { useResort } from '../context/ResortContext';
import { Room, Package, Booking, PaymentMethod, PaymentChannel } from '../types';
import { ADD_ON_SERVICES } from '../data/resortData';
import { checkRoomOccupied, OCCUPIED_UNIT_MESSAGE, COMING_SOON_MESSAGE, validateBookingDates, getTodayFormatted, getTomorrowFormatted } from '../utils/bookingUtils';
import { downloadVoucher } from '../utils/voucher';
import {
  X,
  Calendar,
  BedDouble,
  Users,
  CheckCircle2,
  Receipt,
  CreditCard,
  Download,
  PhoneCall,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  DollarSign,
  QrCode,
  Printer,
  Upload,
  Image as ImageIcon,
  Building2,
  Smartphone,
  Trash2,
  AlertTriangle,
  Gift,
} from 'lucide-react';

export const BookingWizardModal: React.FC = () => {
  const {
    isBookingModalOpen,
    setIsBookingModalOpen,
    selectedRoomForBooking,
    setSelectedRoomForBooking,
    selectedPackageForBooking,
    setSelectedPackageForBooking,
    rooms,
    packages,
    bookings,
    searchFilters,
    addBooking,
    resortInfo,
    paymentSettings,
  } = useResort();

  const [step, setStep] = useState<number>(1);
  const [occupiedNotice, setOccupiedNotice] = useState<string | null>(null);

  // Form State
  const [checkInDate, setCheckInDate] = useState<string>(searchFilters.checkInDate);
  const [checkOutDate, setCheckOutDate] = useState<string>(searchFilters.checkOutDate);
  const [adults, setAdults] = useState<number>(searchFilters.adults || 2);
  const [children, setChildren] = useState<number>(searchFilters.children || 0);

  const [bookingCategory, setBookingCategory] = useState<'room' | 'package'>(
    selectedPackageForBooking ? 'package' : 'room'
  );
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(selectedRoomForBooking || rooms[0]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(selectedPackageForBooking);
  const [modalCategoryFilter, setModalCategoryFilter] = useState<'All' | 'Cottages' | 'Filipino Kubos' | 'Rooms and Suites'>('All');

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});

  // Payment choice
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Partial Deposit (50%)');
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<PaymentChannel>('GCash');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [paymentReferenceCode, setPaymentReferenceCode] = useState<string>('');

  // Confirmation result state
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (selectedPackageForBooking) {
      setSelectedPackage(selectedPackageForBooking);
      setSelectedRoom(null);
      setBookingCategory('package');
    } else if (selectedRoomForBooking) {
      setSelectedRoom(selectedRoomForBooking);
      setSelectedPackage(null);
      setBookingCategory('room');
    }
  }, [selectedRoomForBooking, selectedPackageForBooking]);

  const handleReceiptFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPaymentReceiptUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isBookingModalOpen) return null;

  // Calculate nights
  const calculateNights = (): number => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  const nights = calculateNights();

  // Price calculations based on booking category
  const roomRatePerNight = bookingCategory === 'package' ? (selectedPackage?.price || 0) : (selectedRoom?.pricePerNight || 0);
  const subtotal = bookingCategory === 'package' ? (selectedPackage?.price || 0) : roomRatePerNight * nights;

  // Calculate Add-ons
  const activeAddOnsList = ADD_ON_SERVICES.filter((a) => selectedAddOns[a.id]).map((a) => {
    let total = a.price;
    if (a.unit === 'per person') total = a.price * (adults + children);
    if (a.unit === 'per night') total = a.price * nights;
    return {
      id: a.id,
      name: a.name,
      price: a.price,
      total,
    };
  });

  const addOnsTotal = activeAddOnsList.reduce((acc, curr) => acc + curr.total, 0);
  const taxAmount = Math.round((subtotal + addOnsTotal) * 0.12);
  const totalAmount = subtotal + addOnsTotal + taxAmount;

  let depositAmount = totalAmount;
  if (paymentMethod === 'Partial Deposit (50%)') {
    depositAmount = Math.round(totalAmount * 0.5);
  } else if (paymentMethod === 'Pay at Resort') {
    depositAmount = 0;
  }

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckInChange = (newInDate: string) => {
    setCheckInDate(newInDate);
    setOccupiedNotice(null);
    if (!checkOutDate || checkOutDate <= newInDate) {
      setCheckOutDate(getTomorrowFormatted(newInDate));
    }
  };

  const handleCheckOutChange = (newOutDate: string) => {
    setCheckOutDate(newOutDate);
    if (newOutDate && checkInDate && newOutDate <= checkInDate) {
      setOccupiedNotice(`Invalid Check-Out Date (${newOutDate}): Check-out must be after check-in (${checkInDate}). Minimum stay is 1 day/night.`);
    } else {
      setOccupiedNotice(null);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      const dateValidation = validateBookingDates(checkInDate, checkOutDate);
      if (!dateValidation.isValid) {
        setOccupiedNotice(dateValidation.errorMessage || 'Invalid date range selected.');
        return;
      }
      setOccupiedNotice(null);
      setStep(2);
    } else if (step === 2) {
      const dateValidation = validateBookingDates(checkInDate, checkOutDate);
      if (!dateValidation.isValid) {
        setOccupiedNotice(dateValidation.errorMessage || 'Invalid date range selected.');
        setStep(1);
        return;
      }

      if (bookingCategory === 'package') {
        if (!selectedPackage) {
          alert('Please select a resort package to proceed.');
          return;
        }
        if (selectedRoom) {
          const occ = checkRoomOccupied(selectedRoom.id, checkInDate, checkOutDate, rooms, bookings);
          if (occ.isOccupied) {
            setOccupiedNotice(occ.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE);
            return;
          }
        }
      } else {
        if (!selectedRoom) {
          alert('Please select an accommodation unit to proceed.');
          return;
        }
        const occ = checkRoomOccupied(selectedRoom.id, checkInDate, checkOutDate, rooms, bookings);
        if (occ.isOccupied) {
          setOccupiedNotice(occ.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE);
          return;
        }
      }
      setOccupiedNotice(null);
      setStep(3);
    } else if (step === 3) {
      if (!guestName || !mobile) {
        alert('Please fill in your Full Name and Mobile Number.');
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    setOccupiedNotice(null);
    if (step > 1 && step < 5) {
      setStep(step - 1);
    }
  };

  const handleFinalSubmitBooking = () => {
    const dateValidation = validateBookingDates(checkInDate, checkOutDate);
    if (!dateValidation.isValid) {
      setOccupiedNotice(dateValidation.errorMessage || 'Invalid date range selected.');
      setStep(1);
      return;
    }

    if (bookingCategory === 'package') {
      if (selectedRoom) {
        const occ = checkRoomOccupied(selectedRoom.id, checkInDate, checkOutDate, rooms, bookings);
        if (occ.isOccupied) {
          setOccupiedNotice(occ.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE);
          setStep(2);
          return;
        }
      }
    } else {
      if (selectedRoom) {
        const occ = checkRoomOccupied(selectedRoom.id, checkInDate, checkOutDate, rooms, bookings);
        if (occ.isOccupied) {
          setOccupiedNotice(occ.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE);
          setStep(2);
          return;
        }
      }
    }

    const randomRefNum = `SLTT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      referenceNumber: randomRefNum,
      createdAt: new Date().toISOString(),
      guestName,
      email,
      mobile,
      roomId: bookingCategory === 'package' ? (selectedPackage?.id || 'pkg-deal') : (selectedRoom?.id || 'room-deluxe'),
      roomName: bookingCategory === 'package'
        ? `[Package] ${selectedPackage?.name || 'Resort Package'}${selectedRoom ? ` (${selectedRoom.name})` : ''}`
        : (selectedRoom?.name || 'Deluxe Room'),
      roomPricePerNight: roomRatePerNight,
      checkInDate,
      checkOutDate,
      numberOfNights: nights,
      adultsCount: adults,
      childrenCount: children,
      selectedAddOns: activeAddOnsList,
      specialRequests,
      paymentMethod,
      selectedPaymentChannel: paymentMethod === 'Pay at Resort' ? 'Over the Counter' : selectedPaymentChannel,
      paymentReceiptUrl: paymentMethod === 'Pay at Resort' ? undefined : paymentReceiptUrl,
      paymentReferenceCode: paymentMethod === 'Pay at Resort' ? undefined : paymentReferenceCode,
      paymentStatus: paymentMethod === 'Pay at Resort' ? 'Unpaid' : paymentMethod === 'Full Payment' ? 'Fully Paid' : 'Deposit Paid',
      subtotal,
      addOnsTotal,
      taxAmount,
      totalAmount,
      depositAmount,
      status: 'Pending',
    };

    addBooking(newBooking);
    setCreatedBooking(newBooking);
    setStep(5); // Confirmation Screen
  };

  const handleClose = () => {
    setIsBookingModalOpen(false);
    setStep(1);
    setCreatedBooking(null);
  };

  const handlePrintVoucher = () => {
    if (createdBooking) {
      downloadVoucher(createdBooking, resortInfo);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#132016]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-3xl w-full my-8 shadow-2xl text-[#ebe5de] overflow-hidden relative animate-in fade-in zoom-in-95">
        {/* Modal Header Bar */}
        <div className="bg-[#1c2a20] px-6 py-4 border-b border-[#606e60]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#132016] border border-[#606e60] flex items-center justify-center text-[#ad9e92]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base font-serif text-[#ebe5de]">SLTT ESTANCIAS Booking</h3>
              <p className="text-[11px] text-[#c3ccc0]">Step {step} of 5</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#132016] text-[#c3ccc0] hover:text-[#ebe5de] flex items-center justify-center cursor-pointer border border-[#606e60]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        {step < 5 && (
          <div className="bg-[#132016] px-6 py-3 border-b border-[#606e60]/60 flex items-center justify-between text-xs text-[#c3ccc0]/80 overflow-x-auto">
            <span className={`flex items-center gap-1 ${step >= 1 ? 'text-[#ad9e92] font-bold' : ''}`}>
              1. Dates & Type
            </span>
            <span>→</span>
            <span className={`flex items-center gap-1 ${step >= 2 ? 'text-[#ad9e92] font-bold' : ''}`}>
              2. {bookingCategory === 'package' ? 'Package Selection' : 'Accommodation'} & Add-ons
            </span>
            <span>→</span>
            <span className={`flex items-center gap-1 ${step >= 3 ? 'text-[#ad9e92] font-bold' : ''}`}>
              3. Guest Details
            </span>
            <span>→</span>
            <span className={`flex items-center gap-1 ${step >= 4 ? 'text-[#ad9e92] font-bold' : ''}`}>
              4. Payment & Summary
            </span>
          </div>
        )}

        {/* Occupied Unit Warning Banner */}
        {occupiedNotice && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-900/90 border-2 border-red-500 text-white shadow-xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-800 shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold tracking-wide">
                {occupiedNotice}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOccupiedNotice(null)}
              className="p-1.5 rounded-lg hover:bg-red-800 text-red-200 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 1: Select Dates & Booking Category */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <h4 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ad9e92]" />
              Step 1: Booking Category & Dates
            </h4>

            {/* Category Switcher Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-wider block">
                Select What You Want To Book
              </label>
              <div className="bg-[#1c2a20] p-1.5 rounded-2xl border border-[#606e60]/80 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBookingCategory('room');
                    setSelectedPackage(null);
                    if (!selectedRoom && rooms.length > 0) setSelectedRoom(rooms[0]);
                    setOccupiedNotice(null);
                  }}
                  className={`flex-1 py-3 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    bookingCategory === 'room'
                      ? 'bg-[#ad9e92] text-[#1c2a20] shadow-md ring-1 ring-[#c3ccc0]'
                      : 'text-[#c3ccc0] hover:text-[#ebe5de] hover:bg-[#132016]'
                  }`}
                >
                  <BedDouble className="w-4 h-4" />
                  <span>Standard Accommodation</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBookingCategory('package');
                    if (!selectedPackage && packages.length > 0) setSelectedPackage(packages[0]);
                    setOccupiedNotice(null);
                  }}
                  className={`flex-1 py-3 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    bookingCategory === 'package'
                      ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-300'
                      : 'text-[#c3ccc0] hover:text-[#ebe5de] hover:bg-[#132016]'
                  }`}
                >
                  <Gift className="w-4 h-4 text-amber-200" />
                  <span>Resort Experience Packages</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#c3ccc0] block mb-1">Check-In Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  min={getTodayFormatted()}
                  onChange={(e) => handleCheckInChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#c3ccc0] block mb-1">Check-Out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  min={getTomorrowFormatted(checkInDate)}
                  onChange={(e) => handleCheckOutChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1c2a20] border border-[#606e60] flex items-center justify-between text-xs text-[#c3ccc0]">
              <span>Total Duration:</span>
              <span className="text-[#ad9e92] font-bold text-sm font-serif">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#c3ccc0] block mb-1">Adult Guests</label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#c3ccc0] block mb-1">Child Guests</label>
                <select
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-3.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4 transition-colors"
            >
              <span>CONTINUE TO {bookingCategory === 'package' ? 'PACKAGE SELECTION' : 'ROOM SELECTION'}</span>
              <ArrowRight className="w-4 h-4 text-[#1c2a20]" />
            </button>
          </div>
        )}

        {/* Step 2: Choose Room/Package & Add-Ons */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
                {bookingCategory === 'package' ? (
                  <>
                    <Gift className="w-5 h-5 text-amber-300" />
                    Step 2: Choose Your Resort Package
                  </>
                ) : (
                  <>
                    <BedDouble className="w-5 h-5 text-[#ad9e92]" />
                    Step 2: Select Accommodation Unit
                  </>
                )}
              </h4>

              {/* Mode Switcher pill */}
              <div className="flex bg-[#132016] p-1 rounded-xl border border-[#606e60]/60 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setBookingCategory('room');
                    setSelectedPackage(null);
                    if (!selectedRoom && rooms.length > 0) setSelectedRoom(rooms[0]);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    bookingCategory === 'room' ? 'bg-[#ad9e92] text-[#1c2a20]' : 'text-[#c3ccc0]'
                  }`}
                >
                  Rooms
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookingCategory('package');
                    if (!selectedPackage && packages.length > 0) setSelectedPackage(packages[0]);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    bookingCategory === 'package' ? 'bg-amber-600 text-white' : 'text-[#c3ccc0]'
                  }`}
                >
                  Packages
                </button>
              </div>
            </div>

            {/* IF BOOKING CATEGORY IS ROOM */}
            {bookingCategory === 'room' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-wider">Select Accommodation</label>
                  
                  {/* Category Filters */}
                  <div className="flex flex-wrap gap-1">
                    {(['All', 'Cottages', 'Filipino Kubos', 'Rooms and Suites'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setModalCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          modalCategoryFilter === cat
                            ? 'bg-[#ad9e92] text-[#1c2a20] shadow-sm'
                            : 'bg-[#132016] text-[#c3ccc0] hover:bg-[#1c2a20] border border-[#606e60]/60'
                        }`}
                      >
                        {cat === 'Rooms and Suites' ? 'Rooms' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {rooms
                    .filter((r) => modalCategoryFilter === 'All' || (r.category || 'Rooms and Suites') === modalCategoryFilter)
                    .map((r) => {
                      const isSelected = selectedRoom?.id === r.id && bookingCategory === 'room';
                      const occStatus = checkRoomOccupied(r.id, checkInDate, checkOutDate, rooms, bookings);
                      const isOccupied = occStatus.isOccupied;

                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            setSelectedRoom(r);
                            setSelectedPackage(null);
                            if (isOccupied) {
                              setOccupiedNotice(occStatus.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE);
                            } else {
                              setOccupiedNotice(null);
                            }
                          }}
                          className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isOccupied
                              ? isSelected
                                ? 'bg-red-950/80 border-red-500 text-white shadow-lg'
                                : 'bg-[#181214] border-red-900/60 text-[#c3ccc0] hover:bg-red-950/40'
                              : isSelected
                                ? 'bg-[#1c2a20] border-[#ad9e92] text-[#ebe5de] shadow-lg'
                                : 'bg-[#132016] border-[#606e60]/60 text-[#c3ccc0] hover:bg-[#1c2a20]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={r.featuredImage} alt="" className="w-16 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <div>
                              <div className="flex items-center flex-wrap gap-1.5">
                                <h5 className="font-bold text-sm text-[#ebe5de] font-serif">{r.name}</h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2d4536] text-[#ebe5de]">
                                  {r.category || 'Rooms and Suites'}
                                </span>
                                {r.isComingSoon ? (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-600 text-white uppercase tracking-wider flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-200" />
                                    Currently Unavailable (Coming Soon)
                                  </span>
                                ) : isOccupied ? (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-200" />
                                    Occupied / Reserved
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-[#c3ccc0]">{r.bedType} • Max {r.maxGuests} guests</p>
                              {r.isComingSoon ? (
                                <p className="text-[10px] text-amber-300 font-semibold mt-0.5">
                                  {r.comingSoonNotice || 'Currently Unavailable - Coming Soon'}
                                </p>
                              ) : isOccupied ? (
                                <p className="text-[10px] text-red-300 font-semibold mt-0.5">
                                  Reserved / Occupied for selected dates
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-[#ad9e92] text-base font-serif">₱{r.pricePerNight.toLocaleString()}</span>
                            <span className="text-[10px] text-[#c3ccc0] block">{r.category === 'Cottages' ? '/ day' : '/ night'}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* IF BOOKING CATEGORY IS PACKAGE */}
            {bookingCategory === 'package' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-wider">
                    Select All-Inclusive Package ({packages.length} Available)
                  </label>
                  <span className="text-[11px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    Includes Special Resort Inclusions
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setOccupiedNotice(null);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-4 ${
                          isSelected
                            ? 'bg-[#1c2a20] border-amber-500 text-[#ebe5de] shadow-xl ring-2 ring-amber-500/40'
                            : 'bg-[#132016] border-[#606e60]/60 text-[#c3ccc0] hover:bg-[#1c2a20]'
                        }`}
                      >
                        <div className="sm:w-40 h-32 shrink-0 rounded-xl overflow-hidden relative border border-[#606e60]/40">
                          <img src={pkg.featuredImage} alt={pkg.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {pkg.isPopular && (
                            <span className="absolute top-2 left-2 bg-amber-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow-md flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-200" /> Popular
                            </span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-base text-[#ebe5de] font-serif flex items-center gap-2">
                                {pkg.name}
                                {isSelected && (
                                  <span className="text-[10px] bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3 text-white" /> Selected
                                  </span>
                                )}
                              </h5>
                              <span className="text-[11px] text-[#ad9e92] font-semibold">{pkg.duration} • Rec. {pkg.recommendedGuests}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-amber-300 text-xl font-serif">₱{pkg.price.toLocaleString()}</span>
                              <span className="text-[10px] text-[#c3ccc0] block">package rate</span>
                            </div>
                          </div>

                          <p className="text-xs text-[#c3ccc0]">{pkg.description}</p>

                          {/* Inclusions summary */}
                          <div className="pt-2 border-t border-[#606e60]/40">
                            <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider block mb-1">
                              Package Inclusions:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#c3ccc0]">
                              {pkg.inclusions.map((inc, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <Check className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="truncate">{inc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional Attached Accommodation for Package */}
                <div className="p-4 rounded-2xl bg-[#1c2a20] border border-[#606e60]/60 space-y-2 mt-4">
                  <label className="text-xs font-semibold text-[#ebe5de] flex items-center justify-between">
                    <span>Prefer Specific Room or Kubo for this Package? (Optional)</span>
                    <span className="text-[10px] text-[#ad9e92] font-semibold">Standard package unit included</span>
                  </label>
                  <select
                    value={selectedRoom?.id || ''}
                    onChange={(e) => {
                      const found = rooms.find((r) => r.id === e.target.value);
                      setSelectedRoom(found || null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#132016] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                  >
                    <option value="">Standard Package Assigned Unit (Default)</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.category || 'Rooms'}) - {r.bedType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Optional Add-on Services */}
            <div className="space-y-3 pt-4 border-t border-[#606e60]/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-wider block">
                  Enhance Your Stay (Optional Add-Ons)
                </label>
                <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  Optional Experiences
                </span>
              </div>

              <div className="space-y-2.5">
                {ADD_ON_SERVICES.map((addon) => {
                  const isChecked = !!selectedAddOns[addon.id];
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`p-3.5 rounded-2xl border flex items-start justify-between cursor-pointer transition-all gap-3 ${
                        isChecked
                          ? 'bg-[#1c2a20] border-amber-500 text-[#ebe5de] shadow-md ring-1 ring-amber-500/30'
                          : 'bg-[#132016] border-[#606e60]/60 hover:bg-[#1c2a20]'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="w-4 h-4 mt-0.5 accent-amber-500 cursor-pointer shrink-0"
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#ebe5de] flex items-center gap-1.5">
                            {addon.icon && <span className="text-sm">{addon.icon}</span>}
                            <span>{addon.name}</span>
                          </p>
                          <p className="text-[11px] text-[#c3ccc0] leading-snug">{addon.description}</p>
                          {addon.note && (
                            <p className="text-[10px] text-amber-300/90 italic font-medium pt-0.5">
                              * {addon.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {addon.price > 0 ? (
                          <span className="text-xs font-bold text-amber-300">
                            +₱{addon.price.toLocaleString()}{' '}
                            <span className="text-[10px] text-[#c3ccc0] font-normal block">({addon.unit})</span>
                          </span>
                        ) : (
                          <span className="text-xs font-extrabold text-amber-300/90 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50 block">
                            {addon.priceDisplay || 'Rate upon request'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-amber-200/90 italic bg-[#1c2a20]/80 p-2.5 rounded-xl border border-[#606e60]/40 mt-3">
                * Note: All add-ons are subject to availability. Advance reservation is recommended for activities and special setups.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handlePrevStep}
                className="py-3 px-4 rounded-xl bg-[#1c2a20] border border-[#606e60] text-[#c3ccc0] font-bold text-xs uppercase"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 py-3.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
              >
                <span>CONTINUE TO GUEST INFO</span>
                <ArrowRight className="w-4 h-4 text-[#1c2a20]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Guest Information */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <h4 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#ad9e92]" />
              Step 3: Guest Information
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#c3ccc0] block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#c3ccc0] block mb-1">Mobile Contact Number *</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 09171234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#c3ccc0] block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. guest@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#c3ccc0] block mb-1">Special Requests / Notes</label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Airport shuttle timing, flower setup, late check-in request, dietary requirements..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handlePrevStep}
                className="py-3 px-4 rounded-xl bg-[#1c2a20] border border-[#606e60] text-[#c3ccc0] font-bold text-xs uppercase"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 py-3.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
              >
                <span>REVIEW SUMMARY & PAYMENT</span>
                <ArrowRight className="w-4 h-4 text-[#1c2a20]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Booking Summary & Payment Choice */}
        {step === 4 && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            <h4 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#ad9e92]" />
              Step 4: Review Summary & Select Payment Mode
            </h4>

            {/* Summary Box */}
            <div className="p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] space-y-4">
              <div className="flex justify-between items-start border-b border-[#606e60]/60 pb-3">
                <div>
                  <h5 className="font-bold text-base text-[#ebe5de] font-serif">
                    {selectedPackage ? selectedPackage.name : selectedRoom?.name}
                  </h5>
                  <p className="text-xs text-[#c3ccc0]">
                    {checkInDate} to {checkOutDate} ({nights} {nights === 1 ? 'Night' : 'Nights'})
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#c3ccc0] bg-[#132016] px-2.5 py-1 rounded border border-[#606e60]">
                  {adults} Adults, {children} Kids
                </span>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-[#c3ccc0]">
                <div className="flex justify-between">
                  <span>Room Charge ({nights} nights):</span>
                  <span className="font-bold text-[#ebe5de]">₱{subtotal.toLocaleString()}</span>
                </div>

                {activeAddOnsList.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-[#606e60]/60">
                    <span className="text-[#c3ccc0] font-semibold block">Add-On Services:</span>
                    {activeAddOnsList.map((addon) => (
                      <div key={addon.id} className="flex justify-between pl-2 text-[#ad9e92]">
                        <span>• {addon.name}</span>
                        <span>+₱{addon.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-[#606e60]/60 text-[#c3ccc0]">
                  <span>Estimated Taxes & Sanctuary Fee (12%):</span>
                  <span>₱{taxAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-[#606e60] text-sm font-bold text-[#ad9e92]">
                  <span>Total Amount Due:</span>
                  <span className="text-lg font-serif">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-wider block">
                Payment Option Mode
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentSettings.allowPartialDeposit && (
                  <div
                    onClick={() => setPaymentMethod('Partial Deposit (50%)')}
                    className={`p-3.5 rounded-2xl border cursor-pointer text-xs transition-all ${
                      paymentMethod === 'Partial Deposit (50%)'
                        ? 'bg-[#ad9e92] text-[#1c2a20] font-extrabold border-[#c3ccc0] shadow-md'
                        : 'bg-[#1c2a20] text-[#c3ccc0] border-[#606e60]/60 hover:bg-[#25362a]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-bold">Partial Deposit ({paymentSettings.partialDepositPercentage || 50}%)</span>
                    </div>
                    <p className="text-[10px] opacity-90">
                      Pay ₱{Math.round(totalAmount * ((paymentSettings.partialDepositPercentage || 50) / 100)).toLocaleString()} online now
                    </p>
                  </div>
                )}

                {paymentSettings.allowFullPayment && (
                  <div
                    onClick={() => setPaymentMethod('Full Payment')}
                    className={`p-3.5 rounded-2xl border cursor-pointer text-xs transition-all ${
                      paymentMethod === 'Full Payment'
                        ? 'bg-[#ad9e92] text-[#1c2a20] font-extrabold border-[#c3ccc0] shadow-md'
                        : 'bg-[#1c2a20] text-[#c3ccc0] border-[#606e60]/60 hover:bg-[#25362a]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold">Full Online Payment</span>
                    </div>
                    <p className="text-[10px] opacity-90">
                      Pay ₱{totalAmount.toLocaleString()} in full
                    </p>
                  </div>
                )}

                {paymentSettings.allowPayAtResort && (
                  <div
                    onClick={() => setPaymentMethod('Pay at Resort')}
                    className={`p-3.5 rounded-2xl border cursor-pointer text-xs transition-all ${
                      paymentMethod === 'Pay at Resort'
                        ? 'bg-[#ad9e92] text-[#1c2a20] font-extrabold border-[#c3ccc0] shadow-md'
                        : 'bg-[#1c2a20] text-[#c3ccc0] border-[#606e60]/60 hover:bg-[#25362a]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building2 className="w-4 h-4" />
                      <span className="font-bold">Pay at Resort</span>
                    </div>
                    <p className="text-[10px] opacity-90">
                      Pay balance upon check-in
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Online Payment Details & Channel Selection */}
            {paymentMethod !== 'Pay at Resort' && (
              <div className="space-y-4 p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] shadow-md">
                <label className="text-xs font-bold text-[#ad9e92] uppercase tracking-wider block flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Select Online Payment Channel (GCash or BPI)
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentChannel('GCash')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-all ${
                      selectedPaymentChannel === 'GCash'
                        ? 'bg-[#ad9e92] text-[#1c2a20] border-[#c3ccc0] shadow-lg'
                        : 'bg-[#132016] text-[#c3ccc0] border-[#606e60]/60 hover:bg-[#25362a]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>GCash Mobile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentChannel('BPI')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-all ${
                      selectedPaymentChannel === 'BPI'
                        ? 'bg-[#ad9e92] text-[#1c2a20] border-[#c3ccc0] shadow-lg'
                        : 'bg-[#132016] text-[#c3ccc0] border-[#606e60]/60 hover:bg-[#25362a]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>BPI Bank Transfer</span>
                  </button>
                </div>

                {/* Account Details Box */}
                {selectedPaymentChannel === 'GCash' && (
                  <div className="p-4 rounded-xl bg-[#132016] border border-[#606e60]/60 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#ad9e92] font-bold uppercase tracking-wider block">Official GCash Account</span>
                        <p className="font-bold text-base font-serif text-[#ebe5de]">{paymentSettings.gcash.accountName || 'SLTT ESTANCIAS RESORT'}</p>
                        <p className="font-mono text-sm text-[#ad9e92] font-bold">{paymentSettings.gcash.accountNumber || '09054965912'}</p>
                        <p className="text-[11px] text-[#c3ccc0] mt-1">{paymentSettings.gcash.instructions}</p>
                      </div>

                      {paymentSettings.gcash.qrCodeUrl && (
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-white p-1 border border-[#606e60] shadow-md">
                          <img src={paymentSettings.gcash.qrCodeUrl} alt="GCash QR Code" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedPaymentChannel === 'BPI' && (
                  <div className="p-4 rounded-xl bg-[#132016] border border-[#606e60]/60 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#ad9e92] font-bold uppercase tracking-wider block">Official BPI Account</span>
                        <p className="font-bold text-base font-serif text-[#ebe5de]">{paymentSettings.bpi.accountName || 'SLTT ESTANCIAS LEISURE CORP'}</p>
                        <p className="font-mono text-sm text-[#ad9e92] font-bold">{paymentSettings.bpi.accountNumber || '1234-5678-90'}</p>
                        <p className="text-[11px] text-[#c3ccc0] mt-1">{paymentSettings.bpi.instructions}</p>
                      </div>

                      {paymentSettings.bpi.qrCodeUrl && (
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-white p-1 border border-[#606e60] shadow-md">
                          <img src={paymentSettings.bpi.qrCodeUrl} alt="BPI QR Code" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Proof of Payment / Receipt Upload */}
                <div className="space-y-3 pt-2 border-t border-[#606e60]/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#ebe5de] uppercase tracking-wider block flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#ad9e92]" />
                      Upload Payment Receipt / Proof of Transfer
                    </label>
                    <span className="text-[10px] text-[#ad9e92]">JPG, PNG, WebP</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#c3ccc0] block mb-1">Transaction Ref # (e.g. GCash Ref No)</label>
                      <input
                        type="text"
                        value={paymentReferenceCode}
                        onChange={(e) => setPaymentReferenceCode(e.target.value)}
                        placeholder="e.g. 100987654321"
                        className="w-full px-3 py-2 rounded-xl bg-[#132016] border border-[#606e60]/60 text-xs text-[#ebe5de] font-mono focus:outline-none focus:border-[#c3ccc0]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#c3ccc0] block mb-1">Upload Receipt File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptFileUpload}
                        className="w-full text-xs text-[#c3ccc0] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Receipt Preview if uploaded */}
                  {paymentReceiptUrl ? (
                    <div className="relative p-2 rounded-xl bg-[#132016] border border-[#ad9e92] flex items-center gap-3">
                      <img src={paymentReceiptUrl} alt="Payment Receipt" className="w-16 h-16 rounded-lg object-cover border border-[#606e60]" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#ad9e92]">Payment Receipt Uploaded!</p>
                        <p className="text-[10px] text-[#c3ccc0]">Ready to attach to reservation request.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentReceiptUrl('')}
                        className="p-1.5 rounded-lg bg-[#1c2a20] text-[#ad9e92] hover:text-[#ebe5de]"
                        title="Remove Receipt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#132016]/60 border border-dashed border-[#606e60]/60 text-center text-[11px] text-[#c3ccc0]/80">
                      You may upload your screenshot or receipt now, or attach it later in "Track Reservation".
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handlePrevStep}
                className="py-3 px-4 rounded-xl bg-[#1c2a20] border border-[#606e60] text-[#c3ccc0] font-bold text-xs uppercase"
              >
                Back
              </button>
              <button
                onClick={handleFinalSubmitBooking}
                className="flex-1 py-3.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#1c2a20]" />
                <span>CONFIRM BOOKING REQUEST</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Final Confirmation & Download Voucher */}
        {step === 5 && createdBooking && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1c2a20] border-2 border-[#ad9e92] flex items-center justify-center text-[#ad9e92] mx-auto shadow-2xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-widest bg-[#1c2a20] px-3 py-1 rounded-full border border-[#606e60]">
                Reservation Confirmed
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#ebe5de] mt-2">
                Booking Request Submitted!
              </h3>
              <p className="text-xs text-[#c3ccc0] mt-1">
                Your booking reference number is:
              </p>
              <div className="mt-3 inline-block px-5 py-2.5 rounded-xl bg-[#1c2a20] border-2 border-[#ad9e92] text-[#ad9e92] font-bold font-mono text-xl tracking-wider shadow-inner">
                {createdBooking.referenceNumber}
              </div>
            </div>

            {/* Complete Summary Box */}
            <div className="p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] text-left text-xs space-y-2 text-[#c3ccc0]">
              <div className="grid grid-cols-2 gap-2 border-b border-[#606e60]/60 pb-2 font-medium">
                <div>Guest: <span className="text-[#ebe5de] font-bold">{createdBooking.guestName}</span></div>
                <div>Mobile: <span className="text-[#ebe5de]">{createdBooking.mobile}</span></div>
                <div>Room: <span className="text-[#ad9e92] font-bold">{createdBooking.roomName}</span></div>
                <div>Dates: <span className="text-[#ebe5de]">{createdBooking.checkInDate} to {createdBooking.checkOutDate}</span></div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span>Total Amount:</span>
                <span className="text-[#ad9e92] font-bold text-base font-serif">₱{createdBooking.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[#c3ccc0]">
                <span>Payment Choice:</span>
                <span className="font-semibold text-[#ad9e92]">{createdBooking.paymentMethod}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handlePrintVoucher}
                className="py-3 px-4 rounded-xl bg-[#1c2a20] border border-[#606e60] text-[#ad9e92] hover:text-[#ebe5de] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Download Confirmation Voucher</span>
              </button>

              <a
                href={`tel:${resortInfo.contactNumber}`}
                className="py-3 px-4 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#1c2a20]" />
                <span>Contact Resort Front Desk</span>
              </a>
            </div>

            <button
              onClick={handleClose}
              className="text-xs text-[#c3ccc0] hover:text-[#ebe5de] underline pt-2 block mx-auto"
            >
              Return to Website Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
