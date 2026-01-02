
import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Star, Instagram, User, History } from 'lucide-react';
import { Button, LevelBadge } from './ui';
import { Proposal } from '../types';
import { InstaPortfolio } from './InstaPortfolio';
import { MOCK_PRO, MOCK_REVIEWS } from '../constants';
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

interface ProProfileModalProps {
  proposal: Proposal;
  onClose: () => void;
  onViewPortfolio: () => void;
  onHire?: (p: Proposal) => void;
  hideHireAction?: boolean;
}

export const ProProfileModal: React.FC<ProProfileModalProps> = ({ 
  proposal, 
  onClose, 
  onViewPortfolio, 
  onHire,
  hideHireAction = false 
}) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-[70]"
      >
        {/* Header Image/Pattern */}
        <div className="h-32 bg-gradient-to-r from-emerald-400 to-teal-500 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-8 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="relative">
              <img 
                src={proposal.proAvatar} 
                className="w-32 h-32 rounded-[2rem] border-4 border-white dark:border-slate-900 object-cover shadow-xl" 
                alt={proposal.proName}
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
                <ShieldCheck size={20} fill="currentColor" className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-black mt-4 text-slate-900 dark:text-white">{proposal.proName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <LevelBadge level={proposal.proLevel} />
              <span className="text-amber-500 font-bold flex items-center gap-1">
                <Star size={16} fill="currentColor" /> {proposal.proRating}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
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
              <span className="text-lg font-black text-amber-500">4.9</span>
            </div>
          </div>

          {/* INSTAGRAM PORTFOLIO ENTRY POINT */}
          <button 
            onClick={onViewPortfolio}
            className="w-full mb-8 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1px] group-hover:scale-110 transition-transform">
               <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[7px] flex items-center justify-center">
                  <Instagram size={14} className="text-slate-700 dark:text-slate-300 group-hover:text-pink-500" />
               </div>
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
              {t.viewInstaBtn}
            </span>
          </button>

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

        {!hideHireAction && onHire && (
          <div className="p-6 border-t dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
            <Button 
              className="w-full h-14 text-lg font-black rounded-2xl"
              onClick={() => {
                onHire(proposal);
                onClose();
              }}
            >
              {t.hireNow} - € {proposal.price}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
