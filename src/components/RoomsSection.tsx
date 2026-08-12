import React from 'react';
import { useResort } from '../context/ResortContext';
import { Room } from '../types';
import { Users, BedDouble, Sparkles, Check, ArrowRight, Eye, Calendar } from 'lucide-react';
import { EditableText } from './common/EditableText';
import { EditableImage } from './common/EditableImage';

export const RoomsSection: React.FC = () => {
  const { rooms, setRooms, setSelectedRoomDetails, setSelectedRoomForBooking, setIsBookingModalOpen, theme } = useResort();
  const isLight = theme === 'light';
  const [selectedCategory, setSelectedCategory] = React.useState<'All' | 'Rooms and Suites' | 'Cottages' | 'Filipino Kubos'>('All');

  const filteredRooms = selectedCategory === 'All'
    ? rooms
    : rooms.filter((r) => (r.category || 'Rooms and Suites') === selectedCategory);

  const handleUpdateRoomImage = (roomId: string, newImg: string) => {
    const updated = rooms.map((r) => (r.id === roomId ? { ...r, featuredImage: newImg } : r));
    setRooms(updated);
  };

  const handleUpdateRoomName = (roomId: string, newName: string) => {
    const updated = rooms.map((r) => (r.id === roomId ? { ...r, name: newName } : r));
    setRooms(updated);
  };

  const handleUpdateRoomDesc = (roomId: string, newDesc: string) => {
    const updated = rooms.map((r) => (r.id === roomId ? { ...r, description: newDesc } : r));
    setRooms(updated);
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoomDetails(room);
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoomForBooking(room);
    setIsBookingModalOpen(true);
  };

  return (
    <section id="rooms" className={`py-20 relative transition-colors duration-300 ${
      isLight ? 'bg-[#f9f7f2] text-[#1c2a20]' : 'bg-[#132016] text-[#ebe5de]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border ${
            isLight
              ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
              : 'bg-[#1c2a20] border-[#606e60] text-[#c3ccc0]'
          }`}>
            <BedDouble className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
            Accommodations & Cottages
          </div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif ${
            isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
          }`}>
            Resort Facilities & Stays
          </h2>
          <p className={`text-base sm:text-lg font-light ${
            isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
          }`}>
            Choose from overnight rooms, relaxing day cottages, or authentic Filipino kubos surrounded by mountain air.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {(['All', 'Cottages', 'Filipino Kubos', 'Rooms and Suites'] as const).map((cat) => {
            const count = cat === 'All' ? rooms.length : rooms.filter((r) => (r.category || 'Rooms and Suites') === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  isActive
                    ? isLight
                      ? 'bg-[#2d4536] text-white border-[#2d4536] shadow-md'
                      : 'bg-[#ad9e92] text-[#1c2a20] border-[#ad9e92] shadow-md font-extrabold'
                    : isLight
                      ? 'bg-white text-[#2d4536] border-[#d8d0c2] hover:bg-[#eaf0eb]'
                      : 'bg-[#1c2a20] text-[#c3ccc0] border-[#606e60]/60 hover:bg-[#25362a]'
                }`}
              >
                {cat === 'All' ? 'All Accommodations' : cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className={`group rounded-3xl overflow-hidden border shadow-lg transition-all duration-300 flex flex-col transform hover:-translate-y-1.5 ${
                isLight
                  ? 'bg-white border-[#e0d9cc] hover:border-[#2d4536]/40 hover:shadow-xl'
                  : 'bg-[#1c2a20] border-[#606e60]/60 hover:border-[#c3ccc0]/80'
              }`}
            >
              {/* Image & Price Overlay */}
              <div className={`relative h-64 overflow-hidden ${isLight ? 'bg-[#f4efe6]' : 'bg-[#132016]'}`}>
                <EditableImage
                  src={room.featuredImage}
                  alt={room.name}
                  onChange={(newImg) => handleUpdateRoomImage(room.id, newImg)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full relative group/img-editable overflow-hidden"
                />
                <div className={`absolute inset-0 opacity-85 pointer-events-none ${
                  isLight
                    ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'
                    : 'bg-gradient-to-t from-[#1c2a20] via-transparent to-transparent'
                }`} />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-md uppercase tracking-wider ${
                    isLight
                      ? 'bg-[#2d4536] text-white border-[#2d4536]'
                      : 'bg-[#132016]/90 text-[#ad9e92] border-[#606e60]'
                  }`}>
                    {room.category || 'Rooms and Suites'}
                  </span>
                </div>

                {/* Price Tag */}
                <div className={`absolute top-4 right-4 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border z-10 ${
                  isLight
                    ? 'bg-white/95 border-[#2d4536]/20 text-[#1c2a20]'
                    : 'bg-[#132016]/90 border-[#ad9e92] text-[#ebe5de]'
                }`}>
                  <span className={`font-bold font-serif text-lg ${isLight ? 'text-[#2d4536]' : 'text-[#ebe5de]'}`}>
                    ₱{room.pricePerNight.toLocaleString()}
                  </span>
                  <span className={`text-xs ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>
                    {room.category === 'Cottages' ? ' / day' : ' / night'}
                  </span>
                </div>

                {/* Coming Soon Overlay Banner */}
                {room.isComingSoon && (
                  <div className="absolute inset-x-0 bottom-16 bg-amber-500/95 text-slate-950 font-extrabold text-xs py-1.5 px-3 text-center shadow-lg uppercase tracking-wider backdrop-blur-sm z-10 flex items-center justify-center gap-1.5 border-y border-amber-300">
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>{room.comingSoonNotice ? `UNAVAILABLE - ${room.comingSoonNotice}` : 'CURRENTLY UNAVAILABLE (COMING SOON)'}</span>
                  </div>
                )}

                {/* Badge Tagline */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className={`text-xs font-medium px-3 py-1 rounded-lg border backdrop-blur-md inline-block mb-1 ${
                    isLight
                      ? 'bg-white/95 text-[#2d4536] border-[#2d4536]/20'
                      : 'bg-[#132016]/90 text-[#c3ccc0] border-[#606e60]'
                  }`}>
                    {room.tagline}
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-white drop-shadow-sm">
                    <EditableText
                      value={room.name}
                      onChange={(val) => handleUpdateRoomName(room.id, val)}
                      as="span"
                    />
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <p className={`text-sm leading-relaxed ${
                    isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
                  }`}>
                    <EditableText
                      value={room.description || room.shortDescription}
                      onChange={(val) => handleUpdateRoomDesc(room.id, val)}
                      as="span"
                    />
                  </p>

                  {/* Room Specs */}
                  <div className={`grid grid-cols-2 gap-3 py-3 border-y text-xs ${
                    isLight ? 'border-[#e0d9cc] text-[#27382b]' : 'border-[#606e60]/40 text-[#c3ccc0]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Users className={`w-4 h-4 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                      <span>Max {room.maxGuests} Guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BedDouble className={`w-4 h-4 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />
                      <span>{room.bedType}</span>
                    </div>
                  </div>

                  {/* Amenities Highlights */}
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.slice(0, 4).map((amenity, idx) => (
                      <span
                        key={idx}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                          isLight
                            ? 'bg-[#f4efe6] text-[#2d4536] border-[#e0d9cc]'
                            : 'bg-[#132016] text-[#c3ccc0] border-[#606e60]/40'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${
                        isLight
                          ? 'bg-[#eaf0eb] text-[#2d4536] border-[#2d4536]/20'
                          : 'bg-[#132016] text-[#ad9e92] border-[#606e60]/40'
                      }`}>
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleViewDetails(room)}
                    className={`py-2.5 px-3 rounded-xl font-medium text-xs border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-[#f4efe6] hover:bg-[#e6dfd1] text-[#1c2a20] border-[#d4cbba]'
                        : 'bg-[#132016] hover:bg-[#25362a] text-[#ebe5de] border-[#606e60]'
                    }`}
                  >
                    <Eye className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                    <span>VIEW DETAILS</span>
                  </button>
                  <button
                    onClick={() => handleBookRoom(room)}
                    className={`py-2.5 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                      room.isComingSoon
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : isLight
                          ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white'
                          : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{room.isComingSoon ? 'COMING SOON' : 'BOOK NOW'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
