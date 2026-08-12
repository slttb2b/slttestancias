import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { CustomBlock } from '../../types';
import { EditableText } from '../common/EditableText';
import { Tag, Copy, Check, Calendar, Ticket } from 'lucide-react';

interface PromoBlockProps {
  block: CustomBlock;
}

export const PromoBlock: React.FC<PromoBlockProps> = ({ block }) => {
  const { theme, resortInfo, updateResortInfo, setActiveTab, showToast } = useResort();
  const isLight = theme === 'light';

  const [copied, setCopied] = useState(false);

  const promoCode = block.data?.promoCode || 'SLTTSUMMER2026';
  const discountText = block.data?.discountText || 'Get 20% OFF on all 2-Night Villa Stays!';
  const validUntil = block.data?.validUntil || 'Valid until August 31, 2026';

  const updateBlockData = (key: string, val: string) => {
    const updatedBlocks = (resortInfo.customBlocks || []).map((b) =>
      b.id === block.id ? { ...b, data: { ...b.data, [key]: val } } : b
    );
    updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    showToast(`Copied promo code ${promoCode} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className={`py-12 px-4 sm:px-6 lg:px-8 ${isLight ? 'bg-[#f4efe8]' : 'bg-[#0f1b12]'}`}>
      <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1c2a20] to-[#0e1710] border-2 border-dashed border-[#ad9e92]/70 shadow-2xl relative overflow-hidden text-[#ebe5de] space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#606e60]/60 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ad9e92]/20 border border-[#ad9e92]/50 text-[#ad9e92] text-xs font-bold uppercase tracking-widest">
              <Ticket className="w-3.5 h-3.5" />
              <span>Resort Special Coupon</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#ebe5de]">
              <EditableText value={block.title} onChange={(val) => {
                const updatedBlocks = (resortInfo.customBlocks || []).map((b) => b.id === block.id ? { ...b, title: val } : b);
                updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
              }} as="span" />
            </h3>

            <p className="text-sm text-[#c3ccc0] font-light">
              <EditableText value={discountText} onChange={(val) => updateBlockData('discountText', val)} as="span" />
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#ad9e92] tracking-wider">
              Exclusive Promo Code
            </span>
            <div className="flex items-center gap-2 bg-[#09120b] border border-[#ad9e92] rounded-2xl px-4 py-2 font-mono font-extrabold text-lg text-[#ad9e92]">
              <Tag className="w-4 h-4 text-[#ad9e92]" />
              <EditableText value={promoCode} onChange={(val) => updateBlockData('promoCode', val)} as="span" />
              <button
                onClick={handleCopyCode}
                className="ml-2 p-1.5 rounded-lg bg-[#1c2a20] hover:bg-[#ad9e92] hover:text-[#1c2a20] transition-colors cursor-pointer"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#c3ccc0]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ad9e92]" />
            <EditableText value={validUntil} onChange={(val) => updateBlockData('validUntil', val)} as="span" />
          </div>

          <button
            onClick={() => setActiveTab('rooms')}
            className="px-6 py-2.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold uppercase tracking-wider cursor-pointer shadow-lg transition-all"
          >
            Book Villa With Promo
          </button>
        </div>

      </div>
    </section>
  );
};
