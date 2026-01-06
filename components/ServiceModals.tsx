
import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Star, Instagram, User, History, MapPin, Globe, CreditCard, ExternalLink, Languages, CheckCircle2, Clock, Heart, Ban, Unlock } from 'lucide-react';
import { Button, LevelBadge, Card } from './ui';
import { Proposal, User as UserType } from '../types';
import { InstaPortfolio } from './InstaPortfolio';
import { MOCK_PRO, MOCK_REVIEWS, MOCK_CLIENT } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface PortfolioOverlayProps {
  proposal: Proposal;
  onClose: () => void;
}

export const PortfolioOverlay: React.FC<PortfolioOverlayProps> = ({ proposal, onClose }) => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-[90]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
              <img src={proposal.proAvatar} className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{proposal.proName}</h3>
              <p className="text-xs text-slate-500 font-medium">{t.instaPortfolio}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <InstaPortfolio />
        </div>
      </motion.div>
    </div>
  );
};

interface UserProfileModalProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    role: 'CLIENT' | 'PRO';
    // Optional Pro fields
    level?: string;
    rating?: number;
    // Optional Client fields
    address?: string;
    languages?: string[];
    // Business Hours
    openingTime?: string;
    closingTime?: string;
  };
  onClose: () => void;
  // Pro Actions
  onViewPortfolio?: () => void;
  onHire?: () => void;
  hideHireAction?: boolean;
  // Interaction Actions
  onToggleFavorite?: (id: string) => void;
  onToggleBlock?: (id: string) => void;
  isFavorited?: boolean;
  isBlocked?: boolean;
}

// --- SUB-COMPONENTS FOR CLEAN ARCHITECTURE ---

const ClientProfileView: React.FC<{ user: UserProfileModalProps['user'] }> = ({ user }) => {
  const { t } = useLanguage();
  
  // Mock Data for Client Specifics (Since Proposal object doesn't carry full client profile)
  const clientData = {
    requestsMade: 12,
    paymentRate: '100%',
    languages: user.languages || MOCK_CLIENT.languages,
    address: user.address || `${MOCK_CLIENT.addresses[0]?.street} ${MOCK_CLIENT.addresses[0]?.number}, ${MOCK_CLIENT.addresses[0]?.locality}`,
    rating: 5.0
  };

  return (
    <div className="px-6 pb-8 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center mt-6 mb-6">
        <div className="relative">
          <img 
            src={user.avatar} 
            className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-xl" 
            alt={user.name}
          />
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
            <User size={20} fill="currentColor" className="text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-black mt-4 text-slate-900 dark:text-white">{user.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {t.clientRole}
          </span>
          <span className="text-emerald-500 font-bold flex items-center gap-1 text-xs">
            <CheckCircle2 size={14} /> {t.reliableClient}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
        <div className="text-center border-r border-slate-200 dark:border-slate-700">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.requestsMade}</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{clientData.requestsMade}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.paymentRate}</span>
          <span className="text-lg font-black text-emerald-500">{clientData.paymentRate}</span>
        </div>
      </div>

      {/* Logistics Section - CRITICAL FOR PROS */}
      <div className="space-y-6">
        
        {/* Languages */}
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
            <Languages size={16} /> {t.speaks}
          </h4>
          <div className="flex flex-wrap gap-2">
            {clientData.languages.map(lang => (
              <span key={lang} className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                {lang === 'EN' ? '🇬🇧' : lang === 'FR' ? '🇫🇷' : lang === 'LB' ? '🇱🇺' : lang === 'PT' ? '🇵🇹' : '🇩🇪'} {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50">
           <h4 className="font-black text-sm uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-3">
             <MapPin size={16} /> {t.serviceLocation}
           </h4>
           <p className="text-slate-700 dark:text-slate-300 font-medium mb-4 leading-relaxed">
             {clientData.address}
           </p>
           <div className="flex gap-2">
             <a 
               href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clientData.address)}`} 
               target="_blank" 
               rel="noreferrer"
               className="flex-1"
             >
                <Button size="sm" variant="secondary" className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-none shadow-sm hover:bg-slate-100">
                   <ExternalLink size={14} className="mr-2" /> {t.openMaps}
                </Button>
             </a>
           </div>
        </div>

      </div>
    </div>
  );
};

const ProviderProfileView: React.FC<{ 
  user: UserProfileModalProps['user'];
  onViewPortfolio?: () => void; 
}> = ({ user, onViewPortfolio }) => {
  const { t } = useLanguage();
  
  // Ensure we have languages to display (fallback to MOCK_PRO if prop is empty)
  const proLanguages = user.languages && user.languages.length > 0 ? user.languages : MOCK_PRO.languages;

  // Use props if available, otherwise fallback to mock for demo consistency
  const openingTime = user.openingTime || '08:00';
  const closingTime = user.closingTime || '18:00';

  // Construct website URL
  const websiteUrl = `https://servicebid.lu/${user.name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="px-6 pb-8 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center mt-6 mb-6">
        <div className="relative">
          <img 
            src={user.avatar} 
            className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-xl" 
            alt={user.name}
          />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
            <ShieldCheck size={20} fill="currentColor" className="text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-black mt-4 text-slate-900 dark:text-white text-center">{user.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <LevelBadge level={user.level || 'Professional'} />
          <span className="text-amber-500 font-bold flex items-center gap-1">
            <Star size={16} fill="currentColor" /> {user.rating}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
        <div className="text-center border-r border-slate-200 dark:border-slate-700">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.jobs}</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">128</span>
        </div>
        <div className="text-center border-r border-slate-200 dark:border-slate-700">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.xp}</span>
          <span className="text-lg font-black text-emerald-500">4.5k</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.rating}</span>
          <span className="text-lg font-black text-amber-500">{user.rating}</span>
        </div>
      </div>

      {/* NEW: UNIFIED SOCIAL & WEB SECTION */}
      <div className="mb-6">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
           <Globe size={16} /> {t.onlinePresence}
        </h4>
        <div className="grid grid-cols-2 gap-3">
             {/* Website Button */}
            <a 
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
            >
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Globe size={24} />
                </div>
                <div className="text-center">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">Website</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-center">
                         servicebid.lu <ExternalLink size={10} />
                    </span>
                </div>
            </a>

            {/* Instagram/Portfolio Button */}
            <button 
              onClick={onViewPortfolio}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-md transition-all group"
            >
                <div className="p-0.5 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:scale-110 transition-transform">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-[10px]">
                        <Instagram size={20} className="text-slate-900 dark:text-white" />
                    </div>
                </div>
                <div className="text-center">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">Portfolio</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-center">
                         Instagram <ExternalLink size={10} />
                    </span>
                </div>
            </button>
        </div>
      </div>

      {/* Business Hours - WHATSAPP STYLE ADDITION */}
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
            <Clock size={16} /> {t.businessHours}
          </h4>
          <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500">Mon - Fri</span>
              <span className="text-slate-900 dark:text-white font-bold">{openingTime} - {closingTime}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium mt-1">
              <span className="text-slate-500">Sat - Sun</span>
              <span className="text-slate-400 italic">Closed</span>
          </div>
      </div>

      {/* Languages Section */}
      <div className="mb-6">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
          <Languages size={16} /> {t.speaks}
        </h4>
        <div className="flex flex-wrap gap-2">
          {proLanguages.map(lang => (
            <span key={lang} className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
              {lang === 'EN' ? '🇬🇧' : lang === 'FR' ? '🇫🇷' : lang === 'LB' ? '🇱🇺' : lang === 'PT' ? '🇵🇹' : '🇩🇪'} {lang}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <User size={16} /> {t.bio}
        </h4>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
          {MOCK_PRO.bio}
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <History size={16} /> {t.serviceTimeline}
        </h4>
        <div className="space-y-3">
          {MOCK_REVIEWS.map((review, i) => (
            <div key={review.id} className="flex gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                {i < MOCK_REVIEWS.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{review.service}</h5>
                  <span className="text-[10px] font-black text-slate-400">{review.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-emerald-500 font-bold">€ {review.price}</span>
                  <span>•</span>
                  <div className="flex items-center text-amber-500 font-bold">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={10} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT (Refactored to Drawer) ---

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  user, 
  onClose, 
  onViewPortfolio, 
  onHire,
  hideHireAction = false,
  onToggleFavorite,
  onToggleBlock,
  isFavorited = false,
  isBlocked = false
}) => {
  const { t } = useLanguage();
  const isClient = user.role === 'CLIENT';

  return (
    <div className="fixed inset-0 z-[60] flex justify-end overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      {/* DRAWER CONTAINER */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl h-full flex flex-col z-[70] border-l border-slate-200 dark:border-slate-800"
      >
        {/* Drawer Header */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 shrink-0">
            <button 
                onClick={onClose}
                className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
                <X size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.contactInfo}</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
            {isClient ? (
                <ClientProfileView user={user} />
            ) : (
                <ProviderProfileView user={user} onViewPortfolio={onViewPortfolio} />
            )}

            {/* ACTION BUTTONS (BLOCK & FAVORITE) */}
            {!isClient && (
                <div className="px-6 pb-8 space-y-4">
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
                    
                    {/* Favorite Button */}
                    <button 
                        onClick={() => onToggleFavorite && onToggleFavorite(user.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                    >
                        <Heart size={20} className={isFavorited ? "text-red-500 fill-current" : "text-slate-400 group-hover:text-red-500"} />
                        <span className={`text-sm font-bold ${isFavorited ? "text-red-500" : "text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                            {isFavorited ? t.removeFromFavorites : t.addToFavorites}
                        </span>
                    </button>

                    {/* Block Button */}
                    <button 
                        onClick={() => onToggleBlock && onToggleBlock(user.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
                    >
                        {isBlocked ? (
                            <Unlock size={20} className="text-slate-500 group-hover:text-slate-700" />
                        ) : (
                            <Ban size={20} className="text-red-500 group-hover:text-red-600" />
                        )}
                        <span className={`text-sm font-bold ${isBlocked ? "text-slate-500" : "text-red-500 group-hover:text-red-600"}`}>
                            {isBlocked ? t.unblockContact : t.blockContact}
                        </span>
                    </button>
                </div>
            )}
        </div>

        {/* Hire Button (Fixed at Bottom if applicable) */}
        {!isClient && !hideHireAction && onHire && !isBlocked && (
          <div className="p-6 border-t dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
            <Button 
              className="w-full h-14 text-lg font-black rounded-2xl"
              onClick={() => {
                onHire();
                onClose();
              }}
            >
              {t.hireNow}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Re-export as ProProfileModal for backwards compatibility if needed
export const ProProfileModal = UserProfileModal;
