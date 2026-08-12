import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface PrivacyTermsModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 bg-[#132016]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl text-[#ebe5de] relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#c3ccc0] hover:text-[#ebe5de]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          {isPrivacy ? <Shield className="w-6 h-6 text-[#ad9e92]" /> : <FileText className="w-6 h-6 text-[#ad9e92]" />}
          <h2 className="text-2xl font-bold font-serif text-[#ebe5de]">
            {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
          </h2>
        </div>
        <p className="text-xs text-[#c3ccc0] mb-6 font-light">
          SLTT ESTANCIAS Resort & Sanctuary • Tigbao, Mauswagon Lugait
        </p>

        {isPrivacy ? (
          <div className="space-y-4 text-xs text-[#c3ccc0] leading-relaxed font-light">
            <h4 className="font-bold text-[#ebe5de] text-sm">1. Data Collection</h4>
            <p>
              We collect customer information strictly for reservation processing, guest verification, and front desk communications. This includes full name, mobile number, email address, and booking preferences.
            </p>

            <h4 className="font-bold text-[#ebe5de] text-sm">2. Usage of Information</h4>
            <p>
              Your personal information is used solely by SLTT ESTANCIAS management to confirm your reservation, send reference vouchers, and accommodate custom requests. We do not sell or share customer data with third parties.
            </p>

            <h4 className="font-bold text-[#ebe5de] text-sm">3. Payment Security</h4>
            <p>
              Payment details and transaction reference numbers are handled securely. Online deposits are verified against resort bank and GCash accounts.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-[#c3ccc0] leading-relaxed font-light">
            <h4 className="font-bold text-[#ebe5de] text-sm">1. Check-In & Check-Out Policy</h4>
            <p>
              Standard Check-In time is at 2:00 PM. Standard Check-Out time is at 12:00 PM. Early check-in or late check-out is subject to room availability and front desk confirmation.
            </p>

            <h4 className="font-bold text-[#ebe5de] text-sm">2. Reservation & Cancellation</h4>
            <p>
              A 50% partial deposit or full payment confirms your room reservation. Cancellations made at least 48 hours prior to check-in are eligible for date rebooking.
            </p>

            <h4 className="font-bold text-[#ebe5de] text-sm">3. Resort Guidelines & Pool Rules</h4>
            <p>
              Proper swimwear is required in the swimming pools. Guests are expected to maintain peace and respect resort property at all times.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
