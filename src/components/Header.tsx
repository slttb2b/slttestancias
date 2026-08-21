import React, { useState } from 'react';
import { useResort, ActiveTab } from '../context/ResortContext';
import {
  Palmtree,
  CalendarCheck,
  ShieldCheck,
  BookOpen,
  Menu,
  X,
  PhoneCall,
  MapPin,
  Clock,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { EditableText } from './common/EditableText';

interface HeaderProps {
  onOpenDocs: () => void;
  onOpenMyBookings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDocs, onOpenMyBookings }) => {
  const {
    activeTab,
    setActiveTab,
    resortInfo,
    updateResortInfo,
    setIsBookingModalOpen,
    setSelectedRoomForBooking,
    setSelectedPackageForBooking,
    theme,
    toggleTheme,
  } = useResort();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    if (tab !== 'admin' && tab !== 'my-bookings') {
      const element = document.getElementById(tab);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBookNowClick = () => {
    setSelectedRoomForBooking(null);
    setSelectedPackageForBooking(null);
    setIsBookingModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const navItems: { label: string; tab: ActiveTab; sectionId?: string }[] = [
    { label: 'Home', tab: 'home' },
    { label: 'About', tab: 'about' },
    { label: 'Rooms & Suites', tab: 'rooms' },
    { label: 'Packages', tab: 'packages' },
    { label: 'Amenities', tab: 'amenities' },
    { label: 'Gallery', tab: 'gallery' },
    { label: 'Location', tab: 'location' },
    { label: 'Contact', tab: 'contact' },
  ];

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md transition-colors duration-300 shadow-md ${
      isLight ? 'bg-white/95 border-b border-[#e2dcd0] text-[#1c2a20]' : 'bg-[#132016]/95 border-b border-[#606e60]/30 text-[#ebe5de]'
    }`}>
      {/* Top Banner Contact Strip */}
      <div className={`py-1.5 px-4 text-xs hidden md:block border-b transition-colors ${
        isLight ? 'bg-[#f4efe6] border-[#e2dcd0] text-[#3c5241]' : 'bg-[#0e1710] border-[#606e60]/40 text-[#c3ccc0]'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              {resortInfo.location}
            </span>
            <div className="flex items-center gap-2 font-medium">
              <PhoneCall className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              <div className="flex items-center gap-2">
                <a
                  href="tel:09455768405"
                  className={`hover:underline transition-colors ${
                    isLight ? 'hover:text-[#1c2a20]' : 'hover:text-[#ebe5de]'
                  }`}
                  title="Call Globe"
                >
                  <span className="opacity-75 font-normal mr-0.5">Globe:</span> 0945 576 8405
                </a>
                <span className="opacity-40">|</span>
                <a
                  href="tel:09296690344"
                  className={`hover:underline transition-colors ${
                    isLight ? 'hover:text-[#1c2a20]' : 'hover:text-[#ebe5de]'
                  }`}
                  title="Call Smart"
                >
                  <span className="opacity-75 font-normal mr-0.5">Smart:</span> 0929 669 0344
                </a>
              </div>
            </div>
            <span className="flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              {resortInfo.businessHours}
            </span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <button
              onClick={onOpenMyBookings}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                isLight ? 'text-[#2d4536] hover:text-[#1c2a20]' : 'text-[#c3ccc0] hover:text-[#ebe5de]'
              }`}
            >
              <CalendarCheck className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              <span>Track Reservation</span>
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                isLight ? 'text-[#2d4536] hover:text-[#1c2a20]' : 'text-[#c3ccc0] hover:text-[#ebe5de]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Portal</span>
            </button>
            <button
              onClick={onOpenDocs}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                isLight ? 'text-[#2d4536] hover:text-[#1c2a20]' : 'text-[#ad9e92] hover:text-[#ebe5de]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Developer Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ${
            isLight ? 'bg-[#2d4536] text-white border border-[#2d4536]' : 'bg-[#1c2a20] border border-[#606e60] text-[#c3ccc0]'
          }`}>
            <Palmtree className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-xl font-bold tracking-wider font-serif transition-colors block leading-tight ${
              isLight ? 'text-[#1c2a20] group-hover:text-[#2d4536]' : 'text-[#ebe5de] group-hover:text-[#c3ccc0]'
            }`}>
              <EditableText
                value={resortInfo.name}
                onChange={(val) => updateResortInfo({ ...resortInfo, name: val })}
                as="span"
              />
            </span>
            <span className={`text-[10px] tracking-widest uppercase block font-sans font-semibold ${
              isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
            }`}>
              <EditableText
                value={resortInfo.tagline}
                onChange={(val) => updateResortInfo({ ...resortInfo, tagline: val })}
                as="span"
              />
            </span>
          </div>
        </button>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'bg-[#f4efe6] text-[#2d4536] font-bold border border-[#d6cdbc] shadow-sm'
                      : 'bg-[#1c2a20] text-[#ebe5de] border border-[#606e60] shadow-sm'
                    : isLight
                    ? 'text-[#27382b] hover:text-[#2d4536] hover:bg-[#f4efe6]'
                    : 'text-[#c3ccc0] hover:text-[#ebe5de] hover:bg-[#1c2a20]/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
              isLight
                ? 'bg-[#f4efe6] border-[#d6cdbc] text-[#2d4536] hover:bg-[#e8e2d4]'
                : 'bg-[#1c2a20] border-[#606e60] text-[#c3ccc0] hover:bg-[#132016]'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Theme"
          >
            {isLight ? <Moon className="w-4 h-4 text-[#2d4536]" /> : <Sun className="w-4 h-4 text-[#ad9e92]" />}
          </button>

          <button
            onClick={onOpenMyBookings}
            className={`lg:hidden p-2 rounded-lg ${
              isLight ? 'text-[#2d4536] hover:bg-[#f4efe6]' : 'text-[#c3ccc0] hover:text-[#ebe5de] hover:bg-[#1c2a20]'
            }`}
            title="Track Booking"
          >
            <CalendarCheck className="w-5 h-5" />
          </button>

          <button
            onClick={handleBookNowClick}
            className={`hidden sm:flex px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${
              isLight
                ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white'
                : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>BOOK YOUR STAY</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={handleBookNowClick}
              className={`sm:hidden px-3.5 py-1.5 rounded-lg font-bold text-xs ${
                isLight ? 'bg-[#2d4536] text-white' : 'bg-[#ad9e92] text-[#1c2a20]'
              }`}
            >
              BOOK
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg border focus:outline-none cursor-pointer ${
                isLight
                  ? 'bg-[#f4efe6] text-[#1c2a20] border-[#d6cdbc]'
                  : 'bg-[#1c2a20] text-[#ebe5de] hover:text-[#c3ccc0] border-[#606e60]/60'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden border-b px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 ${
          isLight ? 'bg-[#faf8f5] border-[#e2dcd0]' : 'bg-[#132016] border-[#606e60]/60'
        }`}>
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.tab
                    ? isLight
                      ? 'bg-[#f4efe6] text-[#2d4536] font-bold border border-[#d6cdbc]'
                      : 'bg-[#1c2a20] text-[#ad9e92] font-semibold border border-[#606e60]/60'
                    : isLight
                    ? 'text-[#27382b] hover:bg-[#f4efe6]'
                    : 'text-[#c3ccc0] hover:bg-[#1c2a20]/60 hover:text-[#ebe5de]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={`pt-4 border-t space-y-2 ${isLight ? 'border-[#e2dcd0]' : 'border-[#606e60]/40'}`}>
            <button
              onClick={() => {
                onOpenMyBookings();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                isLight ? 'text-[#27382b] hover:bg-[#f4efe6]' : 'text-[#c3ccc0] hover:bg-[#1c2a20] hover:text-[#ebe5de]'
              }`}
            >
              <CalendarCheck className={`w-4 h-4 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              <span>Track Reservation</span>
            </button>
            <button
              onClick={() => {
                handleNavClick('admin');
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                isLight ? 'text-[#27382b] hover:bg-[#f4efe6]' : 'text-[#c3ccc0] hover:bg-[#1c2a20] hover:text-[#ebe5de]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Resort Owner Portal</span>
            </button>
            <button
              onClick={() => {
                onOpenDocs();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                isLight ? 'text-[#27382b] hover:bg-[#f4efe6]' : 'text-[#c3ccc0] hover:bg-[#1c2a20] hover:text-[#ebe5de]'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              <span>Developer & Setup Guide</span>
            </button>
            <button
              onClick={handleBookNowClick}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide text-center cursor-pointer transition-colors ${
                isLight ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white' : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
              }`}
            >
              BOOK YOUR STAY
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
