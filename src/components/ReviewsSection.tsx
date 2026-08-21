import React, { useState } from 'react';
import { useResort } from '../context/ResortContext';
import { Star, PlusCircle, X } from 'lucide-react';
import { Testimonial } from '../types';
import { EditableText } from './common/EditableText';
import { EditableImage } from './common/EditableImage';

export const ReviewsSection: React.FC = () => {
  const { reviews, addReview, updateReview, showToast, theme } = useResort();
  const isLight = theme === 'light';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [origin, setOrigin] = useState('');
  const [roomName, setRoomName] = useState('Deluxe Room');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleUpdateGuestName = (id: string, name: string) => {
    const target = reviews.find((r) => r.id === id);
    if (target) {
      updateReview({ ...target, guestName: name });
    }
  };

  const handleUpdateComment = (id: string, text: string) => {
    const target = reviews.find((r) => r.id === id);
    if (target) {
      updateReview({ ...target, comment: text });
    }
  };

  const handleUpdateAvatar = (id: string, newUrl: string) => {
    const target = reviews.find((r) => r.id === id);
    if (target) {
      updateReview({ ...target, avatarUrl: newUrl });
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !comment) return;

    const newRev: Testimonial = {
      id: `rev-${Date.now()}`,
      guestName,
      origin: origin || 'Valued Guest',
      rating,
      comment,
      date: 'Just now',
      roomName,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    };

    addReview(newRev);
    setIsModalOpen(false);
    setGuestName('');
    setComment('');
    showToast('Thank you! Your review has been published.', 'success');
  };

  return (
    <section className={`py-20 relative transition-colors duration-300 ${
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
            <Star className={`w-3.5 h-3.5 ${isLight ? 'text-[#2d4536] fill-[#2d4536]' : 'text-[#ad9e92] fill-[#ad9e92]'}`} />
            Guest Impressions
          </div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif ${
            isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
          }`}>
            What Our Guests Say
          </h2>
          <p className={`text-base sm:text-lg font-light ${
            isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
          }`}>
            Real stories and experiences from guests who stayed at SLTT ESTANCIAS.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shadow-md ${
                isLight
                  ? 'bg-[#faf8f5] hover:bg-[#eaf0eb] border-[#d8d0c2] text-[#1c2a20]'
                  : 'bg-[#132016] border-[#606e60] text-[#ebe5de] hover:text-[#c3ccc0]'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />
              <span>Leave a Guest Review</span>
            </button>
          </div>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-6 relative transition-all duration-300 border ${
                isLight
                  ? 'bg-[#faf8f5] border-[#e2dcd0] hover:border-[#2d4536]/40 hover:shadow-xl'
                  : 'bg-[#132016]/90 border-[#606e60]/60 hover:border-[#c3ccc0]/80 shadow-xl'
              }`}
            >
              <div className="space-y-4">
                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating
                          ? isLight ? 'text-[#2d4536] fill-[#2d4536]' : 'text-[#ad9e92] fill-[#ad9e92]'
                          : 'text-gray-300 dark:text-[#606e60]/40'
                      }`}
                    />
                  ))}
                  <span className={`text-xs font-bold ml-2 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`}>{rev.rating}.0</span>
                </div>

                {/* Comment */}
                <p className={`text-sm leading-relaxed italic font-light ${
                  isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
                }`}>
                  "<EditableText
                    value={rev.comment}
                    onChange={(val) => handleUpdateComment(rev.id, val)}
                    as="span"
                  />"
                </p>
              </div>

              {/* Guest Profile Footer */}
              <div className={`pt-4 border-t flex items-center gap-3 ${
                isLight ? 'border-[#e2dcd0]' : 'border-[#606e60]/40'
              }`}>
                <EditableImage
                  src={rev.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                  alt={rev.guestName}
                  onChange={(newUrl) => handleUpdateAvatar(rev.id, newUrl)}
                  className={`w-10 h-10 rounded-full object-cover border ${
                    isLight ? 'border-[#2d4536]/30' : 'border-[#ad9e92]/40'
                  }`}
                  containerClassName="relative group/img-editable shrink-0"
                />
                <div>
                  <h4 className={`font-bold text-sm font-serif ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>
                    <EditableText
                      value={rev.guestName}
                      onChange={(val) => handleUpdateGuestName(rev.id, val)}
                      as="span"
                    />
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-[#4e6a55]' : 'text-[#c3ccc0]/80'}`}>
                    {rev.origin} • <span className={`font-medium ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`}>{rev.roomName}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full p-6 shadow-2xl relative border ${
            isLight
              ? 'bg-white border-[#e0d9cc] text-[#1c2a20]'
              : 'bg-[#132016] border-[#606e60] text-[#ebe5de]'
          }`}>
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-4 right-4 ${isLight ? 'text-[#3c5241] hover:text-[#1c2a20]' : 'text-[#c3ccc0] hover:text-[#ebe5de]'}`}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className={`text-xl font-bold font-serif mb-1 ${isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'}`}>Share Your Sanctuary Experience</h3>
            <p className={`text-xs mb-6 ${isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'}`}>Your feedback helps future guests discover SLTT ESTANCIAS.</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Your Full Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Maria Clara Santos"
                  className={`w-full px-3 py-2 rounded-xl text-sm focus:outline-none ${
                    isLight
                      ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                      : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>City / Hometown</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Cagayan de Oro City"
                  className={`w-full px-3 py-2 rounded-xl text-sm focus:outline-none ${
                    isLight
                      ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                      : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Room Category Stayed</label>
                <select
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm focus:outline-none ${
                    isLight
                      ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                      : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                  }`}
                >
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Family Room">Family Room</option>
                  <option value="Premium Suite">Premium Suite</option>
                  <option value="Tropical Villa">Tropical Villa</option>
                  <option value="Private Pool Villa">Private Pool Villa</option>
                </select>
              </div>

              <div>
                <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? isLight ? 'text-[#2d4536] fill-[#2d4536]' : 'text-[#ad9e92] fill-[#ad9e92]'
                            : 'text-gray-300 dark:text-[#606e60]/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`text-xs font-medium block mb-1 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`}>Your Review Comment</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a few words about your stay, room, pool, staff..."
                  className={`w-full px-3 py-2 rounded-xl text-sm focus:outline-none ${
                    isLight
                      ? 'bg-[#f6f3ed] border border-[#d8d0c2] text-[#1c2a20] focus:border-[#2d4536]'
                      : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] focus:border-[#c3ccc0]'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-extrabold text-sm tracking-wider uppercase cursor-pointer ${
                  isLight
                    ? 'bg-[#2d4536] hover:bg-[#1c2a20] text-white'
                    : 'bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20]'
                }`}
              >
                Submit Guest Review
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
