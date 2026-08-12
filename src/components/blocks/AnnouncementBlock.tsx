import React from 'react';
import { useResort } from '../../context/ResortContext';
import { CustomBlock } from '../../types';
import { EditableText } from '../common/EditableText';
import { Megaphone, ArrowRight } from 'lucide-react';

interface AnnouncementBlockProps {
  block: CustomBlock;
}

export const AnnouncementBlock: React.FC<AnnouncementBlockProps> = ({ block }) => {
  const { theme, resortInfo, updateResortInfo, setActiveTab } = useResort();
  const isLight = theme === 'light';

  const badgeText = block.data?.badgeText || 'SPECIAL OFFER';
  const announcementText = block.data?.announcementText || 'Book any Private Villa 3 days in advance and enjoy complimentary breakfast!';
  const ctaText = block.data?.ctaText || 'Claim Offer';

  const updateBlockData = (key: string, val: string) => {
    const updatedBlocks = (resortInfo.customBlocks || []).map((b) =>
      b.id === block.id ? { ...b, data: { ...b.data, [key]: val } } : b
    );
    updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#1c2a20] via-[#2d4536] to-[#1c2a20] border border-[#ad9e92]/50 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Background glow accent */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#ad9e92]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ad9e92]/20 border border-[#ad9e92]/60 text-[#ad9e92] text-xs font-bold uppercase tracking-widest">
            <Megaphone className="w-3.5 h-3.5 animate-bounce" />
            <EditableText value={badgeText} onChange={(val) => updateBlockData('badgeText', val)} as="span" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#ebe5de] leading-snug">
            <EditableText value={block.title} onChange={(val) => {
              const updatedBlocks = (resortInfo.customBlocks || []).map((b) => b.id === block.id ? { ...b, title: val } : b);
              updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
            }} as="span" />
          </h3>

          <p className="text-sm sm:text-base text-[#c3ccc0] font-light leading-relaxed">
            <EditableText value={announcementText} onChange={(val) => updateBlockData('announcementText', val)} as="span" />
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('rooms')}
            className="px-6 py-3 rounded-2xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-xl transition-all scale-105"
          >
            <EditableText value={ctaText} onChange={(val) => updateBlockData('ctaText', val)} as="span" />
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
