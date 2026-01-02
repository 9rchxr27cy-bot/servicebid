
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Upload, 
  ScanFace, 
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
  FileCheck,
  Home
} from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { CATEGORIES } from '../constants';
import { User as UserType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthProps {
  onLogin: (role: 'CLIENT' | 'PRO', userData?: Partial<UserType>) => void;
}

export const WelcomeScreen: React.FC<AuthProps> = ({ onLogin }) => {
  const { t } = useLanguage();

  return (
    <div className="p-6 flex flex-col h-full justify-center min-h-[80vh] gap-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">{t.welcomeTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.welcomeSubtitle}</p>
      </div>

      <div className="grid gap-4">
        <Card 
          className="group hover:border-emerald-500 cursor-pointer transition-all active:scale-95"
          onClick={() => onLogin('CLIENT')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <UserIcon className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg">{t.imClient}</h3>
              <p className="text-sm text-slate-500">{t.imClientDesc}</p>
            </div>
          </div>
        </Card>

        <Card 
          className="group hover:border-blue-500 cursor-pointer transition-all active:scale-95"
          onClick={() => onLogin('PRO')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg">{t.imPro}</h3>
              <p className="text-sm text-slate-500">{t.imProDesc}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const ProOnboarding: React.FC<{ onComplete: (data: any) => void }> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
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
    // Step 3
    licenseNum: '',
    licenseExpiry: '',
    licenseUploaded: false,
    // Step 4
    iban: '',
    accHolder: '',
    // Step 5
    declarationAccepted: false
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { id: 1, title: t.personalDetails, icon: <UserIcon size={16} /> },
    { id: 2, title: t.businessDetails, icon: <Building2 size={16} /> },
    { id: 3, title: t.licenseDetails, icon: <FileText size={16} /> },
    { id: 4, title: t.bankDetails, icon: <CreditCard size={16} /> },
    { id: 5, title: t.reviewDetails, icon: <CheckCircle2 size={16} /> },
  ];

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fullName.length > 3 && formData.cnsNumber.length === 13 && formData.postalCode.startsWith('L-');
      case 2:
        return formData.tvaNumber.startsWith('LU') && formData.tvaNumber.length === 10 && (formData.legalType === 'independant' || formData.rcsNumber.length > 5);
      case 3:
        return formData.licenseNum.length > 4 && formData.licenseExpiry !== '';
      case 4:
        return formData.iban.length > 10 && formData.accHolder.length > 3;
      case 5:
        return formData.declarationAccepted;
      default:
        return false;
    }
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
          <p className="text-xs text-slate-500">Step {step} of 5</p>
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
                <Input 
                  label={t.fullName} 
                  value={formData.fullName} 
                  onChange={e => updateForm('fullName', e.target.value)} 
                  placeholder="Roberto Silva"
                />
                <Input 
                  label={t.cnsNumber} 
                  value={formData.cnsNumber} 
                  onChange={e => updateForm('cnsNumber', e.target.value.replace(/\D/g, '').slice(0, 13))} 
                  placeholder="YYYYMMDDXXXXX"
                />
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3">
                    <Input label={t.street} value={formData.street} onChange={e => updateForm('street', e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <Input label="N°" value={formData.houseNumber} onChange={e => updateForm('houseNumber', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label={t.postalCode} 
                    value={formData.postalCode} 
                    onChange={e => {
                        let val = e.target.value.toUpperCase();
                        if (!val.startsWith('L-') && val.length > 0) val = 'L-' + val;
                        updateForm('postalCode', val.slice(0, 6));
                    }} 
                    placeholder="L-XXXX"
                  />
                  <Input label={t.locality} value={formData.locality} onChange={e => updateForm('locality', e.target.value)} />
                </div>
                <div 
                  className={`mt-4 border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${formData.idUploaded ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800'}`}
                  onClick={() => updateForm('idUploaded', true)}
                >
                  <Upload size={20} className={formData.idUploaded ? 'text-emerald-500' : 'text-slate-400'} />
                  <span className="text-sm font-medium">{t.idUpload}</span>
                  {formData.idUploaded && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Document Attached</span>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <button 
                    onClick={() => updateForm('legalType', 'independant')}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.legalType === 'independant' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                  >
                    <UserIcon size={24} />
                    <span className="text-sm font-bold">{t.independant}</span>
                  </button>
                  <button 
                    onClick={() => updateForm('legalType', 'societe')}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.legalType === 'societe' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                  >
                    <Building2 size={24} />
                    <span className="text-sm font-bold">{t.societe}</span>
                  </button>
                </div>

                {formData.legalType === 'societe' && (
                  <Input label={t.companyName} value={formData.companyName} onChange={e => updateForm('companyName', e.target.value)} />
                )}

                <div className="space-y-4">
                  <Input 
                    label={t.tvaNumber} 
                    value={formData.tvaNumber} 
                    onChange={e => {
                        let val = e.target.value.toUpperCase();
                        if (!val.startsWith('LU') && val.length > 0) val = 'LU' + val;
                        updateForm('tvaNumber', val.slice(0, 10));
                    }}
                    placeholder="LUXXXXXXXX"
                  />
                  {formData.legalType === 'societe' && (
                    <Input label={t.rcsNumber} value={formData.rcsNumber} onChange={e => updateForm('rcsNumber', e.target.value.toUpperCase())} placeholder="B123456" />
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-xs">
                    <HelpCircle size={16} className="shrink-0" />
                    <span>This license is issued by the Ministry of the Economy. Mandatory for most activities in LU.</span>
                </div>
                <Input label={t.licenseNum} value={formData.licenseNum} onChange={e => updateForm('licenseNum', e.target.value)} />
                <div className="flex flex-col gap-1.5">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.licenseExpiry}</label>
                   <input 
                     type="date" 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
                     value={formData.licenseExpiry}
                     onChange={e => updateForm('licenseExpiry', e.target.value)}
                   />
                </div>
                <div 
                  className={`mt-4 border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors ${formData.licenseUploaded ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800'}`}
                  onClick={() => updateForm('licenseUploaded', true)}
                >
                  <Upload size={24} className={formData.licenseUploaded ? 'text-emerald-500' : 'text-slate-400'} />
                  <span className="text-sm font-medium">Upload PDF / Photo</span>
                  {formData.licenseUploaded && <span className="text-xs text-emerald-600 font-bold">LICENSE_UPLOADED.PDF</span>}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
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
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Payment Security</p>
                    <p className="text-xs text-slate-500">ServiceBid uses encrypted payouts via SEPA. Your bank details are never shared directly with clients.</p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <Card className="p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50 border-none">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{t.fullName}</span>
                    <span className="text-sm font-bold">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Legal</span>
                    <span className="text-sm font-bold uppercase">{formData.legalType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">VAT (TVA)</span>
                    <span className="text-sm font-bold">{formData.tvaNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">IBAN</span>
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
          onClick={step === 5 ? () => onComplete(formData) : nextStep}
          disabled={!isStepValid()}
        >
          {step === 5 ? t.finish : (
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

export const CompanyCreationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    structure: 'independant',
    activity: '',
    residency: 'lux',
    passport: false,
    criminalRecord: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center max-w-md mx-auto min-h-[80vh]">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-bounce">
          <FileCheck size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{t.requestSent}</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          {t.requestSentDesc}
        </p>
        <Button onClick={onBack} className="w-full h-14 font-bold">
          {t.backToHome}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors mb-6 font-bold">
        <ArrowLeft size={20} /> {t.back}
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl mb-4">
          <Building2 size={32} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">{t.formationTitle}</h1>
        <p className="text-slate-500 text-lg max-w-lg mx-auto">{t.formationSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Contact */}
        <section>
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 flex items-center justify-center text-[10px]">1</span>
            {t.formStep1}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label={t.fullName} 
              placeholder="Alice Johnson" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label={t.email} 
              type="email" 
              placeholder="alice@email.com" 
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <div className="md:col-span-2">
              <Input 
                label={t.phoneLabel} 
                type="tel" 
                placeholder="+352 6XX XXX XXX" 
                required 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Structure */}
        <section>
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 flex items-center justify-center text-[10px]">2</span>
            {t.businessType}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, structure: 'independant'})}
              className={`p-4 rounded-xl border-2 text-left transition-all ${formData.structure === 'independant' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
            >
              <UserIcon className={`mb-2 ${formData.structure === 'independant' ? 'text-emerald-500' : 'text-slate-400'}`} />
              <div className="font-bold text-sm">{t.independantType}</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, structure: 'sarl-s'})}
              className={`p-4 rounded-xl border-2 text-left transition-all ${formData.structure === 'sarl-s' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
            >
              <Building2 className={`mb-2 ${formData.structure === 'sarl-s' ? 'text-emerald-500' : 'text-slate-400'}`} />
              <div className="font-bold text-sm">{t.sarlsType}</div>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.activityDesc}</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none h-24"
                placeholder={t.activityPlace}
                required
                value={formData.activity}
                onChange={e => setFormData({...formData, activity: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.residency}</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'lux', label: t.residencyLux },
                  { id: 'eu', label: t.residencyEU },
                  { id: 'none', label: t.residencyNonEU },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({...formData, residency: opt.id})}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${formData.residency === opt.id ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-transparent border-slate-200 text-slate-500'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Docs */}
        <section>
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 flex items-center justify-center text-[10px]">3</span>
            {t.formStep2}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setFormData({...formData, passport: !formData.passport})}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors gap-2 ${formData.passport ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
            >
              <ScanFace size={24} className={formData.passport ? 'text-emerald-500' : 'text-slate-400'} />
              <span className={`text-xs font-bold ${formData.passport ? 'text-emerald-600' : 'text-slate-500'}`}>{t.docPassport}</span>
              {formData.passport && <CheckCircle2 size={16} className="text-emerald-500" />}
            </div>
            <div 
              onClick={() => setFormData({...formData, criminalRecord: !formData.criminalRecord})}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors gap-2 ${formData.criminalRecord ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
            >
              <FileText size={24} className={formData.criminalRecord ? 'text-emerald-500' : 'text-slate-400'} />
              <span className={`text-xs font-bold ${formData.criminalRecord ? 'text-emerald-600' : 'text-slate-500'}`}>{t.docCriminal}</span>
              {formData.criminalRecord && <CheckCircle2 size={16} className="text-emerald-500" />}
            </div>
          </div>
        </section>

        <Button type="submit" className="w-full h-14 text-lg font-black shadow-xl shadow-emerald-500/20">
          {t.submitRequest}
        </Button>

      </form>
    </div>
  );
};
