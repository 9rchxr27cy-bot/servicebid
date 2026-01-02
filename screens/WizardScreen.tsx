
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Camera, X, CheckCircle2, Calendar, Home, Plus, Euro, Pencil } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { JobRequest, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface WizardProps {
  category: string;
  currentUser: User | null;
  initialData?: JobRequest | null; // Prop to handle editing mode
  onComplete: (job: any) => void;
  onCancel: () => void;
}

export const WizardScreen: React.FC<WizardProps> = ({ category, currentUser, initialData, onComplete, onCancel }) => {
  const { t, tCategory } = useLanguage();
  const [step, setStep] = useState(1);

  // Initialize state directly with initialData if present (Correction for "Edit starts from zero")
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

  // Draft Logic (Only if NOT editing)
  useEffect(() => {
    if (!initialData) {
        const saved = localStorage.getItem(`draft_job_${category}`);
        if (saved) {
            const parsed = JSON.parse(saved);
            setFormData(parsed);
        }
    }
  }, [category, initialData]);

  // Persist Logic (Only if NOT editing)
  useEffect(() => {
    if (!initialData) {
        localStorage.setItem(`draft_job_${category}`, JSON.stringify(formData));
    }
  }, [formData, category, initialData]);

  // Pre-fill location logic (Only for new jobs)
  useEffect(() => {
    if (!initialData && currentUser && currentUser.addresses.length > 0 && useSavedAddress && !formData.location) {
        const primary = currentUser.addresses[0];
        setFormData(prev => ({ ...prev, location: `${primary.street} ${primary.number}, ${primary.postalCode} ${primary.locality}` }));
    }
  }, [currentUser, useSavedAddress, initialData]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => step === 1 ? onCancel() : setStep(s => s - 1);

  const simulateUpload = () => {
    const mockPhoto = `https://picsum.photos/200/200?random=${formData.photos.length}`;
    setFormData({ ...formData, photos: [...formData.photos, mockPhoto] });
  };

  const steps = [
    { title: t.whatNeed, sub: t.describeProblem },
    { title: t.whereWhen, sub: t.defineLocation },
    { title: t.photosOptional, sub: t.helpPro }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Header / Progress */}
      <header className="p-4 border-b dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="p-2 -ml-2 text-slate-500"><ChevronLeft /></button>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
                {t.stepXofY.replace('{x}', step.toString()).replace('{y}', '3')}
            </span>
            {initialData && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1">
                    <Pencil size={10} /> Editing: {tCategory(category)}
                </div>
            )}
          </div>
          
          <div className="w-8" />
        </div>
        <div className="flex gap-2">
          {[1,2,3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
          ))}
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">{steps[step-1].title}</h2>
          <p className="text-slate-500">{steps[step-1].sub}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {step === 1 && (
              <>
                <Input 
                  label={t.titleLabel} 
                  placeholder={t.titlePlaceholder} 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.detailsLabel}</label>
                  <textarea 
                    className="w-full p-4 rounded-2xl border dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none h-32"
                    placeholder={t.detailsPlaceholder}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* ADDRESS LOGIC */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Address</label>
                    
                    {currentUser && currentUser.addresses.length > 0 ? (
                        <div className="space-y-2">
                            {currentUser.addresses.map((addr) => (
                                <div 
                                    key={addr.id}
                                    onClick={() => {
                                        setUseSavedAddress(true);
                                        setFormData(prev => ({ ...prev, location: `${addr.street} ${addr.number}, ${addr.postalCode} ${addr.locality}` }));
                                    }}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                                        useSavedAddress && formData.location.includes(addr.street) 
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${useSavedAddress && formData.location.includes(addr.street) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <Home size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{addr.label}</p>
                                        <p className="text-xs text-slate-500">{addr.street} {addr.number}, {addr.locality}</p>
                                    </div>
                                    {useSavedAddress && formData.location.includes(addr.street) && <CheckCircle2 className="ml-auto text-emerald-500" size={18} />}
                                </div>
                            ))}
                            
                            <div 
                                onClick={() => {
                                    setUseSavedAddress(false);
                                    setFormData(prev => ({ ...prev, location: '' }));
                                }}
                                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                                    !useSavedAddress 
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!useSavedAddress ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <Plus size={16} />
                                </div>
                                <span className="text-sm font-bold">New Address</span>
                            </div>
                        </div>
                    ) : null}

                    {(!currentUser || !useSavedAddress) && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                                <Input 
                                    placeholder={t.addressPlaceholder}
                                    className="pl-12"
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                            {!currentUser && (
                                <p className="text-[10px] text-slate-400 mt-2 px-1">
                                    You can save this address by creating an account in the next step.
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>
                
                {/* DATE / URGENCY LOGIC */}
                <div className="space-y-3 mt-4">
                  <label className="text-sm font-medium">{t.whenLabel}</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'URGENT', label: t.urgencyAsap, icon: '⚡' },
                      { id: 'THIS_WEEK', label: t.urgencyThisWeek, icon: '📅' },
                      { id: 'PLANNING', label: t.urgencyPlanning, icon: '🔍' },
                      { id: 'SPECIFIC_DATE', label: 'Specific Date', icon: '📆' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setFormData({...formData, urgency: opt.id as any})}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${formData.urgency === opt.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <span className="font-bold">{opt.label}</span>
                        {opt.id === 'SPECIFIC_DATE' && formData.urgency === 'SPECIFIC_DATE' && (
                            <Calendar className="ml-auto text-emerald-500" size={18} />
                        )}
                      </button>
                    ))}
                  </div>

                  {formData.urgency === 'SPECIFIC_DATE' && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                          <input 
                            type="date" 
                            className="w-full p-4 rounded-xl border border-emerald-200 bg-white dark:bg-slate-900 dark:border-emerald-900 font-bold text-lg"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                          />
                      </motion.div>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {/* BUDGET INPUT */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.budgetLabel}</label>
                    <div className="relative">
                        <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="number" 
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-300"
                            placeholder={t.budgetPlaceholder}
                            value={formData.suggestedPrice}
                            onChange={(e) => setFormData({...formData, suggestedPrice: e.target.value})}
                        />
                    </div>
                    <p className="text-xs text-slate-500">{t.budgetHelp}</p>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                <div className="grid grid-cols-3 gap-3">
                  {formData.photos.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={p} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData({...formData, photos: formData.photos.filter((_, idx) => idx !== i)})}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
                      ><X size={12} /></button>
                    </div>
                  ))}
                  {formData.photos.length < 5 && (
                    <button 
                      onClick={simulateUpload}
                      className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                    >
                      <Camera size={24} />
                      <span className="text-[10px] mt-1 font-bold">{t.addPhoto}</span>
                    </button>
                  )}
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex gap-3 text-xs text-blue-700 dark:text-blue-300">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <p>{t.photoTip}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="p-6 border-t dark:border-slate-800">
        <Button 
          className="w-full py-4 text-lg font-bold" 
          onClick={step === 3 ? () => onComplete({...formData, suggestedPrice: Number(formData.suggestedPrice) || 0}) : handleNext}
          disabled={step === 1 && !formData.title}
        >
          {step === 3 ? (initialData ? t.saveChanges : t.requestQuotes) : t.next}
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </footer>
    </div>
  );
};
