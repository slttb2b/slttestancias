import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { PhoneCall, Mail, MessageSquare, Clock, Facebook, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { EditableText } from './common/EditableText';

export const ContactSection: React.FC = () => {
  const { resortInfo, updateResortInfo, showToast, theme, createOrStartChatThread, setIsLiveChatOpen } = useResort();
  const isLight = theme === 'light';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry / Reservation Request');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    createOrStartChatThread(
      { name: name || 'Guest', email, phone, subject },
      message
    );
    setIsLiveChatOpen(true);
    setIsSent(true);
    showToast('Live Chat session started with SLTT ESTANCIAS Front Desk!', 'success');
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIsSent(false);
    }, 2000);
  };

  return (
    <section id="contact" className={`py-20 relative transition-colors duration-300 ${
      isLight ? 'bg-white text-[#1c2a20]' : 'bg-[#1c2a20] text-[#ebe5de]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border ${
            isLight
              ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
              : 'bg-[#132016] border-[#606e60] text-[#c3ccc0]'
          }`}>
            <PhoneCall className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
            Direct Communication
          </div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif ${
            isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
          }`}>
            <EditableText
              value={resortInfo.contactHeading || 'Contact the Sanctuary'}
              onChange={(val) => updateResortInfo({ ...resortInfo, contactHeading: val })}
              as="span"
            />
          </h2>
          <p className={`text-base sm:text-lg font-light ${
            isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
          }`}>
            <EditableText
              value={resortInfo.contactSubtitle || 'Have questions about room availability, special event bookings, or day tour access? Connect with us directly.'}
              onChange={(val) => updateResortInfo({ ...resortInfo, contactSubtitle: val })}
              as="span"
            />
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Details Cards */}
          <div className="lg:col-span-2 space-y-4">
            {/* Phone */}
            <div className={`p-5 rounded-3xl flex items-start gap-4 shadow-md border transition-all ${
              isLight
                ? 'bg-[#faf8f5] border-[#e0d9cc]'
                : 'bg-[#132016]/90 border-[#606e60]/60 shadow-xl'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
                  : 'bg-[#1c2a20] border-[#606e60]/60 text-[#ad9e92]'
              }`}>
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Mobile & Hotline</h4>
                <a
                  href={`tel:${resortInfo.contactNumber}`}
                  className={`text-lg font-bold font-serif block mt-0.5 transition-colors ${
                    isLight ? 'text-[#1c2a20] hover:text-[#2d4536]' : 'text-[#ebe5de] hover:text-[#c3ccc0]'
                  }`}
                >
                  {resortInfo.contactNumber}
                </a>
                <p className={`text-xs mt-1 ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]/80'}`}>Direct call or SMS assistance</p>
              </div>
            </div>

            {/* Email */}
            <div className={`p-5 rounded-3xl flex items-start gap-4 shadow-md border transition-all ${
              isLight
                ? 'bg-[#faf8f5] border-[#e0d9cc]'
                : 'bg-[#132016]/90 border-[#606e60]/60 shadow-xl'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
                  : 'bg-[#1c2a20] border-[#606e60]/60 text-[#c3ccc0]'
              }`}>
                <Mail className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Email Inquiries</h4>
                <a
                  href={`mailto:${resortInfo.email}`}
                  className={`text-sm font-bold block truncate mt-0.5 hover:underline ${
                    isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'
                  }`}
                >
                  {resortInfo.email}
                </a>
                <p className={`text-xs mt-1 ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]/80'}`}>Official resort inquiries & group reservations</p>
              </div>
            </div>

            {/* Facebook & Messenger */}
            <div className={`p-5 rounded-3xl flex items-start gap-4 shadow-md border transition-all ${
              isLight
                ? 'bg-[#faf8f5] border-[#e0d9cc]'
                : 'bg-[#132016]/90 border-[#606e60]/60 shadow-xl'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
                  : 'bg-[#1c2a20] border-[#606e60]/60 text-[#ad9e92]'
              }`}>
                <Facebook className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Facebook Page</h4>
                <p className={`text-sm font-bold font-serif mt-0.5 ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>{resortInfo.facebookPage}</p>
                <div className="flex gap-2 mt-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                      isLight
                        ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white'
                        : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Messenger</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className={`p-5 rounded-3xl flex items-start gap-4 shadow-md border transition-all ${
              isLight
                ? 'bg-[#faf8f5] border-[#e0d9cc]'
                : 'bg-[#132016]/90 border-[#606e60]/60 shadow-xl'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
                  : 'bg-[#1c2a20] border-[#606e60]/60 text-[#c3ccc0]'
              }`}>
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Operating Hours</h4>
                <p className={`text-sm font-semibold mt-0.5 ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>{resortInfo.businessHours}</p>
                <p className={`text-xs mt-1 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`}>Front desk assistance available 24/7 for check-ins</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-3 rounded-3xl p-6 sm:p-8 shadow-xl border ${
            isLight
              ? 'bg-[#faf8f5] border-[#e0d9cc]'
              : 'bg-[#132016]/90 border-[#606e60]/60 shadow-2xl'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-2xl font-bold font-serif mb-1 ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Send Direct Message or Live Chat</h3>
                <p className={`text-xs font-light ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>
                  Connect with our resort front desk manager instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveChatOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#132016] font-bold text-xs flex items-center gap-2 shadow-md shrink-0 cursor-pointer transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Live Chat Widget</span>
              </button>
            </div>

            {isSent ? (
              <div className={`p-6 rounded-2xl text-center space-y-3 border ${
                isLight
                  ? 'bg-[#eaf0eb] border-[#2d4536]/20'
                  : 'bg-[#1c2a20] border-[#606e60]'
              }`}>
                <CheckCircle2 className={`w-12 h-12 mx-auto ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />
                <h4 className={`text-lg font-bold font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Message Received!</h4>
                <p className={`text-xs ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>
                  Thank you for reaching out to SLTT ESTANCIAS. Our team will contact you at {phone || email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none ${
                        isLight
                          ? 'bg-white border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                          : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Mobile Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 09171234567"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none ${
                        isLight
                          ? 'bg-white border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                          : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. guest@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none ${
                        isLight
                          ? 'bg-white border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                          : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none ${
                        isLight
                          ? 'bg-white border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                          : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                      }`}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Room Reservation">Room Reservation</option>
                      <option value="Day Tour / Swimming">Day Tour / Swimming</option>
                      <option value="Wedding / Function Event">Wedding / Function Event</option>
                      <option value="Custom Special Request">Custom Special Request</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Your Message *</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your planned visit, preferred dates, or special inquiry..."
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none ${
                      isLight
                        ? 'bg-white border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                        : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                    }`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-colors ${
                    isLight
                      ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white'
                      : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>SUBMIT DIRECT INQUIRY</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
