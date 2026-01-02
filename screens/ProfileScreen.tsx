import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  ChevronRight, 
  Globe, 
  Check,
  Info,
  Car,
  ArrowUpCircle,
  Loader2,
  Building,
  Grid,
  LayoutDashboard
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card } from '../components/ui';
import { User, LanguageCode } from '../types';
import { profileSchema, ProfileFormData } from '../utils/validation';
import { useLanguage } from '../contexts/LanguageContext';
import { useLuxAddress } from '../hooks/useLuxAddress';
import { InstaPortfolio } from '../components/InstaPortfolio';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onUpdate: (data: Partial<User>) => void;
}

type Tab = 'personal' | 'address' | 'security' | 'portfolio';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack, onUpdate }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [isSaving, setIsSaving] = useState(false);

  const defaultFirstName = user.name.split(' ')[0];
  const defaultLastName = user.name.split(' ').slice(1).join(' ') || user.surname || '';

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setValue,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      email: user.email,
      phone: user.phone || '',
      languages: user.languages,
      postalCode: user.addresses[0]?.postalCode || '',
      locality: user.addresses[0]?.locality || '',
      street: user.addresses[0]?.street || '',
      number: user.addresses[0]?.number || '',
      floor: user.addresses[0]?.floor || '',
      residence: user.addresses[0]?.residence || '',
      hasElevator: user.addresses[0]?.hasElevator || false,
      easyParking: user.addresses[0]?.easyParking || false,
    }
  });

  const watchZip = watch('postalCode');
  const selectedLangs = watch('languages');
  const { data: luxAddr, loading: addrLoading } = useLuxAddress(watchZip);

  useEffect(() => {
    if (luxAddr?.city) {
      setValue('locality', luxAddr.city);
    }
  }, [luxAddr, setValue]);

  const languages: { code: LanguageCode, label: string }[] = [
    { code: 'LB', label: 'Lëtzebuergesch' },
    { code: 'FR', label: 'Français' },
    { code: 'DE', label: 'Deutsch' },
    { code: 'EN', label: 'English' },
    { code: 'PT', label: 'Português' },
  ];

  const handleToggleLang = (code: LanguageCode) => {
    const current = (selectedLangs as LanguageCode[]) || [];
    if (current.includes(code)) {
      setValue('languages', current.filter(c => c !== code));
    } else {
      setValue('languages', [...current, code]);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    
    onUpdate({
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      languages: data.languages as LanguageCode[],
      addresses: [{
        id: user.addresses[0]?.id || 'addr-1',
        label: 'Principal',
        street: data.street,
        number: data.number,
        postalCode: data.postalCode,
        locality: data.locality,
        floor: data.floor,
        residence: data.residence,
        hasElevator: data.hasElevator,
        easyParking: data.easyParking,
      }]
    });
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 md:sticky md:top-16 md:h-[calc(100vh-64px)]">
        <button onClick={onBack} className="text-sm font-bold text-slate-500 flex items-center gap-2 hover:text-emerald-500 transition-colors mb-4 md:hidden">
          <ChevronRight className="rotate-180 w-4 h-4" /> {t.back}
        </button>

        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
          {/* Dashboard Button in Sidebar */}
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all shrink-0 md:w-full border-2 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 mb-2 md:mb-4"
          >
            <LayoutDashboard size={18} />
            <span>{t.dashboard}</span>
          </button>

          <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} icon={<UserIcon size={18} />} label={t.personalInfo} />
          {user.role === 'PRO' && (
            <TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={<Grid size={18} />} label="Portfolio (Instagram)" />
          )}
          <TabButton active={activeTab === 'address'} onClick={() => setActiveTab('address')} icon={<MapPin size={18} />} label={t.addressLogistics} />
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldCheck size={18} />} label={t.security} />
        </div>
        
        <div className="mt-auto hidden md:block">
           <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50 p-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                <Info size={16} />
                <span className="text-xs font-black uppercase tracking-wider">{t.logisticsNote}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.luxNoteDesc}
              </p>
           </Card>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
        {activeTab !== 'portfolio' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <header>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t.personalInfo}</h2>
                  <p className="text-slate-500">{t.manageIdentity}</p>
                </header>

                <div className="flex items-center gap-8 mb-10">
                  <div className="relative">
                    <img src={user.avatar} className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-2xl" />
                    <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <p className="text-slate-500 text-sm">{user.email}</p>
                    {user.isVerified && <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase rounded-full">Identité Vérifiée</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Prénom" {...register('firstName')} error={errors.firstName?.message} placeholder="Alice" />
                  <Input label="Nom" {...register('lastName')} error={errors.lastName?.message} placeholder="Johnson" />
                  <div className="md:col-span-2">
                    <Input label="Numéro de Téléphone" {...register('phone')} error={errors.phone?.message} placeholder="+352 621 123 456" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black flex items-center gap-2 text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    <Globe size={16} className="text-emerald-500" /> {t.languages}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleToggleLang(lang.code)}
                        className={`px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all flex items-center gap-2 ${
                          (selectedLangs as string[])?.includes(lang.code) 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        {(selectedLangs as string[])?.includes(lang.code) && <Check size={16} />}
                        {lang.label}
                      </button>
                    ))}
                  </div>
                  {errors.languages && <p className="text-xs text-red-500 font-bold">{errors.languages.message}</p>}
                </div>
              </motion.div>
            )}

            {activeTab === 'address' && (
              <motion.div key="address" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <header>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t.addressLogistics}</h2>
                  <p className="text-slate-500">{t.smartAddress}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative">
                    <Input 
                      label={t.postalCode} 
                      {...register('postalCode')} 
                      error={errors.postalCode?.message} 
                      placeholder="Ex: 1234" 
                      maxLength={6}
                    />
                    {addrLoading && <Loader2 className="absolute right-3 top-10 w-4 h-4 animate-spin text-emerald-500" />}
                  </div>
                  <div className="md:col-span-2">
                    <Input label={t.locality} {...register('locality')} error={errors.locality?.message} disabled className="bg-slate-100 dark:bg-slate-800 font-bold" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.street}</label>
                    {luxAddr && luxAddr.streets.length > 0 ? (
                      <select 
                        {...register('street')} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                      >
                        <option value="">Sélectionnez uma rua...</option>
                        {luxAddr.streets.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <Input {...register('street')} placeholder="Saisissez d'abord le CP" disabled={!luxAddr} />
                    )}
                    {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>}
                  </div>
                  
                  <Input label={t.houseNumber} {...register('number')} error={errors.number?.message} placeholder="42A" />
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
                    <Building size={16} /> Détails Logistiques
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Résidence / Bloc" {...register('residence')} placeholder="Résidence Marie-Thérèse" />
                    <Input label="Étage" {...register('floor')} placeholder="3ème étage" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <LogisticsCheckbox 
                      label="Possède un ascenseur" 
                      checked={watch('hasElevator')} 
                      onChange={(val) => setValue('hasElevator', val)} 
                      icon={<ArrowUpCircle size={20} />} 
                    />
                    <LogisticsCheckbox 
                      label="Parking privado fácil" 
                      checked={watch('easyParking')} 
                      onChange={(val) => setValue('easyParking', val)} 
                      icon={<Car size={20} />} 
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <header>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t.security}</h2>
                  <p className="text-slate-500">Protection de vos données bancaires et acesso.</p>
                </header>
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl">
                   <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Double Authentification</h4>
                   <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">Recommandé pour les comptes avec transactions au Luxembourg.</p>
                   <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">Activer le 2FA</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-10 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
             <p className="text-xs text-slate-400 max-w-[200px] italic">Vos données sont stockées conformément au RGPD luxembourgeois.</p>
             <Button type="submit" isLoading={isSaving} className="px-10 h-14 text-lg">{t.saveChanges}</Button>
          </div>
        </form>
        ) : (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
             <header className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Portfolio</h2>
                <p className="text-slate-500">Showcase your best work to clients.</p>
             </header>
             <InstaPortfolio />
          </motion.div>
        )}
      </main>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all shrink-0 md:w-full border-2 ${
      active 
      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
      : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const LogisticsCheckbox: React.FC<{ label: string, checked: boolean, onChange: (v: boolean) => void, icon: React.ReactNode }> = ({ label, checked, onChange, icon }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
      checked 
      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'
    }`}
  >
    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
       {checked ? <Check size={14} /> : icon}
    </div>
    <span className="font-bold text-sm">{label}</span>
  </button>
);