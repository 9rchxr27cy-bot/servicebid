
import React, { useState } from 'react';
import { Moon, Sun, ShieldCheck, ChevronDown, User as UserIcon, LogOut, X, Mail, Phone, Lock, Briefcase, User as UserCircle, LayoutDashboard } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from '../types';
import { useLanguage, LANGUAGES_LIST, Language } from '../contexts/LanguageContext';
import { Button, Input } from './ui';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleTheme: () => void;
  user: User | null;
  onLogout: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onDashboardClick: () => void;
  onLogin: (emailOrPhone: string, pass: string) => void;
  onSignUpClick: () => void;
  // New props for controlling modal externally
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  darkMode, 
  toggleTheme, 
  user, 
  onLogout, 
  onLogoClick, 
  onProfileClick,
  onDashboardClick,
  onLogin,
  onSignUpClick,
  authModalOpen,
  setAuthModalOpen
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const currentLangObj = LANGUAGES_LIST.find(l => l.code === language) || LANGUAGES_LIST[0];

  const LoginModal = () => {
    const [loginTab, setLoginTab] = useState<'email' | 'phone'>('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setAuthModalOpen(false)}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden z-[110]"
        >
          <div className="p-8">
            <button 
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.signIn}</h2>
              <p className="text-slate-500 text-sm mt-1">{t.welcomeSubtitle}</p>
            </div>

            {/* Quick Login Section */}
            <div className="mb-8 space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Quick Access (Demo)</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    onLogin('alice.j@email.lu', 'password123');
                    setAuthModalOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl hover:bg-emerald-100 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 group-active:scale-90 transition-transform">
                    <UserCircle size={18} />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 leading-none mb-1">Role: {t.imClient}</span>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Alice J.</span>
                  </div>
                </button>
                <button 
                   onClick={() => {
                    onLogin('roberto.pro@servicebid.lu', 'password123');
                    setAuthModalOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl hover:bg-blue-100 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0 group-active:scale-90 transition-transform">
                    <Briefcase size={18} />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 leading-none mb-1">Role: {t.imPro}</span>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Roberto S.</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300"><span className="bg-white dark:bg-slate-900 px-4 tracking-widest">Or login manual</span></div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => setLoginTab('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${loginTab === 'email' ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Mail size={16} /> {t.loginWithEmail}
              </button>
              <button 
                onClick={() => setLoginTab('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${loginTab === 'phone' ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Phone size={16} /> {t.loginWithPhone}
              </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              onLogin(loginTab === 'email' ? email : phone, password);
              setAuthModalOpen(false);
            }}>
              <AnimatePresence mode="wait">
                {loginTab === 'email' ? (
                  <motion.div 
                    key="email"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input 
                      label={t.email}
                      type="email"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="phone"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input 
                      label={t.phoneLabel}
                      type="tel"
                      placeholder="+352 6XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <Input 
                  label={t.password}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end">
                  <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-500">{t.forgotPassword}</button>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20">
                {t.signIn}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {t.dontHaveAccount} <button 
                  onClick={() => {
                    onSignUpClick();
                    setAuthModalOpen(false);
                  }}
                  className="text-emerald-600 font-bold hover:text-emerald-500 ml-1"
                >
                  {t.signUp}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={onLogoClick}
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-active:scale-90 transition-transform">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter hidden sm:block">ServiceBid<span className="text-emerald-500">.lu</span></span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="text-lg">{currentLangObj.flag}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 overflow-hidden"
                  >
                    {LANGUAGES_LIST.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code as Language);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${language === l.code ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <span className="text-lg">{l.flag}</span>
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group"
                >
                  <img src={user.avatar} className="w-9 h-9 rounded-xl border border-slate-100 dark:border-slate-700" alt={user.name} />
                  <span className="text-sm font-bold hidden sm:block">{user.name}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform group-hover:text-slate-600 ${isUserOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.loggedAs}</span>
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{user.email}</span>
                      </div>
                      <button 
                        onClick={() => { onDashboardClick(); setIsUserOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard size={18} /> {t.dashboard}
                      </button>
                      <button 
                        onClick={() => { onProfileClick(); setIsUserOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <UserIcon size={18} /> {t.profile}
                      </button>
                      <button 
                        onClick={() => { onLogout(); setIsUserOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={18} /> {t.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="h-11 px-6 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20"
              >
                {t.signIn}
              </Button>
            )}
          </div>
        </nav>

        <main className="max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
          {children}
        </main>

        <AnimatePresence>
          {authModalOpen && <LoginModal />}
        </AnimatePresence>
      </div>
    </div>
  );
};
