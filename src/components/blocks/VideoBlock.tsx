import React, { useState } from 'react';
import { useResort } from '../../context/ResortContext';
import { CustomBlock } from '../../types';
import { EditableText } from '../common/EditableText';
import { Video, Play, Edit2 } from 'lucide-react';

interface VideoBlockProps {
  block: CustomBlock;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ block }) => {
  const { theme, isVisualEditMode, resortInfo, updateResortInfo, showToast } = useResort();
  const isLight = theme === 'light';

  const [videoUrlInput, setVideoUrlInput] = useState(block.data?.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  const videoUrl = block.data?.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';

  const handleSaveUrl = () => {
    const updatedBlocks = (resortInfo.customBlocks || []).map((b) =>
      b.id === block.id ? { ...b, data: { ...b.data, videoUrl: videoUrlInput } } : b
    );
    updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
    setIsEditingUrl(false);
    showToast('Video tour link updated!', 'success');
  };

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${isLight ? 'bg-[#fbf9f5]' : 'bg-[#09120b]'}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ad9e92]/20 border border-[#ad9e92]/40 text-[#ad9e92] text-xs font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5" />
            <span>Resort Video Showcase</span>
          </div>

          <h2 className={`text-3xl sm:text-4xl font-bold font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>
            <EditableText value={block.title} onChange={(val) => {
              const updatedBlocks = (resortInfo.customBlocks || []).map((b) => b.id === block.id ? { ...b, title: val } : b);
              updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
            }} as="span" />
          </h2>

          {block.subtitle && (
            <p className={`text-sm sm:text-base max-w-2xl mx-auto font-light ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>
              <EditableText value={block.subtitle} onChange={(val) => {
                const updatedBlocks = (resortInfo.customBlocks || []).map((b) => b.id === block.id ? { ...b, subtitle: val } : b);
                updateResortInfo({ ...resortInfo, customBlocks: updatedBlocks });
              }} as="span" />
            </p>
          )}
        </div>

        {/* Video Player Container */}
        <div className="relative rounded-3xl overflow-hidden border border-[#ad9e92]/40 shadow-2xl bg-black aspect-video max-w-4xl mx-auto">
          {videoUrl.includes('youtube') || videoUrl.includes('vimeo') || videoUrl.includes('embed') ? (
            <iframe
              src={videoUrl}
              title={block.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={videoUrl} controls className="w-full h-full object-cover" />
          )}

          {/* Video Link Edit Overlay in Visual Edit Mode */}
          {isVisualEditMode && (
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsEditingUrl(!isEditingUrl)}
                className="px-3 py-1.5 rounded-xl bg-[#ad9e92] text-[#1c2a20] font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer hover:bg-[#c3ccc0]"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Video Embed URL</span>
              </button>
            </div>
          )}
        </div>

        {/* Video URL Edit Modal / Popover */}
        {isVisualEditMode && isEditingUrl && (
          <div className="p-4 rounded-2xl bg-[#1c2a20] border border-[#ad9e92] max-w-xl mx-auto space-y-3 shadow-xl">
            <span className="text-xs font-bold text-[#ad9e92] uppercase block">Video Embed URL (YouTube/Vimeo)</span>
            <input
              type="text"
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              placeholder="e.g. https://www.youtube.com/embed/..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#0e1710] border border-[#606e60] text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditingUrl(false)}
                className="px-3 py-1 rounded-lg bg-[#0e1710] text-[#c3ccc0] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUrl}
                className="px-4 py-1 rounded-lg bg-[#ad9e92] text-[#1c2a20] text-xs font-extrabold cursor-pointer"
              >
                Save Video URL
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
