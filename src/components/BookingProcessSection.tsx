import React from 'react';
import { useResort } from '../context/ResortContext';
import { CalendarRange, BedDouble, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

export const BookingProcessSection: React.FC = () => {
  const { theme } = useResort();
  const isLight = theme === 'light';

  const steps = [
    {
      num: '01',
      title: 'Select Your Dates',
      description: 'Choose check-in and check-out dates along with total guest count.',
      icon: <CalendarRange className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />,
    },
    {
      num: '02',
      title: 'Choose Your Room',
      description: 'Select your preferred deluxe suite, family room, or private pool villa.',
      icon: <BedDouble className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />,
    },
    {
      num: '03',
      title: 'Enter Guest Info',
      description: 'Fill in your full contact details and any custom request or add-ons.',
      icon: <UserCheck className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'}`} />,
    },
    {
      num: '04',
      title: 'Confirm & Enjoy',
      description: 'Receive instant reference voucher and payment instructions.',
      icon: <ShieldCheck className={`w-8 h-8 ${isLight ? 'text-[#2d4536]' : 'text-[#c3ccc0]'}`} />,
    },
  ];

  return (
    <section className={`py-20 relative transition-colors duration-300 border-y ${
      isLight
        ? 'bg-[#faf8f5] text-[#1c2a20] border-[#e2dcd0]'
        : 'bg-[#132016] text-[#ebe5de] border-[#606e60]/40'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className={`text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full border ${
            isLight
              ? 'bg-[#eaf0eb] border-[#2d4536]/20 text-[#2d4536]'
              : 'bg-[#1c2a20] border-[#606e60] text-[#c3ccc0]'
          }`}>
            Effortless Reservation
          </span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif ${
            isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
          }`}>
            How to Book Your Sanctuary Stay
          </h2>
          <p className={`text-base sm:text-lg font-light ${
            isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
          }`}>
            Reserving your spot at SLTT ESTANCIAS takes less than 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className={`rounded-3xl p-6 border relative shadow-md flex flex-col justify-between group transition-all duration-300 ${
                isLight
                  ? 'bg-white border-[#e0d9cc] hover:border-[#2d4536]/40 hover:shadow-xl'
                  : 'bg-[#1c2a20] border-[#606e60]/60 hover:border-[#c3ccc0]/80 shadow-xl'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform ${
                    isLight
                      ? 'bg-[#eaf0eb] border-[#2d4536]/20'
                      : 'bg-[#132016] border-[#606e60]/60'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-3xl font-bold font-serif transition-colors ${
                    isLight
                      ? 'text-[#2d4536]/30 group-hover:text-[#2d4536]'
                      : 'text-[#606e60]/60 group-hover:text-[#ad9e92]'
                  }`}>
                    {step.num}
                  </span>
                </div>

                <h3 className={`text-xl font-bold font-serif ${
                  isLight ? 'text-[#1c2a20]' : 'text-[#ebe5de]'
                }`}>{step.title}</h3>
                <p className={`text-xs leading-relaxed font-light ${
                  isLight ? 'text-[#3c5241]' : 'text-[#c3ccc0]'
                }`}>
                  {step.description}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className={`hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 ${
                  isLight ? 'text-[#2d4536]' : 'text-[#ad9e92]'
                }`}>
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
