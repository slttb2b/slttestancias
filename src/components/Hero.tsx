import React from 'react';
import { useResort } from '../context/ResortContext';
import heroBgImg from '../assets/images/resort_hero_bg_1785309990556.jpg';
import { EditableText } from './common/EditableText';
import { EditableImage } from './common/EditableImage';
import { MapPin, Calendar, Compass } from 'lucide-react';

export const Hero: React.FC = () => {
  const { resortInfo, updateResortInfo, setIsBookingModalOpen, setSelectedRoomForBooking, setSelectedPackageForBooking, theme } = useResort();
  const isLight = theme === 'light';
  const heroImage = resortInfo.designAssets?.heroBgImg || heroBgImg;

  const handleHeroImageChange = (newUrl: string) => {
    updateResortInfo({
      ...resortInfo,
      designAssets: {
        ...resortInfo.designAssets,
        heroBgImg: newUrl,
      } as any,
    });
  };

  const handleBookClick = () => {
    setSelectedRoomForBooking(null);
    setSelectedPackageForBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleExploreClick = () => {
    const el = document.getElementById('rooms');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`relative w-full min-h-[88vh] flex items-center justify-center overflow-hidden transition-colors duration-300 ${
      isLight ? 'bg-[#faf8f5] text-[#1c2a20]' : 'bg-[#1c2a20] text-[#ebe5de]'
    }`}>
      {/* Background Image with Editable Image Overlay */}
      <div className="absolute inset-0 z-0">
        <EditableImage
          src={heroImage}
          alt="SLTT ESTANCIAS Resort Hero"
          onChange={handleHeroImageChange}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
          containerClassName="w-full h-full relative group/img-editable overflow-hidden"
        />
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
          isLight
            ? 'bg-gradient-to-t from-[#faf8f5] via-[#faf8f5]/75 to-[#faf8f5]/40'
            : 'bg-gradient-to-t from-[#1c2a20] via-[#132016]/75 to-[#0e1710]/50'
        }`} />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Location Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-medium backdrop-blur-md mb-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 ${
          isLight
            ? 'bg-white/95 border-[#2d4536]/20 text-[#2d4536]'
            : 'bg-[#132016]/90 border-[#606e60] text-[#c3ccc0]'
        }`}>
          <MapPin className={`w-4 h-4 shrink-0 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
          <span>
            <EditableText
              value={resortInfo.location}
              onChange={(val) => updateResortInfo({ ...resortInfo, location: val })}
              as="span"
            />
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-[#2d4536]' : 'bg-[#c3ccc0]'}`} />
          <span className={`font-serif italic ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Lugait Nature Sanctuary</span>
        </div>

        {/* Main Headline */}
        <h1 className={`text-4xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight mb-6 leading-tight drop-shadow-sm ${
          isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
        }`}>
          <EditableText
            value={resortInfo.heroTitle || 'Escape to SLTT ESTANCIAS RESORT'}
            onChange={(val) => updateResortInfo({ ...resortInfo, heroTitle: val })}
            as="span"
          />
        </h1>

        {/* Subheadline */}
        <p className={`text-lg sm:text-xl md:text-2xl max-w-3xl mb-10 font-light leading-relaxed ${
          isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
        }`}>
          <EditableText
            value={resortInfo.heroSubtitle || 'Your Private Tropical Sanctuary in Tigbao, Lugait'}
            onChange={(val) => updateResortInfo({ ...resortInfo, heroSubtitle: val })}
            as="span"
          />
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
          <button
            onClick={handleBookClick}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base tracking-wider shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer border ${
              isLight
                ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white border-[#2d4536]'
                : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] border-[#ebe5de]/30'
            }`}
          >
            <Calendar className={`w-5 h-5 ${isLight ? 'text-white' : 'text-[#1c2a20]'}`} />
            <span className="uppercase">
              <EditableText
                value={resortInfo.heroCtaText || 'Reserve Your Villa'}
                onChange={(val) => updateResortInfo({ ...resortInfo, heroCtaText: val })}
                as="span"
              />
            </span>
          </button>
          <button
            onClick={handleExploreClick}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base border backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              isLight
                ? 'bg-white/90 hover:bg-[#f4efe6] text-[#1c2a20] border-[#2d4536]/20'
                : 'bg-[#132016]/90 hover:bg-[#1c2a20] text-[#ebe5de] border-[#606e60]'
            }`}
          >
            <Compass className={`w-5 h-5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
            <span>EXPLORE RESORT & ROOMS</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-8 border-t w-full max-w-3xl text-center ${
          isLight ? 'border-[#e2dcd0]' : 'border-[#606e60]/40'
        }`}>
          <div className="flex flex-col items-center">
            <span className={`font-bold text-lg sm:text-xl font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>
              <EditableText
                value={resortInfo.trustBadge1Title || 'MOUNTAIN ESCAPE'}
                onChange={(val) => updateResortInfo({ ...resortInfo, trustBadge1Title: val })}
                as="span"
              />
            </span>
            <span className={`text-xs mt-0.5 ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>
              <EditableText
                value={resortInfo.trustBadge1Sub || 'Nature • Relaxation • Comfort'}
                onChange={(val) => updateResortInfo({ ...resortInfo, trustBadge1Sub: val })}
                as="span"
              />
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className={`font-bold text-lg sm:text-xl font-serif ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>
              <EditableText
                value={resortInfo.trustBadge2Title || 'INFINITY POOL'}
                onChange={(val) => updateResortInfo({ ...resortInfo, trustBadge2Title: val })}
                as="span"
              />
            </span>
            <span className={`text-xs mt-0.5 ${isLight ? 'text-[#3c5241]' : 'text-[#ad9e92]'}`}>
              <EditableText
                value={resortInfo.trustBadge2Sub || 'Mountain & Nature View'}
                onChange={(val) => updateResortInfo({ ...resortInfo, trustBadge2Sub: val })}
                as="span"
              />
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className={`font-bold text-lg sm:text-xl font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>
              <EditableText
                value={resortInfo.trustBadge3Title || '100% RELAXATION'}
                onChange={(val) => updateResortInfo({ ...resortInfo, trustBadge3Title: val })}
                as="span"
              />
            </span>
            <span className={`text-xs mt-0.5 ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>
              <EditableText
                value={resortInfo.trustBadge3Sub || 'Your Mountain Escape'}
                onChange={(val) => updateResortInfo({ ...resortInfo, trustBadge3Sub: val })}
                as="span"
              />
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className={`font-bold text-lg sm:text-xl font-serif ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>
              <EditableText
                value={resortInfo.trustBadge4Title || 'FRESH DINING'}
                onChange={(val) => updateResortInfo({ ...resortInfo, trustBadge4Title: val })}
                as="span"
              />
            </span>
            <span className={`text-xs mt-0.5 ${isLight ? 'text-[#3c5241]' : 'text-[#ad9e92]'}`}>
              <EditableText
                value={resortInfo.trustBadge4Sub || 'Local & Farm-Fresh Flavors'}
                onChange={(val) => updateResortInfo({ ...resortInfo, trustBadge4Sub: val })}
                as="span"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
