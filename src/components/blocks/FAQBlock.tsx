import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { CustomBlock, FAQItem } from '../../types';
import { EditableText } from '../common/EditableText';
import { ChevronDown, Plus, Trash2, HelpCircle } from 'lucide-react';

interface FAQBlockProps {
  block: CustomBlock;
}

export const FAQBlock: React.FC<FAQBlockProps> = ({ block }) => {
  const { theme, isVisualEditMode, resortInfo, updateResortInfo, showToast } = useResort();
  const isLight = theme === 'light';

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ q1: true });

  const faqItems: FAQItem[] = block.data?.faqItems || [];

  const toggleAccordion = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateTitle = (newTitle: string) => {
    const updatedBlocks = (resortInfo.customBlocks || []).map((b) =>
      b.id === block.id ? { ...b, title: newTitle } : b
    );
    updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
  };

  const handleUpdateSubtitle = (newSub: string) => {
    const updatedBlocks = (resortInfo.customBlocks || []).map((b) =>
      b.id === block.id ? { ...b, subtitle: newSub } : b
    );
    updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
  };

  const handleUpdateQuestion = (itemId: string, newQ: string) => {
    const updatedFaqs = faqItems.map((item) => (item.id === itemId ? { ...item, question: newQ } : item));
    const updatedBlocks = (resortInfo.customBlocks || []).map((b) =>
      b.id === block.id ? { ...b, data: { ...b.data, faqItems: updatedFaqs } } : b
    );
    updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
  };

  const handleUpdateAnswer = (itemId: string, newA: string) => {
    const updatedFaqs = faqItems.map((item) => (item.id === itemId ? { ...item, answer: newA } : item));
    const updatedBlocks = (resortInfo.customBlocks || []).map((b) =>
      b.id === block.id ? { ...b, data: { ...b.data, faqItems: updatedFaqs } } : b
    );
    updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
  };

  const handleAddQuestion = () => {
    const newItem: FAQItem = {
      id: `q_${Date.now()}`,
      question: 'New Guest Question (Click to edit)',
      answer: 'Write answer details here for resort guests.',
    };
    const updatedFaqs = [...faqItems, newItem];
    const updatedBlocks = (resortInfo.customBlocks || []).map((b) =>
      b.id === block.id ? { ...b, data: { ...b.data, faqItems: updatedFaqs } } : b
    );
    updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
    setOpenItems((prev) => ({ ...prev, [newItem.id]: true }));
    showToast('New question added to FAQ!', 'success');
  };

  const handleDeleteQuestion = (itemId: string) => {
    const updatedFaqs = faqItems.filter((item) => item.id !== itemId);
    const updatedBlocks = (resortInfo.customBlocks || []).map((b) =>
      b.id === block.id ? { ...b, data: { ...b.data, faqItems: updatedFaqs } } : b
    );
    updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
    showToast('Question removed from FAQ', 'info');
  };

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 transition-colors ${isLight ? 'bg-[#f4efe8]' : 'bg-[#0f1b12]'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ad9e92]/20 border border-[#ad9e92]/40 text-[#ad9e92] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Resort Inquiries & Policies</span>
          </div>

          <h2 className={`text-3xl sm:text-4xl font-bold font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>
            <EditableText value={block.title} onChange={handleUpdateTitle} as="span" />
          </h2>

          {block.subtitle && (
            <p className={`text-sm sm:text-base max-w-2xl mx-auto font-light ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>
              <EditableText value={block.subtitle} onChange={handleUpdateSubtitle} as="span" />
            </p>
          )}
        </div>

        {/* Accordion Questions List */}
        <div className="space-y-4">
          {faqItems.map((item) => {
            const isOpen = openItems[item.id];
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isLight
                    ? 'bg-white border-[#d8d0c5] shadow-sm hover:border-[#ad9e92]'
                    : 'bg-[#18281c] border-[#606e60]/60 shadow-lg'
                }`}
              >
                <div
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <span className={`text-base font-bold flex-1 ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>
                    <EditableText value={item.question} onChange={(val) => handleUpdateQuestion(item.id, val)} as="span" />
                  </span>

                  <div className="flex items-center gap-2">
                    {isVisualEditMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(item.id);
                        }}
                        className="p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-colors"
                        title="Remove Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#ad9e92]' : isLight ? 'text-[#4e6a55]' : 'text-[#c3ccc0]'
                      }`}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className={`px-5 pb-5 pt-1 text-sm leading-relaxed border-t border-dashed ${
                    isLight ? 'border-[#e8e2d8] text-[#3c5241]' : 'border-[#606e60]/40 text-[#c3ccc0]'
                  }`}>
                    <EditableText value={item.answer} onChange={(val) => handleUpdateAnswer(item.id, val)} as="p" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Question Button in Visual Edit Mode */}
        {isVisualEditMode && (
          <div className="text-center pt-2">
            <button
              onClick={handleAddQuestion}
              className="px-5 py-2.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase flex items-center gap-2 mx-auto cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ Question</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
