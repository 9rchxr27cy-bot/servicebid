
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Upload, 
  Briefcase, 
  User as UserIcon, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Building2,
  FileText,
  CreditCard,
  Check,
  HelpCircle,
  ArrowLeft,
  Lock,
  Globe,
  Sparkles,
  Crown,
  Infinity,
  FileBadge,
  Landmark,
  Edit3,
  Loader2
} from 'lucide-react';
import { Button, Input, Card, LevelBadge } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { CATEGORIES } from '../constants';
import { User } from '../types';

export const WelcomeScreen: React.FC<{ onLogin: (role: 'CLIENT' | 'PRO') => void }> = ({ onLogin }) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center space-y-8">
      <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
        <ShieldCheck className="text-white w-10 h-10" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">ServiceBid<span className="text-emerald-500">.lu</span></h1>
        <p className="text-slate-500">Choose your role to continue</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        <button 
          onClick={() => onLogin('CLIENT')}
          className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-emerald-500 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UserIcon size={24} />
          </div>
          <h3 className="font-bold text-lg mb-1">{t.imClient}</h3>
          <p className="text-xs text-slate-500">I want to hire professionals</p>
        </button>

        <button 
          onClick={() => onLogin('PRO')}
          className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-emerald-500 transition-all group"
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Briefcase size={24} />
          </div>
          <h3 className="font-bold text-lg mb-1">{t.imPro}</h3>
          <p className="text-xs text-slate-500">I want to offer services</p>
        </button>
      </div>
    </div>
  );
};

export const CompanyCreationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 font-bold mb-6">
        <ArrowLeft size={20} /> {t.back}
      </button>
      
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
          <Building2 size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-4">{t.noCompany}</h1>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed">
           Starting a business in Luxembourg involves several administrative steps. We can help you navigate through the process of obtaining your business permit and setting up your legal structure.
        </p>

        <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">1</div>
                <div>
                    <h4 className="font-bold text-lg">Business Permit</h4>
                    <p className="text-sm text-slate-500">Required for all commercial activities.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">2</div>
                <div>
                    <h4 className="font-bold text-lg">Legal Form</h4>
                    <p className="text-sm text-slate-500">Choose between S.à r.l., S.A., or Sole Proprietorship.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">3</div>
                <div>
                    <h4 className="font-bold text-lg">VAT & Tax</h4>
                    <p className="text-sm text-slate-500">Registration with the administration.</p>
                </div>
            </div>
        </div>

        <Button className="w-full h-14 text-lg font-black rounded-2xl">
            Contact Support for Help
        </Button>
      </div>
    </div>
  );
};

export const ProOnboarding: React.FC<{ onComplete: (data: any) => void }> = ({ onComplete }) => {
  const { t, tCategory } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    email: '', // ADDED
    phone: '', // ADDED
    cnsNumber: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    locality: '',
    idUploaded: false,
    // Step 2
    legalType: 'independant' as 'independant' | 'societe',
    rcsNumber: '',
    tvaNumber: '',
    companyName: '',
    // Step 3 (NEW - Services)
    selectedCategories: [] as string[],
    // Step 4 (Was 3)
    licenseNum: '',
    licenseExpiry: '',
    licenseUploaded: false,
    // Step 5 (Was 4 - Financial & Plans)
    selectedPlan: 'premium', // NEW: Track selected plan
    iban: '',
    accHolder: '',
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCvc: '',
    // Step 6 (Was 5)
    declarationAccepted: false
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (catId: string) => {
    setFormData(prev => {
        const current = prev.selectedCategories;
        if (current.includes(catId)) {
            return { ...prev, selectedCategories: current.filter(c => c !== catId) };
        } else {
            return { ...prev, selectedCategories: [...current, catId] };
        }
    });
  };

  const steps = [
    { id: 1, title: t.personalDetails, icon: <UserIcon size={16} /> },
    { id: 2, title: t.businessDetails, icon: <Building2 size={16} /> },
    { id: 3, title: t.servicesAndScope, icon: <Briefcase size={16} /> }, 
    { id: 4, title: t.licenseDetails, icon: <FileText size={16} /> },
    { id: 5, title: t.financialPlan, icon: <CreditCard size={16} /> },
    { id: 6, title: t.reviewDetails, icon: <CheckCircle2 size={16} /> },
  ];

  const isStepValid = () => {
    switch (step) {
      case 1:
        // Validate Name, Email, Phone, CNS, Zip
        return formData.fullName.length > 3 && 
               formData.email.includes('@') && 
               formData.phone.length > 6 &&
               formData.cnsNumber.length === 13 && 
               formData.postalCode.startsWith('L-');
      case 2:
        return formData.tvaNumber.startsWith('LU') && formData.tvaNumber.length === 10 && (formData.legalType === 'independant' || formData.rcsNumber.length > 5);
      case 3:
        return formData.selectedCategories.length > 0;
      case 4:
        return formData.licenseNum.length > 4 && formData.licenseExpiry !== '';
      case 5:
        // IBAN check + Card Check + Plan Selected
        return formData.iban.length > 10 && formData.cardNumber.length >= 16 && formData.selectedPlan !== '';
      case 6:
        return formData.declarationAccepted;
      default:
        return false;
    }
  };

  const getWebsiteTheme = () => {
      const primaryCat = formData.selectedCategories[0];
      if (['Gardening', 'SolarEnergy'].includes(primaryCat)) return 'from-emerald-500 to-green-600';
      if (['Cleaning', 'Beauty', 'Pet Sitter'].includes(primaryCat)) return 'from-pink-500 to-rose-600';
      return 'from-blue-600 to-slate-800'; // Default Industrial
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto min-h-[85vh] flex flex-col">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2" />
          {steps.map((s) => (
            <div 
              key={s.id} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s.id === step 
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 scale-110' 
                  : s.id < step 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              {s.id < step ? <Check size={14} /> : s.icon}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{steps[step-1].title}</h2>
          <p className="text-xs text-slate-500">{t.stepIndicator.replace('{step}', step.toString()).replace('{total}', '6')}</p>
        </div>
      </div>

      {/* Form Content Area */}
      <div className="flex-1">
        <AnimatePresence mode='wait'>
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {step === 1 && (
              <div className="space-y-4">
                <Input label={t.fullName} value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} placeholder="Roberto Silva" />
                
                {/* NEW: EMAIL & PHONE */}
                <Input label={t.email} type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} placeholder="name@company.com" />
                <Input label={t.phoneLabel} type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+352 6XX XXX XXX" />

                <Input label={t.cnsNumber} value={formData.cnsNumber} onChange={e => updateForm('cnsNumber', e.target.value.replace(/\D/g, '').slice(0, 13))} placeholder="YYYYMMDDXXXXX" />
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3"><Input label={t.street} value={formData.street} onChange={e => updateForm('street', e.target.value)} /></div>
                  <div className="col-span-1"><Input label="N°" value={formData.houseNumber} onChange={e => updateForm('houseNumber', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label={t.postalCode} value={formData.postalCode} onChange={e => { let val = e.target.value.toUpperCase(); if (!val.startsWith('L-') && val.length > 0) val = 'L-' + val; updateForm('postalCode', val.slice(0, 6)); }} placeholder="L-XXXX" />
                  <Input label={t.locality} value={formData.locality} onChange={e => updateForm('locality', e.target.value)} />
                </div>
                <div className={`mt-4 border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${formData.idUploaded ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800'}`} onClick={() => updateForm('idUploaded', true)}>
                  <Upload size={20} className={formData.idUploaded ? 'text-emerald-500' : 'text-slate-400'} />
                  <span className="text-sm font-medium">{t.idUpload}</span>
                  {formData.idUploaded && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{t.attached}</span>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <button onClick={() => updateForm('legalType', 'independant')} className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.legalType === 'independant' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                    <UserIcon size={24} /> <span className="text-sm font-bold">{t.independant}</span>
                  </button>
                  <button onClick={() => updateForm('legalType', 'societe')} className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.legalType === 'societe' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                    <Building2 size={24} /> <span className="text-sm font-bold">{t.societe}</span>
                  </button>
                </div>
                {formData.legalType === 'societe' && <Input label={t.companyName} value={formData.companyName} onChange={e => updateForm('companyName', e.target.value)} />}
                <div className="space-y-4">
                  <Input label={t.tvaNumber} value={formData.tvaNumber} onChange={e => { let val = e.target.value.toUpperCase(); if (!val.startsWith('LU') && val.length > 0) val = 'LU' + val; updateForm('tvaNumber', val.slice(0, 10)); }} placeholder="LUXXXXXXXX" />
                  {formData.legalType === 'societe' && <Input label={t.rcsNumber} value={formData.rcsNumber} onChange={e => updateForm('rcsNumber', e.target.value.toUpperCase())} placeholder="B123456" />}
                </div>
              </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                        <h3 className="font-bold text-lg">{t.selectServices}</h3>
                        <p className="text-sm text-slate-500">{t.selectServicesDesc}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                        {CATEGORIES.map(cat => {
                            const isSelected = formData.selectedCategories.includes(cat.id);
                            return (
                                <button key={cat.id} onClick={() => toggleCategory(cat.id)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-md transform scale-[1.02]' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-300'}`}>
                                    <div className={`mb-2 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`}><Briefcase size={20} /></div>
                                    <span className="text-xs font-bold text-center">{tCategory(cat.id)}</span>
                                    {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-xs">
                    <HelpCircle size={16} className="shrink-0" />
                    <span>{t.licenseInfo}</span>
                </div>
                <Input label={t.licenseNum} value={formData.licenseNum} onChange={e => updateForm('licenseNum', e.target.value)} />
                <div className="flex flex-col gap-1.5">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.licenseExpiry}</label>
                   <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" value={formData.licenseExpiry} onChange={e => updateForm('licenseExpiry', e.target.value)} />
                </div>
                <div className={`mt-4 border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors ${formData.licenseUploaded ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800'}`} onClick={() => updateForm('licenseUploaded', true)}>
                  <Upload size={24} className={formData.licenseUploaded ? 'text-emerald-500' : 'text-slate-400'} />
                  <span className="text-sm font-medium">{t.uploadPdfLabel}</span>
                  {formData.licenseUploaded && <span className="text-xs text-emerald-600 font-bold">{t.licenseUploaded}</span>}
                </div>
              </div>
            )}

            {/* STEP 5: FINANCE & PLANS (MAJOR UPDATE) */}
            {step === 5 && (
              <div className="space-y-6">
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">{t.planSelect}</h3>

                {/* Plan Selection Cards */}
                <div className="space-y-4">
                    {/* PREMIUM CARD */}
                    <div 
                        onClick={() => updateForm('selectedPlan', 'premium')}
                        className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer group ${
                            formData.selectedPlan === 'premium' 
                            ? 'border-amber-400 shadow-xl scale-[1.02]' 
                            : 'border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:border-amber-400/50'
                        }`}
                    >
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
                            <div className="absolute top-0 right-0 bg-amber-400 px-3 py-1 text-[10px] font-black text-slate-900 uppercase tracking-widest rounded-bl-xl">
                                {t.founderOffer}
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-black italic flex items-center gap-2">
                                        <Crown size={18} className="text-amber-400" fill="currentColor" /> 
                                        {t.premiumPlan}
                                    </h4>
                                    <div className="flex items-center gap-1 text-[10px] text-amber-200 mt-1">
                                        <Infinity size={12} /> {t.lifetimeAccess}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm text-slate-400 line-through decoration-red-500 decoration-2">€ 50/mo</span>
                                    <span className="block text-xl font-black text-amber-400">€ 0</span>
                                </div>
                            </div>

                            {/* Detailed Benefits List */}
                            <ul className="space-y-2 mb-4">
                                {[
                                    t.benefitSite, 
                                    t.benefitPriority,
                                    t.benefitFees,
                                    t.benefitSupport,
                                    t.benefitBadge
                                ].map((benefit, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                                        <div className="bg-amber-400/20 p-0.5 rounded-full">
                                            <Check size={10} className="text-amber-400" />
                                        </div>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-3 flex gap-2 items-center justify-between border-t border-white/10 pt-3">
                                <span className="text-[10px] text-slate-400">{t.durationLabel}</span>
                                <span className="text-xs font-bold text-amber-400 animate-pulse">{t.freeForever}</span>
                            </div>
                        </div>
                        
                        {/* Selected Indicator */}
                        {formData.selectedPlan === 'premium' && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 pointer-events-none">
                                <Crown size={120} fill="currentColor" />
                            </div>
                        )}
                    </div>
                    
                    {/* BASIC PLAN CARD (Selectable but inferior) */}
                    <div 
                        onClick={() => updateForm('selectedPlan', 'basic')}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                            formData.selectedPlan === 'basic'
                            ? 'border-emerald-500 bg-white dark:bg-slate-900 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 grayscale hover:grayscale-0'
                        }`}
                    >
                        <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">{t.basicPlan}</span>
                            <span className="text-[10px] text-slate-500">{t.basicDesc}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-slate-900 dark:text-white">€ 30</span>
                            <span className="text-[10px] text-slate-400 block">/mo</span>
                        </div>
                    </div>
                </div>

                {/* Section: Payout Details */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <Building2 size={14} /> {t.payoutDetails}
                    </h4>
                    <Input 
                        label={t.iban} 
                        value={formData.iban} 
                        onChange={e => updateForm('iban', e.target.value.replace(/\s/g, '').toUpperCase())} 
                        placeholder="LUXX XXXX XXXX XXXX XXXX"
                    />
                    <Input 
                        label={t.accHolder} 
                        value={formData.accHolder} 
                        onChange={e => updateForm('accHolder', e.target.value)} 
                    />
                </div>

                {/* Section: Payment Method (Charging) */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <CreditCard size={14} /> {t.paymentMethod}
                    </h4>
                    <p className="text-[10px] text-slate-500 -mt-2 mb-2">{t.paymentValidation}</p>
                    
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                value={formData.cardNumber}
                                onChange={e => updateForm('cardNumber', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                                placeholder={t.expiryDate}
                                maxLength={5}
                                value={formData.cardExpiry}
                                onChange={e => updateForm('cardExpiry', e.target.value)}
                            />
                            <input 
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                                placeholder={t.cvc}
                                maxLength={3}
                                type="password"
                                value={formData.cardCvc}
                                onChange={e => updateForm('cardCvc', e.target.value)}
                            />
                        </div>
                        <Input 
                            placeholder={t.cardHolder}
                            value={formData.cardHolder}
                            onChange={e => updateForm('cardHolder', e.target.value)}
                        />
                    </div>
                </div>

              </div>
            )}

            {/* STEP 6: REVIEW (UPDATED with Website Preview) */}
            {step === 6 && (
              <div className="space-y-6">
                
                {/* Website Preview Card */}
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getWebsiteTheme()} p-6 text-white shadow-2xl`}>
                    <div className="absolute top-2 right-2 bg-white/20 p-2 rounded-full backdrop-blur-md">
                        <Globe size={20} />
                    </div>
                    <div className="relative z-10">
                        <div className="mb-4 inline-block rounded-lg bg-white/20 p-3 backdrop-blur-md">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="text-2xl font-black mb-1">{t.websiteReady}</h3>
                        <p className="text-white/80 text-sm mb-4">{t.websiteDesc}</p>
                        
                        <div className="bg-black/30 rounded-lg p-3 flex items-center justify-between backdrop-blur-sm border border-white/10">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Globe size={14} className="text-emerald-400 shrink-0" />
                                <span className="text-xs font-mono truncate">servicebid.lu/{formData.companyName.replace(/\s+/g, '-').toLowerCase()}</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">{t.visitSite}</span>
                        </div>
                        
                        <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/60">
                            {t.generatedFor}: {formData.selectedCategories[0] || 'General'}
                        </div>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute -right-10 -bottom-10 opacity-20 rotate-12">
                        <Briefcase size={150} />
                    </div>
                </div>

                <Card className="p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50 border-none">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{t.fullName}</span>
                    <span className="text-sm font-bold">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{t.email}</span>
                    <span className="text-sm font-bold">{formData.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{t.summaryServices}</span>
                    <span className="text-sm font-bold truncate max-w-[150px]">{formData.selectedCategories.map(c => tCategory(c)).join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{t.summaryPlan}</span>
                    <span className={`text-sm font-bold ${formData.selectedPlan === 'premium' ? 'text-amber-500' : 'text-slate-900'}`}>
                        {formData.selectedPlan === 'premium' ? t.premiumPlan : t.basicPlan}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{t.summaryIban}</span>
                    <span className="text-sm font-bold truncate max-w-[150px]">{formData.iban}</span>
                  </div>
                </Card>

                <div 
                    className="flex gap-3 items-start cursor-pointer group mt-6"
                    onClick={() => updateForm('declarationAccepted', !formData.declarationAccepted)}
                >
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.declarationAccepted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                        {formData.declarationAccepted && <Check size={14} className="text-white" />}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t.declaration}
                    </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-900">
        {step > 1 && (
          <Button 
            variant="ghost" 
            className="flex-1 text-slate-500" 
            onClick={prevStep}
          >
            <ChevronLeft size={20} className="mr-1" />
            {t.back}
          </Button>
        )}
        <Button 
          className="flex-1 shadow-lg shadow-emerald-500/20" 
          onClick={step === 6 ? () => onComplete(formData) : nextStep}
          disabled={!isStepValid()}
        >
          {step === 6 ? t.finish : (
            <>
                {t.next}
                <ChevronRight size={20} className="ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
