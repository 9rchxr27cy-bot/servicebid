
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  History, 
  User, 
  Star, 
  MapPin, 
  Timer, 
  TrendingDown, 
  TrendingUp, 
  Euro, 
  Instagram,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search,
  FileText,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit,
  ArrowLeft,
  Eye,
  Activity
} from 'lucide-react';
import { Button, Card, LevelBadge, Input } from '../components/ui';
import { MOCK_PROPOSALS } from '../constants';
import { Proposal, JobRequest } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ProProfileModal, PortfolioOverlay } from '../components/ServiceModals';

interface ClientDashboardProps {
  jobs: JobRequest[];
  onSelectProposal: (p: Proposal) => void;
  onCreateNew: () => void;
  onViewProfile: () => void;
  onEdit: (job: JobRequest) => void; // New Prop
}

type DashboardView = 'REQUESTS' | 'MARKET' | 'HISTORY' | 'MESSAGES';

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ jobs, onSelectProposal, onCreateNew, onViewProfile, onEdit }) => {
  const { t, tCategory } = useLanguage();
  const [currentView, setCurrentView] = useState<DashboardView>('REQUESTS');
  const [viewingPro, setViewingPro] = useState<Proposal | null>(null);
  const [viewingPortfolio, setViewingPortfolio] = useState<Proposal | null>(null);
  
  // Market State
  const [selectedJobForMarket, setSelectedJobForMarket] = useState<JobRequest | null>(null);
  const [isMonitoringPaused, setIsMonitoringPaused] = useState(false);
  const [targetBudget, setTargetBudget] = useState(100);
  const [liveBids, setLiveBids] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [timeLeft, setTimeLeft] = useState(1800);

  // Switch to market when a job is selected for monitoring
  const handleGoToMarket = (job: JobRequest) => {
    setSelectedJobForMarket(job);
    setTargetBudget(job.suggestedPrice || 100);
    setIsMonitoringPaused(false); // Reset pause state
    setCurrentView('MARKET');
  };

  const handlePauseToggle = () => {
    setIsMonitoringPaused(!isMonitoringPaused);
  };

  // Simulação de Leilão em tempo real
  useEffect(() => {
    if (currentView === 'MARKET' && !isMonitoringPaused && selectedJobForMarket) {
      const interval = setInterval(() => {
        const names = ['Marco L.', 'Sophie W.', 'Kevin D.', 'Luc T.'];
        const newBid: Proposal = {
          id: `bid-${Date.now()}`,
          jobId: selectedJobForMarket.id,
          proId: `pro-${Math.random()}`,
          proName: names[Math.floor(Math.random() * names.length)],
          proAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
          proLevel: 'Expert',
          proRating: 4.5 + Math.random() * 0.5,
          price: Math.floor(targetBudget * (0.8 + Math.random() * 0.4)),
          message: "I can start immediately. I have all the tools required.",
          distance: (Math.random() * 5).toFixed(1) + ' km',
          createdAt: 'Just now'
        };
        setLiveBids(prev => [newBid, ...prev].slice(0, 10));
      }, 8000); // Slower updates

      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(timer);
      };
    }
  }, [currentView, targetBudget, isMonitoringPaused, selectedJobForMarket]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const SidebarItem = ({ view, icon: Icon, label, count }: { view: DashboardView, icon: any, label?: string, count?: number }) => (
    <div className="relative group">
      <button 
        onClick={() => setCurrentView(view)}
        className={`p-3 rounded-2xl transition-all duration-300 relative ${
          currentView === view 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-500'
        }`}
      >
        <Icon size={24} />
        {count && count > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {count}
            </span>
        )}
      </button>
      <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 hidden sm:block">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Desktop Only */}
      <div className="hidden sm:flex flex-col w-24 bg-white dark:bg-slate-900 border-r dark:border-slate-800 items-center py-8 gap-8 z-20">
        <div 
          className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl cursor-pointer active:scale-90 transition-transform hover:rotate-90 duration-500" 
          onClick={onCreateNew}
          title={t.whatNeed}
        >
          <Plus size={24} />
        </div>
        
        <div className="w-10 h-px bg-slate-100 dark:bg-slate-800" />

        <nav className="flex flex-col gap-6 items-center w-full">
          <SidebarItem view="REQUESTS" icon={FileText} label={t.myRequests} count={jobs.filter(j => j.status === 'IN_PROGRESS').length} />
          {selectedJobForMarket && (
             <SidebarItem view="MARKET" icon={LayoutDashboard} label={t.liveMarket} />
          )}
          <SidebarItem view="MESSAGES" icon={MessageSquare} label="Messages" />
          <SidebarItem view="HISTORY" icon={History} label={t.historyTab} />
        </nav>

        <div className="mt-auto">
          <button onClick={onViewProfile} className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
            <User size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 sm:pb-8 h-[calc(100vh-64px)]">
        <AnimatePresence mode="wait">
          
          {/* VIEW: MY REQUESTS (LIST) */}
          {currentView === 'REQUESTS' && (
            <motion.div 
              key="requests"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-6 sm:p-8 max-w-5xl mx-auto"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t.myRequests}</h1>
                        <p className="text-slate-500 font-medium">{t.manageRequests}</p>
                    </div>
                    <Button onClick={onCreateNew} className="hidden sm:flex items-center gap-2">
                        <Plus size={18} /> {t.createFirstRequest}
                    </Button>
                </div>

                {jobs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">{t.noActiveRequests}</p>
                        <Button onClick={onCreateNew} variant="outline" className="mt-4">
                            {t.createFirstRequest}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {jobs.map((job, i) => (
                            <motion.div 
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="flex flex-col md:flex-row gap-6 p-6 hover:shadow-lg transition-all group border-l-4 border-l-emerald-500">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                                {tCategory(job.category)}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={12} /> {job.createdAt}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            {job.title || job.description}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                            <span className="flex items-center gap-1"><Euro size={14} /> {job.suggestedPrice}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button 
                                                onClick={() => onEdit(job)} 
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" 
                                                title={t.editRequest}
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title={t.deleteRequest}>
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        
                                        <Button 
                                            onClick={() => handleGoToMarket(job)}
                                            className="w-full md:w-auto bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/10 flex items-center gap-2"
                                        >
                                            <Activity size={18} className="text-emerald-500" />
                                            {t.goToMarket}
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
          )}

          {/* VIEW: LIVE MARKET */}
          {currentView === 'MARKET' && selectedJobForMarket ? (
            <motion.div 
              key="market"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="min-h-full"
            >
              <header className="sticky top-0 z-10 p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800">
                <div className="flex flex-col gap-6 max-w-6xl mx-auto">
                    {/* Top Bar: Back & Job Info */}
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setCurrentView('REQUESTS')}
                            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-500 transition-colors"
                        >
                            <ArrowLeft size={16} /> {t.back}
                        </button>
                        
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${isMonitoringPaused ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isMonitoringPaused ? t.monitoringPaused : t.monitoringActive}
                            <span className={`w-2 h-2 rounded-full ${isMonitoringPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{tCategory(selectedJobForMarket.category)}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs font-mono text-slate-400">ID: #{selectedJobForMarket.id.slice(-6)}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                {selectedJobForMarket.title || selectedJobForMarket.description}
                            </h2>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={handlePauseToggle}
                                className={`p-3 rounded-xl transition-all flex items-center gap-2 ${isMonitoringPaused ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-emerald-500'}`}
                            >
                                {isMonitoringPaused ? <PlayCircle size={24} /> : <PauseCircle size={24} />}
                                <span className="font-bold text-sm hidden sm:inline">{isMonitoringPaused ? t.resumeMonitoring : t.pauseMonitoring}</span>
                            </button>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                            <div className="flex flex-col px-2">
                                <span className="text-[10px] uppercase font-black text-slate-400">{t.realTime}</span>
                                <span className={`font-mono font-bold ${isMonitoringPaused ? 'text-slate-400' : 'text-emerald-500'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Budget & Stats Strip */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/50">
                        <div className="flex-1 w-full sm:w-auto">
                            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest block mb-1">{t.targetBudget}</span>
                            <div className="flex items-center gap-2">
                            <Euro className="text-emerald-500" size={24} />
                            <input 
                                type="number" 
                                value={targetBudget}
                                onChange={(e) => setTargetBudget(Number(e.target.value))}
                                className="bg-transparent text-2xl font-black text-slate-900 dark:text-white focus:outline-none w-24"
                                disabled={isMonitoringPaused}
                            />
                            </div>
                        </div>
                        <div className="h-10 w-px bg-emerald-200 dark:bg-emerald-800 hidden sm:block" />
                        <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">{t.averageOffer}</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">€ {(targetBudget * 1.05).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
              </header>

              <main className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto opacity-transition">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.incomingOffers}</h2>
                  {!isMonitoringPaused && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live
                    </div>
                  )}
                </div>

                <div className={`grid gap-4 ${isMonitoringPaused ? 'opacity-50 grayscale transition-all duration-500' : 'transition-all duration-500'}`}>
                  <AnimatePresence initial={false}>
                    {liveBids.map((bid, idx) => {
                      const isSaving = bid.price <= targetBudget;
                      return (
                        <motion.div
                          key={bid.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                        >
                          <Card className={`relative overflow-hidden group transition-all hover:shadow-2xl border-2 ${isSaving ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-slate-100 dark:border-slate-800'}`}>
                            <div className="flex flex-col sm:flex-row justify-between gap-6">
                              <div className="flex gap-4">
                                <div className="relative shrink-0">
                                  <img src={bid.proAvatar} className="w-16 h-16 rounded-[1.25rem] object-cover shadow-lg" alt={bid.proName} />
                                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <LevelBadge level={bid.proLevel} />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{bid.proName}</h4>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md">
                                          <Star size={12} fill="currentColor" className="mr-1" /> {bid.proRating}
                                      </div>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setViewingPortfolio(bid); }}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-pink-300 dark:hover:border-pink-500/50 transition-colors group/insta"
                                      >
                                          <Instagram size={10} className="text-slate-400 group-hover/insta:text-pink-500" />
                                          <span className="text-[10px] font-black uppercase tracking-wide bg-gradient-to-r from-slate-500 to-slate-500 dark:from-slate-400 dark:to-slate-400 group-hover/insta:from-orange-400 group-hover/insta:via-pink-500 group-hover/insta:to-purple-600 bg-clip-text text-transparent transition-all">
                                              {t.viewPhotos}
                                          </span>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 mt-2 text-slate-500 text-xs font-medium">
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {bid.distance}</span>
                                    <span>•</span>
                                    <span>{bid.createdAt}</span>
                                  </div>
                                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                                    "{bid.message}"
                                  </p>
                                  
                                  <div className="mt-3">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setViewingPro(bid); }}
                                        className="text-xs font-bold text-slate-400 hover:text-emerald-500 underline decoration-slate-200 hover:decoration-emerald-200 underline-offset-4 transition-colors"
                                      >
                                        {t.viewFullProfile}
                                      </button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col justify-between items-end min-w-[120px]">
                                <div className="text-right w-full flex justify-between sm:block items-center mb-4 sm:mb-0">
                                  <div className={`text-3xl font-black ${isSaving ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500'}`}>
                                    € {bid.price}
                                  </div>
                                  <div className={`flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest ${isSaving ? 'text-emerald-500' : 'text-orange-400'}`}>
                                    {isSaving ? (
                                      <><TrendingDown size={12} /> {t.budgetFit}</>
                                    ) : (
                                      <><TrendingUp size={12} /> {t.aboveTarget}</>
                                    )}
                                  </div>
                                </div>
                                
                                <Button 
                                  className={`w-full sm:w-auto h-12 px-8 font-black uppercase tracking-widest transition-transform active:scale-95 ${isSaving ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-900 shadow-slate-900/20'}`}
                                  onClick={() => onSelectProposal(bid)}
                                  disabled={isMonitoringPaused}
                                >
                                  {t.acceptOffer}
                                </Button>
                              </div>
                            </div>
                            
                            {/* Visual progress for "Hot Bid" */}
                            {idx === 0 && !isMonitoringPaused && (
                              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 5 }}
                                  className="h-full bg-emerald-500"
                                />
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </main>
            </motion.div>
          ) : currentView === 'MARKET' ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <LayoutDashboard className="w-16 h-16 text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">{t.selectRequestToView}</h2>
                <Button onClick={() => setCurrentView('REQUESTS')} className="mt-4">{t.myRequests}</Button>
             </div>
          ) : null}

          {/* VIEW: MESSAGES (Chats) */}
          {currentView === 'MESSAGES' && (
            <motion.div 
              key="messages"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-6 sm:p-8 max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Messages</h2>
              <p className="text-slate-500 mb-8">Your active conversations with professionals.</p>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-3">
                {/* Mock Chats based on MOCK_PROPOSALS */}
                {MOCK_PROPOSALS.map((chat, i) => (
                  <motion.div 
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => onSelectProposal(chat)}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-emerald-500/30 transition-all cursor-pointer group flex gap-4"
                  >
                     <div className="relative shrink-0">
                        <img src={chat.proAvatar} className="w-14 h-14 rounded-xl object-cover" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                           <h3 className="font-bold text-slate-900 dark:text-white truncate">{chat.proName}</h3>
                           <span className="text-xs font-medium text-emerald-500">12:30 PM</span>
                        </div>
                        <p className="text-sm text-slate-500 truncate group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                           {chat.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">Electrician</span>
                           <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Offer Accepted</span>
                        </div>
                     </div>
                     <div className="flex flex-col justify-center">
                        <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                     </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW: HISTORY */}
          {currentView === 'HISTORY' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-6 sm:p-8 max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.historyTab}</h2>
              <p className="text-slate-500 mb-8">{t.manageRequests}</p>

              {jobs.filter(j => j.status === 'COMPLETED' || j.status === 'CANCELLED').length === 0 ? (
                 <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">{t.noRequestsDesc}</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {jobs.filter(j => j.status === 'COMPLETED' || j.status === 'CANCELLED').map((job, i) => (
                    <motion.div 
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 shrink-0">
                         <CheckCircle2 size={32} />
                      </div>
                      
                      <div className="flex-1">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">
                               {job.status}
                            </span>
                            <span className="text-xs font-bold text-slate-400">{job.createdAt}</span>
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{job.title || job.description}</h3>
                         <p className="text-sm text-slate-500 mb-4 line-clamp-1">{job.location}</p>
                      </div>

                      <div className="flex flex-col justify-center gap-2">
                         <Button variant="outline" size="sm" className="text-xs w-full">View Invoice</Button>
                         <Button size="sm" className="text-xs w-full">Book Again</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
        
        <AnimatePresence>
            {viewingPro && (
              <ProProfileModal 
                proposal={viewingPro} 
                onClose={() => setViewingPro(null)}
                onHire={onSelectProposal}
                onViewPortfolio={() => setViewingPortfolio(viewingPro)}
              />
            )}
            {viewingPortfolio && (
              <PortfolioOverlay 
                proposal={viewingPortfolio} 
                onClose={() => setViewingPortfolio(null)} 
              />
            )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation (Bottom) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 p-2 flex justify-around z-30 pb-safe">
        <button onClick={() => setCurrentView('REQUESTS')} className={`p-2 rounded-xl flex flex-col items-center ${currentView === 'REQUESTS' ? 'text-emerald-500' : 'text-slate-400'}`}>
           <FileText size={24} />
           <span className="text-[10px] font-bold mt-1">Requests</span>
        </button>
        <button onClick={() => selectedJobForMarket ? setCurrentView('MARKET') : setCurrentView('REQUESTS')} className={`p-2 rounded-xl flex flex-col items-center ${currentView === 'MARKET' ? 'text-emerald-500' : 'text-slate-400'}`}>
           <LayoutDashboard size={24} />
           <span className="text-[10px] font-bold mt-1">Market</span>
        </button>
        <button onClick={onCreateNew} className="p-4 bg-emerald-500 text-white rounded-full -mt-8 shadow-lg shadow-emerald-500/30">
           <Plus size={24} />
        </button>
        <button onClick={() => setCurrentView('MESSAGES')} className={`p-2 rounded-xl flex flex-col items-center ${currentView === 'MESSAGES' ? 'text-emerald-500' : 'text-slate-400'}`}>
           <MessageSquare size={24} />
           <span className="text-[10px] font-bold mt-1">Chat</span>
        </button>
        <button onClick={onViewProfile} className="p-2 text-slate-400 rounded-xl flex flex-col items-center">
           <User size={24} />
           <span className="text-[10px] font-bold mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};
