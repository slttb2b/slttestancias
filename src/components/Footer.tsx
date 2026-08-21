import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { MapPin, PhoneCall, Mail, Facebook, Shield, FileText, Heart } from 'lucide-react';
import { EditableText } from './common/EditableText';

interface FooterProps {
  onOpenPrivacyTerms: (type: 'privacy' | 'terms') => void;
  onOpenDocs: () => void;
  onOpenMyBookings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacyTerms,
  onOpenDocs,
  onOpenMyBookings,
}) => {
  const { resortInfo, updateResortInfo, setActiveTab, setIsBookingModalOpen, setSelectedRoomForBooking, theme } = useResort();
  const isLight = theme === 'light';

  const handleNavClick = (sectionId: string) => {
    setActiveTab(sectionId as any);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookClick = () => {
    setSelectedRoomForBooking(null);
    setIsBookingModalOpen(true);
  };

  return (
    <footer className={`pt-16 pb-12 transition-colors duration-300 border-t ${
      isLight
        ? 'bg-[#1c2a20] text-[#ebe5de] border-[#2d4536]'
        : 'bg-[#132016] text-[#c3ccc0] border-[#606e60]/40'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#606e60]/60">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#26442e] border border-[#606e60]/60 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src="/sltt-logo.jpg"
                  alt="SLTT ESTANCIAS"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/favicon.svg';
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-bold tracking-wider font-serif text-[#ebe5de] block">
                  <EditableText
                    value={resortInfo.name}
                    onChange={(val) => updateResortInfo({ ...resortInfo, name: val })}
                    as="span"
                  />
                </span>
                <span className="text-[10px] text-[#c3ccc0] tracking-widest uppercase block font-semibold">
                  <EditableText
                    value={resortInfo.location}
                    onChange={(val) => updateResortInfo({ ...resortInfo, location: val })}
                    as="span"
                  />
                </span>
              </div>
            </div>

            <p className="text-xs text-[#c3ccc0] leading-relaxed max-w-sm font-light">
              <EditableText
                value={resortInfo.aboutText || 'Your premier resort sanctuary in Tigbao, Mauswagon Lugait. Providing peaceful tropical stays, private pool villas, infinity pool relaxation, and warm Filipino hospitality.'}
                onChange={(val) => updateResortInfo({ ...resortInfo, aboutText: val })}
                as="span"
              />
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#132016] border border-[#606e60]/60 flex items-center justify-center text-[#ad9e92] hover:text-[#ebe5de] hover:bg-[#25362a] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <button
                onClick={onOpenDocs}
                className="px-3 py-1.5 rounded-lg bg-[#132016] border border-[#606e60]/60 text-xs text-[#c3ccc0] hover:text-[#ebe5de] flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#ad9e92]" />
                <span>Developer Guide</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ad9e92] font-serif">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-[#ebe5de] transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('about')} className="hover:text-[#ebe5de] transition-colors cursor-pointer">
                  About Resort
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('rooms')} className="hover:text-[#ebe5de] transition-colors cursor-pointer">
                  Rooms & Suites
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('packages')} className="hover:text-[#ebe5de] transition-colors cursor-pointer">
                  Special Packages
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('amenities')} className="hover:text-[#ebe5de] transition-colors cursor-pointer">
                  Amenities
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('gallery')} className="hover:text-[#ebe5de] transition-colors cursor-pointer">
                  Photo Gallery
                </button>
              </li>
            </ul>
          </div>

          {/* Guest Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ad9e92] font-serif">Guest Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={handleBookClick} className="text-[#ad9e92] font-semibold hover:underline cursor-pointer">
                  Book A Room Online
                </button>
              </li>
              <li>
                <button onClick={onOpenMyBookings} className="hover:text-[#ebe5de] transition-colors cursor-pointer">
                  Track Reservation
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('location')} className="hover:text-[#ebe5de] transition-colors cursor-pointer">
                  Location & Directions
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('contact')} className="hover:text-[#ebe5de] transition-colors cursor-pointer">
                  Contact Front Desk
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="text-[#c3ccc0] font-medium hover:underline cursor-pointer">
                  Resort Owner Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ad9e92] font-serif">Contact Info</h4>
            <div className="space-y-2.5 text-xs text-[#c3ccc0]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#c3ccc0] shrink-0 mt-0.5" />
                <span>{resortInfo.address}</span>
              </p>
              <div className="flex items-start gap-2">
                <PhoneCall className="w-4 h-4 text-[#ad9e92] shrink-0 mt-0.5" />
                <div className="flex flex-col space-y-0.5">
                  <a href="tel:09455768405" className="text-[#ebe5de] hover:underline">
                    Globe: 0945 576 8405
                  </a>
                  <a href="tel:09296690344" className="text-[#ebe5de] hover:underline">
                    Smart: 0929 669 0344
                  </a>
                </div>
              </div>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#ad9e92] shrink-0" />
                <a href={`mailto:${resortInfo.email}`} className="text-[#ad9e92] hover:underline truncate">
                  {resortInfo.email}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#c3ccc0]/80">
          <p>© {new Date().getFullYear()} {resortInfo.name}. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onOpenPrivacyTerms('privacy')}
              className="hover:text-[#ebe5de] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenPrivacyTerms('terms')}
              className="hover:text-[#ebe5de] transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
