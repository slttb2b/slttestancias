import React from 'react';
import { useResort } from '../context/ResortContext';
import { MapPin, Navigation, Compass, Car, Plane, Map } from 'lucide-react';
import { EditableText } from './common/EditableText';

export const LocationSection: React.FC = () => {
  const { resortInfo, updateResortInfo, theme } = useResort();
  const isLight = theme === 'light';

  return (
    <section id="location" className={`py-20 relative transition-colors duration-300 border-t ${
      isLight
        ? 'bg-[#f9f7f2] text-[#1c2a20] border-[#e2dcd0]'
        : 'bg-[#132016] text-[#ebe5de] border-[#606e60]/40'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Info Side */}
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border ${
              isLight
                ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
                : 'bg-[#1c2a20] border-[#606e60] text-[#c3ccc0]'
            }`}>
              <MapPin className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              Resort Location
            </div>

            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif ${
              isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
            }`}>
              <EditableText
                value={resortInfo.locationHeading || 'Find Us in Tigbao, Lugait'}
                onChange={(val) => updateResortInfo({ ...resortInfo, locationHeading: val })}
                as="span"
              />
            </h2>

            <p className={`text-base sm:text-lg leading-relaxed font-light ${
              isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
            }`}>
              <EditableText
                value={resortInfo.locationGuideText || 'SLTT ESTANCIAS is conveniently situated along the coastal Highway in Tigbao, Mauswagon Lugait. Highly accessible for guests traveling from Cagayan de Oro City, Iligan City, and Laguindingan International Airport.'}
                onChange={(val) => updateResortInfo({ ...resortInfo, locationGuideText: val })}
                as="span"
              />
            </p>

            <div className={`p-5 rounded-3xl space-y-3 shadow-md border ${
              isLight
                ? 'bg-white border-[#e0d9cc]'
                : 'bg-[#1c2a20] border-[#606e60]/60'
            }`}>
              <div className="flex items-start gap-3">
                <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                <div>
                  <h4 className={`font-bold text-sm font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Complete Address</h4>
                  <p className={`text-xs mt-0.5 leading-relaxed ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>
                    <EditableText
                      value={resortInfo.address}
                      onChange={(val) => updateResortInfo({ ...resortInfo, address: val })}
                      as="span"
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* Travel Times */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isLight
                  ? 'bg-white border-[#e0d9cc]'
                  : 'bg-[#1c2a20] border-[#606e60]/60'
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight
                    ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
                    : 'bg-[#132016] border-[#606e60]/60 text-[#ad9e92]'
                }`}>
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h5 className={`font-bold text-xs ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Laguindingan Airport</h5>
                  <p className={`text-[11px] ${isLight ? 'text-[#4e6a55]' : 'text-[#c3ccc0]/80'}`}>~ 45 Minutes Drive</p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isLight
                  ? 'bg-white border-[#e0d9cc]'
                  : 'bg-[#1c2a20] border-[#606e60]/60'
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight
                    ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
                    : 'bg-[#132016] border-[#606e60]/60 text-[#c3ccc0]'
                }`}>
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h5 className={`font-bold text-xs ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Iligan City</h5>
                  <p className={`text-[11px] ${isLight ? 'text-[#4e6a55]' : 'text-[#c3ccc0]/80'}`}>~ 25 Minutes Drive</p>
                </div>
              </div>
            </div>

            {/* Direct Google Maps Action */}
            <div className="pt-2">
              <a
                href={resortInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm tracking-wide shadow-xl cursor-pointer transition-all ${
                  isLight
                    ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white'
                    : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>GET DIRECTIONS ON GOOGLE MAPS</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Visual Box */}
          <div className={`relative rounded-3xl overflow-hidden shadow-2xl h-[400px] flex flex-col justify-between p-6 border ${
            isLight
              ? 'bg-white border-[#e0d9cc]'
              : 'bg-[#1c2a20] border-[#606e60]/60'
          }`}>
            <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(#606e60_1px,transparent_1px)] [background-size:16px_16px]`} />

            <div className="relative z-10 flex items-center justify-between">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                isLight
                  ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
                  : 'bg-[#132016]/90 border-[#606e60] text-[#ad9e92]'
              }`}>
                <Map className="w-4 h-4" />
                <span>Google Maps Landmark</span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-md border ${
                isLight
                  ? 'bg-[#faf8f5] border-[#d8d0c2] text-[#2d4536]'
                  : 'bg-[#132016] border-[#606e60] text-[#c3ccc0]'
              }`}>
                Verified Resort Location
              </span>
            </div>

            <div className={`relative z-10 p-6 rounded-2xl backdrop-blur-md space-y-4 border ${
              isLight
                ? 'bg-[#faf8f5]/95 border-[#e2dcd0]'
                : 'bg-[#132016]/95 border-[#606e60]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  isLight
                    ? 'bg-[#2d4536] text-white'
                    : 'bg-[#ad9e92] text-[#1c2a20]'
                }`}>
                  SLTT
                </div>
                <div>
                  <h3 className={`text-lg font-bold font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>{resortInfo.name}</h3>
                  <p className={`text-xs ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`}>Tigbao, Mauswagon Lugait</p>
                </div>
              </div>

              <p className={`text-xs leading-relaxed font-light ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>
                Click below to open official Google Maps directions directly on your smartphone navigation app or web browser.
              </p>

              <a
                href={resortInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors border ${
                  isLight
                    ? 'bg-white hover:bg-[#eaf0eb] text-[#2d4536] border-[#2d4536]/20'
                    : 'bg-[#1c2a20] hover:bg-[#25362a] text-[#c3ccc0] hover:text-[#ebe5de] border-[#606e60]'
                }`}
              >
                <Navigation className={`w-4 h-4 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
                <span>Open Google Maps Location Pin</span>
              </a>
            </div>

            <div className={`relative z-10 text-[10px] text-center ${isLight ? 'text-[#4e6a55]' : 'text-[#c3ccc0]/70'}`}>
              GPS Coordinates: 8°20'42"N 124°15'30"E • Tigbao, Lugait
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
