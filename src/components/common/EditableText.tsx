import React, { useRef } from 'react';
import { useResort } from '../../context/ResortContext';
import { Edit3 } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
  placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  as = 'span',
  placeholder = 'Click to edit text...',
}) => {
  const { isVisualEditMode } = useResort();
  const elementRef = useRef<HTMLElement | null>(null);

  if (!isVisualEditMode) {
    const Component = as;
    return <Component className={className}>{value}</Component>;
  }

  const handleBlur = () => {
    if (elementRef.current) {
      const newText = elementRef.current.innerText.trim();
      if (newText !== value) {
        onChange(newText || placeholder);
      }
    }
  };

  const Component = as as any;

  return (
    <span className="relative inline-block group/editable max-w-full">
      <Component
        ref={elementRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        className={`${className} outline-dashed outline-1 outline-[#ad9e92]/80 hover:outline-2 hover:outline-[#ad9e92] rounded px-1 -mx-1 transition-all bg-[#ad9e92]/10 hover:bg-[#ad9e92]/25 cursor-text text-inherit`}
      >
        {value}
      </Component>

      {/* Visual Edit Mode Hover Badge */}
      <span className="absolute -top-3 -right-3 opacity-0 group-hover/editable:opacity-100 transition-opacity bg-[#ad9e92] text-[#1c2a20] text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-md flex items-center gap-0.5 pointer-events-none z-30">
        <Edit3 className="w-2.5 h-2.5" />
        <span>Edit</span>
      </span>
    </span>
  );
};
