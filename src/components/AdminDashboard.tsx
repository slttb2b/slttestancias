import React, { useState, useRef } from 'react';
import { useResort } from '../context/ResortContext';
import { BookingStatus, Room, Package, PaymentSettings, ResortInfo, ResortDesignAssets, SectionId, Booking, NotificationLog } from '../types';
import { formatNotificationMessage } from '../data/resortData';
import { downloadVoucher } from '../utils/voucher';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  BedDouble,
  Users,
  LogOut,
  Building,
  Key,
  CalendarRange,
  Upload,
  Image as ImageIcon,
  Receipt,
  Smartphone,
  Building2,
  Globe,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Save,
  Eye,
  FileText,
  CreditCard,
  Sliders,
  Check,
  X,
  Sparkles,
  QrCode,
  Printer,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Layout,
  Move,
  GripVertical,
  Layers,
  MessageSquare,
  Send,
  RotateCcw,
  Copy,
  CheckCircle,
  Maximize2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    bookings,
    updateBookingStatus,
    deleteBooking,
    rooms,
    toggleRoomAvailability,
    updateRoomPrice,
    addRoom,
    updateRoom,
    deleteRoom,
    blockRoomDates,
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    resortInfo,
    updateResortInfo,
    paymentSettings,
    updatePaymentSettings,
    notificationTemplates,
    updateNotificationTemplates,
    notificationLogs,
    sendNotification,
    showToast,
    chatThreads,
    sendChatMessage,
    markThreadReadByOwner,
    deleteChatThread,
    unreadChatCountOwner,
  } = useResort();

  const [pinInput, setPinInput] = useState('');
  const [adminTab, setAdminTab] = useState<'bookings' | 'chat' | 'rooms' | 'packages' | 'builder' | 'system' | 'payments' | 'notifications'>('bookings');

  // Live Chat Admin State
  const [selectedAdminThreadId, setSelectedAdminThreadId] = useState<string | null>(null);
  const [ownerReplyText, setOwnerReplyText] = useState<string>('');
  const [ownerReplyImage, setOwnerReplyImage] = useState<string | null>(null);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [adminZoomImage, setAdminZoomImage] = useState<string | null>(null);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const handleAdminImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOwnerReplyImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Notification Template Editing State
  const [notifForm, setNotifForm] = useState(notificationTemplates);
  const [selectedBookingForNotify, setSelectedBookingForNotify] = useState<Booking | null>(null);
  const [customEmailSub, setCustomEmailSub] = useState('');
  const [customEmailBody, setCustomEmailBody] = useState('');
  const [viewingNotificationLog, setViewingNotificationLog] = useState<NotificationLog | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Bookings Filter State
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // SECTION NAMES MAP FOR BUILDER
  const SECTION_NAMES: Record<SectionId, string> = {
    hero: '1. Homepage Hero & Quick Search Bar',
    about: '2. Botanical Sanctuary About Narrative',
    rooms: '3. Villas & Luxury Accommodations',
    packages: '4. Exclusive Day Tour & Stay Packages',
    amenities: '5. Resort Facilities & Photo Gallery',
    location: '6. Sanctuary Location & Highway Map',
    faq: '7. FAQ Accordion Block',
    announcement: '8. Event Announcement Banner',
    video: '9. Video Tour Showcase',
    promo: '10. Special Promo Voucher',
  };

  // ROOM EDIT / ADD STATE
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'All' | 'Rooms and Suites' | 'Cottages' | 'Filipino Kubos'>('All');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState<Partial<Room>>({
    name: '',
    category: 'Rooms and Suites',
    tagline: '',
    shortDescription: '',
    fullDescription: '',
    maxGuests: 2,
    bedType: '1 Queen Bed',
    sizeSqM: 35,
    pricePerNight: 2500,
    featuredImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [],
    amenities: ['Air Conditioning', 'Plush Bedding', 'Hot Rainfall Shower', 'Free Wi-Fi'],
    isAvailable: true,
    isComingSoon: false,
    comingSoonNotice: 'Coming Soon - Opening Soon!',
  });
  const [newGalleryInput, setNewGalleryInput] = useState('');

  // PACKAGE EDIT / ADD STATE
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [newPackageData, setNewPackageData] = useState<Partial<Package>>({
    name: '',
    tagline: '',
    price: 3500,
    duration: '2 Days / 1 Night',
    inclusions: ['Breakfast included', 'Pool access', 'Welcome Drinks'],
    validity: 'Valid Year-round',
    featuredImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    recommendedGuests: '2-4 Persons',
    isPopular: false,
  });
  const [newInclusionInput, setNewInclusionInput] = useState('');
  const [newPkgInclusionInput, setNewPkgInclusionInput] = useState('');

  // SYSTEM / RESORT DETAILS STATE
  const [systemForm, setSystemForm] = useState<ResortInfo>(resortInfo);

  // PAYMENT SETTINGS STATE
  const [paymentForm, setPaymentForm] = useState<PaymentSettings>(paymentSettings);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'admin123' || pinInput === 'admin' || pinInput.length > 0) {
      setIsAdminLoggedIn(true);
      showToast('Authenticated as Resort Administrator.', 'success');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="py-20 px-4 bg-[#1c2a20] text-[#ebe5de] flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#1c2a20] border border-[#606e60] flex items-center justify-center text-[#ad9e92] mx-auto shadow-xl">
            <Key className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-serif text-[#ebe5de]">Resort Owner Portal</h2>
            <p className="text-xs text-[#c3ccc0] mt-1">Enter your admin security PIN to access reservation and resort management controls.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (Default: admin123)"
                className="w-full px-4 py-3 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-center font-mono text-lg text-[#ad9e92] focus:outline-none focus:border-[#c3ccc0]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-bold text-xs tracking-wider uppercase cursor-pointer transition-colors shadow-lg"
            >
              Access Admin Dashboard
            </button>
          </form>

          <p className="text-[11px] text-[#c3ccc0]/70">
            For demonstration testing, click submit or type <code className="text-[#ad9e92] font-mono">admin123</code>.
          </p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalBookingsCount = bookings.length;
  const totalRevenueEstimated = bookings.reduce((acc, b) => acc + (b.status !== 'Cancelled' ? b.totalAmount : 0), 0);
  const pendingRequestsCount = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesQuery =
      b.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.mobile.includes(searchQuery);
    return matchesStatus && matchesQuery;
  });

  // HANDLERS FOR ROOM MANAGEMENT
  const handleSaveEditedRoom = () => {
    if (!editingRoom) return;
    updateRoom(editingRoom);
    setEditingRoom(null);
  };

  const handleCreateRoom = () => {
    if (!newRoomData.name || !newRoomData.pricePerNight) {
      alert('Please provide at least Name and Price.');
      return;
    }
    const created: Room = {
      id: `room-${Date.now()}`,
      name: newRoomData.name || 'New Accommodation',
      category: newRoomData.category || (selectedCategoryTab !== 'All' ? selectedCategoryTab : 'Rooms and Suites'),
      tagline: newRoomData.tagline || 'Comfortable retreat',
      shortDescription: newRoomData.shortDescription || 'Spacious resort accommodation.',
      fullDescription: newRoomData.fullDescription || 'Equipped with modern amenities and garden views.',
      maxGuests: newRoomData.maxGuests || 2,
      bedType: newRoomData.bedType || '1 Queen Bed',
      sizeSqM: newRoomData.sizeSqM || 30,
      pricePerNight: newRoomData.pricePerNight || 2500,
      featuredImage: newRoomData.featuredImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      galleryImages: newRoomData.galleryImages || [],
      amenities: newRoomData.amenities || ['Air Conditioning', 'Free Wi-Fi'],
      isAvailable: true,
      isComingSoon: newRoomData.isComingSoon ?? false,
      comingSoonNotice: newRoomData.comingSoonNotice || 'Coming Soon - Opening Soon!',
    };
    addRoom(created);
    setIsAddingRoom(false);
  };

  const handleQuickAddKubo = () => {
    const kuboCount = rooms.filter((r) => r.category === 'Filipino Kubos').length + 1;
    setNewRoomData({
      name: `Filipino Bahay Kubo #${kuboCount}`,
      category: 'Filipino Kubos',
      tagline: 'Authentic Filipino bamboo & nipa thatch cottage',
      shortDescription: 'Traditional handcrafted nipa hut with native bamboo seating, low dining table, and fresh natural breeze.',
      fullDescription: 'Unwind in an authentic Filipino Bahay Kubo crafted from natural bamboo, sawali walls, and nipa thatch leaves. Ideal for family gatherings, native dining feasts, and daytime relaxation.',
      maxGuests: 10,
      bedType: 'Native Bamboo Benches & Low Table',
      sizeSqM: 20,
      pricePerNight: 1500,
      featuredImage: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80'],
      amenities: ['Bamboo Seating', 'Nipa Thatch Roof', 'Electrical Outlets', 'Grilling Area Access', 'Fresh Breeze Ventilation'],
      isAvailable: true,
      isComingSoon: false,
      comingSoonNotice: 'Coming Soon - Opening Soon!',
    });
    setSelectedCategoryTab('Filipino Kubos');
    setIsAddingRoom(true);
  };

  const toggleRoomComingSoon = (roomId: string) => {
    const target = rooms.find((r) => r.id === roomId);
    if (target) {
      updateRoom({
        ...target,
        isComingSoon: !target.isComingSoon,
        comingSoonNotice: target.comingSoonNotice || 'Coming Soon - Reservations Opening Soon!',
      });
    }
  };

  const handleFileUploadRoomFeatured = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const url = uploadEvent.target.result as string;
          if (isEdit && editingRoom) {
            setEditingRoom({ ...editingRoom, featuredImage: url });
          } else {
            setNewRoomData((prev) => ({ ...prev, featuredImage: url }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUploadGallery = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const url = uploadEvent.target.result as string;
          if (isEdit && editingRoom) {
            setEditingRoom({
              ...editingRoom,
              galleryImages: [...editingRoom.galleryImages, url],
            });
          } else {
            setNewRoomData((prev) => ({
              ...prev,
              galleryImages: [...(prev.galleryImages || []), url],
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // HANDLERS FOR PACKAGE MANAGEMENT
  const handleSaveEditedPackage = () => {
    if (!editingPackage) return;
    updatePackage(editingPackage);
    setEditingPackage(null);
  };

  const handleCreatePackage = () => {
    if (!newPackageData.name || !newPackageData.price) {
      alert('Please provide Package Name and Price.');
      return;
    }
    const created: Package = {
      id: `pkg-${Date.now()}`,
      name: newPackageData.name || 'New Special Package',
      tagline: newPackageData.tagline || 'Memorable experience',
      price: newPackageData.price || 3500,
      duration: newPackageData.duration || '2 Days / 1 Night',
      inclusions: newPackageData.inclusions || ['Free Breakfast', 'Pool Pass'],
      validity: newPackageData.validity || 'Valid Year-round',
      featuredImage: newPackageData.featuredImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      recommendedGuests: newPackageData.recommendedGuests || '2-4 Persons',
      isPopular: newPackageData.isPopular || false,
    };
    addPackage(created);
    setIsAddingPackage(false);
  };

  const handleFileUploadPackageImg = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const url = uploadEvent.target.result as string;
          if (isEdit && editingPackage) {
            setEditingPackage({ ...editingPackage, featuredImage: url });
          } else {
            setNewPackageData((prev) => ({ ...prev, featuredImage: url }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // HANDLERS FOR SYSTEM DETAILS
  const handleSaveSystemDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateResortInfo(systemForm);
  };

  const handleFileUploadSystemAsset = (
    e: React.ChangeEvent<HTMLInputElement>,
    assetKey: keyof ResortDesignAssets
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const url = uploadEvent.target.result as string;
          const updated = {
            ...systemForm,
            designAssets: {
              ...(systemForm.designAssets || { heroBgImg: '', infinityPoolImg: '', villaPoolImg: '', deluxeRoomImg: '' }),
              [assetKey]: url,
            },
          };
          setSystemForm(updated);
          updateResortInfo(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const defaultOrder: SectionId[] = ['hero', 'about', 'rooms', 'packages', 'amenities', 'location'];
    const currentOrder = [...(systemForm.sectionOrder || defaultOrder)];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;
    const updated = { ...systemForm, sectionOrder: currentOrder };
    setSystemForm(updated);
    updateResortInfo(updated);
    showToast('Updated layout section order!', 'success');
  };

  const toggleSectionVisibility = (sectionId: SectionId) => {
    const disabled = [...(systemForm.disabledSections || [])];
    const exists = disabled.includes(sectionId);
    const updatedDisabled = exists
      ? disabled.filter((id) => id !== sectionId)
      : [...disabled, sectionId];
    const updated = { ...systemForm, disabledSections: updatedDisabled };
    setSystemForm(updated);
    updateResortInfo(updated);
    showToast(`${exists ? 'Enabled' : 'Disabled'} section on live website`, 'info');
  };

  const handleDropAsset = (e: React.DragEvent<HTMLDivElement>, assetKey: keyof ResortDesignAssets) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const url = uploadEvent.target.result as string;
          const updated = {
            ...systemForm,
            designAssets: {
              ...(systemForm.designAssets || { heroBgImg: '', infinityPoolImg: '', villaPoolImg: '', deluxeRoomImg: '' }),
              [assetKey]: url,
            },
          };
          setSystemForm(updated);
          updateResortInfo(updated);
          showToast(`Updated image asset!`, 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // HANDLERS FOR PAYMENT OPTIONS
  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentSettings(paymentForm);
  };

  const handleFileUploadPaymentQR = (e: React.ChangeEvent<HTMLInputElement>, channel: 'gcash' | 'bpi') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const url = uploadEvent.target.result as string;
          setPaymentForm((prev) => ({
            ...prev,
            [channel]: {
              ...prev[channel],
              qrCodeUrl: url,
            },
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="py-12 bg-[#1c2a20] text-[#ebe5de] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Dashboard Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#132016] border border-[#606e60] shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1c2a20] border border-[#606e60] flex items-center justify-center text-[#ad9e92] shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-[#ebe5de]">SLTT ESTANCIAS Admin Portal</h1>
              <p className="text-xs text-[#c3ccc0]">Comprehensive Owner Dashboard • Manage Rooms, Packages, System Details & Payments</p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="px-4 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#c3ccc0] hover:text-[#ebe5de] text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-[#ad9e92] transition-colors"
          >
            <LogOut className="w-4 h-4 text-[#ad9e92]" />
            <span>Lock Portal</span>
          </button>
        </div>

        {/* Analytics Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#132016] border border-[#606e60] shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-[#c3ccc0] font-semibold uppercase">
              <span>Total Bookings</span>
              <Calendar className="w-4 h-4 text-[#ad9e92]" />
            </div>
            <p className="text-3xl font-bold font-serif text-[#ebe5de]">{totalBookingsCount}</p>
            <p className="text-[11px] text-[#ad9e92] font-medium">{pendingRequestsCount} Pending Approval</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#132016] border border-[#606e60] shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-[#c3ccc0] font-semibold uppercase">
              <span>Estimated Revenue</span>
              <DollarSign className="w-4 h-4 text-[#ad9e92]" />
            </div>
            <p className="text-3xl font-bold font-serif text-[#ad9e92]">
              ₱{totalRevenueEstimated.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#c3ccc0]">Calculated from active stays</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#132016] border border-[#606e60] shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-[#c3ccc0] font-semibold uppercase">
              <span>Confirmed Stays</span>
              <CheckCircle2 className="w-4 h-4 text-[#ad9e92]" />
            </div>
            <p className="text-3xl font-bold font-serif text-[#ebe5de]">{confirmedCount}</p>
            <p className="text-[11px] text-[#c3ccc0]">Ready for guest arrival</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#132016] border border-[#606e60] shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-[#c3ccc0] font-semibold uppercase">
              <span>Active Rooms</span>
              <BedDouble className="w-4 h-4 text-[#ad9e92]" />
            </div>
            <p className="text-3xl font-bold font-serif text-[#ebe5de]">{rooms.length}</p>
            <p className="text-[11px] text-[#ad9e92] font-medium">100% Operational</p>
          </div>
        </div>

        {/* Navigation Tab Switcher */}
        <div className="flex border-b border-[#606e60]/40 overflow-x-auto gap-2 scrollbar-none pb-1">
          <button
            onClick={() => setAdminTab('bookings')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              adminTab === 'bookings'
                ? 'border-[#ad9e92] text-[#ad9e92]'
                : 'border-transparent text-[#c3ccc0] hover:text-[#ebe5de]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings & Receipts ({bookings.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('chat')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 relative ${
              adminTab === 'chat'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/30 rounded-t-xl'
                : 'border-transparent text-[#c3ccc0] hover:text-[#ebe5de]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Live Chat Inbox</span>
            {unreadChatCountOwner > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-[#132016] animate-pulse">
                {unreadChatCountOwner} NEW
              </span>
            ) : (
              <span className="text-[10px] text-[#ad9e92]">({chatThreads.length})</span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('rooms')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              adminTab === 'rooms'
                ? 'border-[#ad9e92] text-[#ad9e92]'
                : 'border-transparent text-[#c3ccc0] hover:text-[#ebe5de]'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Manage Rooms & Images ({rooms.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('packages')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              adminTab === 'packages'
                ? 'border-[#ad9e92] text-[#ad9e92]'
                : 'border-transparent text-[#c3ccc0] hover:text-[#ebe5de]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Resort Packages ({packages.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('builder')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              adminTab === 'builder'
                ? 'border-[#ad9e92] text-[#ad9e92] bg-[#ad9e92]/10 rounded-t-xl'
                : 'border-transparent text-[#c3ccc0] hover:text-[#ebe5de]'
            }`}
          >
            <Layout className="w-4 h-4 text-[#ad9e92]" />
            <span>Visual Builder & Drag-Drop Layout</span>
          </button>

          <button
            onClick={() => setAdminTab('system')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              adminTab === 'system'
                ? 'border-[#ad9e92] text-[#ad9e92]'
                : 'border-transparent text-[#c3ccc0] hover:text-[#ebe5de]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Overall System Details</span>
          </button>

          <button
            onClick={() => setAdminTab('payments')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              adminTab === 'payments'
                ? 'border-[#ad9e92] text-[#ad9e92]'
                : 'border-transparent text-[#c3ccc0] hover:text-[#ebe5de]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Payment Options & Banks</span>
          </button>

          <button
            onClick={() => {
              setNotifForm(notificationTemplates);
              setAdminTab('notifications');
            }}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              adminTab === 'notifications'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20 rounded-t-xl'
                : 'border-transparent text-[#c3ccc0] hover:text-[#ebe5de]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Email Notifications</span>
          </button>
        </div>

        {/* 1. BOOKINGS & RECEIPTS TAB */}
        {adminTab === 'bookings' && (
          <div className="bg-[#132016] border border-[#606e60] rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#c3ccc0]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reference, guest, mobile..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-[#c3ccc0]">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked In">Checked In</option>
                  <option value="Checked Out">Checked Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#c3ccc0]">
                <thead className="bg-[#0e1710] text-[#ad9e92] font-bold uppercase tracking-wider border-b border-[#606e60]/60">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Guest Details</th>
                    <th className="p-3">Room / Stay</th>
                    <th className="p-3">Total Due</th>
                    <th className="p-3">Payment & Channel</th>
                    <th className="p-3">Guest Receipt</th>
                    <th className="p-3">Booking Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#606e60]/40">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#1c2a20]/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#ad9e92]">{b.referenceNumber}</td>
                      <td className="p-3">
                        <span className="font-bold text-[#ebe5de] block">{b.guestName}</span>
                        <span className="text-[#c3ccc0] block">{b.mobile}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-[#ad9e92] block">{b.roomName}</span>
                        <span className="text-[#c3ccc0] block">{b.checkInDate} → {b.checkOutDate} ({b.numberOfNights}n)</span>
                      </td>
                      <td className="p-3 font-serif font-bold text-[#ad9e92] text-sm">
                        ₱{b.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="block text-[#ebe5de] font-bold">{b.paymentMethod}</span>
                        <span className="text-[10px] text-[#ad9e92] block">Channel: {b.selectedPaymentChannel || 'GCash'}</span>
                        <span className="text-[10px] text-green-400 font-bold block">{b.paymentStatus}</span>
                      </td>
                      <td className="p-3">
                        {b.paymentReceiptUrl ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingReceiptUrl(b.paymentReceiptUrl || null)}
                              className="relative group rounded-lg overflow-hidden border border-[#606e60] w-12 h-12 shrink-0 cursor-pointer"
                              title="Click to view full receipt"
                            >
                              <img src={b.paymentReceiptUrl} alt="Receipt" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </button>
                            <div className="text-[10px] space-y-0.5">
                              <span className="text-green-400 font-bold block">Receipt Attached</span>
                              {b.paymentReferenceCode && (
                                <span className="font-mono text-[#ebe5de] block">Ref: {b.paymentReferenceCode}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#c3ccc0]/60 italic">No receipt uploaded</span>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          value={b.status}
                          onChange={(e) => updateBookingStatus(b.id, e.target.value as BookingStatus)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0e1710] border border-[#606e60]/60 text-xs font-bold text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Checked In">Checked In</option>
                          <option value="Checked Out">Checked Out</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => downloadVoucher(b, resortInfo)}
                            className="p-1.5 rounded bg-[#132016] border border-[#606e60] text-[#c3ccc0] hover:text-[#ebe5de] cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            title="Download/Print official confirmation voucher for this guest"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-400" />
                            <span>Voucher</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedBookingForNotify(b);
                              setCustomEmailSub(formatNotificationMessage(notificationTemplates.emailSubject, b, resortInfo));
                              setCustomEmailBody(formatNotificationMessage(notificationTemplates.emailBody, b, resortInfo));
                            }}
                            className="p-1.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:text-white cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            title="Send or edit confirmation Email for this guest"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Notify</span>
                          </button>

                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="p-1.5 rounded bg-[#0e1710] border border-[#606e60] text-[#ad9e92] hover:text-[#ebe5de] cursor-pointer"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-[#c3ccc0]/60">
                        No bookings found matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 1.5. LIVE CHAT INBOX TAB (CUSTOMER TO OWNER) */}
        {adminTab === 'chat' && (
          <div className="bg-[#132016] border border-[#606e60] rounded-3xl p-6 shadow-2xl space-y-6">
            {/* Full Image Zoom Modal for Admin */}
            {adminZoomImage && (
              <div
                onClick={() => setAdminZoomImage(null)}
                className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
              >
                <div className="relative max-w-4xl max-h-[85vh]">
                  <button
                    onClick={() => setAdminZoomImage(null)}
                    className="absolute -top-12 right-0 text-white bg-black/70 p-2 rounded-full hover:bg-black"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <img
                    src={adminZoomImage}
                    alt="Zoomed Guest Attachment"
                    className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border-2 border-white/20 object-contain"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#606e60]/50 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <span>Customer Live Chat Inbox</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                    Real-Time Active
                  </span>
                </div>
                <p className="text-xs text-[#c3ccc0] mt-1">
                  Respond directly to guests in real-time. Guests can attach photos/payment receipts.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#c3ccc0]" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search guest name, phone, subject..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                />
              </div>
            </div>

            {/* Chat Inbox Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
              {/* Left Column: Chat Threads List */}
              <div className="lg:col-span-4 bg-[#0e1710] border border-[#606e60]/50 rounded-2xl p-3 flex flex-col space-y-2 max-h-[600px] overflow-y-auto">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#ad9e92] px-2 py-1 flex items-center justify-between">
                  <span>Conversations ({chatThreads.length})</span>
                  {unreadChatCountOwner > 0 && (
                    <span className="text-emerald-400 font-normal text-[10px]">
                      {unreadChatCountOwner} unread
                    </span>
                  )}
                </h3>

                {chatThreads
                  .filter((t) => {
                    if (!chatSearchQuery) return true;
                    const q = chatSearchQuery.toLowerCase();
                    return (
                      t.customerName.toLowerCase().includes(q) ||
                      (t.customerPhone && t.customerPhone.includes(q)) ||
                      (t.customerEmail && t.customerEmail.toLowerCase().includes(q)) ||
                      (t.subject && t.subject.toLowerCase().includes(q))
                    );
                  })
                  .map((t) => {
                    const isSelected = (selectedAdminThreadId || (chatThreads[0] && chatThreads[0].id)) === t.id;
                    const hasUnread = t.unreadCountOwner > 0;

                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedAdminThreadId(t.id);
                          markThreadReadByOwner(t.id);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                          isSelected
                            ? 'bg-[#1c2a20] border-emerald-500/80 shadow-lg'
                            : hasUnread
                            ? 'bg-[#1a2b1f] border-emerald-600/60'
                            : 'bg-[#132016]/80 border-[#606e60]/40 hover:border-[#606e60]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#2d4536] border border-[#606e60] flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
                          {t.customerName.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-[#ebe5de] truncate">{t.customerName}</h4>
                            <span className="text-[10px] text-[#ad9e92] shrink-0">
                              {new Date(t.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#c3ccc0] truncate mt-0.5 font-medium">
                            {t.subject || 'General Inquiry'}
                          </p>
                          <p className="text-[11px] text-[#ad9e92] truncate mt-0.5 italic">
                            "{t.lastMessage}"
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#606e60]/20 text-[10px]">
                            <span className="text-[#c3ccc0]/70">{t.customerPhone || t.customerEmail || 'No contact info'}</span>
                            {hasUnread && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-[#132016] font-bold text-[9px] animate-pulse">
                                {t.unreadCountOwner} NEW
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete conversation with ${t.customerName}?`)) {
                              deleteChatThread(t.id);
                            }
                          }}
                          className="absolute top-2 right-2 text-[#606e60] hover:text-red-400 p-1 rounded transition-colors"
                          title="Delete Chat Thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                {chatThreads.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#c3ccc0]/60 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-[#606e60]" />
                    <p>No active customer live chats yet.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Conversation Stream & Reply Control */}
              <div className="lg:col-span-8 bg-[#0e1710] border border-[#606e60]/50 rounded-2xl flex flex-col overflow-hidden">
                {(() => {
                  const activeThread = chatThreads.find(
                    (t) => t.id === (selectedAdminThreadId || (chatThreads[0] && chatThreads[0].id))
                  );

                  if (!activeThread) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#c3ccc0]">
                        <MessageSquare className="w-12 h-12 text-[#606e60] mb-3" />
                        <h4 className="font-bold text-sm">Select a Conversation</h4>
                        <p className="text-xs text-[#ad9e92] max-w-sm mt-1">
                          Click any guest thread on the left panel to read and reply in real time.
                        </p>
                      </div>
                    );
                  }

                  const handleSendOwnerReply = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!ownerReplyText.trim() && !ownerReplyImage) return;
                    sendChatMessage(
                      activeThread.id,
                      ownerReplyText.trim(),
                      'owner',
                      'Front Desk Admin',
                      ownerReplyImage || undefined
                    );
                    setOwnerReplyText('');
                    setOwnerReplyImage(null);
                    markThreadReadByOwner(activeThread.id);
                  };

                  const quickReplies = [
                    "Hello! Yes, the room is available for your dates. Would you like to proceed with reservation?",
                    "Good day! Day Tour pool access is open 8:00 AM - 5:00 PM daily.",
                    "Thank you! We have received your deposit receipt. Booking status updated to Confirmed.",
                    "Welcome to SLTT ESTANCIAS! Front desk is open 24/7 for check-in assistance."
                  ];

                  return (
                    <>
                      {/* Active Thread Header */}
                      <div className="bg-[#132016] p-4 border-b border-[#606e60]/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2d4536] border border-[#606e60] flex items-center justify-center text-amber-300 font-bold font-serif text-sm">
                            {activeThread.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-[#ebe5de] flex items-center gap-2">
                              <span>{activeThread.customerName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1c2a20] text-[#ad9e92] border border-[#606e60]/40 font-mono">
                                Thread #{activeThread.id}
                              </span>
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-[#c3ccc0] mt-0.5">
                              {activeThread.customerPhone && (
                                <span className="flex items-center gap-1">
                                  <PhoneCall className="w-3 h-3 text-emerald-400" />
                                  {activeThread.customerPhone}
                                </span>
                              )}
                              {activeThread.customerEmail && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-amber-400" />
                                  {activeThread.customerEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => markThreadReadByOwner(activeThread.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#1c2a20] border border-[#606e60] text-xs font-semibold text-[#c3ccc0] hover:text-[#ebe5de] cursor-pointer"
                            title="Mark Thread Read"
                          >
                            Mark Read
                          </button>
                        </div>
                      </div>

                      {/* Chat Messages Feed */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[400px] bg-[#0c140e]">
                        {activeThread.messages.map((msg) => {
                          const isOwner = msg.sender === 'owner';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'} space-y-1`}
                            >
                              <span className="text-[10px] text-[#ad9e92] px-1 font-medium">
                                {msg.senderName || (isOwner ? 'Front Desk Admin (You)' : activeThread.customerName)} •{' '}
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div
                                className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-md leading-relaxed ${
                                  isOwner
                                    ? 'bg-[#2d4536] border border-[#606e60] text-[#ebe5de] rounded-tr-none'
                                    : 'bg-[#1c2a20] border border-[#606e60]/60 text-[#ebe5de] rounded-tl-none'
                                }`}
                              >
                                {msg.imageUrl && (
                                  <div className="mb-2 relative group rounded-xl overflow-hidden border border-white/10">
                                    <img
                                      src={msg.imageUrl}
                                      alt="Attachment"
                                      className="w-full max-h-56 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                      onClick={() => setAdminZoomImage(msg.imageUrl || null)}
                                    />
                                    <button
                                      onClick={() => setAdminZoomImage(msg.imageUrl || null)}
                                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black text-[10px] flex items-center gap-1 shadow-md"
                                    >
                                      <Maximize2 className="w-3.5 h-3.5" />
                                      <span>Click to Enlarge</span>
                                    </button>
                                  </div>
                                )}
                                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Replies Bar */}
                      <div className="p-2.5 bg-[#132016] border-t border-[#606e60]/40 overflow-x-auto flex items-center gap-2 scrollbar-none">
                        <span className="text-[10px] font-bold text-[#ad9e92] uppercase shrink-0 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Quick Reply:
                        </span>
                        {quickReplies.map((qr, idx) => (
                          <button
                            key={idx}
                            onClick={() => setOwnerReplyText(qr)}
                            className="px-2.5 py-1 rounded-lg bg-[#0e1710] border border-[#606e60]/50 text-[11px] text-[#c3ccc0] hover:text-amber-300 hover:border-amber-400 shrink-0 cursor-pointer transition-colors"
                          >
                            {qr.length > 35 ? qr.substring(0, 35) + '...' : qr}
                          </button>
                        ))}
                      </div>

                      {/* Reply Input Form */}
                      <div className="p-3 bg-[#132016] border-t border-[#606e60]/50 space-y-2">
                        {ownerReplyImage && (
                          <div className="relative inline-block border border-[#606e60] rounded-xl overflow-hidden max-h-24">
                            <img src={ownerReplyImage} alt="Admin attachment preview" className="h-20 object-cover" />
                            <button
                              type="button"
                              onClick={() => setOwnerReplyImage(null)}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <form onSubmit={handleSendOwnerReply} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => adminFileInputRef.current?.click()}
                            className="p-2.5 rounded-xl bg-[#0e1710] border border-[#606e60] text-emerald-400 hover:text-emerald-300 cursor-pointer shrink-0 transition-colors"
                            title="Attach Photo or Document to Reply"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <input
                            type="file"
                            ref={adminFileInputRef}
                            onChange={handleAdminImageUpload}
                            accept="image/*"
                            className="hidden"
                          />

                          <input
                            type="text"
                            value={ownerReplyText}
                            onChange={(e) => setOwnerReplyText(e.target.value)}
                            placeholder={`Reply to ${activeThread.customerName} as Front Desk Admin...`}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60] text-xs text-[#ebe5de] focus:outline-none focus:border-emerald-400"
                          />
                          <button
                            type="submit"
                            disabled={!ownerReplyText.trim() && !ownerReplyImage}
                            className="px-5 py-2.5 rounded-xl bg-[#2d4536] hover:bg-[#3d5e4a] text-white font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                          >
                            <Send className="w-4 h-4" />
                            <span>Send Reply</span>
                          </button>
                        </form>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* 2. MANAGE ROOMS & PRICING DASHBOARD */}
        {adminTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#132016] border border-[#606e60] rounded-2xl p-4 shadow-xl">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#ebe5de]">Manage Accommodations & Cottages</h2>
                <p className="text-xs text-[#c3ccc0]">Update room, cottage & kubo details, prices, images, and coming soon notices</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                <button
                  onClick={handleQuickAddKubo}
                  className="px-3.5 py-2 rounded-xl bg-[#2d4536] hover:bg-[#3d5e4a] text-[#ebe5de] font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md transition-colors border border-[#606e60]"
                  title="Quick prefill for a new traditional bamboo & nipa kubo"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>+ Quick Add Filipino Kubo</span>
                </button>
                <button
                  onClick={() => setIsAddingRoom(true)}
                  className="px-4 py-2 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Accommodation</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs by Category */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-[#606e60]/40">
              {(['All', 'Rooms and Suites', 'Cottages', 'Filipino Kubos'] as const).map((cat) => {
                const count = cat === 'All' ? rooms.length : rooms.filter((r) => (r.category || 'Rooms and Suites') === cat).length;
                const isActive = selectedCategoryTab === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryTab(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#ad9e92] text-[#1c2a20] shadow-md font-extrabold'
                        : 'bg-[#132016] text-[#c3ccc0] hover:bg-[#1c2a20] border border-[#606e60]/60'
                    }`}
                  >
                    {cat === 'All' ? 'All Options' : cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Room List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms
                .filter((r) => selectedCategoryTab === 'All' || (r.category || 'Rooms and Suites') === selectedCategoryTab)
                .map((r) => (
                <div key={r.id} className="bg-[#132016] border border-[#606e60] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-xl overflow-hidden border border-[#606e60]/60">
                      <img src={r.featuredImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      
                      {/* Price Badge */}
                      <div className="absolute top-2 right-2 bg-[#132016]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-[#ad9e92] border border-[#606e60]">
                        ₱{r.pricePerNight.toLocaleString()} {r.category === 'Cottages' ? '/ day' : '/ night'}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-2 left-2 bg-[#2d4536]/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-[#ebe5de] border border-[#606e60]">
                        {r.category || 'Rooms and Suites'}
                      </div>

                      {/* Coming Soon Notice Badge */}
                      {r.isComingSoon && (
                        <div className="absolute bottom-2 left-2 right-2 bg-amber-600/90 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg text-center shadow-lg border border-amber-400 uppercase tracking-wider">
                          ✨ COMING SOON
                        </div>
                      )}

                      {!r.isComingSoon && (
                        <div className="absolute bottom-2 left-2 bg-[#132016]/80 px-2 py-0.5 rounded text-[10px] text-[#c3ccc0]">
                          {r.galleryImages.length} Gallery Photos
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold font-serif text-[#ebe5de]">{r.name}</h3>
                      <p className="text-xs text-[#ad9e92] italic">{r.tagline}</p>
                      <p className="text-xs text-[#c3ccc0] mt-1 line-clamp-2">{r.shortDescription}</p>
                      <p className="text-xs text-[#c3ccc0] mt-1">{r.bedType} • Max {r.maxGuests} guests</p>
                    </div>

                    {/* Controls: Availability & Coming Soon */}
                    <div className="space-y-2 pt-2 border-t border-[#606e60]/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#c3ccc0]">Availability:</span>
                        <button
                          onClick={() => toggleRoomAvailability(r.id)}
                          className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                            r.isAvailable ? 'bg-green-900/60 text-green-300 border border-green-700' : 'bg-red-900/60 text-red-300 border border-red-700'
                          }`}
                        >
                          {r.isAvailable ? 'Available' : 'Blocked'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#c3ccc0]">Status Notice:</span>
                        <button
                          onClick={() => toggleRoomComingSoon(r.id)}
                          className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-colors ${
                            r.isComingSoon ? 'bg-amber-900/80 text-amber-300 border border-amber-600' : 'bg-[#1c2a20] text-[#c3ccc0] border border-[#606e60]'
                          }`}
                        >
                          {r.isComingSoon ? 'Coming Soon' : 'Standard'}
                        </button>
                      </div>
                    </div>

                    {/* Price Quick Edit */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-[#c3ccc0]">Price (₱):</span>
                      <input
                        type="number"
                        defaultValue={r.pricePerNight}
                        onBlur={(e) => updateRoomPrice(r.id, parseFloat(e.target.value) || r.pricePerNight)}
                        className="w-28 px-2.5 py-1 rounded-lg bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ad9e92] font-bold"
                      />
                      <span className="text-[10px] text-[#c3ccc0]/70">Auto-saved</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-[#606e60]/40">
                    <button
                      onClick={() => setEditingRoom(r)}
                      className="flex-1 py-2 rounded-xl bg-[#1c2a20] hover:bg-[#25362a] border border-[#606e60] text-[#ebe5de] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#ad9e92]" />
                      <span>Edit & Details</span>
                    </button>
                    <button
                      onClick={() => deleteRoom(r.id)}
                      className="p-2 rounded-xl bg-[#1c2a20] hover:bg-red-900/40 border border-[#606e60] text-red-400 cursor-pointer"
                      title="Delete Option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. RESORT PACKAGES TAB */}
        {adminTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#132016] border border-[#606e60] rounded-2xl p-4 shadow-xl">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#ebe5de]">Manage Resort Packages</h2>
                <p className="text-xs text-[#c3ccc0]">Create, edit, or update special day tour & overnight stay packages</p>
              </div>

              <button
                onClick={() => setIsAddingPackage(true)}
                className="px-4 py-2 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Package</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-[#132016] border border-[#606e60] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="relative h-40 rounded-xl overflow-hidden border border-[#606e60]/60">
                      <img src={pkg.featuredImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 right-2 bg-[#132016]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-[#ad9e92] border border-[#606e60]">
                        ₱{pkg.price.toLocaleString()}
                      </div>
                      {pkg.isPopular && (
                        <div className="absolute top-2 left-2 bg-[#ad9e92] text-[#1c2a20] px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Popular Choice
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg font-serif text-[#ebe5de]">{pkg.name}</h3>
                      <p className="text-xs text-[#ad9e92] italic">{pkg.tagline}</p>
                      <p className="text-xs text-[#c3ccc0] mt-1">Duration: <strong className="text-[#ebe5de]">{pkg.duration}</strong> • Guests: {pkg.recommendedGuests}</p>
                    </div>

                    <div className="space-y-1 text-xs text-[#c3ccc0] bg-[#0e1710] p-3 rounded-xl border border-[#606e60]/40">
                      <span className="text-[10px] font-bold text-[#ad9e92] uppercase block">Inclusions:</span>
                      {pkg.inclusions.map((inc, i) => (
                        <div key={i} className="flex items-center gap-1 text-[11px]">
                          <Check className="w-3 h-3 text-[#ad9e92]" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-[#606e60]/40">
                    <button
                      onClick={() => setEditingPackage(pkg)}
                      className="flex-1 py-2 rounded-xl bg-[#1c2a20] hover:bg-[#25362a] border border-[#606e60] text-[#ebe5de] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#ad9e92]" />
                      <span>Edit Package</span>
                    </button>
                    <button
                      onClick={() => deletePackage(pkg.id)}
                      className="p-2 rounded-xl bg-[#1c2a20] hover:bg-red-900/40 border border-[#606e60] text-red-400 cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. VISUAL BUILDER & DRAG-DROP LAYOUT TAB */}
        {adminTab === 'builder' && (
          <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-[#132016] border border-[#606e60] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#606e60]/60 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ad9e92]/20 border border-[#ad9e92]/40 text-[#ad9e92] text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Visual Website Builder Engine</span>
                  </div>
                  <h2 className="text-2xl font-bold font-serif text-[#ebe5de]">Live Layout & Drag-Drop Content Customizer</h2>
                  <p className="text-xs text-[#c3ccc0] mt-1">
                    Reorder homepage sections, toggle visibility, edit exact website text, and drag-and-drop new high-res background images in real-time.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateResortInfo(systemForm);
                      showToast('Website design & layout saved successfully!', 'success');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Publish Changes to Live Site</span>
                  </button>
                </div>
              </div>

              {/* 1. SECTION ORDER & VISIBILITY CONTROL */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Homepage Layout Section Order & Display Toggle
                  </h3>
                  <span className="text-xs text-[#c3ccc0] font-mono">Use ▲ / ▼ buttons to move sections</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(systemForm.sectionOrder || ['hero', 'about', 'rooms', 'packages', 'amenities', 'location']).map((secId, index, arr) => {
                    const isDisabled = (systemForm.disabledSections || []).includes(secId);
                    return (
                      <div
                        key={secId}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          isDisabled
                            ? 'bg-[#0e1710]/50 border-[#606e60]/30 opacity-60'
                            : 'bg-[#1c2a20] border-[#606e60] shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ad9e92]">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#ebe5de] block">
                              {SECTION_NAMES[secId] || secId}
                            </span>
                            <span className="text-[11px] text-[#c3ccc0]">
                              Status: {isDisabled ? 'Hidden from website' : 'Visible on homepage'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveSection(index, 'up')}
                            disabled={index === 0}
                            className={`p-2 rounded-xl border border-[#606e60]/60 text-xs font-bold flex items-center gap-1 ${
                              index === 0
                                ? 'opacity-30 cursor-not-allowed text-[#c3ccc0]'
                                : 'bg-[#0e1710] hover:bg-[#25362a] text-[#ebe5de] cursor-pointer'
                            }`}
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4 text-[#ad9e92]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => moveSection(index, 'down')}
                            disabled={index === arr.length - 1}
                            className={`p-2 rounded-xl border border-[#606e60]/60 text-xs font-bold flex items-center gap-1 ${
                              index === arr.length - 1
                                ? 'opacity-30 cursor-not-allowed text-[#c3ccc0]'
                                : 'bg-[#0e1710] hover:bg-[#25362a] text-[#ebe5de] cursor-pointer'
                            }`}
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4 text-[#ad9e92]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSectionVisibility(secId)}
                            className={`px-3 py-2 rounded-xl border border-[#606e60]/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                              isDisabled
                                ? 'bg-red-950/40 text-red-300 border-red-800/50'
                                : 'bg-[#25362a] text-[#ebe5de]'
                            }`}
                          >
                            {isDisabled ? (
                              <>
                                <EyeOff className="w-4 h-4 text-red-400" />
                                <span>Hidden</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 text-[#ad9e92]" />
                                <span>Visible</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. DRAG & DROP IMAGE ASSET UPLOADER DROPZONES */}
              <div className="space-y-4 pt-6 border-t border-[#606e60]/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Drag & Drop Website Image Assets
                  </h3>
                  <span className="text-xs text-[#c3ccc0]">Drag image files directly onto any box below</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Hero Image Dropzone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropAsset(e, 'heroBgImg')}
                    className="p-4 rounded-2xl bg-[#0e1710] border-2 border-dashed border-[#606e60] hover:border-[#ad9e92] space-y-3 transition-colors group text-center"
                  >
                    <span className="text-xs font-bold text-[#ebe5de] block">Main Hero Background</span>
                    <div className="relative h-32 rounded-xl overflow-hidden border border-[#606e60]">
                      <img src={systemForm.designAssets?.heroBgImg} alt="Hero Bg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                        Drop image to replace
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#c3ccc0] block mb-1">Click or drag image file</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUploadSystemAsset(e, 'heroBgImg')}
                        className="w-full text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Infinity Pool Showcase Dropzone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropAsset(e, 'infinityPoolImg')}
                    className="p-4 rounded-2xl bg-[#0e1710] border-2 border-dashed border-[#606e60] hover:border-[#ad9e92] space-y-3 transition-colors group text-center"
                  >
                    <span className="text-xs font-bold text-[#ebe5de] block">Infinity Pool Showcase</span>
                    <div className="relative h-32 rounded-xl overflow-hidden border border-[#606e60]">
                      <img src={systemForm.designAssets?.infinityPoolImg} alt="Infinity Pool" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                        Drop image to replace
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#c3ccc0] block mb-1">Click or drag image file</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUploadSystemAsset(e, 'infinityPoolImg')}
                        className="w-full text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* About Feature Banner Dropzone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropAsset(e, 'aboutSectionImg')}
                    className="p-4 rounded-2xl bg-[#0e1710] border-2 border-dashed border-[#606e60] hover:border-[#ad9e92] space-y-3 transition-colors group text-center"
                  >
                    <span className="text-xs font-bold text-[#ebe5de] block">About Sanctuary Image</span>
                    <div className="relative h-32 rounded-xl overflow-hidden border border-[#606e60]">
                      <img src={systemForm.designAssets?.aboutSectionImg || systemForm.designAssets?.villaPoolImg} alt="About Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                        Drop image to replace
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#c3ccc0] block mb-1">Click or drag image file</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUploadSystemAsset(e, 'aboutSectionImg')}
                        className="w-full text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. COMPLETE TEXT & COPYWRITING INLINE EDITING */}
              <div className="space-y-6 pt-6 border-t border-[#606e60]/60">
                <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Website Text & Copywriting Editor
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Hero Copy */}
                  <div className="p-5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-3">
                    <h4 className="text-xs font-bold text-[#ad9e92] uppercase tracking-wider">Homepage Hero Text</h4>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Hero Main Title Headline</label>
                      <input
                        type="text"
                        value={systemForm.heroTitle || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, heroTitle: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="e.g. Escape to SLTT ESTANCIAS RESORT"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Hero Subtitle Paragraph</label>
                      <input
                        type="text"
                        value={systemForm.heroSubtitle || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, heroSubtitle: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="e.g. Your Private Tropical Sanctuary in Tigbao, Lugait"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Main CTA Button Label</label>
                      <input
                        type="text"
                        value={systemForm.heroCtaText || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, heroCtaText: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="e.g. Reserve Your Villa"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                  </div>

                  {/* Botanical About Copy */}
                  <div className="p-5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-3">
                    <h4 className="text-xs font-bold text-[#ad9e92] uppercase tracking-wider">Botanical About Narrative</h4>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">About Section Heading</label>
                      <input
                        type="text"
                        value={systemForm.aboutHeading || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, aboutHeading: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="e.g. A Peaceful Botanical Sanctuary in Tigbao"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Main Story Text</label>
                      <textarea
                        rows={2}
                        value={systemForm.aboutStoryText || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, aboutStoryText: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="Write story narrative..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Secondary Story Paragraph</label>
                      <input
                        type="text"
                        value={systemForm.aboutSecondaryText || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, aboutSecondaryText: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="e.g. Designed for families and couples..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                  </div>

                  {/* Amenities Copy */}
                  <div className="p-5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-3">
                    <h4 className="text-xs font-bold text-[#ad9e92] uppercase tracking-wider">Facilities & Amenities Header</h4>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Section Title</label>
                      <input
                        type="text"
                        value={systemForm.amenitiesHeading || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, amenitiesHeading: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="e.g. World-Class Tropical Resort Facilities"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Section Subtitle</label>
                      <input
                        type="text"
                        value={systemForm.amenitiesSubtitle || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, amenitiesSubtitle: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="e.g. Designed for utmost relaxation and leisure"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                  </div>

                  {/* Location Copy */}
                  <div className="p-5 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-3">
                    <h4 className="text-xs font-bold text-[#ad9e92] uppercase tracking-wider">Location & Map Directions Guide</h4>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Location Title</label>
                      <input
                        type="text"
                        value={systemForm.locationHeading || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, locationHeading: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="e.g. Sanctuary Location & Directions"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Location Guide Text</label>
                      <textarea
                        rows={2}
                        value={systemForm.locationGuideText || ''}
                        onChange={(e) => {
                          const updated = { ...systemForm, locationGuideText: e.target.value };
                          setSystemForm(updated);
                          updateResortInfo(updated);
                        }}
                        placeholder="e.g. Conveniently accessible along National Highway..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#1c2a20] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#ad9e92]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. OVERALL SYSTEM DETAILS & DESIGN IMAGES TAB */}
        {adminTab === 'system' && (
          <form onSubmit={handleSaveSystemDetails} className="bg-[#132016] border border-[#606e60] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
            <div className="flex items-center justify-between border-b border-[#606e60]/60 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#ebe5de]">Overall System Portal & Design Assets</h2>
                <p className="text-xs text-[#c3ccc0]">Update resort information, address, hotline numbers, and primary design hero images</p>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save All System Details</span>
              </button>
            </div>

            {/* General Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Resort Information & Contacts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Resort Brand Name</label>
                  <input
                    type="text"
                    value={systemForm.name}
                    onChange={(e) => setSystemForm({ ...systemForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Tagline Slogan</label>
                  <input
                    type="text"
                    value={systemForm.tagline}
                    onChange={(e) => setSystemForm({ ...systemForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Contact Phone Number / Hotline</label>
                  <input
                    type="text"
                    value={systemForm.contactNumber}
                    onChange={(e) => setSystemForm({ ...systemForm, contactNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Inquiry Email Address</label>
                  <input
                    type="email"
                    value={systemForm.email}
                    onChange={(e) => setSystemForm({ ...systemForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Facebook Page Name</label>
                  <input
                    type="text"
                    value={systemForm.facebookPage}
                    onChange={(e) => setSystemForm({ ...systemForm, facebookPage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Location City / Area</label>
                  <input
                    type="text"
                    value={systemForm.location}
                    onChange={(e) => setSystemForm({ ...systemForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-[#c3ccc0] block mb-1">Full Physical Address</label>
                  <input
                    type="text"
                    value={systemForm.address}
                    onChange={(e) => setSystemForm({ ...systemForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Business Hours</label>
                  <input
                    type="text"
                    value={systemForm.businessHours}
                    onChange={(e) => setSystemForm({ ...systemForm, businessHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Check-In / Check-Out Times</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Check-in e.g. 2:00 PM"
                      value={systemForm.checkInTime}
                      onChange={(e) => setSystemForm({ ...systemForm, checkInTime: e.target.value })}
                      className="w-1/2 px-3 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Check-out e.g. 12:00 PM"
                      value={systemForm.checkOutTime}
                      onChange={(e) => setSystemForm({ ...systemForm, checkOutTime: e.target.value })}
                      className="w-1/2 px-3 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Homepage Copy & Narrative Section */}
            <div className="space-y-4 pt-6 border-t border-[#606e60]/60">
              <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Custom Website Headings & Story Copy
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Homepage Hero Title</label>
                  <input
                    type="text"
                    value={systemForm.heroTitle || ''}
                    onChange={(e) => setSystemForm({ ...systemForm, heroTitle: e.target.value })}
                    placeholder="e.g. Your Natural Sanctuary"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Homepage Hero Subtitle</label>
                  <input
                    type="text"
                    value={systemForm.heroSubtitle || ''}
                    onChange={(e) => setSystemForm({ ...systemForm, heroSubtitle: e.target.value })}
                    placeholder="e.g. Relax, recharge, and connect..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">About Section Heading</label>
                  <input
                    type="text"
                    value={systemForm.aboutHeading || ''}
                    onChange={(e) => setSystemForm({ ...systemForm, aboutHeading: e.target.value })}
                    placeholder="e.g. A Peaceful Botanical Sanctuary in Tigbao, Lugait"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">Location Directions Guide</label>
                  <input
                    type="text"
                    value={systemForm.locationGuideText || ''}
                    onChange={(e) => setSystemForm({ ...systemForm, locationGuideText: e.target.value })}
                    placeholder="e.g. Accessible along National Highway..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-[#c3ccc0] block mb-1">About Story Narrative Text</label>
                  <textarea
                    rows={3}
                    value={systemForm.aboutStoryText || ''}
                    onChange={(e) => setSystemForm({ ...systemForm, aboutStoryText: e.target.value })}
                    placeholder="Write your resort narrative..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none focus:border-[#c3ccc0]"
                  />
                </div>
              </div>
            </div>

            {/* Design Images Section */}
            <div className="space-y-4 pt-6 border-t border-[#606e60]/60">
              <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Resort Design Assets & Background Images
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hero Banner Image */}
                <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-3">
                  <span className="text-xs font-bold text-[#ebe5de] block">1. Main Homepage Hero Background</span>
                  <div className="relative h-28 rounded-xl overflow-hidden border border-[#606e60]">
                    <img src={systemForm.designAssets?.heroBgImg} alt="Hero Bg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#c3ccc0] block mb-1">Upload Hero Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadSystemAsset(e, 'heroBgImg')}
                      className="w-full text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Infinity Pool Image */}
                <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-3">
                  <span className="text-xs font-bold text-[#ebe5de] block">2. Infinity Pool Showcase</span>
                  <div className="relative h-28 rounded-xl overflow-hidden border border-[#606e60]">
                    <img src={systemForm.designAssets?.infinityPoolImg} alt="Infinity Pool" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#c3ccc0] block mb-1">Upload Pool Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadSystemAsset(e, 'infinityPoolImg')}
                      className="w-full text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                    />
                  </div>
                </div>

                {/* About Section Image */}
                <div className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 space-y-3">
                  <span className="text-xs font-bold text-[#ebe5de] block">3. About Sanctuary Feature Banner</span>
                  <div className="relative h-28 rounded-xl overflow-hidden border border-[#606e60]">
                    <img src={systemForm.designAssets?.aboutSectionImg || systemForm.designAssets?.villaPoolImg} alt="About Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#c3ccc0] block mb-1">Upload About Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadSystemAsset(e, 'aboutSectionImg')}
                      className="w-full text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#606e60]/60">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save All System Details</span>
              </button>
            </div>
          </form>
        )}

        {/* 5. PAYMENT OPTIONS & BANK DETAILS TAB */}
        {adminTab === 'payments' && (
          <form onSubmit={handleSavePaymentSettings} className="bg-[#132016] border border-[#606e60] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
            <div className="flex items-center justify-between border-b border-[#606e60]/60 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#ebe5de]">Payment Options & Bank Details</h2>
                <p className="text-xs text-[#c3ccc0]">Configure Partial Deposit (50%), Full Online Payment, and Admin GCash & BPI Bank Details</p>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Payment Settings</span>
              </button>
            </div>

            {/* Allowed Payment Modes Toggles */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Allowed Guest Payment Modes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.allowPartialDeposit}
                    onChange={(e) => setPaymentForm({ ...paymentForm, allowPartialDeposit: e.target.checked })}
                    className="w-4 h-4 accent-[#ad9e92] rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#ebe5de] block">Partial Deposit ({paymentForm.partialDepositPercentage}%)</span>
                    <span className="text-[10px] text-[#c3ccc0]">Allow guests to pay 50% online deposit</span>
                  </div>
                </label>

                <label className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.allowFullPayment}
                    onChange={(e) => setPaymentForm({ ...paymentForm, allowFullPayment: e.target.checked })}
                    className="w-4 h-4 accent-[#ad9e92] rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#ebe5de] block">Full Online Payment</span>
                    <span className="text-[10px] text-[#c3ccc0]">Allow guests to pay 100% full amount</span>
                  </div>
                </label>

                <label className="p-4 rounded-2xl bg-[#0e1710] border border-[#606e60]/60 flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.allowPayAtResort}
                    onChange={(e) => setPaymentForm({ ...paymentForm, allowPayAtResort: e.target.checked })}
                    className="w-4 h-4 accent-[#ad9e92] rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#ebe5de] block">Pay at Resort</span>
                    <span className="text-[10px] text-[#c3ccc0]">Pay balance upon check-in at front desk</span>
                  </div>
                </label>
              </div>
            </div>

            {/* GCASH CONFIGURATION */}
            <div className="space-y-4 pt-6 border-t border-[#606e60]/60">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  GCash Account & QR Details
                </h3>

                <label className="flex items-center gap-2 text-xs text-[#c3ccc0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.gcash.enabled}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        gcash: { ...paymentForm.gcash, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-[#ad9e92] rounded"
                  />
                  <span>Enable GCash Channel</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0e1710] p-5 rounded-2xl border border-[#606e60]/60">
                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">GCash Account Name</label>
                  <input
                    type="text"
                    value={paymentForm.gcash.accountName}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        gcash: { ...paymentForm.gcash, accountName: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#132016] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">GCash Mobile Number</label>
                  <input
                    type="text"
                    value={paymentForm.gcash.accountNumber}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        gcash: { ...paymentForm.gcash, accountNumber: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#132016] border border-[#606e60]/60 text-xs text-[#ebe5de] font-mono focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-[#c3ccc0] block mb-1">Payment Instructions for Guests</label>
                  <input
                    type="text"
                    value={paymentForm.gcash.instructions}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        gcash: { ...paymentForm.gcash, instructions: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#132016] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs text-[#c3ccc0] block">Upload GCash QR Code Image</label>
                  <div className="flex items-center gap-4">
                    {paymentForm.gcash.qrCodeUrl && (
                      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-[#606e60] bg-white p-1">
                        <img src={paymentForm.gcash.qrCodeUrl} alt="GCash QR" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadPaymentQR(e, 'gcash')}
                      className="text-xs text-[#c3ccc0] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BPI CONFIGURATION */}
            <div className="space-y-4 pt-6 border-t border-[#606e60]/60">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#ad9e92] uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  BPI Bank Account Details
                </h3>

                <label className="flex items-center gap-2 text-xs text-[#c3ccc0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.bpi.enabled}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        bpi: { ...paymentForm.bpi, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-[#ad9e92] rounded"
                  />
                  <span>Enable BPI Channel</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0e1710] p-5 rounded-2xl border border-[#606e60]/60">
                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">BPI Account Name</label>
                  <input
                    type="text"
                    value={paymentForm.bpi.accountName}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        bpi: { ...paymentForm.bpi, accountName: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#132016] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#c3ccc0] block mb-1">BPI Account Number</label>
                  <input
                    type="text"
                    value={paymentForm.bpi.accountNumber}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        bpi: { ...paymentForm.bpi, accountNumber: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#132016] border border-[#606e60]/60 text-xs text-[#ebe5de] font-mono focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-[#c3ccc0] block mb-1">Bank Instructions</label>
                  <input
                    type="text"
                    value={paymentForm.bpi.instructions}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        bpi: { ...paymentForm.bpi, instructions: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#132016] border border-[#606e60]/60 text-xs text-[#ebe5de] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs text-[#c3ccc0] block">Upload BPI QR Code Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    {paymentForm.bpi.qrCodeUrl && (
                      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-[#606e60] bg-white p-1">
                        <img src={paymentForm.bpi.qrCodeUrl} alt="BPI QR" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadPaymentQR(e, 'bpi')}
                      className="text-xs text-[#c3ccc0] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#606e60]/60">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Payment Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* 7. EMAIL & SMS NOTIFICATION TEMPLATES TAB */}
        {adminTab === 'notifications' && (
          <div className="space-y-6">
            {/* Header & Global Toggles */}
            <div className="bg-[#132016] border border-[#606e60] rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#606e60]/60 pb-5">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#ebe5de] flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    Automated Confirmation Message Templates
                  </h2>
                  <p className="text-xs text-[#c3ccc0] mt-0.5">
                    Customize the email messages sent automatically to clients when their booking is confirmed or submitted.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-xl text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Supports Dynamic Placeholders & Custom Formats</span>
                </div>
              </div>

              {/* Automation Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  notifForm.autoSendOnConfirm ? 'bg-[#1c2a20] border-amber-500/80 text-[#ebe5de]' : 'bg-[#0e1710] border-[#606e60]/60 text-[#c3ccc0]'
                }`}>
                  <input
                    type="checkbox"
                    checked={notifForm.autoSendOnConfirm}
                    onChange={(e) => setNotifForm({ ...notifForm, autoSendOnConfirm: e.target.checked })}
                    className="w-5 h-5 mt-0.5 accent-amber-500 rounded cursor-pointer shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#ebe5de] block">Auto-Send on Booking Confirmation</span>
                    <p className="text-[11px] text-[#c3ccc0] leading-relaxed mt-0.5">
                      Automatically dispatch Email notifications as soon as staff marks a booking status as <strong className="text-amber-300">"Confirmed"</strong>.
                    </p>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  notifForm.autoSendOnBookingCreated ? 'bg-[#1c2a20] border-amber-500/80 text-[#ebe5de]' : 'bg-[#0e1710] border-[#606e60]/60 text-[#c3ccc0]'
                }`}>
                  <input
                    type="checkbox"
                    checked={notifForm.autoSendOnBookingCreated}
                    onChange={(e) => setNotifForm({ ...notifForm, autoSendOnBookingCreated: e.target.checked })}
                    className="w-5 h-5 mt-0.5 accent-amber-500 rounded cursor-pointer shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#ebe5de] block">Auto-Send Initial Submission Receipt</span>
                    <p className="text-[11px] text-[#c3ccc0] leading-relaxed mt-0.5">
                      Automatically dispatch instant Email acknowledgement as soon as a guest submits a new reservation online.
                    </p>
                  </div>
                </label>
              </div>

              {/* Dynamic Tag Selector */}
              <div className="space-y-2 bg-[#0e1710] p-4 rounded-2xl border border-[#606e60]/60">
                <label className="text-xs font-bold text-[#ad9e92] uppercase tracking-wider block">
                  Available Dynamic Tags (Click to Copy or Insert)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: '{guest_name}', label: 'Guest Name' },
                    { tag: '{booking_reference}', label: 'Booking Ref No.' },
                    { tag: '{resort_name}', label: 'Resort Name' },
                    { tag: '{room_name}', label: 'Accommodation' },
                    { tag: '{check_in}', label: 'Check-In' },
                    { tag: '{check_out}', label: 'Check-Out' },
                    { tag: '{number_of_nights}', label: 'Nights' },
                    { tag: '{adults_count}', label: 'Adults' },
                    { tag: '{children_count}', label: 'Children' },
                    { tag: '{total_price}', label: 'Total Amount' },
                    { tag: '{payment_status}', label: 'Payment Status' },
                    { tag: '{payment_method}', label: 'Payment Method' },
                    { tag: '{add_ons_list}', label: 'Add-Ons List' },
                    { tag: '{resort_contact}', label: 'Resort Phone' },
                    { tag: '{resort_email}', label: 'Resort Email' },
                    { tag: '{resort_address}', label: 'Resort Address' },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.tag);
                        setCopiedTag(item.tag);
                        showToast(`Copied placeholder tag ${item.tag} to clipboard!`, 'info');
                        setTimeout(() => setCopiedTag(null), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#1c2a20] border border-[#606e60] hover:border-amber-400 text-[11px] font-mono text-amber-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                      title={`Click to copy ${item.label}`}
                    >
                      <span>{item.tag}</span>
                      {copiedTag === item.tag ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-60" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid & Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Left Column: Template Editors */}
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-[#ebe5de] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span>Email Subject Line Template</span>
                    </label>
                    <input
                      type="text"
                      value={notifForm.emailSubject}
                      onChange={(e) => setNotifForm({ ...notifForm, emailSubject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60] text-xs font-mono text-[#ebe5de] focus:outline-none focus:border-amber-400"
                      placeholder="e.g. Booking Confirmed - {resort_name} (Ref: {booking_reference})"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#ebe5de] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span>Email Body Content Template</span>
                    </label>
                    <textarea
                      rows={12}
                      value={notifForm.emailBody}
                      onChange={(e) => setNotifForm({ ...notifForm, emailBody: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[#0e1710] border border-[#606e60] text-xs font-mono text-[#ebe5de] leading-relaxed focus:outline-none focus:border-amber-400"
                    />
                  </div>


                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#606e60]/60">
                    <button
                      type="button"
                      onClick={() => {
                        const defaultTemplates = {
                          emailSubject: "Booking Confirmed - {resort_name} (Ref: {booking_reference})",
                          emailBody: `Dear {guest_name},\n\nMadiyaw Karadajaw! 🌿\n\nWe are delighted to inform you that your booking with {resort_name} is officially CONFIRMED! Below are your reservation details:\n\n========================================\nRESERVATION SUMMARY\n========================================\n• Reference No: {booking_reference}\n• Guest Name: {guest_name}\n• Accommodation: {room_name}\n• Check-In Date: {check_in} (2:00 PM)\n• Check-Out Date: {check_out} (12:00 PM)\n• Duration: {number_of_nights} Night(s)\n• Total Guests: {adults_count} Adult(s), {children_count} Child(ren)\n• Total Amount: ₱{total_price}\n• Payment Status: {payment_status}\n========================================\n\n{add_ons_list}\n\nResort Address: {resort_address}\nContact Hotline: {resort_contact} | Email: {resort_email}\n\nWe look forward to welcoming you soon!\n\nWarm regards,\n{resort_name} Reservations Team`,
                          autoSendOnConfirm: true,
                          autoSendOnBookingCreated: true,
                        };
                        setNotifForm(defaultTemplates);
                        showToast('Reset notification templates to default.', 'info');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60] text-[#c3ccc0] hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Default</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateNotificationTemplates(notifForm)}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-xl transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Templates</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Real-Time Live Rendered Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#0e1710] p-3 rounded-2xl border border-[#606e60]/60">
                    <span className="text-xs font-bold text-[#ebe5de] uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-amber-400" />
                      Live Rendered Sample Preview
                    </span>
                    <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                      Sample Data Mode
                    </span>
                  </div>

                  {/* Rendered Email Preview Box */}
                  <div className="bg-[#0b120d] border border-[#606e60]/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#606e60]/40 text-xs">
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span className="text-[#c3ccc0] font-semibold">Subject:</span>
                      <span className="text-[#ebe5de] font-mono text-[11px] truncate">
                        {bookings.length > 0
                          ? formatNotificationMessage(notifForm.emailSubject, bookings[0], resortInfo)
                          : formatNotificationMessage(
                              notifForm.emailSubject,
                              {
                                id: 'bkg-demo',
                                referenceNumber: 'SLTT-2026-99881',
                                createdAt: new Date().toISOString(),
                                guestName: 'Maria Santos',
                                email: 'maria.santos@example.com',
                                mobile: '09171234567',
                                roomId: 'room-deluxe',
                                roomName: 'Deluxe Room',
                                roomPricePerNight: 2500,
                                checkInDate: '2026-08-15',
                                checkOutDate: '2026-08-17',
                                numberOfNights: 2,
                                adultsCount: 2,
                                childrenCount: 1,
                                selectedAddOns: [{ id: '1', name: 'Extra Breakfast Platter', price: 350, total: 700 }],
                                paymentMethod: 'Partial Deposit (50%)',
                                paymentStatus: 'Deposit Paid',
                                subtotal: 5000,
                                addOnsTotal: 700,
                                taxAmount: 684,
                                totalAmount: 6384,
                                depositAmount: 3192,
                                status: 'Confirmed',
                              },
                              resortInfo
                            )}
                      </span>
                    </div>

                    <div className="bg-[#132016] border border-[#606e60]/40 p-4 rounded-xl text-xs font-mono text-[#ebe5de] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto scrollbar-thin">
                      {bookings.length > 0
                        ? formatNotificationMessage(notifForm.emailBody, bookings[0], resortInfo)
                        : formatNotificationMessage(
                            notifForm.emailBody,
                            {
                              id: 'bkg-demo',
                              referenceNumber: 'SLTT-2026-99881',
                              createdAt: new Date().toISOString(),
                              guestName: 'Maria Santos',
                              email: 'maria.santos@example.com',
                              mobile: '09171234567',
                              roomId: 'room-deluxe',
                              roomName: 'Deluxe Room',
                              roomPricePerNight: 2500,
                              checkInDate: '2026-08-15',
                              checkOutDate: '2026-08-17',
                              numberOfNights: 2,
                              adultsCount: 2,
                              childrenCount: 1,
                              selectedAddOns: [{ id: '1', name: 'Extra Breakfast Platter', price: 350, total: 700 }],
                              paymentMethod: 'Partial Deposit (50%)',
                              paymentStatus: 'Deposit Paid',
                              subtotal: 5000,
                              addOnsTotal: 700,
                              taxAmount: 684,
                              totalAmount: 6384,
                              depositAmount: 3192,
                              status: 'Confirmed',
                            },
                            resortInfo
                          )}
                    </div>
                  </div>


                </div>
              </div>
            </div>

            {/* Dispatched Notifications Log Table */}
            <div className="bg-[#132016] border border-[#606e60] rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-serif text-[#ebe5de] flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Dispatched Email Notification Audit Log ({notificationLogs.length})
                  </h3>
                  <p className="text-xs text-[#c3ccc0] mt-0.5">
                    Real-time history of all confirmation messages sent to clients automatically or manually by staff.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#606e60]/60 text-[11px] font-bold text-[#ad9e92] uppercase tracking-wider">
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Booking Ref</th>
                      <th className="p-3">Recipient & Contact</th>
                      <th className="p-3">Trigger Event</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">View Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#606e60]/40 text-xs">
                    {notificationLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#1c2a20]/60 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-[#c3ccc0]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold font-mono text-amber-300">
                          {log.bookingRef}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-[#ebe5de] block">{log.recipientEmail || 'N/A'}</span>
                          <span className="text-[10px] text-[#c3ccc0] font-mono">{log.recipientMobile || 'N/A'}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0e1710] border border-[#606e60] text-[#c3ccc0]">
                            {log.triggerEvent}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 border border-amber-800/60 text-amber-300">
                            {log.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-950/60 border border-green-800/60 text-green-400 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            <span>{log.status}</span>
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingNotificationLog(log)}
                            className="p-1.5 rounded-lg bg-[#0e1710] border border-[#606e60] text-[#c3ccc0] hover:text-white cursor-pointer"
                            title="View sent message content"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {notificationLogs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-[#c3ccc0]/60">
                          No dispatched notification logs recorded yet. Send a test or confirm a booking to view history.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDIT ROOM */}
        {editingRoom && (
          <div className="fixed inset-0 z-50 bg-[#132016]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl text-[#ebe5de] relative space-y-6">
              <div className="flex items-center justify-between border-b border-[#606e60]/60 pb-3">
                <h3 className="text-xl font-bold font-serif text-[#ebe5de]">Edit Room: {editingRoom.name}</h3>
                <button onClick={() => setEditingRoom(null)} className="text-[#c3ccc0] hover:text-[#ebe5de]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[#c3ccc0] block mb-1">Accommodation Category</label>
                  <select
                    value={editingRoom.category || 'Rooms and Suites'}
                    onChange={(e) => setEditingRoom({ ...editingRoom, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  >
                    <option value="Rooms and Suites">Rooms and Suites</option>
                    <option value="Cottages">Cottages</option>
                    <option value="Filipino Kubos">Filipino Kubos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Name</label>
                  <input
                    type="text"
                    value={editingRoom.name}
                    onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingRoom.tagline}
                    onChange={(e) => setEditingRoom({ ...editingRoom, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Price (₱)</label>
                  <input
                    type="number"
                    value={editingRoom.pricePerNight}
                    onChange={(e) => setEditingRoom({ ...editingRoom, pricePerNight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ad9e92] font-bold"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Max Guests</label>
                  <input
                    type="number"
                    value={editingRoom.maxGuests}
                    onChange={(e) => setEditingRoom({ ...editingRoom, maxGuests: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Bed / Seating Type</label>
                  <input
                    type="text"
                    value={editingRoom.bedType}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bedType: e.target.value })}
                    placeholder="e.g. 1 Queen Bed / Picnic Benches"
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#c3ccc0] block mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={editingRoom.shortDescription}
                    onChange={(e) => setEditingRoom({ ...editingRoom, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                {/* Coming Soon Settings */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-[#606e60]/40">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editIsComingSoon"
                      checked={!!editingRoom.isComingSoon}
                      onChange={(e) => setEditingRoom({ ...editingRoom, isComingSoon: e.target.checked })}
                      className="w-4 h-4 accent-[#ad9e92] rounded cursor-pointer"
                    />
                    <label htmlFor="editIsComingSoon" className="text-xs font-bold text-[#ebe5de] cursor-pointer">
                      Mark as "Coming Soon"
                    </label>
                  </div>
                  {editingRoom.isComingSoon && (
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Coming Soon Notice Text</label>
                      <input
                        type="text"
                        value={editingRoom.comingSoonNotice || ''}
                        onChange={(e) => setEditingRoom({ ...editingRoom, comingSoonNotice: e.target.value })}
                        placeholder="e.g. Coming Soon - Opening Next Season!"
                        className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                      />
                    </div>
                  )}
                </div>

                {/* Featured Image upload */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-[#606e60]/40">
                  <label className="text-xs font-bold text-[#ad9e92] block">Featured Cover Image</label>
                  <div className="flex items-center gap-4">
                    <img src={editingRoom.featuredImage} alt="" className="w-20 h-16 rounded-lg object-cover border border-[#606e60]" referrerPolicy="no-referrer" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadRoomFeatured(e, true)}
                      className="text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Gallery Images upload and delete */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-[#606e60]/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#ad9e92] block">Room Image Gallery ({editingRoom.galleryImages.length} photos)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadGallery(e, true)}
                      className="text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {editingRoom.galleryImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#606e60] h-20">
                        <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingRoom({
                              ...editingRoom,
                              galleryImages: editingRoom.galleryImages.filter((_, i) => i !== idx),
                            })
                          }
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#606e60]/60">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 rounded-xl bg-[#0e1710] border border-[#606e60] text-[#c3ccc0] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedRoom}
                  className="px-6 py-2 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-bold text-xs uppercase flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Room Details</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD ROOM */}
        {isAddingRoom && (
          <div className="fixed inset-0 z-50 bg-[#132016]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl text-[#ebe5de] relative space-y-6">
              <div className="flex items-center justify-between border-b border-[#606e60]/60 pb-3">
                <h3 className="text-xl font-bold font-serif text-[#ebe5de]">Add New Accommodation / Cottage</h3>
                <button onClick={() => setIsAddingRoom(false)} className="text-[#c3ccc0] hover:text-[#ebe5de]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[#c3ccc0] block mb-1">Accommodation Category *</label>
                  <select
                    value={newRoomData.category || (selectedCategoryTab !== 'All' ? selectedCategoryTab : 'Rooms and Suites')}
                    onChange={(e) => setNewRoomData({ ...newRoomData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  >
                    <option value="Rooms and Suites">Rooms and Suites</option>
                    <option value="Cottages">Cottages</option>
                    <option value="Filipino Kubos">Filipino Kubos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Name *</label>
                  <input
                    type="text"
                    value={newRoomData.name}
                    onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                    placeholder="e.g. Executive Cottage / Garden Villa"
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={newRoomData.tagline}
                    onChange={(e) => setNewRoomData({ ...newRoomData, tagline: e.target.value })}
                    placeholder="e.g. Outdoor shade & poolside relaxation"
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Price (₱) *</label>
                  <input
                    type="number"
                    value={newRoomData.pricePerNight}
                    onChange={(e) => setNewRoomData({ ...newRoomData, pricePerNight: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ad9e92] font-bold"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Max Capacity / Guests</label>
                  <input
                    type="number"
                    value={newRoomData.maxGuests}
                    onChange={(e) => setNewRoomData({ ...newRoomData, maxGuests: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Bed / Seating Setup</label>
                  <input
                    type="text"
                    value={newRoomData.bedType || '1 Queen Bed'}
                    onChange={(e) => setNewRoomData({ ...newRoomData, bedType: e.target.value })}
                    placeholder="e.g. Picnic Table & Benches"
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#c3ccc0] block mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={newRoomData.shortDescription}
                    onChange={(e) => setNewRoomData({ ...newRoomData, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                {/* Coming Soon Settings */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-[#606e60]/40">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="addIsComingSoon"
                      checked={!!newRoomData.isComingSoon}
                      onChange={(e) => setNewRoomData({ ...newRoomData, isComingSoon: e.target.checked })}
                      className="w-4 h-4 accent-[#ad9e92] rounded cursor-pointer"
                    />
                    <label htmlFor="addIsComingSoon" className="text-xs font-bold text-[#ebe5de] cursor-pointer">
                      Mark as "Coming Soon" Notice
                    </label>
                  </div>
                  {newRoomData.isComingSoon && (
                    <div>
                      <label className="text-xs text-[#c3ccc0] block mb-1">Coming Soon Notice Text</label>
                      <input
                        type="text"
                        value={newRoomData.comingSoonNotice || ''}
                        onChange={(e) => setNewRoomData({ ...newRoomData, comingSoonNotice: e.target.value })}
                        placeholder="e.g. Coming Soon - Opening Next Season!"
                        className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-[#606e60]/40">
                  <label className="text-xs font-bold text-[#ad9e92] block">Upload Cover Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUploadRoomFeatured(e, false)}
                    className="text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#606e60]/60">
                <button
                  type="button"
                  onClick={() => setIsAddingRoom(false)}
                  className="px-4 py-2 rounded-xl bg-[#0e1710] border border-[#606e60] text-[#c3ccc0] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="px-6 py-2 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-bold text-xs uppercase flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Accommodation</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDIT PACKAGE */}
        {editingPackage && (
          <div className="fixed inset-0 z-50 bg-[#132016]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-lg w-full my-8 p-6 sm:p-8 shadow-2xl text-[#ebe5de] relative space-y-6">
              <div className="flex items-center justify-between border-b border-[#606e60]/60 pb-3">
                <h3 className="text-xl font-bold font-serif text-[#ebe5de]">Edit Package: {editingPackage.name}</h3>
                <button onClick={() => setEditingPackage(null)} className="text-[#c3ccc0] hover:text-[#ebe5de]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[#c3ccc0] block mb-1">Package Name</label>
                  <input
                    type="text"
                    value={editingPackage.name}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingPackage.tagline}
                    onChange={(e) => setEditingPackage({ ...editingPackage, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#c3ccc0] block mb-1">Package Price (₱)</label>
                    <input
                      type="number"
                      value={editingPackage.price}
                      onChange={(e) => setEditingPackage({ ...editingPackage, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ad9e92] font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[#c3ccc0] block mb-1">Duration</label>
                    <input
                      type="text"
                      value={editingPackage.duration}
                      onChange={(e) => setEditingPackage({ ...editingPackage, duration: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Upload Package Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUploadPackageImg(e, true)}
                    className="w-full text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                  />
                </div>

                {/* Package Inclusions Management */}
                <div className="border-t border-[#606e60]/40 pt-3">
                  <label className="text-[#ebe5de] block mb-1.5 font-bold">
                    Package Inclusions ({editingPackage.inclusions?.length || 0})
                  </label>
                  <p className="text-[11px] text-[#c3ccc0] mb-2">Edit existing inclusions or add new ones for this package:</p>
                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                    {(editingPackage.inclusions || []).map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={inc}
                          onChange={(e) => {
                            const updated = [...(editingPackage.inclusions || [])];
                            updated[idx] = e.target.value;
                            setEditingPackage({ ...editingPackage, inclusions: updated });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de] text-xs focus:border-[#ad9e92] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingPackage.inclusions || []).filter((_, i) => i !== idx);
                            setEditingPackage({ ...editingPackage, inclusions: updated });
                          }}
                          className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900/80 transition-colors border border-red-800/40"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Free Welcome Drinks or Aircon Cottage Pass"
                      value={newInclusionInput}
                      onChange={(e) => setNewInclusionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newInclusionInput.trim()) {
                            setEditingPackage({
                              ...editingPackage,
                              inclusions: [...(editingPackage.inclusions || []), newInclusionInput.trim()],
                            });
                            setNewInclusionInput('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de] text-xs placeholder:text-[#606e60]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newInclusionInput.trim()) {
                          setEditingPackage({
                            ...editingPackage,
                            inclusions: [...(editingPackage.inclusions || []), newInclusionInput.trim()],
                          });
                          setNewInclusionInput('');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2d4536] hover:bg-[#3d5e4a] text-[#ebe5de] text-xs font-bold flex items-center gap-1 cursor-pointer border border-[#606e60]"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#606e60]/60">
                <button
                  type="button"
                  onClick={() => setEditingPackage(null)}
                  className="px-4 py-2 rounded-xl bg-[#0e1710] border border-[#606e60] text-[#c3ccc0] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedPackage}
                  className="px-6 py-2 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-bold text-xs uppercase flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Package</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD PACKAGE */}
        {isAddingPackage && (
          <div className="fixed inset-0 z-50 bg-[#132016]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#132016] border border-[#606e60] rounded-3xl max-w-lg w-full my-8 p-6 sm:p-8 shadow-2xl text-[#ebe5de] relative space-y-6">
              <div className="flex items-center justify-between border-b border-[#606e60]/60 pb-3">
                <h3 className="text-xl font-bold font-serif text-[#ebe5de]">Add New Resort Package</h3>
                <button onClick={() => setIsAddingPackage(false)} className="text-[#c3ccc0] hover:text-[#ebe5de]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[#c3ccc0] block mb-1">Package Name *</label>
                  <input
                    type="text"
                    value={newPackageData.name}
                    onChange={(e) => setNewPackageData({ ...newPackageData, name: e.target.value })}
                    placeholder="e.g. Tropical Day Getaway"
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={newPackageData.tagline}
                    onChange={(e) => setNewPackageData({ ...newPackageData, tagline: e.target.value })}
                    placeholder="e.g. All-day pool pass & set lunch"
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#c3ccc0] block mb-1">Price (₱) *</label>
                    <input
                      type="number"
                      value={newPackageData.price}
                      onChange={(e) => setNewPackageData({ ...newPackageData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ad9e92] font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[#c3ccc0] block mb-1">Duration</label>
                    <input
                      type="text"
                      value={newPackageData.duration}
                      onChange={(e) => setNewPackageData({ ...newPackageData, duration: e.target.value })}
                      placeholder="e.g. Full Day Pass"
                      className="w-full px-3 py-2 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#c3ccc0] block mb-1">Upload Package Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUploadPackageImg(e, false)}
                    className="w-full text-xs text-[#c3ccc0] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ad9e92] file:text-[#1c2a20] cursor-pointer"
                  />
                </div>

                {/* Package Inclusions Management (New Package) */}
                <div className="border-t border-[#606e60]/40 pt-3">
                  <label className="text-[#ebe5de] block mb-1.5 font-bold">
                    Package Inclusions ({newPackageData.inclusions?.length || 0})
                  </label>
                  <p className="text-[11px] text-[#c3ccc0] mb-2">Inclusions included with this new package:</p>
                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                    {(newPackageData.inclusions || []).map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={inc}
                          onChange={(e) => {
                            const updated = [...(newPackageData.inclusions || [])];
                            updated[idx] = e.target.value;
                            setNewPackageData({ ...newPackageData, inclusions: updated });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de] text-xs focus:border-[#ad9e92] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (newPackageData.inclusions || []).filter((_, i) => i !== idx);
                            setNewPackageData({ ...newPackageData, inclusions: updated });
                          }}
                          className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900/80 transition-colors border border-red-800/40"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Free Breakfast for 2"
                      value={newPkgInclusionInput}
                      onChange={(e) => setNewPkgInclusionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newPkgInclusionInput.trim()) {
                            setNewPackageData({
                              ...newPackageData,
                              inclusions: [...(newPackageData.inclusions || []), newPkgInclusionInput.trim()],
                            });
                            setNewPkgInclusionInput('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#0e1710] border border-[#606e60]/60 text-[#ebe5de] text-xs placeholder:text-[#606e60]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPkgInclusionInput.trim()) {
                          setNewPackageData({
                            ...newPackageData,
                            inclusions: [...(newPackageData.inclusions || []), newPkgInclusionInput.trim()],
                          });
                          setNewPkgInclusionInput('');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2d4536] hover:bg-[#3d5e4a] text-[#ebe5de] text-xs font-bold flex items-center gap-1 cursor-pointer border border-[#606e60]"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#606e60]/60">
                <button
                  type="button"
                  onClick={() => setIsAddingPackage(false)}
                  className="px-4 py-2 rounded-xl bg-[#0e1710] border border-[#606e60] text-[#c3ccc0] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreatePackage}
                  className="px-6 py-2 rounded-xl bg-[#ad9e92] hover:bg-[#c3ccc0] text-[#1c2a20] font-bold text-xs uppercase flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Package</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: LIGHTBOX RECEIPT VIEW */}
        {viewingReceiptUrl && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-xl w-full bg-[#132016] border border-[#606e60] rounded-3xl p-6 text-center space-y-4">
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="absolute top-4 right-4 text-white hover:text-[#ad9e92]"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-lg font-bold font-serif text-[#ebe5de]">Guest Payment Receipt Proof</h3>
              <div className="max-h-[70vh] overflow-auto rounded-xl border border-[#606e60] bg-black p-2">
                <img src={viewingReceiptUrl} alt="Receipt proof" className="w-full h-auto object-contain mx-auto" referrerPolicy="no-referrer" />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setViewingReceiptUrl(null)}
                  className="px-6 py-2 rounded-xl bg-[#ad9e92] text-[#1c2a20] font-bold text-xs uppercase"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DIRECT NOTIFY & MESSAGE CUSTOMIZER FOR SPECIFIC BOOKING */}
        {selectedBookingForNotify && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative max-w-2xl w-full bg-[#132016] border border-[#606e60] rounded-3xl p-6 space-y-5 my-8">
              <button
                onClick={() => setSelectedBookingForNotify(null)}
                className="absolute top-5 right-5 text-[#c3ccc0] hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 border-b border-[#606e60]/60 pb-4">
                <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-800/60 text-amber-300">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#ebe5de]">
                    Send / Edit Notification Message
                  </h3>
                  <p className="text-xs text-[#c3ccc0]">
                    Customize the message sent to <strong className="text-amber-300">{selectedBookingForNotify.guestName}</strong> for Ref #{selectedBookingForNotify.referenceNumber}.
                  </p>
                </div>
              </div>

              {/* Guest Target Summary Banner */}
              <div className="bg-[#0e1710] p-4 rounded-2xl border border-[#606e60]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#ad9e92] uppercase block">Guest Name</span>
                  <span className="font-bold text-[#ebe5de] truncate block">{selectedBookingForNotify.guestName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#ad9e92] uppercase block">Email Address</span>
                  <span className="font-bold text-[#ebe5de] truncate block">{selectedBookingForNotify.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#ad9e92] uppercase block">Mobile Hotline</span>
                  <span className="font-bold text-[#ebe5de] font-mono truncate block">{selectedBookingForNotify.mobile}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#ad9e92] uppercase block">Booking Status</span>
                  <span className="font-bold text-amber-300 truncate block">{selectedBookingForNotify.status}</span>
                </div>
              </div>

              {/* Editable Email Fields */}
              <div className="space-y-4">
                <div className="space-y-3 bg-[#0e1710] p-4 rounded-2xl border border-[#606e60]/60">
                  <div>
                    <label className="text-xs font-bold text-[#ebe5de] block mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Email Subject</span>
                    </label>
                    <input
                      type="text"
                      value={customEmailSub}
                      onChange={(e) => setCustomEmailSub(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#132016] border border-[#606e60] text-xs font-mono text-[#ebe5de] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#ebe5de] block mb-1">
                      Email Body Content
                    </label>
                    <textarea
                      rows={8}
                      value={customEmailBody}
                      onChange={(e) => setCustomEmailBody(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#132016] border border-[#606e60] text-xs font-mono text-[#ebe5de] leading-relaxed focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#606e60]/60">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForNotify(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#0e1710] border border-[#606e60] text-[#c3ccc0] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sendNotification(selectedBookingForNotify, 'Email', 'Manual Dispatch', {
                      emailSubject: customEmailSub,
                      emailBody: customEmailBody,
                    });
                    setSelectedBookingForNotify(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Email Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW DISPATCHED NOTIFICATION LOG DETAIL */}
        {viewingNotificationLog && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-xl w-full bg-[#132016] border border-[#606e60] rounded-3xl p-6 space-y-4">
              <button
                onClick={() => setViewingNotificationLog(null)}
                className="absolute top-5 right-5 text-[#c3ccc0] hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 border-b border-[#606e60]/60 pb-3">
                <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                <div>
                  <h3 className="text-base font-bold font-serif text-[#ebe5de]">Dispatched Notification Record</h3>
                  <p className="text-xs text-[#c3ccc0]">
                    Ref #{viewingNotificationLog.bookingRef} • Sent on {new Date(viewingNotificationLog.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-[#0e1710] p-3 rounded-xl border border-[#606e60]/60">
                  <div>
                    <span className="text-[10px] text-[#ad9e92] uppercase block">Recipient Email</span>
                    <span className="font-semibold text-[#ebe5de] block">{viewingNotificationLog.recipientEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#ad9e92] uppercase block">Recipient Mobile</span>
                    <span className="font-semibold text-[#ebe5de] font-mono block">{viewingNotificationLog.recipientMobile || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#ad9e92] uppercase block mb-1">Dispatched Message Content</span>
                  <div className="bg-[#0e1710] border border-[#606e60] p-4 rounded-xl text-xs font-mono text-[#ebe5de] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {viewingNotificationLog.body}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewingNotificationLog(null)}
                  className="px-6 py-2 rounded-xl bg-[#ad9e92] text-[#1c2a20] font-bold text-xs uppercase"
                >
                  Close Log
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
