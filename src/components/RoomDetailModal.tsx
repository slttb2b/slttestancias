import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { X, Users, BedDouble, Maximize2, Check, Calendar, Sparkles } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUtils';

export const RoomDetailModal: React.FC = () => {
  const {
    selectedRoomDetails,
    setSelectedRoomDetails,
    setSelectedRoomForBooking,
    setIsBookingModalOpen,
  } = useResort();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedRoomDetails) return null;

  const room = selectedRoomDetails;
  const images = room.galleryImages.length > 0 ? room.galleryImages : [room.featuredImage];

  const handleBookThisRoom = () => {
    setSelectedRoomForBooking(room);
    setSelectedRoomDetails(null);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#132016]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-4xl w-full my-8 shadow-2xl text-[#ebe5de] overflow-hidden relative animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={() => setSelectedRoomDetails(null)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#1c2a20]/80 border border-[#606e60]/60 text-[#c3ccc0] hover:text-[#ebe5de] flex items-center justify-center cursor-pointer shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-[#1c2a20] flex flex-col justify-between space-y-4">
            <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#606e60]/60 shadow-xl">
              <img
                src={resolveImageUrl(images[activeImageIndex] || room.featuredImage)}
                alt={room.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 bg-[#132016]/90 px-3 py-1 rounded-md text-xs text-[#ad9e92] font-medium border border-[#606e60]">
                {room.tagline}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-[#ad9e92] scale-105 shadow-md' : 'border-[#606e60]/60 opacity-60'
                  }`}
                >
                  <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Room Specs & Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-[#c3ccc0] uppercase tracking-widest bg-[#1c2a20] px-2.5 py-1 rounded-md border border-[#606e60]">
                  {room.bedType}
                </span>
                <h2 className="text-3xl font-bold font-serif text-[#ebe5de] mt-2">{room.name}</h2>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-serif text-[#ad9e92]">
                  ₱{room.pricePerNight.toLocaleString()}
                </span>
                <span className="text-xs text-[#c3ccc0]">/ night</span>
              </div>

              <p className="text-[#c3ccc0] text-sm leading-relaxed font-light">
                {room.fullDescription}
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#606e60]/60 text-xs text-[#c3ccc0]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#ad9e92]" />
                  <span>Max Occupancy: {room.maxGuests} Guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-[#ad9e92]" />
                  <span>{room.bedType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-[#ad9e92]" />
                  <span>Room Size: {room.sizeSqM} m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ad9e92]" />
                  <span>Daily Sanctuary Cleaning</span>
                </div>
              </div>

              {/* All Amenities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#ad9e92] mb-2">
                  Room Inclusions & Amenities:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#c3ccc0]">
                  {room.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#ad9e92] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleBookThisRoom}
              className="w-full py-3.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#1c2a20]" />
              <span>BOOK THIS ROOM NOW</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
