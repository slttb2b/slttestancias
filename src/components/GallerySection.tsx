import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { Image, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditableText } from './common/EditableText';
import { EditableImage } from './common/EditableImage';
import { resolveImageUrl } from '../utils/imageUtils';

export const GallerySection: React.FC = () => {
  const { gallery, updateGalleryItem, theme } = useResort();
  const isLight = theme === 'light';
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const categories = ['All', 'Exterior', 'Rooms', 'Swimming Pool', 'Restaurant', 'Activities', 'Scenic Views'];

  const filteredItems = selectedCategory === 'All'
    ? gallery
    : gallery.filter((item) => item.category === selectedCategory);

  const handleUpdateImage = (id: string, newUrl: string) => {
    const target = gallery.find((g) => g.id === id);
    if (target) {
      updateGalleryItem({ ...target, imageUrl: newUrl });
    }
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    const target = gallery.find((g) => g.id === id);
    if (target) {
      updateGalleryItem({ ...target, title: newTitle });
    }
  };

  const handleUpdateCaption = (id: string, newCaption: string) => {
    const target = gallery.find((g) => g.id === id);
    if (target) {
      updateGalleryItem({ ...target, caption: newCaption });
    }
  };

  const handlePrev = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const handleNext = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((activeLightboxIndex + 1) % filteredItems.length);
    }
  };

  return (
    <section id="gallery" className={`py-20 relative transition-colors duration-300 ${
      isLight ? 'bg-[#f9f7f2] text-[#1c2a20]' : 'bg-[#1c2a20] text-[#ebe5de]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border ${
            isLight
              ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
              : 'bg-[#132016] border-[#606e60] text-[#c3ccc0]'
          }`}>
            <Image className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
            Visual Tour
          </div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif ${
            isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
          }`}>
            Resort Nature Gallery
          </h2>
          <p className={`text-base sm:text-lg font-light ${
            isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
          }`}>
            Take a glimpse into life at SLTT ESTANCIAS. Click any photo to expand into high-definition view.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? isLight
                    ? 'bg-[#2d4536] text-white font-extrabold shadow-lg'
                    : 'bg-[#ad9e92] text-[#1c2a20] font-extrabold shadow-lg'
                  : isLight
                    ? 'bg-white text-[#2d4536] hover:bg-[#eaf0eb] border border-[#d8d0c2]'
                    : 'bg-[#132016] text-[#c3ccc0] hover:text-[#ebe5de] hover:bg-[#1c2a20] border border-[#606e60]/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxIndex(idx)}
              className={`group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-xl transition-all duration-300 border ${
                isLight
                  ? 'bg-white border-[#e0d9cc] hover:border-[#2d4536]'
                  : 'bg-[#132016] border-[#606e60]/60 hover:border-[#ad9e92]'
              }`}
            >
              <EditableImage
                src={item.imageUrl}
                alt={item.title}
                onChange={(newUrl) => handleUpdateImage(item.id, newUrl)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                containerClassName="w-full h-full relative group/img-editable overflow-hidden"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />

              {/* Expand Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>

              {/* Caption */}
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#ad9e92] bg-black/70 px-2.5 py-0.5 rounded-md border border-white/20">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold font-serif mt-1">
                  <EditableText
                    value={item.title}
                    onChange={(val) => handleUpdateTitle(item.id, val)}
                    as="span"
                  />
                </h3>
                <p className="text-xs text-[#c3ccc0] line-clamp-1 mt-0.5">
                  <EditableText
                    value={item.caption || ''}
                    onChange={(val) => handleUpdateCaption(item.id, val)}
                    as="span"
                  />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && filteredItems[activeLightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-[#132016]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
          {/* Close Button */}
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-[#1c2a20] text-[#c3ccc0] hover:text-[#ebe5de] border border-[#606e60] cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 z-50 p-3 rounded-full bg-[#1c2a20]/90 text-[#ebe5de] border border-[#606e60] hover:bg-[#132016] cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 z-50 p-3 rounded-full bg-[#1c2a20]/90 text-[#ebe5de] border border-[#606e60] hover:bg-[#132016] cursor-pointer"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Image & Caption Container */}
          <div className="max-w-5xl w-full flex flex-col items-center">
            <div className="relative max-h-[75vh] rounded-3xl overflow-hidden border border-[#606e60] shadow-2xl">
              <img
                src={resolveImageUrl(filteredItems[activeLightboxIndex].imageUrl)}
                alt={filteredItems[activeLightboxIndex].title}
                className="max-h-[75vh] w-auto object-contain rounded-3xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-6 text-center text-[#ebe5de] max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#ad9e92]">
                {filteredItems[activeLightboxIndex].category} ({activeLightboxIndex + 1} of {filteredItems.length})
              </span>
              <h3 className="text-2xl font-bold font-serif mt-1">
                {filteredItems[activeLightboxIndex].title}
              </h3>
              <p className="text-sm text-[#c3ccc0] mt-2 font-light">
                {filteredItems[activeLightboxIndex].caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
