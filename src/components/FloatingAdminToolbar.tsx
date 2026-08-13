import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { ThemePaletteKey, FontPairingKey, CustomBlockType, CustomBlock } from '../types';
import {
  Sparkles,
  Edit3,
  Eye,
  Palette,
  Type,
  PlusCircle,
  Layout,
  CheckCircle2,
  Save,
  ChevronDown,
  Layers,
  HelpCircle,
  Megaphone,
  Video,
  Tag,
} from 'lucide-react';

export const FloatingAdminToolbar: React.FC = () => {
  const {
    isAdminLoggedIn,
    isVisualEditMode,
    setIsVisualEditMode,
    resortInfo,
    updateResortInfo,
    setActiveTab,
    showToast,
  } = useResort();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);

  if (!isAdminLoggedIn) return null;

  const currentPalette: ThemePaletteKey = resortInfo.themePalette || 'emerald';
  const currentFont: FontPairingKey = resortInfo.fontPairing || 'editorial';

  const themePalettes: { key: ThemePaletteKey; name: string; colors: string[] }[] = [
    { key: 'emerald', name: 'Emerald Forest', colors: ['#1c2a20', '#ad9e92', '#2d4536'] },
    { key: 'coral', name: 'Coral Sunset', colors: ['#2b1810', '#e07a5f', '#81b29a'] },
    { key: 'warm_sand', name: 'Warm Sand', colors: ['#241e17', '#c6a052', '#d4a373'] },
    { key: 'minimalist', name: 'Modern Minimalist', colors: ['#111111', '#6b7280', '#374151'] },
    { key: 'azure', name: 'Azure Coastal', colors: ['#0f2027', '#20b2aa', '#203a43'] },
  ];

  const fontPairings: { key: FontPairingKey; name: string; preview: string }[] = [
    { key: 'editorial', name: 'Classic Editorial', preview: 'Playfair Display + Sans' },
    { key: 'imperial', name: 'Imperial Luxury', preview: 'Cinzel + Inter' },
    { key: 'botanical', name: 'Botanical Warmth', preview: 'Cormorant + Outfit' },
    { key: 'clean', name: 'Contemporary Clean', preview: 'Outfit + Jakarta' },
  ];

  const handlePaletteSelect = (key: ThemePaletteKey) => {
    updateResortInfo({ ...resortInfo, themePalette: key });
    setIsPaletteOpen(false);
    showToast(`Applied ${themePalettes.find((p) => p.key === key)?.name} theme!`, 'success');
  };

  const handleFontSelect = (key: FontPairingKey) => {
    updateResortInfo({ ...resortInfo, fontPairing: key });
    setIsFontOpen(false);
    showToast(`Applied ${fontPairings.find((f) => f.key === key)?.name} typography!`, 'success');
  };

  const handleAddCustomBlock = (type: CustomBlockType) => {
    const existing = resortInfo.customBlocks || [];
    let newBlock: CustomBlock;

    if (type === 'faq') {
      newBlock = {
        id: `faq_${Date.now()}`,
        type: 'faq',
        title: 'Resort Guest FAQ',
        subtitle: 'Questions regarding bookings, amenities, and pool hours',
        enabled: true,
        data: {
          faqItems: [
            { id: '1', question: 'What are the pool operating hours?', answer: 'Infinity pool is open from 8:00 AM to 9:00 PM.' },
            { id: '2', question: 'Can we bring outside food?', answer: 'Light snacks allowed; heavy catering requires cottage rental.' },
          ],
        },
      };
    } else if (type === 'announcement') {
      newBlock = {
        id: `announcement_${Date.now()}`,
        type: 'announcement',
        title: 'Special Season Highlight Banner',
        subtitle: 'Exclusive discounts on overnight villa stays',
        enabled: true,
        data: {
          badgeText: 'LIMITED SEASON OFFER',
          announcementText: 'Book any Villa 3 days in advance and get complimentary breakfast for 4 guests!',
          ctaText: 'View Villas',
          ctaLink: '#rooms',
        },
      };
    } else if (type === 'video') {
      newBlock = {
        id: `video_${Date.now()}`,
        type: 'video',
        title: 'Virtual Resort Tour',
        subtitle: 'Explore our infinity pool, private cottages, and gardens',
        enabled: true,
        data: {
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
      };
    } else {
      newBlock = {
        id: `promo_${Date.now()}`,
        type: 'promo',
        title: 'Exclusive Getaway Discount Voucher',
        subtitle: 'Valid for weekday family bookings and corporate retreats',
        enabled: true,
        data: {
          promoCode: 'SLTTSUMMER2026',
          discountText: 'Get 20% OFF on all 2-Night Villa Stays',
          validUntil: 'Valid until September 30, 2026',
        },
      };
    }

    const updatedBlocks = [...existing, newBlock];
    const defaultOrder = resortInfo.sectionOrder || ['hero', 'about', 'rooms', 'packages', 'amenities', 'location'];
    const updatedOrder = defaultOrder.includes(type) ? defaultOrder : [...defaultOrder, type as any];

    updateResortInfo({
      ...resortInfo,
      customBlocks: updatedBlocks,
      sectionOrder: updatedOrder,
    });

    setIsAddBlockOpen(false);
    showToast(`Added ${type.toUpperCase()} block to live page!`, 'success');
  };

  return (
    <div className="sticky top-0 z-[100] bg-[#0c160e]/95 backdrop-blur-md border-b border-[#ad9e92]/40 shadow-2xl text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left Side: Owner Studio Indicator & Edit Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1c2a20] px-3 py-1.5 rounded-full border border-[#ad9e92]/50 text-[#ad9e92] font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Owner Studio:</span>
            <span className="text-white font-extrabold">{resortInfo.name}</span>
          </div>

          {/* Toggle Visual Edit Mode */}
          <button
            onClick={() => {
              setIsVisualEditMode(!isVisualEditMode);
              showToast(
                !isVisualEditMode ? 'Visual Edit Mode Activated! Click text/photos on site to edit.' : 'Preview Mode Active',
                'info'
              );
            }}
            className={`px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm ${
              isVisualEditMode
                ? 'bg-[#ad9e92] text-[#1c2a20] ring-2 ring-[#ad9e92]/80 font-extrabold scale-105'
                : 'bg-[#25362a] text-[#c3ccc0] hover:bg-[#324939] hover:text-white'
            }`}
          >
            {isVisualEditMode ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-[#1c2a20]" />
                <span>Visual Edit Mode: ON</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Enable In-Place Edit Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Middle Controls: Theme Palette, Typography, Add Content Block */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Theme Palette Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPaletteOpen(!isPaletteOpen);
                setIsFontOpen(false);
                setIsAddBlockOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#ebe5de] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Palette className="w-3.5 h-3.5 text-[#ad9e92]" />
              <span className="hidden md:inline">Theme:</span>
              <span className="font-bold text-[#ad9e92]">
                {themePalettes.find((p) => p.key === currentPalette)?.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[#c3ccc0]" />
            </button>

            {isPaletteOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#132016] border border-[#606e60] rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#ad9e92] px-2 pt-1 block">
                  Select Color Theme
                </span>
                {themePalettes.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handlePaletteSelect(p.key)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left cursor-pointer transition-colors text-xs ${
                      currentPalette === p.key ? 'bg-[#ad9e92]/20 border border-[#ad9e92]/40 text-[#ad9e92] font-bold' : 'hover:bg-[#1c2a20] text-[#ebe5de]'
                    }`}
                  >
                    <span>{p.name}</span>
                    <div className="flex items-center gap-1">
                      {p.colors.map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full border border-black/30" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Typography Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFontOpen(!isFontOpen);
                setIsPaletteOpen(false);
                setIsAddBlockOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:border-[#ad9e92] text-[#ebe5de] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Type className="w-3.5 h-3.5 text-[#ad9e92]" />
              <span className="hidden md:inline">Font:</span>
              <span className="font-bold text-[#ad9e92]">
                {fontPairings.find((f) => f.key === currentFont)?.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[#c3ccc0]" />
            </button>

            {isFontOpen && (
              <div className="absolute top-full left-0 mt-2 w-60 bg-[#132016] border border-[#606e60] rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#ad9e92] px-2 pt-1 block">
                  Select Typography Pairing
                </span>
                {fontPairings.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => handleFontSelect(f.key)}
                    className={`w-full text-left p-2 rounded-xl cursor-pointer transition-colors text-xs ${
                      currentFont === f.key ? 'bg-[#ad9e92]/20 border border-[#ad9e92]/40 text-[#ad9e92] font-bold' : 'hover:bg-[#1c2a20] text-[#ebe5de]'
                    }`}
                  >
                    <div className="block font-bold">{f.name}</div>
                    <div className="text-[10px] text-[#c3ccc0]">{f.preview}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Custom Content Block Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsAddBlockOpen(!isAddBlockOpen);
                setIsPaletteOpen(false);
                setIsFontOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#ad9e92]/20 border border-[#ad9e92]/60 hover:bg-[#ad9e92]/30 text-[#ad9e92] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Block</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isAddBlockOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#132016] border border-[#606e60] rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#ad9e92] px-2 pt-1 block">
                  Add New Homepage Section Block
                </span>
                <button
                  onClick={() => handleAddCustomBlock('faq')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[#1c2a20] text-left cursor-pointer text-xs text-[#ebe5de]"
                >
                  <HelpCircle className="w-4 h-4 text-[#ad9e92]" />
                  <div>
                    <span className="font-bold block">FAQ Accordion</span>
                    <span className="text-[10px] text-[#c3ccc0]">Guest inquiries and answers</span>
                  </div>
                </button>
                <button
                  onClick={() => handleAddCustomBlock('announcement')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[#1c2a20] text-left cursor-pointer text-xs text-[#ebe5de]"
                >
                  <Megaphone className="w-4 h-4 text-[#ad9e92]" />
                  <div>
                    <span className="font-bold block">Event / Promo Banner</span>
                    <span className="text-[10px] text-[#c3ccc0]">Seasonal announcements</span>
                  </div>
                </button>
                <button
                  onClick={() => handleAddCustomBlock('video')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[#1c2a20] text-left cursor-pointer text-xs text-[#ebe5de]"
                >
                  <Video className="w-4 h-4 text-[#ad9e92]" />
                  <div>
                    <span className="font-bold block">Virtual Video Tour</span>
                    <span className="text-[10px] text-[#c3ccc0]">Embedded resort video player</span>
                  </div>
                </button>
                <button
                  onClick={() => handleAddCustomBlock('promo')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[#1c2a20] text-left cursor-pointer text-xs text-[#ebe5de]"
                >
                  <Tag className="w-4 h-4 text-[#ad9e92]" />
                  <div>
                    <span className="font-bold block">Promo Pass Card</span>
                    <span className="text-[10px] text-[#c3ccc0]">Vouchers & coupon codes</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Owner Portal Switch & Publish Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('admin')}
            className="px-3 py-1.5 rounded-xl bg-[#1c2a20] border border-[#606e60] hover:text-white text-[#c3ccc0] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Layout className="w-3.5 h-3.5 text-[#ad9e92]" />
            <span className="hidden sm:inline">Owner Portal</span>
          </button>

          <button
            onClick={() => {
              try {
                localStorage.setItem('sltt_resort_info', JSON.stringify(resortInfo));
              } catch (e) {
                console.warn('Storage save error:', e);
              }
              showToast('Design changes published live to all website visitors!', 'success');
            }}
            className="px-4 py-1.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Publish Design</span>
          </button>
        </div>

      </div>
    </div>
  );
};
