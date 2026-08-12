import React from 'react';
import { useResort } from '../context/ResortContext';
import { ShieldCheck, Waves, Trees, Sparkles, MapPin, Coffee, Utensils } from 'lucide-react';
import villaPoolImg from '../assets/images/resort_villa_pool_1785310007598.jpg';
import infinityPoolImg from '../assets/images/resort_infinity_pool_1785310034114.jpg';
import { EditableText } from './common/EditableText';
import { EditableImage } from './common/EditableImage';

export const AboutSection: React.FC = () => {
  const { resortInfo, updateResortInfo, theme } = useResort();
  const isLight = theme === 'light';

  const mainAboutImg = resortInfo.designAssets?.aboutSectionImg || villaPoolImg;
  const secondaryAboutImg = resortInfo.designAssets?.infinityPoolImg || infinityPoolImg;

  const handleMainImgChange = (newUrl: string) => {
    updateResortInfo({
      ...resortInfo,
      designAssets: {
        ...resortInfo.designAssets,
        aboutSectionImg: newUrl,
      } as any,
    });
  };

  const handleSecondaryImgChange = (newUrl: string) => {
    updateResortInfo({
      ...resortInfo,
      designAssets: {
        ...resortInfo.designAssets,
        infinityPoolImg: newUrl,
      } as any,
    });
  };

  return (
    <section id="about" className={`py-20 relative overflow-hidden transition-colors duration-300 ${
      isLight ? 'bg-white text-[#1c2a20]' : 'bg-[#1c2a20] text-[#ebe5de]'
    }`}>
      {/* Decorative ambient nature glow */}
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isLight ? 'bg-[#2d4536]/5' : 'bg-[#606e60]/10'
      }`} />
      <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isLight ? 'bg-[#f4efe6]/50' : 'bg-[#ad9e92]/10'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Column */}
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border ${
              isLight
                ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
                : 'bg-[#132016] border-[#606e60] text-[#c3ccc0]'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              Welcome to {resortInfo.name}
            </div>

            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight ${
              isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
            }`}>
              <EditableText
                value={resortInfo.aboutHeading || 'A Peaceful Botanical Sanctuary in Tigbao, Lugait'}
                onChange={(val) => updateResortInfo({ ...resortInfo, aboutHeading: val })}
                as="span"
              />
            </h2>

            <p className={`text-base sm:text-lg leading-relaxed font-light ${
              isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
            }`}>
              <EditableText
                value={resortInfo.aboutStoryText || 'Nestled along the serene coastline of Tigbao, Mauswagon Lugait, SLTT ESTANCIAS offers an exquisite blend of modern tropical luxury and warm, genuine hospitality.'}
                onChange={(val) => updateResortInfo({ ...resortInfo, aboutStoryText: val })}
                as="span"
              />
            </p>

            <p className={`text-sm sm:text-base leading-relaxed ${
              isLight ? 'text-[#4e6a55]' : 'text-[#c3ccc0]/90'
            }`}>
              <EditableText
                value={resortInfo.aboutSecondaryText || 'Designed for families, couples, and corporate gatherings seeking privacy, pristine swimming pools, and lush tropical gardens.'}
                onChange={(val) => updateResortInfo({ ...resortInfo, aboutSecondaryText: val })}
                as="span"
              />
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-md border ${
                isLight
                  ? 'bg-[#faf8f5] border-[#e2dcd0]'
                  : 'bg-[#132016]/90 border-[#606e60]/50'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight
                    ? 'bg-[#2d4536] text-white border-[#2d4536]'
                    : 'bg-[#1c2a20] border-[#606e60]/60 text-[#c3ccc0]'
                }`}>
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-semibold text-sm font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Infinity Pool</h4>
                  <p className={`text-xs ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]/80'}`}>Illuminated multi-depth pool for day & night swim.</p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-md border ${
                isLight
                  ? 'bg-[#faf8f5] border-[#e2dcd0]'
                  : 'bg-[#132016]/90 border-[#606e60]/50'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight
                    ? 'bg-[#2d4536] text-white border-[#2d4536]'
                    : 'bg-[#1c2a20] border-[#606e60]/60 text-[#ad9e92]'
                }`}>
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-semibold text-sm font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Tropical Gardens</h4>
                  <p className={`text-xs ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]/80'}`}>Lush flora, private cabanas, and fresh sea air.</p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-md border ${
                isLight
                  ? 'bg-[#faf8f5] border-[#e2dcd0]'
                  : 'bg-[#132016]/90 border-[#606e60]/50'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight
                    ? 'bg-[#2d4536] text-white border-[#2d4536]'
                    : 'bg-[#1c2a20] border-[#606e60]/60 text-[#ad9e92]'
                }`}>
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-semibold text-sm font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Estancias Dining</h4>
                  <p className={`text-xs ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]/80'}`}>Fresh local seafood & grilled specialties.</p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-md border ${
                isLight
                  ? 'bg-[#faf8f5] border-[#e2dcd0]'
                  : 'bg-[#132016]/90 border-[#606e60]/50'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight
                    ? 'bg-[#2d4536] text-white border-[#2d4536]'
                    : 'bg-[#1c2a20] border-[#606e60]/60 text-[#c3ccc0]'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-semibold text-sm font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Gated Security</h4>
                  <p className={`text-xs ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]/80'}`}>24/7 staff support & private parking.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Column */}
          <div className="relative">
            <div className={`relative rounded-3xl overflow-hidden shadow-2xl border ${
              isLight ? 'border-[#e2dcd0]' : 'border-[#606e60]/60'
            }`}>
              <EditableImage
                src={mainAboutImg}
                alt="SLTT ESTANCIAS Resort"
                onChange={handleMainImgChange}
                className="w-full h-[380px] sm:h-[450px] object-cover"
                containerClassName="relative group/img-editable overflow-hidden"
              />
              <div className={`absolute inset-0 pointer-events-none ${
                isLight
                  ? 'bg-gradient-to-t from-white/90 via-transparent to-transparent'
                  : 'bg-gradient-to-t from-[#132016]/90 via-transparent to-transparent'
              }`} />
              
              {/* Floating Overlay Badge */}
              <div className={`absolute bottom-6 left-6 right-6 p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between shadow-2xl ${
                isLight
                  ? 'bg-white/95 border-[#e2dcd0]'
                  : 'bg-[#132016]/95 border-[#606e60]'
              }`}>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${
                    isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'
                  }`}>Sanctuary Location</p>
                  <p className={`text-sm font-bold font-serif ${
                    isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
                  }`}>{resortInfo.location}</p>
                </div>
                <a
                  href={resortInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
                    isLight
                      ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white'
                      : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
                  }`}
                >
                  View on Map
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
