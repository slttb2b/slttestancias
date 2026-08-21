import React from 'react';
import { useResort } from '../context/ResortContext';
import {
  Waves,
  Wifi,
  UtensilsCrossed,
  Car,
  Wind,
  Sun,
  ConciergeBell,
  Sparkles,
  CheckCircle2,
  Flame,
  Trees,
  Mic,
  ShieldCheck,
} from 'lucide-react';
import { EditableText } from './common/EditableText';

export const AmenitiesSection: React.FC = () => {
  const { amenities, updateAmenity, theme, resortInfo, updateResortInfo } = useResort();
  const isLight = theme === 'light';

  const handleUpdateAmenityName = (id: string, newName: string) => {
    const target = amenities.find((a) => a.id === id);
    if (target) {
      updateAmenity({ ...target, name: newName });
    }
  };

  const handleUpdateAmenityDesc = (id: string, newDesc: string) => {
    const target = amenities.find((a) => a.id === id);
    if (target) {
      updateAmenity({ ...target, description: newDesc });
    }
  };

  const handleUpdateAmenityTag = (id: string, newTag: string) => {
    const target = amenities.find((a) => a.id === id);
    if (target) {
      updateAmenity({ ...target, tag: newTag });
    }
  };

  const iconMap: Record<string, React.ReactNode> = {
    Waves: <Waves className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />,
    Wifi: <Wifi className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />,
    UtensilsCrossed: <UtensilsCrossed className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />,
    Car: <Car className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />,
    Flame: <Flame className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />,
    Trees: <Trees className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />,
    Mic: <Mic className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />,
    ShieldCheck: <ShieldCheck className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />,
    Wind: <Wind className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />,
    Sun: <Sun className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />,
    ConciergeBell: <ConciergeBell className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />,
    Sparkles: <Sparkles className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />,
  };

  return (
    <section id="amenities" className={`py-20 relative transition-colors duration-300 ${
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
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
            RESORT FACILITIES
          </div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif ${
            isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
          }`}>
            <EditableText
              value={resortInfo.amenitiesHeading || 'Amenities & Mountain Comforts'}
              onChange={(val) => updateResortInfo({ ...resortInfo, amenitiesHeading: val })}
              as="span"
            />
          </h2>
          <p className={`text-base sm:text-lg font-light ${
            isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
          }`}>
            <EditableText
              value={resortInfo.amenitiesSubtitle || 'Everything you need for a relaxing day or night at SLTT Estancias Resort, surrounded by nature and fresh mountain air.'}
              onChange={(val) => updateResortInfo({ ...resortInfo, amenitiesSubtitle: val })}
              as="span"
            />
          </p>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {amenities.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-6 transition-all duration-300 shadow-md group flex flex-col justify-between border ${
                isLight
                  ? 'bg-[#faf8f5] border-[#e2dcd0] hover:border-[#2d4536]/40 hover:shadow-xl'
                  : 'bg-[#132016]/90 border-[#606e60]/60 hover:border-[#c3ccc0]/80 shadow-xl'
              }`}
            >
              <div className="space-y-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border ${
                  isLight
                    ? 'bg-[#eaf0eb] border-[#2d4536]/20'
                    : 'bg-[#1c2a20] border-[#606e60]/60'
                }`}>
                  {iconMap[item.iconName] || <Sparkles className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />}
                </div>
                <h3 className={`text-xl font-bold font-serif transition-colors ${
                  isLight ? 'text-[#1c2a20] group-hover:text-[#2d4536]' : 'text-[#ebe5de] group-hover:text-[#c3ccc0]'
                }`}>
                  <EditableText
                    value={item.name}
                    onChange={(val) => handleUpdateAmenityName(item.id, val)}
                    as="span"
                  />
                </h3>
                <p className={`text-sm leading-relaxed ${
                  isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
                }`}>
                  <EditableText
                    value={item.description}
                    onChange={(val) => handleUpdateAmenityDesc(item.id, val)}
                    as="span"
                  />
                </p>
              </div>

              <div className={`pt-4 mt-4 flex items-center gap-1.5 text-xs font-medium border-t ${
                isLight ? 'border-[#e2dcd0] text-[#2d4536]' : 'border-[#606e60]/40 text-[#c3ccc0]'
              }`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                <span>
                  <EditableText
                    value={item.tag || 'Complimentary Guest Access'}
                    onChange={(val) => handleUpdateAmenityTag(item.id, val)}
                    as="span"
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
