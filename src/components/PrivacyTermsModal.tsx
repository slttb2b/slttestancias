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
          <div className="space-y-5 text-xs text-[#c3ccc0] leading-relaxed font-light">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1c2a20] border border-[#ad9e92]/50 shadow-inner">
              <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider mb-3.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#ad9e92]" />
                BOOKING TERMS & CONDITIONS
              </h3>
              <ul className="space-y-3 text-xs text-[#ebe5de]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#ad9e92] font-bold text-base leading-none shrink-0">•</span>
                  <span>All bookings are <strong>NON-REFUNDABLE</strong>, <strong>NON-TRANSFERABLE</strong>, and <strong>NON-REBOOKABLE</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#ad9e92] font-bold text-base leading-none shrink-0">•</span>
                  <span>Once the booking is confirmed, the date and reservation are considered final.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#ad9e92] font-bold text-base leading-none shrink-0">•</span>
                  <span>No refund will be given for cancellation, no-show, late arrival, or early departure.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#ad9e92] font-bold text-base leading-none shrink-0">•</span>
                  <span>Guests must review all booking details, including the resort location/address, date, cottage, and rates, before making payment.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#ad9e92] font-bold text-base leading-none shrink-0">•</span>
                  <span>Once payment is made and the booking is confirmed, it means the guest has read, understood, and agreed to our Booking Terms & Conditions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#ad9e92] font-bold text-base leading-none shrink-0">•</span>
                  <span>Proof of payment is required to confirm the reservation.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-[#ebe5de] text-sm">Resort Guidelines & Check-In Information</h4>
              <p>
                Standard Check-In time begins at 2:00 PM and Standard Check-Out time is at 12:00 PM noon. Please present a digital or printed copy of your booking confirmation voucher along with a valid government ID at the front desk upon arrival.
              </p>
              <p>
                Proper swimwear is required in the swimming pools. Guests are expected to maintain peace, observe quiet hours, and respect sanctuary property at all times.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
