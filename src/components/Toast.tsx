import React from 'react';
import { useResort } from '../context/ResortContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useResort();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#ad9e92] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#c3ccc0] shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-[#132016]/95 border-[#606e60] text-[#ebe5de]',
    error: 'bg-rose-950/95 border-rose-800 text-rose-100',
    info: 'bg-[#132016]/95 border-[#606e60] text-[#ebe5de]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-bounce-once">
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${bgStyles[toastMessage.type]}`}
      >
        {icons[toastMessage.type]}
        <p className="text-sm font-medium flex-1">{toastMessage.text}</p>
      </div>
    </div>
  );
};
