import React, { useState, useMemo } from 'react';
import { useResort } from '../context/ResortContext';
import { Room, Booking, BookingStatus } from '../types';
import { getTodayFormatted, getTomorrowFormatted, getUnitOccupancyForDate } from '../utils/bookingUtils';
import { downloadVoucher } from '../utils/voucher';
import { FrontDeskWalkInModal } from './FrontDeskWalkInModal';
import { PaymentGateModal } from './PaymentGateModal';
import {
  calculateBookingFinancials,
  formatCurrency,
  getPaymentBadgeProps,
} from '../utils/paymentUtils';
import {
  BedDouble,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  Check,
  X,
  Phone,
  Mail,
  Receipt,
  Download,
  Plus,
  Filter,
  Printer,
  Sparkles,
  Eye,
  Clock,
  Shield,
  ExternalLink,
  ChevronRight,
  Home,
  CreditCard,
  Lock,
} from 'lucide-react';

interface AdminOccupancyBoardProps {
  onViewBookingDetails?: (booking: Booking) => void;
  onGoToBookingsTab?: () => void;
}

export const AdminOccupancyBoard: React.FC<AdminOccupancyBoardProps> = ({
  onViewBookingDetails,
  onGoToBookingsTab,
}) => {
  const {
    rooms,
    bookings,
    resortInfo,
    updateBookingStatus,
    collectBookingPayment,
    currentAdminUser,
    toggleRoomAvailability,
    setSelectedRoomForBooking,
    setIsBookingModalOpen,
    showToast,
  } = useResort();

  const todayStr = useMemo(() => getTodayFormatted(), []);

  // Target Date for Occupancy Status
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Rooms and Suites' | 'Cottages' | 'Filipino Kubos' | 'Mesa Collection'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'vacant' | 'arriving_today' | 'blocked' | 'coming_soon'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal for Quick Unit Details or Selected Booking
  const [inspectBooking, setInspectBooking] = useState<Booking | null>(null);

  // Payment Gate Modal State
  const [paymentGateBooking, setPaymentGateBooking] = useState<Booking | null>(null);
  const [paymentGateInitialMode, setPaymentGateInitialMode] = useState<'required' | 'collect'>('required');
  const [isPaymentGateModalOpen, setIsPaymentGateModalOpen] = useState<boolean>(false);

  // Front-Desk Walk-In Modal
  const [walkInModalRoom, setWalkInModalRoom] = useState<Room | null>(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState<boolean>(false);

  // Quick Date Helpers
  const setDateToday = () => setSelectedDate(todayStr);
  const setDateTomorrow = () => setSelectedDate(getTomorrowFormatted(todayStr));
  const setDatePlusDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  // Evaluate occupancy for every room on selectedDate
  const roomsWithOccupancy = useMemo(() => {
    return rooms.map((room) => {
      const occupancy = getUnitOccupancyForDate(room, selectedDate, bookings);
      return {
        room,
        occupancy,
      };
    });
  }, [rooms, selectedDate, bookings]);

  // Summary Metrics for the Selected Date
  const metrics = useMemo(() => {
    let occupied = 0;
    let vacant = 0;
    let arrivingToday = 0;
    let blockedOrComingSoon = 0;

    roomsWithOccupancy.forEach(({ occupancy }) => {
      if (occupancy.status === 'occupied') occupied++;
      else if (occupancy.status === 'arriving_today') {
        occupied++;
        arrivingToday++;
      } else if (occupancy.status === 'vacant') vacant++;
      else if (occupancy.status === 'blocked' || occupancy.status === 'coming_soon') {
        blockedOrComingSoon++;
      }
    });

    const total = rooms.length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    // Checkouts on selected date
    const checkoutsOnDate = bookings.filter(
      (b) => b.checkOutDate === selectedDate && (b.status === 'Confirmed' || b.status === 'Checked In')
    ).length;

    return {
      total,
      occupied,
      vacant,
      arrivingToday,
      blockedOrComingSoon,
      occupancyRate,
      checkoutsOnDate,
    };
  }, [roomsWithOccupancy, rooms.length, bookings, selectedDate]);

  // Filtered rooms list
  const filteredRooms = useMemo(() => {
    return roomsWithOccupancy.filter(({ room, occupancy }) => {
      // Category filter
      const roomCat = room.category || 'Rooms and Suites';
      if (categoryFilter !== 'All' && roomCat !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'occupied' && occupancy.status !== 'occupied' && occupancy.status !== 'arriving_today') {
          return false;
        }
        if (statusFilter === 'vacant' && occupancy.status !== 'vacant') {
          return false;
        }
        if (statusFilter === 'arriving_today' && occupancy.status !== 'arriving_today') {
          return false;
        }
        if (statusFilter === 'blocked' && occupancy.status !== 'blocked') {
          return false;
        }
        if (statusFilter === 'coming_soon' && occupancy.status !== 'coming_soon') {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRoomName = room.name.toLowerCase().includes(q);
        const matchesCategory = (room.category || '').toLowerCase().includes(q);
        const matchesGuest = occupancy.activeBooking?.guestName.toLowerCase().includes(q);
        const matchesRef = occupancy.activeBooking?.referenceNumber.toLowerCase().includes(q);
        const matchesMobile = occupancy.activeBooking?.mobile.includes(q);

        if (!matchesRoomName && !matchesCategory && !matchesGuest && !matchesRef && !matchesMobile) {
          return false;
        }
      }

      return true;
    });
  }, [roomsWithOccupancy, categoryFilter, statusFilter, searchQuery]);

  // Action: Launch Walk-in Booking
  const handleWalkInBooking = (room: Room) => {
    setWalkInModalRoom(room);
    setIsWalkInModalOpen(true);
    setSelectedRoomForBooking(room);
  };

  // Action: Check in guest (Protected by Payment Gate)
  const handleCheckInGuest = (booking: Booking) => {
    const financials = calculateBookingFinancials(booking);
    if (financials.isCheckInBlocked) {
      setPaymentGateBooking(booking);
      setPaymentGateInitialMode('required');
      setIsPaymentGateModalOpen(true);
      return;
    }

    updateBookingStatus(booking.id, 'Checked In');
    showToast(`Guest ${booking.guestName} marked as CHECKED IN!`, 'success');
  };

  // Action: Check out guest
  const handleCheckOutGuest = (booking: Booking) => {
    if (confirm(`Check out guest ${booking.guestName} (${booking.referenceNumber}) and release unit?`)) {
      updateBookingStatus(booking.id, 'Checked Out');
      showToast(`Guest ${booking.guestName} checked out successfully. Unit is now ready for cleaning.`, 'success');
    }
  };

  // Action: Print Occupancy Sheet
  const handlePrint = () => {
    window.print();
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="space-y-6">
      {/* Top Header Card & Date Controller */}
      <div className="bg-[#132016] border border-[#606e60] rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#606e60]/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#ad9e92]" />
                Live Accommodation & Unit Occupancy Board
              </h2>
            </div>
            <p className="text-xs text-[#c3ccc0] mt-1 max-w-3xl">
              Track live occupancy, view occupied cottages & rooms with guest profiles, monitor vacant units ready for check-in, and manage walk-in reservations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const firstVacant = roomsWithOccupancy.find((r) => r.occupancy.status === 'vacant')?.room || rooms[0];
                handleWalkInBooking(firstVacant);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-95"
              title="Register a Walk-In Guest at Front Desk"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Walk-In</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#ebe5de] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Print Daily Occupancy Sheet"
            >
              <Printer className="w-4 h-4 text-[#ad9e92]" />
              <span className="hidden sm:inline">Print Schedule</span>
            </button>

            {onGoToBookingsTab && (
              <button
                type="button"
                onClick={onGoToBookingsTab}
                className="px-3.5 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#ad9e92] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Receipt className="w-4 h-4" />
                <span>All Reservations</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Selector & Fast Presets */}
        <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[#c3ccc0] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#ad9e92]" />
              Target Schedule Date:
            </span>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] text-sm text-[#ebe5de] font-semibold focus:outline-none focus:border-[#ad9e92]"
            />

            {/* Quick buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={setDateToday}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isToday
                    ? 'bg-[#ad9e92] text-[#1c2a20] shadow-sm'
                    : 'bg-[#1c2a20] text-[#c3ccc0] hover:bg-[#25362a] border border-[#606e60]/50'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={setDateTomorrow}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === getTomorrowFormatted(todayStr)
                    ? 'bg-[#ad9e92] text-[#1c2a20] shadow-sm'
                    : 'bg-[#1c2a20] text-[#c3ccc0] hover:bg-[#25362a] border border-[#606e60]/50'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDatePlusDays(2)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1c2a20] text-[#c3ccc0] hover:bg-[#25362a] border border-[#606e60]/50 transition-all cursor-pointer hidden sm:inline-block"
              >
                +2 Days
              </button>
            </div>
          </div>

          <div className="text-xs text-[#c3ccc0] flex items-center gap-2">
            <span className="font-medium">
              Displaying occupancy for:{' '}
              <strong className="text-[#ebe5de] font-serif text-sm">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </strong>
            </span>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                Live Today
              </span>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Cards for this Date */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Occupied */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'occupied' ? 'all' : 'occupied')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'occupied'
                ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500'
                : 'bg-[#1c2a20] border-[#606e60]/60 hover:border-red-500/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#c3ccc0]">
              <span>Occupied Units</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-red-400">
                {metrics.occupied}
              </span>
              <span className="text-xs text-[#c3ccc0]">/ {metrics.total} Units</span>
            </div>
            <p className="text-[11px] text-[#ad9e92] font-semibold mt-1">
              {metrics.occupancyRate}% Overall Occupancy
            </p>
          </div>

          {/* 2. Vacant & Ready */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'vacant' ? 'all' : 'vacant')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'vacant'
                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-[#1c2a20] border-[#606e60]/60 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#c3ccc0]">
              <span>Vacant / Available</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-emerald-400">
                {metrics.vacant}
              </span>
              <span className="text-xs text-[#c3ccc0]">Units</span>
            </div>
            <p className="text-[11px] text-emerald-300 font-semibold mt-1">
              Clean & Ready for Check-In
            </p>
          </div>

          {/* 3. Arriving Today */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'arriving_today' ? 'all' : 'arriving_today')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'arriving_today'
                ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                : 'bg-[#1c2a20] border-[#606e60]/60 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#c3ccc0]">
              <span>Check-Ins Today</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-blue-400">
                {metrics.arrivingToday}
              </span>
              <span className="text-xs text-[#c3ccc0]">Arrivals</span>
            </div>
            <p className="text-[11px] text-blue-300 font-semibold mt-1">
              Scheduled Guest Check-Ins
            </p>
          </div>

          {/* 4. Departures & Maintenance */}
          <div className="p-4 rounded-2xl bg-[#1c2a20] border border-[#606e60]/60 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#c3ccc0]">
              <span>Check-Outs / Maint.</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-amber-300">
                {metrics.checkoutsOnDate}
              </span>
              <span className="text-xs text-[#c3ccc0]">Departing Stays</span>
            </div>
            <p className="text-[11px] text-[#c3ccc0] font-medium">
              {metrics.blockedOrComingSoon} Blocked / Coming Soon
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-[#132016] border border-[#606e60] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0e1710] rounded-2xl border border-[#606e60]/60 text-xs">
            {(['All', 'Rooms and Suites', 'Mesa Collection', 'Cottages', 'Filipino Kubos'] as const).map((cat) => {
              const count = rooms.filter((r) => cat === 'All' || (r.category || 'Rooms and Suites') === cat).length;
              const isSelected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#ad9e92] text-[#1c2a20] shadow-sm'
                      : 'text-[#c3ccc0] hover:text-[#ebe5de] hover:bg-[#1c2a20]'
                  }`}
                >
                  <span>{cat === 'Rooms and Suites' ? 'Rooms & Suites' : cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-[#1c2a20] text-[#ad9e92]' : 'bg-[#1c2a20] text-[#c3ccc0]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar & View Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#c3ccc0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unit, guest, #STE..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
              />
            </div>

            {/* View Mode */}
            <div className="flex bg-[#0e1710] p-1 rounded-xl border border-[#606e60]/60 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#ad9e92] text-[#1c2a20]' : 'text-[#c3ccc0]'
                }`}
                title="Cards Grid View"
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#ad9e92] text-[#1c2a20]' : 'text-[#c3ccc0]'
                }`}
                title="Spreadsheet Table View"
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#606e60]/40 text-xs">
          <span className="text-[11px] font-bold text-[#c3ccc0] uppercase tracking-wider mr-1">
            Status Filter:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#ad9e92] text-[#1c2a20]'
                : 'bg-[#1c2a20] text-[#c3ccc0] hover:bg-[#25362a] border border-[#606e60]/50'
            }`}
          >
            All Units ({roomsWithOccupancy.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('occupied')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'occupied'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-[#1c2a20] text-red-400 hover:bg-red-950/40 border border-red-800/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Occupied Only ({metrics.occupied})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('vacant')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'vacant'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#1c2a20] text-emerald-400 hover:bg-emerald-950/40 border border-emerald-800/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Vacant / Ready Only ({metrics.vacant})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('arriving_today')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'arriving_today'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#1c2a20] text-blue-400 hover:bg-blue-950/40 border border-blue-800/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Arriving Today ({metrics.arrivingToday})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('blocked')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'blocked'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-[#1c2a20] text-amber-300 hover:bg-amber-950/40 border border-amber-800/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Maintenance / Blocked
          </button>
        </div>
      </div>

      {/* Main Grid or Table Display */}
      {filteredRooms.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#132016] border border-[#606e60] text-[#c3ccc0] space-y-3">
          <BedDouble className="w-12 h-12 mx-auto text-[#606e60]" />
          <h4 className="text-lg font-bold text-[#ebe5de] font-serif">No Accommodations Match the Filter</h4>
          <p className="text-xs max-w-md mx-auto">
            Try adjusting your search keywords, category tab, or status pill above.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('All');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#ebe5de] text-xs font-bold transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRooms.map(({ room, occupancy }) => {
            const isOccupied = occupancy.status === 'occupied';
            const isArrivingToday = occupancy.status === 'arriving_today';
            const isVacant = occupancy.status === 'vacant';
            const isComingSoon = occupancy.status === 'coming_soon';
            const isBlocked = occupancy.status === 'blocked';

            const activeBooking = occupancy.activeBooking;

            return (
              <div
                key={room.id}
                className={`rounded-3xl border overflow-hidden transition-all flex flex-col shadow-xl ${
                  isOccupied
                    ? 'bg-[#181214] border-red-700/80 ring-1 ring-red-600/40'
                    : isArrivingToday
                    ? 'bg-[#101923] border-blue-700/80 ring-1 ring-blue-600/40'
                    : isVacant
                    ? 'bg-[#132016] border-[#606e60] hover:border-emerald-500/70'
                    : 'bg-[#171717] border-amber-800/60'
                }`}
              >
                {/* Card Top: Image + Badges */}
                <div className="h-44 relative overflow-hidden shrink-0 border-b border-[#606e60]/40">
                  <img
                    src={room.featuredImage}
                    alt={room.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-[#ebe5de] border border-white/10 uppercase tracking-wider">
                      {room.category || 'Rooms and Suites'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-semibold text-[#c3ccc0]">
                      Max {room.maxGuests} Guests
                    </span>
                  </div>

                  {/* Primary Occupancy Status Pill */}
                  <div className="absolute top-3 right-3">
                    {isOccupied && (
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        Occupied
                      </span>
                    )}
                    {isArrivingToday && (
                      <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                        <Clock className="w-3 h-3" />
                        Arriving Today
                      </span>
                    )}
                    {isVacant && (
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                        <Check className="w-3 h-3" />
                        Vacant / Ready
                      </span>
                    )}
                    {isComingSoon && (
                      <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        Coming Soon
                      </span>
                    )}
                    {isBlocked && (
                      <span className="px-3 py-1 rounded-full bg-neutral-700 text-neutral-200 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Blocked / Maint.
                      </span>
                    )}
                  </div>

                  {/* Unit Name & Nightly Rate Bottom Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h4 className="text-lg font-bold font-serif text-[#ebe5de] leading-snug drop-shadow">
                        {room.name}
                      </h4>
                      <p className="text-[11px] text-[#ad9e92] font-medium drop-shadow">
                        {room.bedType} • {room.sizeSqM} m²
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold text-amber-300 font-serif drop-shadow">
                        ₱{room.pricePerNight.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#c3ccc0] block">
                        {room.category === 'Cottages' ? '/ day' : '/ night'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Middle: Detailed Occupancy Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  {/* IF OCCUPIED OR ARRIVING TODAY */}
                  {(isOccupied || isArrivingToday) && activeBooking && (
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#ad9e92] tracking-wider block">
                            Current Guest
                          </span>
                          <h5 className="font-bold text-sm text-[#ebe5de] font-serif flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#ad9e92]" />
                            {activeBooking.guestName}
                          </h5>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-[#ad9e92] border border-[#ad9e92]/30">
                          {activeBooking.referenceNumber}
                        </span>
                      </div>

                      {/* Schedule info */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#c3ccc0] block">Check-In</span>
                          <span className="font-bold text-[#ebe5de]">
                            {activeBooking.checkInDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#c3ccc0] block">Check-Out</span>
                          <span className="font-bold text-[#ebe5de]">
                            {activeBooking.checkOutDate} ({activeBooking.numberOfNights}N)
                          </span>
                        </div>
                      </div>

                      {/* Party & Contact */}
                      <div className="flex items-center justify-between text-xs text-[#c3ccc0] pt-1">
                        <span>
                          Party: <strong className="text-[#ebe5de]">{activeBooking.adultsCount} Adults{activeBooking.childrenCount > 0 ? `, ${activeBooking.childrenCount} Kids` : ''}</strong>
                        </span>
                        <a
                          href={`tel:${activeBooking.mobile}`}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{activeBooking.mobile}</span>
                        </a>
                      </div>

                      {/* Payment Status indicator */}
                      {(() => {
                        const actFin = calculateBookingFinancials(activeBooking);
                        const badgeProps = getPaymentBadgeProps(
                          actFin.paymentStatus,
                          actFin.outstandingBalance,
                          activeBooking.status
                        );
                        return (
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                            <span className="text-[#c3ccc0]">Payment:</span>
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] border ${badgeProps.bgClass} ${badgeProps.textClass} ${badgeProps.borderClass}`}
                            >
                              {badgeProps.label}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* IF VACANT / READY */}
                  {isVacant && (
                    <div className="p-3.5 rounded-2xl bg-[#0e1710] border border-emerald-700/40 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Ready & Available for Check-In</span>
                      </div>
                      <p className="text-xs text-[#c3ccc0]">
                        This accommodation unit is vacant, cleaned, and fully operational for on-site walk-ins or immediate bookings.
                      </p>
                      {occupancy.pendingBookings && occupancy.pendingBookings.length > 0 && (
                        <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-700/40 text-[11px] text-amber-200">
                          ⚠️ {occupancy.pendingBookings.length} pending reservation request for this date.
                        </div>
                      )}
                    </div>
                  )}

                  {/* IF COMING SOON */}
                  {isComingSoon && (
                    <div className="p-3.5 rounded-2xl bg-[#0e1710] border border-amber-800/40 space-y-1.5">
                      <span className="text-amber-300 text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Under Development
                      </span>
                      <p className="text-xs text-[#c3ccc0]">
                        {room.comingSoonNotice || 'Currently unavailable - scheduled to open soon.'}
                      </p>
                    </div>
                  )}

                  {/* IF BLOCKED / MAINTENANCE */}
                  {isBlocked && (
                    <div className="p-3.5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-1.5">
                      <span className="text-neutral-300 text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Blocked by Management
                      </span>
                      <p className="text-xs text-[#c3ccc0]">
                        {occupancy.reason || 'Temporarily set offline for housekeeping, maintenance, or private resort use.'}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons Bottom Row */}
                  <div className="pt-3 border-t border-[#606e60]/40 flex flex-wrap items-center justify-between gap-2">
                    {/* If Occupied Actions */}
                    {(isOccupied || isArrivingToday) && activeBooking ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setInspectBooking(activeBooking)}
                          className="px-3 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#ebe5de] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#ad9e92]" />
                          <span>Guest Record</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {(() => {
                            const actFin = calculateBookingFinancials(activeBooking);

                            return (
                              <>
                                {isArrivingToday && activeBooking.status !== 'Checked In' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleCheckInGuest(activeBooking)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md ${
                                        actFin.isCheckInBlocked
                                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                                      }`}
                                      title={
                                        actFin.isCheckInBlocked
                                          ? `Payment required before check-in (₱${actFin.outstandingBalance.toLocaleString()} Due)`
                                          : 'Check-In Guest'
                                      }
                                    >
                                      {actFin.isCheckInBlocked ? (
                                        <Lock className="w-3.5 h-3.5" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5" />
                                      )}
                                      <span>Check-In</span>
                                    </button>

                                    {actFin.outstandingBalance > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPaymentGateBooking(activeBooking);
                                          setPaymentGateInitialMode('collect');
                                          setIsPaymentGateModalOpen(true);
                                        }}
                                        className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                        title="Collect remaining balance"
                                      >
                                        <CreditCard className="w-3.5 h-3.5" />
                                        <span>Collect ₱{actFin.outstandingBalance.toLocaleString()}</span>
                                      </button>
                                    )}
                                  </>
                                )}

                                {activeBooking.status === 'Checked In' && actFin.outstandingBalance > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPaymentGateBooking(activeBooking);
                                      setPaymentGateInitialMode('collect');
                                      setIsPaymentGateModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer animate-pulse"
                                    title="Unpaid balance detected on checked-in guest! Settle now."
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                    <span>Settle ₱{actFin.outstandingBalance.toLocaleString()}</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCheckOutGuest(activeBooking)}
                                  className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <span>Check-Out</span>
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </>
                    ) : null}

                    {/* If Vacant Actions */}
                    {isVacant ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleWalkInBooking(room)}
                          className="w-full sm:w-auto flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Walk-In Booking</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleRoomAvailability(room.id)}
                          className="px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 hover:border-amber-500/60 text-[#c3ccc0] hover:text-[#ebe5de] text-xs font-medium transition-colors cursor-pointer"
                          title="Block unit for maintenance"
                        >
                          Block Unit
                        </button>
                      </>
                    ) : null}

                    {/* If Blocked Actions */}
                    {isBlocked ? (
                      <button
                        type="button"
                        onClick={() => toggleRoomAvailability(room.id)}
                        className="w-full px-4 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-emerald-500 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Unblock / Make Available</span>
                      </button>
                    ) : null}

                    {/* If Coming Soon Actions */}
                    {isComingSoon ? (
                      <span className="text-[11px] text-[#c3ccc0] italic">
                        Configure launch date in Room Settings tab.
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#132016] border border-[#606e60] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#0e1710] text-[#c3ccc0] font-bold uppercase text-[10px] tracking-wider border-b border-[#606e60]/60">
                <tr>
                  <th className="p-3.5">Unit / Accommodation</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Rate</th>
                  <th className="p-3.5 text-center">Occupancy Status</th>
                  <th className="p-3.5">Current Guest</th>
                  <th className="p-3.5">Stay Period</th>
                  <th className="p-3.5">Reference #</th>
                  <th className="p-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#606e60]/40">
                {filteredRooms.map(({ room, occupancy }) => {
                  const isOccupied = occupancy.status === 'occupied';
                  const isArrivingToday = occupancy.status === 'arriving_today';
                  const isVacant = occupancy.status === 'vacant';
                  const isComingSoon = occupancy.status === 'coming_soon';
                  const isBlocked = occupancy.status === 'blocked';
                  const activeBooking = occupancy.activeBooking;

                  return (
                    <tr
                      key={room.id}
                      className={`hover:bg-[#1c2a20]/80 transition-colors ${
                        isOccupied ? 'bg-red-950/10' : isArrivingToday ? 'bg-blue-950/10' : ''
                      }`}
                    >
                      {/* Unit name */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={room.featuredImage}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-[#606e60]/40 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-[#ebe5de] font-serif">{room.name}</p>
                            <p className="text-[10px] text-[#c3ccc0]">{room.bedType} • Max {room.maxGuests}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-[#1c2a20] border border-[#606e60]/50 text-[#ebe5de] text-[10px] font-bold">
                          {room.category || 'Rooms and Suites'}
                        </span>
                      </td>

                      {/* Rate */}
                      <td className="p-3.5 font-bold text-[#ad9e92]">
                        ₱{room.pricePerNight.toLocaleString()}
                        <span className="text-[10px] text-[#c3ccc0] font-normal block">
                          {room.category === 'Cottages' ? '/ day' : '/ night'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        {isOccupied && (
                          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Occupied
                          </span>
                        )}
                        {isArrivingToday && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                            <Clock className="w-3 h-3" />
                            Arriving Today
                          </span>
                        )}
                        {isVacant && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                            <Check className="w-3 h-3" />
                            Vacant / Ready
                          </span>
                        )}
                        {isComingSoon && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                            Coming Soon
                          </span>
                        )}
                        {isBlocked && (
                          <span className="px-2.5 py-1 rounded-full bg-neutral-700 text-neutral-300 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                            Blocked
                          </span>
                        )}
                      </td>

                      {/* Guest */}
                      <td className="p-3.5">
                        {activeBooking ? (
                          <div>
                            <p className="font-bold text-[#ebe5de]">{activeBooking.guestName}</p>
                            <p className="text-[10px] text-[#c3ccc0]">{activeBooking.mobile}</p>
                          </div>
                        ) : (
                          <span className="text-[#606e60] italic">None (Unit Vacant)</span>
                        )}
                      </td>

                      {/* Stay Period */}
                      <td className="p-3.5">
                        {activeBooking ? (
                          <div>
                            <p className="font-medium text-[#ebe5de]">
                              {activeBooking.checkInDate} → {activeBooking.checkOutDate}
                            </p>
                            <span className="text-[10px] text-[#ad9e92]">
                              {activeBooking.numberOfNights} Nights • {activeBooking.adultsCount} Adults
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#606e60]">—</span>
                        )}
                      </td>

                      {/* Reference # */}
                      <td className="p-3.5 font-mono text-xs text-[#ad9e92]">
                        {activeBooking ? activeBooking.referenceNumber : '—'}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1.5">
                        {isVacant && (
                          <button
                            type="button"
                            onClick={() => handleWalkInBooking(room)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            + Walk-In
                          </button>
                        )}
                        {activeBooking && (
                          <button
                            type="button"
                            onClick={() => setInspectBooking(activeBooking)}
                            className="px-3 py-1.5 rounded-lg bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#ebe5de] text-xs font-bold transition-colors cursor-pointer"
                          >
                            View Guest
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guest Record / Reservation Details Modal */}
      {inspectBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#606e60]/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                  Currently Occupying Guest
                </span>
                <h3 className="text-xl font-bold font-serif text-[#ebe5de]">
                  {inspectBooking.guestName}
                </h3>
                <p className="text-xs text-[#ad9e92] font-mono">
                  Ref: {inspectBooking.referenceNumber} • Status: {inspectBooking.status}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectBooking(null)}
                className="p-1.5 rounded-xl bg-[#1c2a20] hover:bg-[#25362a] text-[#c3ccc0] hover:text-[#ebe5de] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-[#c3ccc0] block">Assigned Unit</span>
                  <span className="font-bold text-sm text-[#ebe5de] font-serif">
                    {inspectBooking.roomName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#c3ccc0] block">Total Guests</span>
                  <span className="font-bold text-[#ebe5de]">
                    {inspectBooking.adultsCount} Adults, {inspectBooking.childrenCount} Children
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#c3ccc0] block">Check-In Date</span>
                  <span className="font-bold text-[#ebe5de]">
                    {inspectBooking.checkInDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#c3ccc0] block">Check-Out Date</span>
                  <span className="font-bold text-[#ebe5de]">
                    {inspectBooking.checkOutDate} ({inspectBooking.numberOfNights} Nights)
                  </span>
                </div>
              </div>

              {(() => {
                const inspectFin = calculateBookingFinancials(inspectBooking);
                const badge = getPaymentBadgeProps(
                  inspectFin.paymentStatus,
                  inspectFin.outstandingBalance,
                  inspectBooking.status
                );

                return (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#c3ccc0]">Phone / Mobile:</span>
                        <a
                          href={`tel:${inspectBooking.mobile}`}
                          className="text-cyan-400 font-bold hover:underline"
                        >
                          {inspectBooking.mobile}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#c3ccc0]">Email Address:</span>
                        <span className="text-[#ebe5de] font-medium">
                          {inspectBooking.email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#c3ccc0]">Payment Channel:</span>
                        <span className="text-[#ebe5de]">
                          {inspectBooking.selectedPaymentChannel || inspectBooking.paymentMethod}
                        </span>
                      </div>

                      {/* Financial Accounting Breakdown */}
                      <div className="pt-2 border-t border-[#606e60]/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[#c3ccc0]">Total Booking Cost:</span>
                          <span className="font-bold text-[#ebe5de]">
                            {formatCurrency(inspectFin.totalCost)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>Amount Verified / Paid:</span>
                          <span className="font-bold">
                            {formatCurrency(inspectFin.amountPaid)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#c3ccc0]">Outstanding Balance:</span>
                          <span
                            className={`font-black text-sm ${
                              inspectFin.outstandingBalance > 0
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {formatCurrency(inspectFin.outstandingBalance)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[#c3ccc0]">Financial Status:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {inspectFin.outstandingBalance > 0 && (
                      <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-amber-200">
                            Unpaid Balance: {formatCurrency(inspectFin.outstandingBalance)}
                          </p>
                          <p className="text-amber-300/80 text-[11px]">
                            Check-in is locked until this outstanding balance is collected and recorded in full.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#606e60]/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadVoucher(inspectBooking, resortInfo)}
                  className="px-3.5 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#ebe5de] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#ad9e92]" />
                  <span>Voucher</span>
                </button>

                {(() => {
                  const fin = calculateBookingFinancials(inspectBooking);
                  if (fin.outstandingBalance > 0) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentGateBooking(inspectBooking);
                          setPaymentGateInitialMode('collect');
                          setIsPaymentGateModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Collect {formatCurrency(fin.outstandingBalance)}</span>
                      </button>
                    );
                  }
                  return null;
                })()}

                {inspectBooking.status !== 'Checked In' && inspectBooking.status !== 'Checked Out' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCheckInGuest(inspectBooking);
                      setInspectBooking(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow"
                  >
                    <Check className="w-4 h-4" />
                    <span>Check-In</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setInspectBooking(null)}
                className="px-5 py-2 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] text-xs font-extrabold uppercase transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Front-Desk Walk-In Check-In Modal */}
      <FrontDeskWalkInModal
        isOpen={isWalkInModalOpen}
        onClose={() => {
          setIsWalkInModalOpen(false);
          setWalkInModalRoom(null);
        }}
        initialRoom={walkInModalRoom}
        initialDate={selectedDate}
      />

      {/* Check-In Payment Gate & Balance Settlement Modal */}
      {paymentGateBooking && (
        <PaymentGateModal
          isOpen={isPaymentGateModalOpen}
          onClose={() => {
            setIsPaymentGateModalOpen(false);
            setPaymentGateBooking(null);
          }}
          booking={paymentGateBooking}
          initialMode={paymentGateInitialMode}
        />
      )}
    </div>
  );
};
