import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { Booking } from '../types';
import { downloadVoucher } from '../utils/voucher';
import { X, Search, CalendarCheck, Printer, PhoneCall, CheckCircle2, Clock, AlertCircle, Upload, Image as ImageIcon, Receipt, MessageSquare, Send } from 'lucide-react';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({ isOpen, onClose }) => {
  const { bookings, getBookingByReference, resortInfo, attachBookingReceipt } = useResort();
  const [searchInput, setSearchInput] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [refInput, setRefInput] = useState('');
  const [receiptUploadUrl, setReceiptUploadUrl] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const result = getBookingByReference(searchInput);
    if (result) {
      setFoundBooking(result);
    } else {
      // Try searching by mobile or guest name
      const query = searchInput.trim().toLowerCase();
      const matched = bookings.find(
        (b) =>
          (b?.mobile || '').includes(searchInput.trim()) ||
          (b?.guestName || '').toLowerCase().includes(query)
      );
      setFoundBooking(matched || null);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && foundBooking) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const url = uploadEvent.target.result as string;
          setReceiptUploadUrl(url);
          attachBookingReceipt(foundBooking.id, url, refInput);
          setFoundBooking((prev) => prev ? { ...prev, paymentReceiptUrl: url, paymentReferenceCode: refInput || prev.paymentReferenceCode } : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    if (foundBooking) {
      downloadVoucher(foundBooking, resortInfo);
    } else {
      window.print();
    }
  };

  const statusColors = {
    Pending: 'bg-[#1c2a20] border-[#ad9e92] text-[#ad9e92]',
    Confirmed: 'bg-[#1c2a20] border-[#606e60] text-[#c3ccc0]',
    'Checked In': 'bg-[#1c2a20] border-[#606e60] text-[#ebe5de]',
    'Checked Out': 'bg-[#1c2a20] border-[#606e60]/60 text-[#c3ccc0]/60',
    Cancelled: 'bg-[#1c2a20] border-[#ad9e92]/40 text-[#ad9e92]/80',
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#132016]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-xl w-full my-8 p-6 sm:p-8 shadow-2xl text-[#ebe5de] relative animate-in fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#c3ccc0] hover:text-[#ebe5de]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <CalendarCheck className="w-6 h-6 text-[#ad9e92]" />
          <h3 className="text-2xl font-bold font-serif text-[#ebe5de]">Track Reservation</h3>
        </div>
        <p className="text-xs text-[#c3ccc0] mb-6 font-light">
          Enter your booking reference code (e.g. SLTT-2026-88219) or mobile phone number.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Reference Code or Mobile Number..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-sm focus:outline-none focus:border-[#c3ccc0] text-[#ebe5de]"
            required
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <Search className="w-4 h-4 text-[#1c2a20]" />
            <span>Search</span>
          </button>
        </form>

        {/* Results Box */}
        {hasSearched && (
          <div>
            {foundBooking ? (
              <div className="p-5 rounded-2xl bg-[#1c2a20] border border-[#606e60] space-y-4">
                <div className="flex items-center justify-between border-b border-[#606e60]/60 pb-3">
                  <div>
                    <span className="text-[10px] text-[#c3ccc0] block uppercase tracking-wider">Reference Code</span>
                    <span className="font-mono font-bold text-[#ad9e92] text-lg">{foundBooking.referenceNumber}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusColors[foundBooking.status]}`}>
                    {foundBooking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#c3ccc0]">
                  <div>Guest Name: <span className="font-bold text-[#ebe5de] block">{foundBooking.guestName}</span></div>
                  <div>Mobile: <span className="font-bold text-[#ebe5de] block">{foundBooking.mobile}</span></div>
                  <div>Accommodation: <span className="font-bold text-[#ad9e92] block">{foundBooking.roomName}</span></div>
                  <div>Stay Dates: <span className="font-bold text-[#ebe5de] block">{foundBooking.checkInDate} to {foundBooking.checkOutDate} ({foundBooking.numberOfNights} nights)</span></div>
                  <div>Payment Method: <span className="text-[#ebe5de] block font-bold">{foundBooking.paymentMethod} ({foundBooking.selectedPaymentChannel || 'GCash/Bank'})</span></div>
                  <div>Payment Status: <span className="font-bold text-[#ad9e92] block">{foundBooking.paymentStatus}</span></div>
                </div>

                {/* Payment Receipt / Reference Section */}
                <div className="p-4 rounded-xl bg-[#132016] border border-[#606e60] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#ad9e92] flex items-center gap-1.5 uppercase tracking-wider">
                      <Receipt className="w-4 h-4" />
                      Payment Receipt & Verification
                    </span>
                    {foundBooking.paymentReferenceCode && (
                      <span className="text-xs font-mono text-[#ebe5de]">Ref: {foundBooking.paymentReferenceCode}</span>
                    )}
                  </div>

                  {foundBooking.paymentReceiptUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={foundBooking.paymentReceiptUrl} alt="Uploaded Payment Receipt" className="w-16 h-16 rounded-lg object-cover border border-[#606e60]" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Receipt Attached
                        </p>
                        <p className="text-[10px] text-[#c3ccc0]">Verification in progress by front desk team.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-[#c3ccc0]">Upload your GCash / Bank Transfer receipt for faster confirmation:</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Transaction Ref # (e.g. 100234567)"
                          value={refInput}
                          onChange={(e) => setRefInput(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] font-mono focus:outline-none"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {foundBooking.adminNotes && (
                  <div className="p-3 rounded-xl bg-[#132016] border border-[#606e60] text-xs text-[#c3ccc0]">
                    <strong>Sanctuary Note:</strong> {foundBooking.adminNotes}
                  </div>
                )}

                {/* Sent Notifications History */}
                {foundBooking.notificationsSent && foundBooking.notificationsSent.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#132016] border border-[#606e60] space-y-2.5">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Dispatched Email Notifications ({foundBooking.notificationsSent.length})
                    </span>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {foundBooking.notificationsSent.map((notif, idx) => (
                        <div key={notif.id || idx} className="p-2.5 rounded-lg bg-[#1c2a20] border border-[#606e60]/40 text-xs font-mono space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-[#ad9e92]">
                            <span className="font-bold text-amber-200">{notif.type} • {notif.triggerEvent}</span>
                            <span>{new Date(notif.timestamp).toLocaleString()}</span>
                          </div>
                          {notif.subject && (
                            <p className="font-bold text-[#ebe5de] text-[11px] truncate">
                              Subj: {notif.subject}
                            </p>
                          )}
                          <p className="text-[#c3ccc0] text-[11px] whitespace-pre-wrap line-clamp-3">
                            {notif.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-2.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-[#1c2a20]" />
                    <span>Print Confirmation Ticket</span>
                  </button>
                  <a
                    href={`tel:${resortInfo.contactNumber}`}
                    className="py-2.5 px-4 rounded-xl bg-[#132016] border border-[#606e60] text-[#c3ccc0] hover:text-[#ebe5de] text-xs font-bold flex items-center gap-1"
                  >
                    <PhoneCall className="w-4 h-4 text-[#ad9e92]" />
                    <span>Call Desk</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#1c2a20] border border-[#606e60] text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-[#ad9e92] mx-auto" />
                <h4 className="font-bold text-sm text-[#ebe5de]">No Reservation Found</h4>
                <p className="text-xs text-[#c3ccc0]">
                  We couldn't find a booking matching "{searchInput}". Please check your reference code or contact front desk at {resortInfo.contactNumber}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
