import React from 'react';
import { useResort } from '../context/ResortContext';
import { Package } from '../types';
import { Gift, Check, Clock, Users, Calendar, Sparkles } from 'lucide-react';
import { EditableText } from './common/EditableText';
import { EditableImage } from './common/EditableImage';

export const PackagesSection: React.FC = () => {
  const { packages, setPackages, setSelectedPackageForBooking, setSelectedRoomForBooking, setIsBookingModalOpen, theme } = useResort();
  const isLight = theme === 'light';

  const handleUpdatePkgImage = (pkgId: string, newImg: string) => {
    const updated = packages.map((p) => (p.id === pkgId ? { ...p, featuredImage: newImg } : p));
    setPackages(updated);
  };

  const handleUpdatePkgName = (pkgId: string, newName: string) => {
    const updated = packages.map((p) => (p.id === pkgId ? { ...p, name: newName } : p));
    setPackages(updated);
  };

  const handleUpdatePkgDesc = (pkgId: string, newDesc: string) => {
    const updated = packages.map((p) => (p.id === pkgId ? { ...p, description: newDesc } : p));
    setPackages(updated);
  };

  const handleUpdatePkgTagline = (pkgId: string, newTagline: string) => {
    const updated = packages.map((p) => (p.id === pkgId ? { ...p, tagline: newTagline } : p));
    setPackages(updated);
  };

  const handleBookPackage = (pkg: Package) => {
    setSelectedPackageForBooking(pkg);
    setSelectedRoomForBooking(null);
    setIsBookingModalOpen(true);
  };

  return (
    <section id="packages" className={`py-20 relative transition-colors duration-300 ${
      isLight ? 'bg-white text-[#1c2a20]' : 'bg-[#1c2a20] text-[#ebe5de]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border ${
            isLight
              ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
              : 'bg-[#132016] border-[#606e60] text-[#c3ccc0]'
          }`}>
            <Gift className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
            Exclusive Offers
          </div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif ${
            isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
          }`}>
            Special Resort Packages
          </h2>
          <p className={`text-base sm:text-lg font-light ${
            isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
          }`}>
            All-inclusive stays tailored for couples, families, day tourists, and group sanctuary getaways.
          </p>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-3xl border overflow-hidden flex flex-col justify-between group transition-all duration-300 relative shadow-md ${
                pkg.isPopular
                  ? isLight
                    ? 'border-[#2d4536] shadow-xl ring-2 ring-[#2d4536]/20 bg-[#faf8f5]'
                    : 'border-[#ad9e92] shadow-2xl ring-1 ring-[#ad9e92]/40 bg-[#132016]/90'
                  : isLight
                    ? 'border-[#e0d9cc] bg-[#faf8f5] hover:border-[#2d4536]/40 hover:shadow-lg'
                    : 'border-[#606e60]/60 bg-[#132016]/90 hover:border-[#c3ccc0]/80'
              }`}
            >
              {pkg.isPopular && (
                <div className={`absolute top-4 right-4 z-10 font-bold text-xs uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1 ${
                  isLight
                    ? 'bg-[#2d4536] text-white'
                    : 'bg-[#ad9e92] text-[#1c2a20]'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div>
                {/* Image Header */}
                <div className={`relative h-48 overflow-hidden ${isLight ? 'bg-[#f4efe6]' : 'bg-[#1c2a20]'}`}>
                  <EditableImage
                    src={pkg.featuredImage}
                    alt={pkg.name}
                    onChange={(newImg) => handleUpdatePkgImage(pkg.id, newImg)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full relative group/img-editable overflow-hidden"
                  />
                  <div className={`absolute inset-0 opacity-90 pointer-events-none ${
                    isLight
                      ? 'bg-gradient-to-t from-black/80 via-transparent to-transparent'
                      : 'bg-gradient-to-t from-[#132016] via-transparent to-transparent'
                  }`} />

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border backdrop-blur-md ${
                      isLight
                        ? 'bg-white/90 text-[#2d4536] border-[#2d4536]/20'
                        : 'bg-[#1c2a20]/90 text-[#c3ccc0] border-[#606e60]'
                    }`}>
                      {pkg.duration}
                    </span>
                    <h3 className="text-2xl font-bold font-serif text-white mt-1 drop-shadow-sm">
                      <EditableText
                        value={pkg.name}
                        onChange={(val) => handleUpdatePkgName(pkg.id, val)}
                        as="span"
                      />
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6">
                  {/* Price Banner */}
                  <div className={`flex items-baseline gap-1 border-b pb-4 ${
                    isLight ? 'border-[#e0d9cc]' : 'border-[#606e60]/40'
                  }`}>
                    <span className={`text-3xl font-bold font-serif ${
                      isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
                    }`}>
                      ₱{pkg.price.toLocaleString()}
                    </span>
                    <span className={`text-xs font-light ${
                      isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
                    }`}>/ package deal</span>
                  </div>

                  <p className={`text-xs font-medium flex items-center gap-1.5 ${
                    isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
                  }`}>
                    <Users className={`w-4 h-4 shrink-0 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                    <EditableText
                      value={pkg.tagline || pkg.recommendedGuests}
                      onChange={(val) => handleUpdatePkgTagline(pkg.id, val)}
                      as="span"
                    />
                  </p>

                  {/* Inclusions List */}
                  <div className="space-y-2">
                    <h4 className={`text-xs font-semibold uppercase tracking-wider ${
                      isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'
                    }`}>
                      Package Inclusions:
                    </h4>
                    <ul className="space-y-2 text-xs">
                      {pkg.inclusions.map((item, idx) => (
                        <li key={idx} className={`flex items-start gap-2 ${
                          isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
                        }`}>
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Validity */}
                  <div className={`pt-2 flex items-center gap-1.5 text-[11px] ${
                    isLight ? 'text-[#4e6a55]' : 'text-[#c3ccc0]'
                  }`}>
                    <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                    <span>Validity: {pkg.validity}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleBookPackage(pkg)}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                    isLight
                      ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white'
                      : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>BOOK PACKAGE NOW</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
