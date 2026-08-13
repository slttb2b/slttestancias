import React, { useRef } from 'react';
import { useResort } from '../../context/ResortContext';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUtils';
import { uploadImageToFirebaseStorage } from '../../services/storageService';

interface EditableImageProps {
  src: string;
  alt: string;
  onChange: (newImageDataUrl: string) => void;
  className?: string;
  containerClassName?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  onChange,
  className = 'w-full h-full object-cover',
  containerClassName = 'relative group/img-editable overflow-hidden',
}) => {
  const { isVisualEditMode, showToast } = useResort();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = await uploadImageToFirebaseStorage(file, 'design_assets');
      if (url) {
        onChange(url);
        showToast('Image replaced successfully!', 'success');
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isVisualEditMode) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = await uploadImageToFirebaseStorage(file, 'design_assets');
      if (url) {
        onChange(url);
        showToast('Image updated via drag & drop!', 'success');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className={containerClassName}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <img src={resolveImageUrl(src)} alt={alt} className={className} referrerPolicy="no-referrer" />

      {isVisualEditMode && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover/img-editable:opacity-100 transition-all duration-200 flex flex-col items-center justify-center p-4 text-center cursor-pointer border-2 border-dashed border-[#ad9e92] z-20"
          >
            <div className="w-10 h-10 rounded-full bg-[#ad9e92] text-[#1c2a20] flex items-center justify-center mb-2 shadow-lg group-hover/img-editable:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Click or Drag to Swap Photo
            </span>
            <span className="text-[10px] text-[#c3ccc0] mt-0.5">
              Supports JPG, PNG, WEBP
            </span>
          </div>
        </>
      )}
    </div>
  );
};
