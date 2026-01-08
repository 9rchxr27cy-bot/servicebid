
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Camera, X, CheckCircle2, Calendar, Home, Plus, Euro, Pencil, Clock, FileText, DollarSign } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { JobRequest, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface WizardProps {
  category: string;
  currentUser: User | null;
  initialData?: JobRequest | null;
  onComplete: (job: any) => void;
  onCancel: () => void;
}

export const WizardScreen: React.FC<WizardProps> = ({ category, currentUser, initialData, onComplete, onCancel }) => {
  const { t, tCategory } = useLanguage();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    urgency: initialData?.urgency || 'THIS_WEEK' as any,
    scheduledDate: initialData?.scheduledDate || '',
    photos: initialData?.photos || [] as string[],
    suggestedPrice: initialData?.suggestedPrice?.toString() || ''
  });

  const [useSavedAddress, setUseSavedAddress] = useState(!initialData);

  // Draft Logic
  useEffect(() => {
    if (!initialData) {
        const saved = localStorage.getItem(`draft_job_${category}`);
        if (saved) {
            const parsed = JSON.parse(saved);
            setFormData(parsed);
        }
    }
  }, [category, initialData]);

  // Persist Logic
  useEffect(() => {
    if (!initialData) {
        localStorage.setItem(`draft_job_${category}`, JSON.stringify(formData));
    }
  }, [formData, category, initialData]);

  // Pre-fill location logic
  useEffect(() => {
    if (!initialData && currentUser && currentUser.addresses.length > 0 && useSavedAddress && !formData.location) {
        const primary = currentUser.addresses[0];
        setFormData(prev => ({ ...prev, location: `${primary.street} ${primary.number}, ${primary.postalCode} ${primary.locality}` }));
    }
  }, [currentUser, useSavedAddress, initialData]);

  const simulateUpload = () => {
    const mockPhoto = `https://picsum.photos/200/200?random=${formData.photos.length}`;
    setFormData({ ...formData, photos: [...formData.photos, mockPhoto] });
  };

  const isFormValid = formData.title.length > 3 && formData.description.length > 5;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Simple Header */}
      <header className="px-4 py-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto w-full">
          <button onClick={onCancel} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-center">
            <span className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                {tCategory(category)}
            </span>
            {initialData && (
                <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-center gap-1">
                    <Pencil size={10} /> Editing
                </span>
            )}
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        <div className="max-w-lg mx-auto space-y-4">
            
            {/* 1. LOCATION CARD */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase text-slate-400 tracking-widest">
                    <MapPin size={14} className="text-emerald-500" /> {t.serviceLocation}
                </div>
                
                {currentUser && currentUser.addresses.length > 0 ? (
                    <div className="space-y-2">
                        {currentUser.addresses.map((addr) => (
                            <div 
                                key={addr.id}
                                onClick={() => {
                                    setUseSavedAddress(true);
                                    setFormData(prev => ({ ...prev, location: `${addr.street} ${addr.number}, ${addr.postalCode} ${addr.locality}` }));
                                }}
                                className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                                    useSavedAddress && formData.location.includes(addr.street) 
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${useSavedAddress && formData.location.includes(addr.street) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <Home size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{addr.label}</p>
                                    <p className="text-xs text-slate-500 truncate">{addr.street}, {addr.locality}</p>
                                </div>
                                {useSavedAddress && formData.location.includes(addr.street) && <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />}
                            </div>
                        ))}
                        
                        <div 
                            onClick={() => {
                                setUseSavedAddress(false);
                                setFormData(prev => ({ ...prev, location: '' }));
                            }}
                            className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                                !useSavedAddress 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!useSavedAddress ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <Plus size={16} />
                            </div>
                            <span className="text-sm font-bold">Other Location</span>
                        </div>
                    </div>
                ) : null}

                {(!currentUser || !useSavedAddress) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                        <Input 
                            placeholder={t.addressPlaceholder}
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            className="bg-slate-50 dark:bg-slate-800"
                        />
                    </motion.div>
                )}
            </div>

            {/* 2. DETAILS CARD */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase text-slate-400 tracking-widest">
                    <FileText size={14} className="text-blue-500" /> {t.detailsLabel}
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.titleLabel}</label>
                        <Input 
                            placeholder={t.titlePlaceholder} 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{t.detailsLabel}</label>
                        <textarea 
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none h-28 text-sm resize-none"
                            placeholder={t.detailsPlaceholder}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* 3. URGENCY & PHOTOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase text-slate-400 tracking-widest">
                        <Clock size={14} className="text-amber-500" /> {t.whenLabel}
                    </div>
                    <select 
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        value={formData.urgency}
                        onChange={(e) => setFormData({...formData, urgency: e.target.value as any})}
                    >
                        <option value="URGENT">{t.urgencyAsap}</option>
                        <option value="THIS_WEEK">{t.urgencyThisWeek}</option>
                        <option value="PLANNING">{t.urgencyPlanning}</option>
                        <option value="SPECIFIC_DATE">Specific Date</option>
                    </select>
                    
                    {formData.urgency === 'SPECIFIC_DATE' && (
                        <input 
                            type="date" 
                            className="w-full mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase text-slate-400 tracking-widest">
                        <Camera size={14} className="text-purple-500" /> {t.photosOptional}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button 
                            onClick={simulateUpload}
                            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-colors shrink-0"
                        >
                            <Plus size={24} />
                        </button>
                        {formData.photos.map((p, i) => (
                            <div key={i} className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative group">
                                <img src={p} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => setFormData({...formData, photos: formData.photos.filter((_, idx) => idx !== i)})}
                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. OFFER (High Vis) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase text-slate-400 tracking-widest">
                    <DollarSign size={14} className="text-emerald-500" /> {t.yourOffer}
                </div>
                <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                    <input 
                        type="number" 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-3xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-200"
                        placeholder="00"
                        value={formData.suggestedPrice}
                        onChange={(e) => setFormData({...formData, suggestedPrice: e.target.value})}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">{t.budgetHelp}</p>
            </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-lg mx-auto">
            <Button 
            className="w-full py-4 text-lg font-bold shadow-xl shadow-emerald-500/20" 
            onClick={() => onComplete({...formData, suggestedPrice: Number(formData.suggestedPrice) || 0})}
            disabled={!isFormValid}
            >
            {initialData ? t.saveChanges : t.requestQuotes}
            </Button>
        </div>
      </footer>
    </div>
  );
};
