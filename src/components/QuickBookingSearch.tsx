import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { Calendar, Users, BedDouble, Search, Sparkles, AlertTriangle, X } from 'lucide-react';
import { checkRoomOccupied, OCCUPIED_UNIT_MESSAGE, COMING_SOON_MESSAGE, validateBookingDates, getTodayFormatted, getTomorrowFormatted } from '../utils/bookingUtils';

export const QuickBookingSearch: React.FC = () => {
  const {
    searchFilters,
    setSearchFilters,
    rooms,
    bookings,
    setIsBookingModalOpen,
    setSelectedRoomForBooking,
    setSelectedPackageForBooking,
    theme,
  } = useResort();

  const isLight = theme === 'light';
  const [occupiedError, setOccupiedError] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedPackageForBooking(null);
    setOccupiedError(null);

    // Validate dates before proceeding
    const dateValidation = validateBookingDates(searchFilters.checkInDate, searchFilters.checkOutDate);
    if (!dateValidation.isValid) {
      setOccupiedError(dateValidation.errorMessage || 'Invalid date range selected.');
      return;
    }

    let targetRoom = null;
    
    // Check if specific cottage/room selected in secondary dropdown
    if (searchFilters.cottageType && searchFilters.cottageType !== 'All') {
      targetRoom = rooms.find((r) => r.id === searchFilters.cottageType) || null;
    } else if (
      searchFilters.roomType &&
      searchFilters.roomType !== 'All' &&
      !['Cottages', 'Filipino Kubos', 'Rooms and Suites'].includes(searchFilters.roomType)
    ) {
      targetRoom = rooms.find((r) => r.id === searchFilters.roomType) || null;
    }

    if (targetRoom) {
      const occCheck = checkRoomOccupied(
        targetRoom.id,
        searchFilters.checkInDate,
        searchFilters.checkOutDate,
        rooms,
        bookings
      );

      if (occCheck.isOccupied) {
        setOccupiedError(occCheck.isComingSoon ? COMING_SOON_MESSAGE : OCCUPIED_UNIT_MESSAGE);
        setSelectedRoomForBooking(null);
        return;
      }
    }

    setSelectedRoomForBooking(targetRoom);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 mb-16">
      <div className={`rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-2xl transition-colors duration-300 border ${
        isLight
          ? 'bg-white border-[#e2dcd0] text-[#1c2a20]'
          : 'bg-[#132016]/95 border-[#606e60]/50 text-[#ebe5de]'
      }`}>
        {/* Occupied Unit Alert Notice */}
        {occupiedError && (
          <div className="mb-5 p-4 rounded-2xl bg-red-900/90 border-2 border-red-500 text-white shadow-xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-800 shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <p className="text-sm font-extrabold tracking-wide">
                {occupiedError}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOccupiedError(null)}
              className="p-1.5 rounded-lg hover:bg-red-800 text-red-200 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          {/* Check-In Date */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
            }`}>
              <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              Check-In Date
            </label>
            <input
              type="date"
              value={searchFilters.checkInDate}
              min={getTodayFormatted()}
              onChange={(e) => {
                const newIn = e.target.value;
                setOccupiedError(null);
                let newOut = searchFilters.checkOutDate;
                if (!newOut || newOut <= newIn) {
                  newOut = getTomorrowFormatted(newIn);
                }
                setSearchFilters({ ...searchFilters, checkInDate: newIn, checkOutDate: newOut });
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${
                isLight
                  ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                  : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
              }`}
              required
            />
          </div>

          {/* Check-Out Date */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
            }`}>
              <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              Check-Out Date
            </label>
            <input
              type="date"
              value={searchFilters.checkOutDate}
              min={getTomorrowFormatted(searchFilters.checkInDate)}
              onChange={(e) => {
                const newOut = e.target.value;
                setSearchFilters({ ...searchFilters, checkOutDate: newOut });
                if (newOut && searchFilters.checkInDate && newOut <= searchFilters.checkInDate) {
                  setOccupiedError(`Invalid Check-Out Date: Check-out must be strictly after Check-In (${searchFilters.checkInDate}).`);
                } else {
                  setOccupiedError(null);
                }
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${
                isLight
                  ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                  : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
              }`}
              required
            />
          </div>

          {/* Adults */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
            }`}>
              <Users className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              Adults
            </label>
            <select
              value={searchFilters.adults}
              onChange={(e) => setSearchFilters({ ...searchFilters, adults: parseInt(e.target.value) || 1 })}
              className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${
                isLight
                  ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                  : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
              }`}
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Adult' : 'Adults'}
                </option>
              ))}
            </select>
          </div>

          {/* Children */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
            }`}>
              <Users className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              Children
            </label>
            <select
              value={searchFilters.children}
              onChange={(e) => setSearchFilters({ ...searchFilters, children: parseInt(e.target.value) || 0 })}
              className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${
                isLight
                  ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                  : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
              }`}
            >
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Child' : 'Children'}
                </option>
              ))}
            </select>
          </div>

          {/* Accommodation Options */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
            }`}>
              <BedDouble className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              All Accommodation Options
            </label>
            <select
              value={searchFilters.roomType}
              onChange={(e) => {
                const val = e.target.value;
                setSearchFilters({ ...searchFilters, roomType: val, cottageType: 'All' });
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${
                isLight
                  ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                  : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
              }`}
            >
              <option value="All">All Accommodation Options</option>
              <option value="Cottages">1. Cottages</option>
              <option value="Filipino Kubos">2. Filipino Kubos</option>
              <option value="Rooms and Suites">3. Rooms and suites</option>
            </select>
          </div>

          {/* Conditional Secondary Dropdown if Category Selected */}
          {searchFilters.roomType === 'Cottages' && (
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
              }`}>
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                Select Cottage
              </label>
              <select
                value={searchFilters.cottageType || 'All'}
                onChange={(e) => setSearchFilters({ ...searchFilters, cottageType: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                    : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                }`}
              >
                <option value="All">All Cottages</option>
                {rooms
                  .filter((r) => r.category === 'Cottages')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.isComingSoon ? '(Coming Soon)' : `(₱${r.pricePerNight.toLocaleString()})`}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {searchFilters.roomType === 'Filipino Kubos' && (
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
              }`}>
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                Select Kubo Option
              </label>
              <select
                value={searchFilters.cottageType || 'All'}
                onChange={(e) => setSearchFilters({ ...searchFilters, cottageType: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                    : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                }`}
              >
                <option value="All">All Filipino Kubos</option>
                {rooms
                  .filter((r) => r.category === 'Filipino Kubos')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.isComingSoon ? '(Coming Soon)' : `(₱${r.pricePerNight.toLocaleString()})`}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {searchFilters.roomType === 'Rooms and Suites' && (
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
              }`}>
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                Select Room / Suite
              </label>
              <select
                value={searchFilters.cottageType || 'All'}
                onChange={(e) => setSearchFilters({ ...searchFilters, cottageType: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                    : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                }`}
              >
                <option value="All">All Rooms & Suites</option>
                {rooms
                  .filter((r) => r.category === 'Rooms and Suites' || !r.category)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.isComingSoon ? '(Coming Soon)' : `(₱${r.pricePerNight.toLocaleString()}/night)`}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer h-[42px] ${
                isLight
                  ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white'
                  : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
              }`}
            >
              <Search className={`w-4 h-4 ${isLight ? 'text-white' : 'text-[#1c2a20]'}`} />
              <span>CHECK AVAILABILITY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
