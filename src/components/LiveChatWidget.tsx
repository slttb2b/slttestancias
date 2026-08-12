import React, { useState, useEffect, useRef } from 'react';
import { useResort } from '../context/ResortContext';
import { MessageSquare, X, Send, User, Phone, Mail, ShieldCheck, CheckCheck, Clock, Sparkles, RefreshCw, Image as ImageIcon, Paperclip, Maximize2 } from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  const {
    isLiveChatOpen,
    setIsLiveChatOpen,
    chatThreads,
    currentCustomerThreadId,
    sendChatMessage,
    createOrStartChatThread,
    markThreadReadByCustomer,
    resortInfo,
    theme,
  } = useResort();

  const isLight = theme === 'light';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialFileInputRef = useRef<HTMLInputElement>(null);

  // Initial Form state if starting new chat
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [initialMsg, setInitialMsg] = useState('');
  const [initialImage, setInitialImage] = useState<string | null>(null);

  // Chat reply state
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);

  // Image zoom modal
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Find active thread
  const activeThread = chatThreads.find((t) => t.id === currentCustomerThreadId);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isLiveChatOpen && activeThread) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      markThreadReadByCustomer(activeThread.id);
    }
  }, [isLiveChatOpen, activeThread?.messages.length, currentCustomerThreadId]);

  // Handle file selection and convert to Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'initial' | 'reply') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, GIF, WEBP).');
      return;
    }

    // Limit to ~5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Selected image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (target === 'initial') {
        setInitialImage(base64);
      } else {
        setReplyImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle customer starting a brand new live chat
  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || (!initialMsg.trim() && !initialImage)) return;

    createOrStartChatThread(
      {
        name: guestName.trim(),
        phone: guestPhone.trim() || undefined,
        email: guestEmail.trim() || undefined,
        subject: 'Live Chat Inquiry',
      },
      initialMsg.trim(),
      initialImage || undefined
    );

    setInitialMsg('');
    setInitialImage(null);
  };

  // Handle sending a reply in existing live chat
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!replyText.trim() && !replyImage) || !activeThread) return;

    sendChatMessage(
      activeThread.id,
      replyText.trim(),
      'customer',
      activeThread.customerName || 'Guest',
      replyImage || undefined
    );
    setReplyText('');
    setReplyImage(null);
  };

  const unreadForCustomer = activeThread ? activeThread.unreadCountCustomer : 0;

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {!isLiveChatOpen && unreadForCustomer > 0 && (
          <div className="bg-amber-500 text-[#132016] font-bold text-xs px-3 py-1.5 rounded-full shadow-lg border border-amber-300 animate-bounce flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Reply from Front Desk!</span>
          </div>
        )}

        <button
          onClick={() => setIsLiveChatOpen(!isLiveChatOpen)}
          className={`relative p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer group ${
            isLiveChatOpen
              ? 'bg-[#1c2a20] text-white hover:bg-[#132016] scale-95 ring-2 ring-amber-500/50'
              : 'bg-[#2d4536] text-white hover:bg-[#1c2a20] hover:scale-105 ring-4 ring-[#2d4536]/30'
          }`}
          title="Open Live Chat with Front Desk"
        >
          {isLiveChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6" />
              {unreadForCustomer > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-[#132016] text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadForCustomer}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Full Image Zoom Modal */}
      {previewZoomImage && (
        <div
          onClick={() => setPreviewZoomImage(null)}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute -top-10 right-0 text-white bg-black/60 p-2 rounded-full hover:bg-black"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewZoomImage}
              alt="Zoomed Attachment"
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border-2 border-white/20 object-contain"
            />
          </div>
        </div>
      )}

      {/* Live Chat Window / Drawer */}
      {isLiveChatOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[600px] h-[82vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#132016] text-[#ebe5de] p-4 flex items-center justify-between border-b border-[#2d4536]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#2d4536] border border-[#606e60] flex items-center justify-center text-amber-400 font-serif font-bold">
                  SLTT
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#132016]"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm font-serif text-[#ebe5de] flex items-center gap-1.5">
                  <span>Front Desk Live Chat</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                </h3>
                <p className="text-[11px] text-[#c3ccc0] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>{resortInfo.name || 'SLTT ESTANCIAS'} • Online 24/7</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsLiveChatOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#2d4536] text-[#c3ccc0] hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#faf8f5] space-y-3">
            {activeThread ? (
              <>
                {/* Notice banner */}
                <div className="bg-[#eef4f0] border border-[#c3d7ca] rounded-xl p-2.5 text-center text-[11px] text-[#2d4536]">
                  <p className="font-semibold">Chatting as {activeThread.customerName}</p>
                  <p className="text-[10px] text-[#556b5a] mt-0.5">Reference Thread: #{activeThread.id}</p>
                </div>

                {/* Messages List */}
                {activeThread.messages.map((msg) => {
                  const isCustomer = msg.sender === 'customer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <span className="text-[10px] text-gray-400 px-1 font-medium">
                        {msg.senderName || (isCustomer ? 'You' : 'Front Desk')} •{' '}
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm leading-relaxed ${
                          isCustomer
                            ? 'bg-[#2d4536] text-white rounded-tr-none'
                            : 'bg-white border border-gray-200 text-[#1c2a20] rounded-tl-none'
                        }`}
                      >
                        {msg.imageUrl && (
                          <div className="mb-2 relative group rounded-xl overflow-hidden border border-black/10">
                            <img
                              src={msg.imageUrl}
                              alt="Attached photo"
                              className="w-full max-h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => setPreviewZoomImage(msg.imageUrl || null)}
                            />
                            <button
                              onClick={() => setPreviewZoomImage(msg.imageUrl || null)}
                              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black text-[10px] flex items-center gap-1 shadow-md"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Enlarge</span>
                            </button>
                          </div>
                        )}
                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              /* Start New Chat Form */
              <div className="space-y-4 my-auto">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 bg-[#eaf0eb] text-[#2d4536] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#2d4536]/20">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold font-serif text-[#1c2a20] text-base">Start Live Conversation</h4>
                  <p className="text-xs text-gray-600 px-4">
                    Send a message directly to our resort manager and get real-time answers. You can also attach payment receipts or room inquiry photos!
                  </p>
                </div>

                <form onSubmit={handleStartChat} className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Juan Dela Cruz"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d4536] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Mobile Number / Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="e.g. 09054965912"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d4536] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      First Message / Inquiry *
                    </label>
                    <textarea
                      rows={2}
                      value={initialMsg}
                      onChange={(e) => setInitialMsg(e.target.value)}
                      placeholder="Hi! I would like to inquire about..."
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d4536] focus:outline-none"
                    />
                  </div>

                  {/* Initial Image Upload Attachment */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                      Attach Image / Payment Receipt (Optional)
                    </label>

                    {initialImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-300 max-h-32">
                        <img src={initialImage} alt="Attachment preview" className="w-full h-32 object-cover" />
                        <button
                          type="button"
                          onClick={() => setInitialImage(null)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => initialFileInputRef.current?.click()}
                        className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-xl text-xs text-gray-600 hover:border-[#2d4536] hover:text-[#2d4536] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Upload photo or screenshot</span>
                      </button>
                    )}
                    <input
                      type="file"
                      ref={initialFileInputRef}
                      onChange={(e) => handleImageFileChange(e, 'initial')}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#2d4536] hover:bg-[#1c2a20] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Start Live Chat</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer Input Area (When thread active) */}
          {activeThread && (
            <div className="p-3 bg-white border-t border-gray-200 space-y-2">
              {/* Image Preview Banner if pending attach */}
              {replyImage && (
                <div className="relative inline-block border border-gray-300 rounded-xl overflow-hidden max-h-24">
                  <img src={replyImage} alt="Pending attachment" className="h-20 object-cover" />
                  <button
                    type="button"
                    onClick={() => setReplyImage(null)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors shrink-0"
                  title="Attach image or payment receipt"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleImageFileChange(e, 'reply')}
                  accept="image/*"
                  className="hidden"
                />

                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type message or attach receipt..."
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d4536] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!replyText.trim() && !replyImage}
                  className="p-2.5 rounded-xl bg-[#2d4536] hover:bg-[#1c2a20] text-white disabled:opacity-50 cursor-pointer transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};

