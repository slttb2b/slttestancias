import React, { useState, useEffect } from 'react';
import { useResort } from '../context/ResortContext';
import { Room, Package, Booking, PaymentMethod, PaymentChannel } from '../types';
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
  Plus,
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
    addOns,
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
  const [selectedRooms, setSelectedRooms] = useState<Room[]>(
    selectedRoomForBooking ? [selectedRoomForBooking] : rooms.length > 0 ? [rooms[0]] : []
  );
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(selectedPackageForBooking);
  const [additionalPackageRooms, setAdditionalPackageRooms] = useState<Room[]>([]);
  const [modalCategoryFilter, setModalCategoryFilter] = useState<'All' | 'Rooms and Suites' | 'Cottages' | 'Filipino Kubos' | 'Packages'>('All');

  // Status helper for rooms in catalog
  const getAccommodationStatus = (room: Room) => {
    if (room.isComingSoon) {
      return {
        status: 'coming_soon' as const,
        label: 'Coming Soon',
        sublabel: room.comingSoonNotice || 'Opening Soon - Not Bookable Yet',
        badgeBg: 'bg-amber-600/90 text-white border border-amber-400/50',
        dotBg: 'bg-amber-300',
        canBook: false,
      };
    }

    const effectiveIn = checkInDate || getTodayFormatted();
    const effectiveOut = checkOutDate || getTomorrowFormatted(effectiveIn);
    const occ = checkRoomOccupied(room.id, effectiveIn, effectiveOut, rooms, bookings);

    if (occ.isOccupied) {
      return {
        status: 'occupied' as const,
        label: 'Occupied',
        sublabel: occ.reason || 'Currently Reserved',
        badgeBg: 'bg-red-600/90 text-white border border-red-400/50',
        dotBg: 'bg-red-300',
        canBook: true,
      };
    }

    return {
      status: 'available' as const,
      label: 'Non-Occupied / Available',
      sublabel: 'Available for Booking',
      badgeBg: 'bg-emerald-600/90 text-white border border-emerald-400/50',
      dotBg: 'bg-emerald-300',
      canBook: true,
    };
  };

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
      setSelectedRooms([]);
      setAdditionalPackageRooms([]);
      setBookingCategory('package');
    } else if (selectedRoomForBooking) {
      setSelectedRooms([selectedRoomForBooking]);
      setSelectedPackage(null);
      setAdditionalPackageRooms([]);
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
  const totalGuests = (adults || 1) + (children || 0);

  // Helper to extract base capacity of a package
  const getPackageBaseCapacity = (pkg: Package | null): number => {
    if (!pkg) return 0;
    const textToCheck = `${pkg.tagline || ''} ${pkg.recommendedGuests || ''}`;
    const numbers = textToCheck.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return Math.max(...numbers.map(Number));
    }
    return 6;
  };

  // Capacity calculation
  const totalAllocatedCapacity = bookingCategory === 'room'
    ? selectedRooms.reduce((acc, r) => acc + (r.maxGuests || 0), 0)
    : getPackageBaseCapacity(selectedPackage) + additionalPackageRooms.reduce((acc, r) => acc + (r.maxGuests || 0), 0);

  const isCapacityExceeded = totalGuests > totalAllocatedCapacity;
  const capacityShortage = Math.max(0, totalGuests - totalAllocatedCapacity);

  // Room / Package Rate Calculations
  const roomRatePerNight = bookingCategory === 'package'
    ? (selectedPackage?.price || 0) + (additionalPackageRooms.reduce((acc, r) => acc + r.pricePerNight, 0))
    : selectedRooms.reduce((acc, r) => acc + r.pricePerNight, 0);

  const subtotal = bookingCategory === 'package'
    ? (selectedPackage?.price || 0) + (additionalPackageRooms.reduce((acc, r) => acc + r.pricePerNight, 0) * nights)
    : roomRatePerNight * nights;

  // Multi-room management helpers
  const handleAddAccommodation = (room: Room) => {
    const occ = checkRoomOccupied(room.id, checkInDate, checkOutDate, rooms, bookings);
    if (occ.isOccupied) {
      setOccupiedNotice(occ.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE);
      return;
    }
    setOccupiedNotice(null);
    if (bookingCategory === 'room') {
      setSelectedRooms((prev) => [...prev, room]);
    } else {
      setAdditionalPackageRooms((prev) => [...prev, room]);
    }
  };

  const handleRemoveAccommodation = (index: number) => {
    setOccupiedNotice(null);
    if (bookingCategory === 'room') {
      if (selectedRooms.length <= 1) return;
      setSelectedRooms((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAdditionalPackageRooms((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSelectPrimaryRoom = (room: Room) => {
    const occ = checkRoomOccupied(room.id, checkInDate, checkOutDate, rooms, bookings);
    if (occ.isOccupied) {
      setOccupiedNotice(occ.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE);
      return;
    }
    setOccupiedNotice(null);
    setSelectedRooms([room]);
  };

  // Calculate Add-ons
  const availableAddOns = addOns.filter((a) => a.isActive !== false);
  const activeAddOnsList = availableAddOns.filter((a) => selectedAddOns[a.id]).map((a) => {
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
      if (bookingCategory === 'package') {
        if (!selectedPackage) {
          setOccupiedNotice('Please select a resort package to proceed.');
          return;
        }
      } else {
        if (selectedRooms.length === 0) {
          setOccupiedNotice('Please select an accommodation unit (room, cottage, or kubo) to proceed.');
          return;
        }
        const hasComingSoon = selectedRooms.some((r) => r.isComingSoon);
        if (hasComingSoon) {
          setOccupiedNotice('The selected unit is Coming Soon and not yet accepting reservations. Please choose an available unit.');
          return;
        }
      }
      setOccupiedNotice(null);
      setStep(2);
    } else if (step === 2) {
      const dateValidation = validateBookingDates(checkInDate, checkOutDate);
      if (!dateValidation.isValid) {
        setOccupiedNotice(dateValidation.errorMessage || 'Invalid date range selected.');
        return;
      }

      if (bookingCategory === 'room') {
        for (const rm of selectedRooms) {
          const occ = checkRoomOccupied(rm.id, checkInDate, checkOutDate, rooms, bookings);
          if (occ.isOccupied) {
            setOccupiedNotice(`Unit "${rm.name}" is occupied or unavailable for your selected dates (${checkInDate} to ${checkOutDate}). Please choose different dates or return to Step 1 to choose another unit.`);
            return;
          }
        }
      }

      // CAPACITY ENFORCEMENT
      if (isCapacityExceeded) {
        setOccupiedNotice(`Capacity limit exceeded: Your party has ${totalGuests} guests (${adults} Adults, ${children} Children), but your allocated accommodation only accommodates ${totalAllocatedCapacity} guests. Please add additional cottages, kubos, or rooms below to cover the remaining ${capacityShortage} guest(s).`);
        return;
      }

      setOccupiedNotice(null);
      setStep(3);
    } else if (step === 3) {
      setOccupiedNotice(null);
      setStep(4);
    } else if (step === 4) {
      if (!guestName || !mobile) {
        setOccupiedNotice('Please fill in your Full Name and Mobile Contact Number.');
        return;
      }
      setOccupiedNotice(null);
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    setOccupiedNotice(null);
    if (step > 1 && step < 6) {
      setStep(step - 1);
    }
  };

  const handleFinalSubmitBooking = () => {
    const dateValidation = validateBookingDates(checkInDate, checkOutDate);
    if (!dateValidation.isValid) {
      setOccupiedNotice(dateValidation.errorMessage || 'Invalid date range selected.');
      setStep(2);
      return;
    }

    if (isCapacityExceeded) {
      setOccupiedNotice(`Capacity limit exceeded: Your group has ${totalGuests} guests, but your allocated capacity is ${totalAllocatedCapacity}. Please add more accommodation units.`);
      setStep(2);
      return;
    }

    const randomRefNum = `SLTT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const allocatedList = bookingCategory === 'room'
      ? selectedRooms.map((r) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          pricePerNight: r.pricePerNight,
          maxGuests: r.maxGuests,
        }))
      : [
          ...(selectedPackage ? [{
            id: selectedPackage.id,
            name: `[Package] ${selectedPackage.name}`,
            category: 'Package',
            pricePerNight: selectedPackage.price,
            maxGuests: getPackageBaseCapacity(selectedPackage),
          }] : []),
          ...additionalPackageRooms.map((r) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            pricePerNight: r.pricePerNight,
            maxGuests: r.maxGuests,
          })),
        ];

    const displayUnitName = bookingCategory === 'package'
      ? `[Package] ${selectedPackage?.name || 'Resort Package'}${additionalPackageRooms.length > 0 ? ` + ${additionalPackageRooms.map(r => r.name).join(', ')}` : ''}`
      : selectedRooms.length === 1
        ? selectedRooms[0].name
        : selectedRooms.map((r) => r.name).join(' + ');

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      referenceNumber: randomRefNum,
      createdAt: new Date().toISOString(),
      guestName,
      email,
      mobile,
      roomId: bookingCategory === 'package' ? (selectedPackage?.id || 'pkg-deal') : (selectedRooms[0]?.id || 'room-deluxe'),
      roomName: `${displayUnitName} (Cap: ${totalAllocatedCapacity} Guests)`,
      roomPricePerNight: roomRatePerNight,
      checkInDate,
      checkOutDate,
      numberOfNights: nights,
      adultsCount: adults,
      childrenCount: children,
      allocatedRooms: allocatedList,
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
    setStep(6); // Confirmation Screen
  };

  const handleClose = () => {
    setIsBookingModalOpen(false);
    setStep(1);
    setCreatedBooking(null);
    setOccupiedNotice(null);
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
              <p className="text-[11px] text-[#c3ccc0]">{step < 6 ? `Step ${step} of 5` : 'Booking Request Confirmed'}</p>
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
        {step < 6 && (
          <div className="bg-[#132016] px-4 sm:px-6 py-3 border-b border-[#606e60]/60 flex items-center justify-between text-xs text-[#c3ccc0]/80 overflow-x-auto gap-2">
            <span className={`flex items-center gap-1 shrink-0 ${step >= 1 ? 'text-[#ad9e92] font-bold' : ''}`}>
              1. Choose Unit/Package
            </span>
            <span className="shrink-0 text-[#606e60]">→</span>
            <span className={`flex items-center gap-1 shrink-0 ${step >= 2 ? 'text-[#ad9e92] font-bold' : ''}`}>
              2. Dates & Guests
            </span>
            <span className="shrink-0 text-[#606e60]">→</span>
            <span className={`flex items-center gap-1 shrink-0 ${step >= 3 ? 'text-[#ad9e92] font-bold' : ''}`}>
              3. Add-Ons
            </span>
            <span className="shrink-0 text-[#606e60]">→</span>
            <span className={`flex items-center gap-1 shrink-0 ${step >= 4 ? 'text-[#ad9e92] font-bold' : ''}`}>
              4. Guest Info
            </span>
            <span className="shrink-0 text-[#606e60]">→</span>
            <span className={`flex items-center gap-1 shrink-0 ${step >= 5 ? 'text-[#ad9e92] font-bold' : ''}`}>
              5. Payment
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

        {/* Step 1: Select Accommodation or Package (Catalog View) */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#606e60]/60 pb-4">
              <div>
                <h4 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-[#ad9e92]" />
                  Step 1: Choose Your Accommodation or Package
                </h4>
                <p className="text-xs text-[#c3ccc0] mt-1">
                  Explore our rooms, cottages, Filipino kubos, and packages. Select your choice to proceed to dates and guest setup.
                </p>
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                <span className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Non-Occupied / Available
                </span>
                <span className="flex items-center gap-1.5 bg-rose-950/80 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/50">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Occupied
                </span>
                <span className="flex items-center gap-1.5 bg-amber-950/80 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/50">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-wider block">
                Catalog Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'All', label: 'All Catalog' },
                  { id: 'Rooms and Suites', label: 'Rooms & Suites' },
                  { id: 'Cottages', label: 'Cottages' },
                  { id: 'Filipino Kubos', label: 'Filipino Kubos' },
                  { id: 'Packages', label: 'Resort Packages' },
                ].map((tab) => {
                  const isActive = modalCategoryFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setModalCategoryFilter(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#ad9e92] text-[#1c2a20] shadow-md ring-1 ring-[#c3ccc0]'
                          : 'bg-[#1c2a20] text-[#c3ccc0] hover:text-[#ebe5de] border border-[#606e60]/60 hover:bg-[#25362a]'
                      }`}
                    >
                      {tab.id === 'Packages' ? <Gift className="w-3.5 h-3.5" /> : <BedDouble className="w-3.5 h-3.5" />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Units Grid */}
            <div className="space-y-4">
              {/* 1. ROOMS / COTTAGES / KUBOS */}
              {modalCategoryFilter !== 'Packages' && (
                <div className="grid grid-cols-1 gap-3.5">
                  {rooms
                    .filter((r) => modalCategoryFilter === 'All' || r.category === modalCategoryFilter)
                    .map((r) => {
                      const statusInfo = getAccommodationStatus(r);
                      const isSelected = bookingCategory === 'room' && selectedRooms.some((selected) => selected.id === r.id);

                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            if (r.isComingSoon) {
                              setOccupiedNotice(`"${r.name}" is coming soon and not yet open for booking. Please select an available unit.`);
                              return;
                            }
                            setBookingCategory('room');
                            setSelectedRooms([r]);
                            setSelectedPackage(null);
                            setAdditionalPackageRooms([]);
                            setOccupiedNotice(null);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-4 ${
                            isSelected
                              ? 'bg-[#1c2a20] border-[#ad9e92] text-[#ebe5de] shadow-xl ring-2 ring-[#ad9e92]/50'
                              : 'bg-[#132016] border-[#606e60]/60 text-[#c3ccc0] hover:bg-[#1c2a20]'
                          }`}
                        >
                          {/* Image & Status Badge */}
                          <div className="sm:w-44 h-36 shrink-0 rounded-xl overflow-hidden relative border border-[#606e60]/40">
                            <img
                              src={r.featuredImage}
                              alt={r.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            {/* Status Badge */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 ${statusInfo.badgeBg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotBg}`}></span>
                                {statusInfo.label}
                              </span>
                            </div>

                            {/* Category pill */}
                            <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-[#132016]/90 text-[#c3ccc0] px-2 py-0.5 rounded backdrop-blur-sm border border-[#606e60]/40">
                              {r.category}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h5 className="font-bold text-base text-[#ebe5de] font-serif flex items-center gap-2">
                                    {r.name}
                                    {isSelected && (
                                      <span className="text-[10px] bg-[#ad9e92] text-[#1c2a20] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Check className="w-3 h-3 text-[#1c2a20]" /> Selected
                                      </span>
                                    )}
                                  </h5>
                                  <p className="text-xs text-[#c3ccc0] mt-0.5">{r.tagline || r.shortDescription}</p>
                                </div>

                                {/* Price */}
                                <div className="text-right shrink-0">
                                  <span className="font-bold text-[#ad9e92] text-lg font-serif">₱{r.pricePerNight.toLocaleString()}</span>
                                  <span className="text-[10px] text-[#c3ccc0] block">{r.category === 'Cottages' ? '/ day' : '/ night'}</span>
                                </div>
                              </div>

                              {/* Specs */}
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#ad9e92] mt-2">
                                <span className="px-2 py-0.5 rounded bg-[#1c2a20] border border-[#606e60]/60 font-medium">
                                  {r.bedType}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[#1c2a20] border border-[#606e60]/60 font-medium flex items-center gap-1">
                                  <Users className="w-3 h-3" /> Max {r.maxGuests} Guests
                                </span>
                                {r.sizeSqM && (
                                  <span className="px-2 py-0.5 rounded bg-[#1c2a20] border border-[#606e60]/60">
                                    {r.sizeSqM} m²
                                  </span>
                                )}
                              </div>

                              {/* Amenities preview */}
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {r.amenities.slice(0, 4).map((am, idx) => (
                                  <span key={idx} className="text-[10px] bg-[#132016] text-[#c3ccc0] px-2 py-0.5 rounded border border-[#606e60]/40">
                                    ✓ {am}
                                  </span>
                                ))}
                                {r.amenities.length > 4 && (
                                  <span className="text-[10px] text-[#ad9e92] px-1 py-0.5 font-semibold">
                                    +{r.amenities.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Notice and Selection Button */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#606e60]/40">
                              <span className="text-[11px]">
                                {r.isComingSoon ? (
                                  <span className="text-amber-300 font-semibold">{r.comingSoonNotice || 'Opening soon - bookings not open'}</span>
                                ) : statusInfo.status === 'occupied' ? (
                                  <span className="text-rose-300 font-semibold">{statusInfo.sublabel}</span>
                                ) : (
                                  <span className="text-emerald-300 font-semibold">Ready for booking</span>
                                )}
                              </span>

                              <div>
                                {r.isComingSoon ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="px-3.5 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-300 text-xs font-bold opacity-75 cursor-not-allowed"
                                  >
                                    Coming Soon
                                  </button>
                                ) : isSelected ? (
                                  <span className="px-3.5 py-1.5 rounded-lg bg-[#ad9e92] text-[#1c2a20] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                    <Check className="w-3.5 h-3.5" /> Selected
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setBookingCategory('room');
                                      setSelectedRooms([r]);
                                      setSelectedPackage(null);
                                      setAdditionalPackageRooms([]);
                                      setOccupiedNotice(null);
                                    }}
                                    className="px-3.5 py-1.5 rounded-lg bg-[#2d4536] hover:bg-[#3b5946] text-[#ebe5de] border border-[#606e60] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    Select Unit
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* 2. PACKAGES */}
              {(modalCategoryFilter === 'All' || modalCategoryFilter === 'Packages') && (
                <div className="space-y-3.5 pt-2">
                  {modalCategoryFilter === 'All' && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#606e60]/60">
                      <label className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-wider flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-amber-300" />
                        Resort Experience Packages ({packages.length} Available)
                      </label>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3.5">
                    {packages.map((pkg) => {
                      const isSelected = bookingCategory === 'package' && selectedPackage?.id === pkg.id;
                      const pkgCapacity = getPackageBaseCapacity(pkg);

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            setBookingCategory('package');
                            setSelectedPackage(pkg);
                            setSelectedRooms([]);
                            setAdditionalPackageRooms([]);
                            setOccupiedNotice(null);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-4 ${
                            isSelected
                              ? 'bg-[#1c2a20] border-amber-500 text-[#ebe5de] shadow-xl ring-2 ring-amber-500/40'
                              : 'bg-[#132016] border-[#606e60]/60 text-[#c3ccc0] hover:bg-[#1c2a20]'
                          }`}
                        >
                          {/* Image & Status Badge */}
                          <div className="sm:w-44 h-36 shrink-0 rounded-xl overflow-hidden relative border border-[#606e60]/40">
                            <img
                              src={pkg.featuredImage}
                              alt={pkg.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 bg-emerald-600/90 text-white border border-emerald-400/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                                Non-Occupied / Available
                              </span>
                              {pkg.isPopular && (
                                <span className="bg-amber-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow-md flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-200" /> Popular
                                </span>
                              )}
                            </div>

                            <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-[#132016]/90 text-[#c3ccc0] px-2 py-0.5 rounded backdrop-blur-sm border border-[#606e60]/40">
                              Package
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 flex flex-col justify-between space-y-2">
                            <div>
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
                                  <span className="text-[11px] text-[#ad9e92] font-semibold">
                                    {pkg.duration} • {pkg.tagline || `Base: ${pkg.recommendedGuests}`} (Max ~{pkgCapacity} guests)
                                  </span>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-bold text-amber-300 text-xl font-serif">₱{pkg.price.toLocaleString()}</span>
                                  <span className="text-[10px] text-[#c3ccc0] block">package rate</span>
                                </div>
                              </div>

                              <p className="text-xs text-[#c3ccc0] mt-1">{pkg.description}</p>

                              {/* Inclusions summary */}
                              <div className="pt-2 border-t border-[#606e60]/40 mt-2">
                                <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider block mb-1">
                                  Package Inclusions:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#c3ccc0]">
                                  {pkg.inclusions.slice(0, 4).map((inc, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <Check className="w-3 h-3 text-amber-400 shrink-0" />
                                      <span className="truncate">{inc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#606e60]/40">
                              <span className="text-[11px] text-emerald-300 font-semibold">
                                Ready for instant booking
                              </span>

                              <div>
                                {isSelected ? (
                                  <span className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                    <Check className="w-3.5 h-3.5" /> Selected
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setBookingCategory('package');
                                      setSelectedPackage(pkg);
                                      setSelectedRooms([]);
                                      setAdditionalPackageRooms([]);
                                      setOccupiedNotice(null);
                                    }}
                                    className="px-3.5 py-1.5 rounded-lg bg-[#2d4536] hover:bg-[#3b5946] text-[#ebe5de] border border-[#606e60] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    Select Package
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Selection Summary & Continue CTA */}
            <div className="sticky bottom-0 bg-[#132016]/95 backdrop-blur-md p-4 rounded-2xl border-2 border-[#ad9e92]/70 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-[#ad9e92] tracking-wider block">
                  Current Selection:
                </span>
                <p className="font-bold text-sm text-[#ebe5de] font-serif">
                  {bookingCategory === 'package' && selectedPackage ? (
                    <span>[Package] {selectedPackage.name} (₱{selectedPackage.price.toLocaleString()})</span>
                  ) : selectedRooms.length > 0 ? (
                    <span>{selectedRooms[0].name} ({selectedRooms[0].category}) • ₱{selectedRooms[0].pricePerNight.toLocaleString()}{selectedRooms[0].category === 'Cottages' ? '/day' : '/night'}</span>
                  ) : (
                    <span className="text-[#c3ccc0] font-normal italic">Please select an accommodation or package above</span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors shrink-0"
              >
                <span>CONTINUE TO DATES & GUESTS</span>
                <ArrowRight className="w-4 h-4 text-[#1c2a20]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Schedule Dates & Guest Count */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-[#606e60]/60 pb-4">
              <div>
                <h4 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#ad9e92]" />
                  Step 2: Set Stay Dates & Party Size
                </h4>
                <p className="text-xs text-[#c3ccc0] mt-1">
                  Specify your arrival date, departure date, and guest count.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] text-[#ad9e92] hover:text-[#ebe5de] text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                ← Change Selection
              </button>
            </div>

            {/* Selected Unit / Package Highlight Card */}
            <div className="p-4 rounded-2xl bg-[#1c2a20] border border-[#ad9e92]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#132016] border border-[#606e60] flex items-center justify-center text-[#ad9e92] shrink-0">
                  {bookingCategory === 'package' ? <Gift className="w-5 h-5 text-amber-300" /> : <BedDouble className="w-5 h-5 text-[#ad9e92]" />}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#ad9e92] tracking-wider block">
                    {bookingCategory === 'package' ? 'Selected Package' : 'Selected Primary Unit'}
                  </span>
                  <h5 className="font-bold text-sm text-[#ebe5de] font-serif">
                    {bookingCategory === 'package'
                      ? selectedPackage?.name
                      : selectedRooms.map((r) => r.name).join(' + ')}
                  </h5>
                  <p className="text-[11px] text-[#c3ccc0]">
                    {bookingCategory === 'package'
                      ? `${selectedPackage?.duration} • Rate: ₱${selectedPackage?.price.toLocaleString()}`
                      : `Rate: ₱${roomRatePerNight.toLocaleString()}/night • Base Capacity: ${selectedRooms.reduce((acc, r) => acc + r.maxGuests, 0)} guests`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#ad9e92] hover:text-[#ebe5de] underline font-medium self-start sm:self-center cursor-pointer"
              >
                Browse other options
              </button>
            </div>

            {/* Date Pickers */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-wider block">
                Stay Schedule
              </label>
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

              <div className="p-3.5 rounded-xl bg-[#132016] border border-[#606e60]/60 flex items-center justify-between text-xs text-[#c3ccc0]">
                <span>Total Calculated Duration:</span>
                <span className="text-[#ad9e92] font-bold text-sm font-serif">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
              </div>
            </div>

            {/* Guest Count Pickers */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-wider block">
                Guest Party Size
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#c3ccc0] block mb-1">
                    Adult Guests {adults >= 10 && <span className="text-amber-400 font-bold text-[10px]">(Large Group)</span>}
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 25, 30].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Adult' : 'Adults'}{num >= 15 ? ' (Large Group Pavilion)' : num >= 8 ? ' (Family/Group)' : ''}
                      </option>
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
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map((num) => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total Summary */}
              <div className="px-3.5 py-2.5 rounded-xl bg-[#132016] border border-[#606e60]/40 flex items-center justify-between text-xs text-[#c3ccc0]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-[#ad9e92]" /> Total Guests:
                </span>
                <span className="font-bold text-[#ad9e92] text-sm font-serif">
                  {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'} ({adults} Adults{children > 0 ? `, ${children} Kids` : ''})
                </span>
              </div>
            </div>

            {/* LIVE GROUP CAPACITY STATUS BANNER */}
            {isCapacityExceeded ? (
              <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500 text-amber-100 space-y-3 shadow-xl animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-900/90 border border-amber-500/80 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-amber-200 font-serif flex items-center gap-2">
                      <span>Group Capacity Exceeded</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider bg-amber-800/90 text-white px-2 py-0.5 rounded-full border border-amber-600">
                        {capacityShortage} More {capacityShortage === 1 ? 'Spot' : 'Spots'} Needed
                      </span>
                    </h5>
                    <p className="text-xs text-amber-100/95 leading-relaxed">
                      Your party has <strong>{totalGuests} guests</strong> ({adults} Adults, {children} Kids), but your currently allocated accommodation only accommodates <strong>{totalAllocatedCapacity} guests</strong>.
                    </p>
                    <p className="text-xs font-semibold text-amber-300">
                      👉 You are required to <strong>add additional accommodation options</strong> below to allocate your entire group size.
                    </p>
                  </div>
                </div>

                {/* Capacity Meter Bar */}
                <div className="pt-2 border-t border-amber-800/60 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-amber-200">Allocated Capacity: {totalAllocatedCapacity} / {totalGuests} Guests</span>
                    <span className="text-amber-300">{Math.min(100, Math.round((totalAllocatedCapacity / totalGuests) * 100))}% Allocated</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-amber-950 overflow-hidden border border-amber-600/70 p-0.5">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-300 shadow"
                      style={{ width: `${Math.min(100, (totalAllocatedCapacity / totalGuests) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/80 text-emerald-100 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-900 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="font-bold text-xs text-emerald-200 font-serif">
                      Group Capacity Requirement Met
                    </h6>
                    <p className="text-[11px] text-emerald-300/90">
                      {totalAllocatedCapacity} guest capacity allocated for {totalGuests} guests ({selectedRooms.length} unit{selectedRooms.length > 1 ? 's' : ''})
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded-full border border-emerald-600/60 font-mono">
                  {totalAllocatedCapacity} / {totalGuests} Guests
                </span>
              </div>
            )}

            {/* CURRENTLY ALLOCATED ACCOMMODATION TRAY */}
            {bookingCategory === 'room' && selectedRooms.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#1c2a20] border border-[#606e60] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ad9e92]" />
                    <span className="text-xs font-bold text-[#ebe5de] uppercase tracking-wider">
                      Selected Accommodations ({selectedRooms.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-[#ad9e92] font-semibold">
                    Combined Capacity: {totalAllocatedCapacity} Guests
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedRooms.map((room, idx) => (
                    <div
                      key={`${room.id}-${idx}`}
                      className="p-3 rounded-xl bg-[#132016] border border-[#606e60]/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={room.featuredImage} alt="" className="w-12 h-10 rounded-lg object-cover border border-[#606e60]/40 shrink-0" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#ebe5de] truncate font-serif">{room.name}</p>
                          <p className="text-[11px] text-[#c3ccc0]">
                            {room.category || 'Rooms'} • <span className="text-emerald-300 font-semibold">Max {room.maxGuests} Guests</span> • {room.bedType}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-[#ad9e92] text-sm font-serif">₱{room.pricePerNight.toLocaleString()}</span>
                          <span className="text-[10px] text-[#c3ccc0] block">{room.category === 'Cottages' ? '/ day' : '/ night'}</span>
                        </div>

                        {selectedRooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAccommodation(idx)}
                            className="p-1.5 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-800 transition-colors"
                            title="Remove this unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#606e60]/40 flex items-center justify-between text-xs text-[#c3ccc0]">
                  <span>Nightly Rate for All {selectedRooms.length} Units:</span>
                  <span className="font-bold text-[#ad9e92] text-sm font-serif">₱{roomRatePerNight.toLocaleString()} / night</span>
                </div>
              </div>
            )}

            {/* IF BOOKING CATEGORY IS ROOM: Quick extra unit add if desired */}
            {bookingCategory === 'room' && (
              <div className="p-4 rounded-2xl bg-[#132016] border border-[#606e60]/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h6 className="font-bold text-xs text-[#ebe5de] uppercase tracking-wider">
                      Add More Units to This Reservation (Optional)
                    </h6>
                    <p className="text-[11px] text-[#c3ccc0]">
                      Traveling with multiple families or a large group? Click to add extra cottages or kubos:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#ad9e92] hover:text-[#ebe5de] underline font-semibold cursor-pointer shrink-0 self-start sm:self-center"
                  >
                    Browse Full Catalog
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rooms
                    .filter((r) => !r.isComingSoon && !selectedRooms.some((sr) => sr.id === r.id))
                    .slice(0, 6)
                    .map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleAddAccommodation(r)}
                        className="p-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 hover:bg-[#25362a] text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <div className="truncate mr-2">
                          <p className="font-bold text-[#ebe5de] truncate">{r.name}</p>
                          <p className="text-[10px] text-[#c3ccc0]">{r.category} • Max {r.maxGuests} Guests</p>
                        </div>
                        <span className="text-amber-300 font-bold shrink-0">+₱{r.pricePerNight.toLocaleString()}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* IF BOOKING CATEGORY IS PACKAGE */}
            {bookingCategory === 'package' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#1c2a20] border border-amber-500/50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                        Included In Your Selected Package
                      </span>
                      <h5 className="font-bold text-base text-[#ebe5de] font-serif">
                        {selectedPackage?.name}
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer shrink-0"
                    >
                      Change Package
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#c3ccc0] pt-1">
                    {selectedPackage?.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Attached Accommodations for Package if Group is Large */}
                <div className="p-4 rounded-2xl bg-[#1c2a20] border border-[#606e60]/60 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#ebe5de]">
                      Add Additional Cottages / Kubos / Rooms to this Package (For Large Groups)
                    </label>
                    <span className="text-[10px] text-amber-300 font-bold">
                      {additionalPackageRooms.length} Extra {additionalPackageRooms.length === 1 ? 'Unit' : 'Units'} Attached
                    </span>
                  </div>

                  {additionalPackageRooms.length > 0 && (
                    <div className="space-y-1.5 pb-2">
                      {additionalPackageRooms.map((extraRm, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-[#132016] border border-[#606e60]/40 flex items-center justify-between text-xs">
                          <span className="text-[#ebe5de] font-semibold font-serif">
                            + {extraRm.name} (Max {extraRm.maxGuests} Guests)
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#ad9e92] font-bold">₱{extraRm.pricePerNight.toLocaleString()}/night</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAccommodation(idx)}
                              className="p-1 rounded bg-red-950 text-red-300 hover:bg-red-900"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rooms.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleAddAccommodation(r)}
                        className="p-2.5 rounded-xl bg-[#132016] border border-[#606e60]/60 hover:bg-[#25362a] text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <div className="truncate mr-2">
                          <p className="font-bold text-[#ebe5de] truncate">{r.name}</p>
                          <p className="text-[10px] text-[#c3ccc0]">Max {r.maxGuests} Guests</p>
                        </div>
                        <span className="text-amber-300 font-bold shrink-0">+₱{r.pricePerNight.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-3 px-4 rounded-xl bg-[#1c2a20] border border-[#606e60] text-[#c3ccc0] font-bold text-xs uppercase"
              >
                Back to Catalog
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 py-3.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
              >
                <span>CONTINUE TO ADD-ONS</span>
                <ArrowRight className="w-4 h-4 text-[#1c2a20]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Enhance Your Stay (Optional Add-Ons) */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#606e60]/60 pb-4">
              <div>
                <h4 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  Step 3: Enhance Your Stay (Optional Add-Ons)
                </h4>
                <p className="text-xs text-[#c3ccc0] mt-1">
                  Customize your resort stay with authentic bonfire kits, Filipino BBQ grills, breakfasts, and more.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2.5">
                {availableAddOns.map((addon) => {
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
                type="button"
                onClick={handlePrevStep}
                className="py-3 px-4 rounded-xl bg-[#1c2a20] border border-[#606e60] text-[#c3ccc0] font-bold text-xs uppercase"
              >
                Back to Dates & Guests
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 py-3.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
              >
                <span>CONTINUE TO GUEST INFO</span>
                <ArrowRight className="w-4 h-4 text-[#1c2a20]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Guest Information */}
        {step === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            <h4 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#ad9e92]" />
              Step 4: Guest Information
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

        {/* Step 5: Booking Summary & Payment Choice */}
        {step === 5 && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            <h4 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#ad9e92]" />
              Step 5: Review Summary & Select Payment Mode
            </h4>

            {/* Summary Box with Multi-Accommodation Details */}
            <div className="p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] space-y-4">
              <div className="flex justify-between items-start border-b border-[#606e60]/60 pb-3">
                <div>
                  <h5 className="font-bold text-base text-[#ebe5de] font-serif">
                    {bookingCategory === 'package'
                      ? selectedPackage?.name
                      : selectedRooms.length === 1
                        ? selectedRooms[0].name
                        : `${selectedRooms.length} Accommodation Units Reserved`}
                  </h5>
                  <p className="text-xs text-[#c3ccc0]">
                    {checkInDate} to {checkOutDate} ({nights} {nights === 1 ? 'Night' : 'Nights'})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#ad9e92] bg-[#132016] px-2.5 py-1 rounded border border-[#606e60] block mb-1">
                    {adults} Adults, {children} Kids ({totalGuests} Guests)
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold">
                    Capacity: {totalAllocatedCapacity} Guests
                  </span>
                </div>
              </div>

              {/* Allocated Accommodations Detailed List */}
              <div className="space-y-1.5 text-xs text-[#c3ccc0] pb-2 border-b border-[#606e60]/60">
                <span className="font-semibold text-[#ebe5de] block mb-1">Allocated Accommodations:</span>
                {bookingCategory === 'room' ? (
                  selectedRooms.map((rm, i) => (
                    <div key={i} className="flex justify-between pl-2 text-xs">
                      <span>• {rm.name} <span className="text-[10px] text-emerald-300">(Max {rm.maxGuests} guests)</span></span>
                      <span className="text-[#ebe5de] font-medium">₱{rm.pricePerNight.toLocaleString()}/night</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between pl-2 text-xs">
                      <span>• {selectedPackage?.name} <span className="text-[10px] text-amber-300">(Base Package)</span></span>
                      <span className="text-[#ebe5de] font-medium">₱{selectedPackage?.price.toLocaleString()}</span>
                    </div>
                    {additionalPackageRooms.map((rm, i) => (
                      <div key={i} className="flex justify-between pl-2 text-xs">
                        <span>• + {rm.name} <span className="text-[10px] text-emerald-300">(Max {rm.maxGuests} guests)</span></span>
                        <span className="text-[#ebe5de] font-medium">₱{rm.pricePerNight.toLocaleString()}/night</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-[#c3ccc0]">
                <div className="flex justify-between">
                  <span>Accommodation Subtotal ({nights} {nights === 1 ? 'night' : 'nights'}):</span>
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

        {/* Step 6: Final Confirmation & Download Voucher */}
        {step === 6 && createdBooking && (
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
