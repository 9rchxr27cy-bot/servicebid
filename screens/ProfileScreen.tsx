
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
  LayoutDashboard,
  Building2,
  FileBadge,
  Landmark,
  Copy,
  ExternalLink,
  MessageCircle,
  Eye,
  Smartphone,
  CreditCard,
  Crown,
  Clock,
  Ban,
  Unlock,
  Palette,
  LayoutTemplate,
  MessageSquare,
  Zap,
  FileText,
  Edit3,
  Bot
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card } from '../components/ui';
import { User, LanguageCode, AutoReplyTemplate } from '../types';
import { profileSchema, ProfileFormData } from '../utils/validation';
import { useLanguage } from '../contexts/LanguageContext';
import { useLuxAddress } from '../hooks/useLuxAddress';
import { InstaPortfolio } from '../components/InstaPortfolio';

interface ProfileScreenProps {
  user: User;
  onBack: () => void;
  onUpdate: (data: Partial<User>) => void;
}

type Tab = 'personal' | 'company' | 'address' | 'security' | 'portfolio' | 'website' | 'chat_settings';

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button 
        type="button"
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 md:w-full ${
            active 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
            : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
    >
        {icon}
        <span className="whitespace-nowrap">{label}</span>
    </button>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack, onUpdate }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [isSaving, setIsSaving] = useState(false);

  // --- WEBSITE STATE ---
  const [isSiteOnline, setIsSiteOnline] = useState(true);
  const [siteTheme, setSiteTheme] = useState('modern');
  const [siteColor, setSiteColor] = useState('emerald');
  const [linkCopied, setLinkCopied] = useState(false);

  // --- SMART REPLY STATE ---
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(user.autoReplyConfig?.enabled || false);
  const [replyDelay, setReplyDelay] = useState(user.autoReplyConfig?.delay || 0);
  const [replyTemplate, setReplyTemplate] = useState<AutoReplyTemplate>(user.autoReplyConfig?.template || 'DATA');
  const [customReplyMessage, setCustomReplyMessage] = useState(user.autoReplyConfig?.customMessage || '');

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

  // Mock handlers for company data updates
  const [companyIban, setCompanyIban] = useState(user.companyDetails?.iban || '');
  const [companyLicenseExpiry, setCompanyLicenseExpiry] = useState(user.companyDetails?.licenseExpiry || '');
  const [openingTime, setOpeningTime] = useState(user.companyDetails?.openingTime || '08:00');
  const [closingTime, setClosingTime] = useState(user.companyDetails?.closingTime || '18:00');
  
  // Working Days State
  const [workingDays, setWorkingDays] = useState<string[]>(user.companyDetails?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  // Fake card update state
  const [fakeCardLast4, setFakeCardLast4] = useState(user.companyDetails?.cardLast4 || '4242');
  const [isChangingCard, setIsChangingCard] = useState(false);

  const handleSaveCompanyData = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    if (user.companyDetails) {
        onUpdate({
            companyDetails: {
                ...user.companyDetails,
                iban: companyIban,
                licenseExpiry: companyLicenseExpiry,
                cardLast4: fakeCardLast4, // mock update
                openingTime: openingTime,
                closingTime: closingTime,
                workingDays: workingDays // Updated
            }
        });
    }
    setIsSaving(false);
    setIsChangingCard(false);
  };

  const handleSaveChatSettings = async () => {
      setIsSaving(true);
      // Simulate API call
      await new Promise(r => setTimeout(r, 800));
      onUpdate({
          autoReplyConfig: {
              enabled: autoReplyEnabled,
              delay: replyDelay,
              template: replyTemplate,
              customMessage: customReplyMessage
          }
      });
      setIsSaving(false);
  };

  const copyLink = () => {
      navigator.clipboard.writeText(`servicebid.lu/${user.name.toLowerCase().replace(/\s+/g, '-')}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareWhatsapp = () => {
      const url = `https://servicebid.lu/${user.name.toLowerCase().replace(/\s+/g, '-')}`;
      const text = `Check out my professional website: ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleUnblock = (userId: string) => {
      const currentBlocked = user.blockedUsers || [];
      const newBlocked = currentBlocked.filter(id => id !== userId);
      onUpdate({ blockedUsers: newBlocked });
  };

  const toggleDay = (dayKey: string) => {
      if (workingDays.includes(dayKey)) {
          setWorkingDays(workingDays.filter(d => d !== dayKey));
      } else {
          // Sort implies complex logic, so we just append. 
          // Ideally we would keep them sorted but for UI active state checking, order doesn't matter.
          setWorkingDays([...workingDays, dayKey]);
      }
  };

  // Day labels based on language
  const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabelsMap: Record<string, string[]> = {
      EN: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      PT: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
      FR: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      DE: ['M', 'D', 'M', 'D', 'F', 'S', 'S'], 
      LB: ['M', 'D', 'M', 'D', 'F', 'S', 'S']
  };
  const currentDayLabels = dayLabelsMap[language] || dayLabelsMap['EN'];

  // Visual Theme Component Helper
  const ThemePreview = ({ type, color }: { type: string, color: string }) => {
      const activeColorClass = `bg-${color}-500`;
      
      if (type === 'modern') {
          return (
              <div className="w-full h-16 bg-slate-50 dark:bg-slate-800 rounded-lg p-1.5 flex flex-col gap-1 overflow-hidden relative">
                  <div className={`w-full h-6 rounded-md ${activeColorClass} opacity-80`} />
                  <div className="flex gap-1">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-md" />
                      <div className="flex-1 flex flex-col gap-1">
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                          <div className="w-2/3 h-2 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                      </div>
                  </div>
              </div>
          );
      }
      if (type === 'classic') {
          return (
              <div className="w-full h-16 bg-slate-50 dark:bg-slate-800 rounded-lg p-1.5 flex flex-col gap-1 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="w-full h-2 bg-slate-900 dark:bg-slate-600 rounded-sm mb-1" />
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex gap-1 mt-1">
                      <div className="w-1/3 h-8 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                      <div className="w-2/3 flex flex-col gap-1">
                          <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-600 rounded-sm" />
                          <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-600 rounded-sm" />
                          <div className={`w-1/2 h-1.5 ${activeColorClass} rounded-sm`} />
                      </div>
                  </div>
              </div>
          );
      }
      if (type === 'bold') {
          return (
              <div className="w-full h-16 bg-slate-900 dark:bg-black rounded-lg p-1.5 flex flex-col gap-1 overflow-hidden">
                  <div className={`w-1/2 h-4 ${activeColorClass} rounded-sm`} />
                  <div className="w-full h-8 bg-slate-800 rounded-sm border border-slate-700" />
              </div>
          );
      }
      return ( // Minimal
          <div className="w-full h-16 bg-white dark:bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center gap-2 border border-slate-100 dark:border-slate-800">
              <div className={`w-8 h-8 rounded-full border-2 ${activeColorClass.replace('bg-', 'border-')}`} />
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
      );
  };

  const TemplateOption = ({ 
      id, 
      label, 
      desc, 
      icon: Icon 
  }: { id: AutoReplyTemplate, label: string, desc: string, icon: any }) => (
      <div 
          onClick={() => setReplyTemplate(id)}
          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${
              replyTemplate === id 
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
              : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
          }`}
      >
          <div className={`p-2 rounded-xl shrink-0 ${replyTemplate === id ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <Icon size={20} />
          </div>
          <div>
              <h4 className={`font-bold text-sm ${replyTemplate === id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {label}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {desc}
              </p>
          </div>
          {replyTemplate === id && (
              <div className="ml-auto bg-emerald-500 text-white rounded-full p-1">
                  <Check size={12} />
              </div>
          )}
      </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col gap-6 md:sticky md:top-16 md:h-[calc(100vh-64px)] shrink-0">
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
            <>
                <TabButton active={activeTab === 'company'} onClick={() => setActiveTab('company')} icon={<Building2 size={18} />} label={t.companyData} />
                <TabButton active={activeTab === 'website'} onClick={() => setActiveTab('website')} icon={<Smartphone size={18} />} label={t.myWebsite} />
                <TabButton active={activeTab === 'chat_settings'} onClick={() => setActiveTab('chat_settings')} icon={<MessageSquare size={18} />} label={t.chatSettings} />
                <TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={<Grid size={18} />} label="Portfolio" />
            </>
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

      <main className="flex-1 p-4 md:p-12 max-w-4xl mx-auto w-full mb-20 md:mb-0">
        <AnimatePresence mode="wait">
        
        {/* === CHAT SETTINGS TAB (PRO ONLY - SMART REPLY) === */}
        {activeTab === 'chat_settings' ? (
            <motion.div key="chat_settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 pb-24">
                <header>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        {t.smartReply}
                        <span className="bg-amber-400 text-slate-900 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider">PRO</span>
                    </h2>
                    <p className="text-slate-500 mt-2">{t.smartReplyDesc}</p>
                </header>

                <Card className="p-6">
                    {/* Toggle */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{t.smartReply}</h3>
                            <p className="text-xs text-slate-500">{t.enableAutoReply}</p>
                        </div>
                        <div 
                            onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${autoReplyEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${autoReplyEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                        </div>
                    </div>

                    {/* Delay Selection */}
                    <div className={`space-y-6 transition-opacity duration-300 ${autoReplyEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 block">
                                {t.activationTime}
                            </label>
                            <div className="flex gap-2">
                                {[0, 5, 15].map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setReplyDelay(time)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                            replyDelay === time 
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                        }`}
                                    >
                                        {time === 0 ? t.immediate : time === 5 ? t.mins5 : t.mins15}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Templates */}
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 block">
                                {t.botPersonality}
                            </label>
                            <div className="space-y-3">
                                <TemplateOption 
                                    id="AGILITY" 
                                    label={t.agilityMode} 
                                    desc={t.agilityDesc} 
                                    icon={Zap} 
                                />
                                <TemplateOption 
                                    id="DATA" 
                                    label={t.dataMode} 
                                    desc={t.dataDesc} 
                                    icon={FileText} 
                                />
                                <TemplateOption 
                                    id="CUSTOM" 
                                    label={t.customMode} 
                                    desc={t.customDesc} 
                                    icon={Edit3} 
                                />
                            </div>
                        </div>

                        {/* Custom Text Area */}
                        {replyTemplate === 'CUSTOM' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                                <label className="text-xs font-bold text-slate-500 mb-2 block">{t.yourMessage}</label>
                                <textarea 
                                    value={customReplyMessage}
                                    onChange={(e) => setCustomReplyMessage(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm h-32"
                                    placeholder={t.botMessageCustomDefault}
                                />
                            </motion.div>
                        )}
                    </div>
                </Card>

                {/* Preview Card */}
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-3xl opacity-80">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">{t.preview}</h4>
                    <div className="flex gap-4">
                        <div className="relative">
                            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-0.5 rounded-full border border-white">
                                <Bot size={10} className="text-white" />
                            </div>
                        </div>
                        <div className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-sm">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {replyTemplate === 'AGILITY' && t.botMessageAgility}
                                {replyTemplate === 'DATA' && t.botMessageData}
                                {replyTemplate === 'CUSTOM' && (customReplyMessage || t.botMessageCustomDefault)}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-2 block flex items-center gap-1">
                                <Bot size={10} /> {t.botMsgFooter}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button onClick={handleSaveChatSettings} isLoading={isSaving} className="px-8">{t.saveChanges}</Button>
                </div>
            </motion.div>
        ) : activeTab === 'website' ? (
            // ... (Rest of existing Website Tab code) ...
            <motion.div key="website" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8 pb-24">
                
                {/* Status Card */}
                <div className={`rounded-[2rem] p-6 shadow-xl border transition-all duration-500 ${isSiteOnline ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-slate-100 dark:bg-slate-950 border-transparent grayscale'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.siteStatus}</span>
                            <span className={`text-lg font-black ${isSiteOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {isSiteOnline ? t.online : t.offline}
                            </span>
                        </div>
                        <div 
                            onClick={() => setIsSiteOnline(!isSiteOnline)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${isSiteOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isSiteOnline ? 'translate-x-7' : 'translate-x-1'}`} />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex justify-between items-center mb-4 border border-slate-100 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                            servicebid.lu/{user.name.toLowerCase().replace(/\s+/g, '-')}
                        </span>
                        <button 
                            onClick={copyLink}
                            className={`p-2 rounded-xl shadow-sm transition-all ${linkCopied ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-emerald-500'}`}
                        >
                            {linkCopied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>

                    <Button 
                        onClick={shareWhatsapp}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-2xl flex items-center justify-center gap-2 shadow-emerald-500/20"
                    >
                        <MessageCircle size={20} /> {t.shareWhatsapp}
                    </Button>
                </div>

                {/* Appearance Settings */}
                <Card className="p-6">
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-6">
                        <Palette size={16} /> {t.appearance}
                    </h3>
                    
                    <div className="mb-8">
                        <label className="text-xs font-bold text-slate-500 mb-3 block">{t.selectTheme}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {['Modern', 'Classic', 'Bold', 'Minimal'].map(theme => (
                                <button
                                    key={theme}
                                    onClick={() => setSiteTheme(theme.toLowerCase())}
                                    className={`relative p-2 rounded-xl border-2 transition-all flex flex-col gap-2 ${
                                        siteTheme === theme.toLowerCase()
                                        ? `border-${siteColor}-500 ring-2 ring-${siteColor}-500/20 bg-slate-50 dark:bg-slate-900`
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <ThemePreview type={theme.toLowerCase()} color={siteColor} />
                                    <span className={`text-xs font-bold ${siteTheme === theme.toLowerCase() ? `text-${siteColor}-600 dark:text-${siteColor}-400` : 'text-slate-500'}`}>
                                        {t[`theme${theme}` as keyof typeof t] || theme}
                                    </span>
                                    {siteTheme === theme.toLowerCase() && (
                                        <div className={`absolute -top-2 -right-2 bg-${siteColor}-500 text-white p-1 rounded-full shadow-sm`}>
                                            <Check size={10} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-3 block">{t.accentColor}</label>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {['emerald', 'blue', 'purple', 'amber', 'rose'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSiteColor(color)}
                                    className={`w-10 h-10 rounded-full bg-${color}-500 transition-all flex items-center justify-center relative shrink-0 ${
                                        siteColor === color ? 'ring-4 ring-slate-200 dark:ring-slate-700 scale-110 shadow-lg' : 'hover:scale-105'
                                    }`}
                                >
                                    {siteColor === color && <Check size={16} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Preview & Info */}
                <Card className="p-6 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <LayoutTemplate size={120} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black mb-2">{t.previewSite}</h3>
                        <div className="flex items-center gap-2 text-emerald-400 mb-6">
                            <Info size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">{t.siteInfo}</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-sm">
                            {t.siteInfoDesc}
                        </p>
                        <Button 
                            variant="secondary"
                            className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold"
                            onClick={() => window.open(`https://servicebid.lu/preview/${user.name}`, '_blank')}
                        >
                            <Eye size={18} className="mr-2" /> {t.visitExternal}
                        </Button>
                    </div>
                </Card>

            </motion.div>
        ) : activeTab === 'portfolio' ? (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
             <header className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Portfolio</h2>
                <p className="text-slate-500">Showcase your best work to clients.</p>
             </header>
             <InstaPortfolio />
          </motion.div>
        ) : activeTab === 'company' ? (
            <motion.div key="company" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {/* ... (Existing Company Tab Content) ... */}
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.companyData}</h2>
                    <p className="text-slate-500">{t.companyDesc}</p>
                </header>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3 mb-8">
                    <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                        {t.cantEditHelp}
                    </p>
                </div>

                <form onSubmit={handleSaveCompanyData} className="space-y-8">
                    
                    {/* NEW SECTION: BUSINESS HOURS */}
                    <Card className="p-6 space-y-6">
                        <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Clock size={16} /> {t.businessHours}
                        </h3>
                        
                        {/* Working Days Selector */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-wider">{t.workingDays}</label>
                            <div className="flex gap-2 justify-between sm:justify-start">
                                {dayKeys.map((key, index) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => toggleDay(key)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                            workingDays.includes(key)
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {currentDayLabels[index]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <Input 
                                type="time"
                                label={t.openingTime}
                                value={openingTime}
                                onChange={e => setOpeningTime(e.target.value)}
                            />
                            <Input 
                                type="time"
                                label={t.closingTime}
                                value={closingTime}
                                onChange={e => setClosingTime(e.target.value)}
                            />
                        </div>
                    </Card>

                    {/* NEW SECTION: SUBSCRIPTION & BILLING */}
                    <Card className="p-6 space-y-6 border-l-4 border-l-amber-400">
                        <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Crown size={16} className="text-amber-500" /> {t.subscription}
                        </h3>
                        
                        {/* Current Plan */}
                        <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div>
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1 block">{t.currentPlan}</span>
                                <span className="text-lg font-black text-slate-900 dark:text-white">
                                    {user.companyDetails?.plan || 'Basic'} <span className="text-emerald-500 text-xs ml-1">{t.activePlan}</span>
                                </span>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs">{t.upgradeBtn}</Button>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 block">{t.paymentCard}</span>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <CreditCard className="text-slate-400" size={24} />
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">
                                            •••• {fakeCardLast4}
                                        </p>
                                        <p className="text-xs text-slate-500">{user.companyDetails?.cardBrand || 'Visa'} - Exp 12/28</p>
                                    </div>
                                </div>
                                <Button 
                                    type="button"
                                    onClick={() => {
                                        setIsChangingCard(true);
                                        // Mock Simulate random new card
                                        setTimeout(() => setFakeCardLast4(Math.floor(1000 + Math.random() * 9000).toString()), 500);
                                    }}
                                    variant="ghost" 
                                    className="h-14 w-14 rounded-xl border-2 border-dashed border-slate-300 text-slate-400"
                                >
                                    {isChangingCard ? <Loader2 className="animate-spin" /> : <Edit3 size={20} />}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Legal Info Card */}
                    <Card className="p-6 space-y-6">
                        <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Building2 size={16} /> {t.legalForm}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                                label={t.companyName} 
                                value={user.companyDetails?.legalName || ''} 
                                disabled 
                                className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
                            />
                            <Input 
                                label={t.legalForm} 
                                value={user.companyDetails?.legalType?.toUpperCase() || ''} 
                                disabled 
                                className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
                            />
                            <Input 
                                label={t.rcsNumber} 
                                value={user.companyDetails?.rcsNumber || 'N/A'} 
                                disabled 
                                className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
                            />
                            <Input 
                                label={t.tvaNumber} 
                                value={user.companyDetails?.vatNumber || ''} 
                                disabled 
                                className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent"
                            />
                        </div>
                    </Card>

                    {/* Banking */}
                    <Card className="p-6 space-y-6">
                        <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Landmark size={16} /> {t.banking}
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Editable field */}
                            <Input 
                                label={t.iban} 
                                value={companyIban}
                                onChange={e => setCompanyIban(e.target.value.toUpperCase())}
                                className="font-mono text-lg tracking-wide font-bold"
                            />
                        </div>
                    </Card>

                    <div className="pt-6 flex justify-end border-t border-slate-200 dark:border-slate-800">
                        <Button type="submit" isLoading={isSaving} className="px-10 h-14 text-lg">{t.saveChanges}</Button>
                    </div>
                </form>
            </motion.div>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                {/* ... existing Personal Info ... */}
                {/* Just ensure content isn't lost */}
                <header>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.personalInfo}</h2>
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

            {/* Address Tab (Unchanged but ensuring presence) */}
            {activeTab === 'address' && (
              <motion.div key="address" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                {/* ... existing address content ... */}
                <header>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.addressLogistics}</h2>
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
                  </div>
                  <Input label={t.houseNumber} {...register('number')} error={errors.number?.message} placeholder="42A" />
                </div>
              </motion.div>
            )}
            
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <header>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.security}</h2>
                  <p className="text-slate-500">Protection de vos données bancaires et acesso.</p>
                </header>
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl">
                   <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Double Authentification</h4>
                   <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">Recommandé pour les comptes avec transactions au Luxembourg.</p>
                   <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">Activer le 2FA</Button>
                </div>

                {/* BLOCKED USERS SECTION */}
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Ban size={18} className="text-red-500" /> {t.blockedUsers}
                    </h4>
                    
                    {user.blockedUsers && user.blockedUsers.length > 0 ? (
                        <div className="space-y-3">
                            {user.blockedUsers.map(blockedId => (
                                <div key={blockedId} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                            <UserIcon size={14} className="text-slate-400" />
                                        </div>
                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">User ID: {blockedId.slice(0, 8)}...</span>
                                    </div>
                                    <button 
                                        onClick={() => handleUnblock(blockedId)}
                                        className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Unlock size={12} /> {t.unblockContact}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">{t.noBlockedUsers}</p>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab !== 'chat_settings' && activeTab !== 'website' && (
            <div className="pt-10 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400 max-w-[200px] italic">Vos données sont stockées conformément au RGPD luxembourgeois.</p>
                <Button type="submit" isLoading={isSaving} className="px-10 h-14 text-lg">{t.saveChanges}</Button>
            </div>
          )}
        </form>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
};
