import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { ResortProvider, useResort } from './context/ResortContext';
import { SectionId, CustomBlock } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuickBookingSearch } from './components/QuickBookingSearch';
import { AboutSection } from './components/AboutSection';
import { RoomsSection } from './components/RoomsSection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { GallerySection } from './components/GallerySection';
import { PackagesSection } from './components/PackagesSection';
import { BookingProcessSection } from './components/BookingProcessSection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationSection } from './components/LocationSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { RoomDetailModal } from './components/RoomDetailModal';
import { BookingWizardModal } from './components/BookingWizardModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { DocumentationModal } from './components/DocumentationModal';
import { PrivacyTermsModal } from './components/PrivacyTermsModal';
import { Toast } from './components/Toast';
import { LiveChatWidget } from './components/LiveChatWidget';
import { FloatingAdminToolbar } from './components/FloatingAdminToolbar';
import { FAQBlock } from './components/blocks/FAQBlock';
import { AnnouncementBlock } from './components/blocks/AnnouncementBlock';
import { VideoBlock } from './components/blocks/VideoBlock';
import { PromoBlock } from './components/blocks/PromoBlock';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1c2a20] text-[#ebe5de] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#132016] border border-[#606e60] p-8 rounded-3xl space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold font-serif text-amber-400">SLTT ESTANCIAS RESORT</h2>
            <p className="text-xs text-[#c3ccc0]">
              An issue occurred while rendering this component. Click below to reload the portal.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainLayout() {
  const { activeTab, theme, resortInfo, isAdminLoggedIn } = useResort();

  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [privacyTermsType, setPrivacyTermsType] = useState<'privacy' | 'terms' | null>(null);

  const fontClass = `font-pairing-${resortInfo.fontPairing || 'editorial'}`;

  const containerClasses = theme === 'light'
    ? `min-h-screen bg-[#faf8f5] text-[#1c2a20] flex flex-col font-sans selection:bg-[#2d4536] selection:text-white transition-colors duration-300 ${fontClass}`
    : `min-h-screen bg-[#1c2a20] text-[#ebe5de] flex flex-col font-sans selection:bg-[#ad9e92] selection:text-[#1c2a20] transition-colors duration-300 ${fontClass}`;

  const renderCustomBlock = (block: CustomBlock) => {
    switch (block.type) {
      case 'faq':
        return <FAQBlock key={block.id} block={block} />;
      case 'announcement':
        return <AnnouncementBlock key={block.id} block={block} />;
      case 'video':
        return <VideoBlock key={block.id} block={block} />;
      case 'promo':
        return <PromoBlock key={block.id} block={block} />;
      default:
        return null;
    }
  };

  if (activeTab === 'admin') {
    return (
      <div className={containerClasses}>
        {isAdminLoggedIn && <FloatingAdminToolbar />}
        <Header
          onOpenDocs={() => setIsDocsOpen(true)}
          onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        />
        <main className="flex-1">
          <AdminDashboard />
        </main>
        <Footer
          onOpenPrivacyTerms={(type) => setPrivacyTermsType(type)}
          onOpenDocs={() => setIsDocsOpen(true)}
          onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        />
        <Toast />
        <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
        <MyBookingsModal isOpen={isMyBookingsOpen} onClose={() => setIsMyBookingsOpen(false)} />
        <PrivacyTermsModal type={privacyTermsType} onClose={() => setPrivacyTermsType(null)} />
      </div>
    );
  }

  const defaultOrder: SectionId[] = ['hero', 'about', 'rooms', 'packages', 'amenities', 'location'];
  const currentOrder = resortInfo.sectionOrder || defaultOrder;
  const disabledSections = resortInfo.disabledSections || [];
  const customBlocks = resortInfo.customBlocks || [];

  const renderSection = (sectionId: SectionId) => {
    if (disabledSections.includes(sectionId)) return null;

    switch (sectionId) {
      case 'hero':
        return (
          <React.Fragment key="hero">
            <Hero />
            <QuickBookingSearch />
          </React.Fragment>
        );
      case 'about':
        return <AboutSection key="about" />;
      case 'rooms':
        return <RoomsSection key="rooms" />;
      case 'packages':
        return <PackagesSection key="packages" />;
      case 'amenities':
        return (
          <React.Fragment key="amenities">
            <AmenitiesSection />
            <GallerySection />
            <BookingProcessSection />
            <ReviewsSection />
          </React.Fragment>
        );
      case 'location':
        return (
          <React.Fragment key="location">
            <LocationSection />
            <ContactSection />
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  return (
    <div className={containerClasses}>
      {/* Floating Design Studio Admin Toolbar for Owner */}
      {isAdminLoggedIn && <FloatingAdminToolbar />}

      <Header
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />

      <main className="flex-1">
        {currentOrder.map((sectionId) => renderSection(sectionId))}

        {/* Dynamic Custom Content Blocks (FAQ, Announcements, Videos, Promos) */}
        {customBlocks.length > 0 && (
          <div className="space-y-4 py-8">
            {customBlocks.map((block) => renderCustomBlock(block))}
          </div>
        )}
      </main>

      <Footer
        onOpenPrivacyTerms={(type) => setPrivacyTermsType(type)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />

      {/* Modals & Overlay Drawers */}
      <RoomDetailModal />
      <BookingWizardModal />
      <MyBookingsModal isOpen={isMyBookingsOpen} onClose={() => setIsMyBookingsOpen(false)} />
      <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <PrivacyTermsModal type={privacyTermsType} onClose={() => setPrivacyTermsType(null)} />
      <LiveChatWidget />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ResortProvider>
        <MainLayout />
      </ResortProvider>
    </ErrorBoundary>
  );
}
