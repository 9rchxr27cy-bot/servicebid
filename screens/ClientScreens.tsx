
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  History, 
  User, 
  Star, 
  MapPin, 
  Euro, 
  LayoutDashboard,
  Clock,
  Trash2,
  Edit,
  Activity,
  Heart,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { Button, Card } from '../components/ui';
import { MOCK_PRO } from '../constants';
import { Proposal, JobRequest } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfileModal, PortfolioOverlay } from '../components/ServiceModals';
import { useDatabase } from '../contexts/DatabaseContext';

interface ClientDashboardProps {
  jobs: JobRequest[];
  onSelectProposal: (p: Proposal) => void;
  onCreateNew: () => void;
  onViewProfile: () => void;
  onEdit: (job: JobRequest) => void;
  favorites?: string[];
}

type DashboardView = 'REQUESTS' | 'MARKET' | 'HISTORY' | 'MESSAGES' | 'FAVORITES';

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ jobs, onSelectProposal, onCreateNew, onViewProfile, onEdit, favorites = [] }) => {
  const { t, tCategory } = useLanguage();
  const { proposals, users } = useDatabase(); // Use DB
  
  const [currentView, setCurrentView] = useState<DashboardView>('REQUESTS');
  const [viewingPro, setViewingPro] = useState<Proposal | null>(null);
  const [viewingPortfolio, setViewingPortfolio] = useState<Proposal | null>(null);
  
  // Market State
  const [selectedJobForMarket, setSelectedJobForMarket] = useState<JobRequest | null>(null);
  const [liveBids, setLiveBids] = useState<Proposal[]>([]);

  // Switch to market
  const handleGoToMarket = (job: JobRequest) => {
    setSelectedJobForMarket(job);
    setCurrentView('MARKET');
  };

  // Real-time proposals update
  useEffect(() => {
    if (selectedJobForMarket) {
        // Filter proposals for this specific job from the real DB
        const jobProposals = proposals.filter(p => p.jobId === selectedJobForMarket.id);
        setLiveBids(jobProposals);
    }
  }, [selectedJobForMarket, proposals]); // React to DB changes

  // Filter Messages (Proposals that are accepted or have chat history)
  const myChats = proposals.filter(p => {
      // Determine if chat exists or status warrants chat
      const relevantJob = jobs.find(j => j.id === p.jobId);
      return relevantJob && (relevantJob.status !== 'OPEN' || p.status === 'CONFIRMED');
  });

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
      {/* Sidebar (Desktop) */}
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
          <SidebarItem view="MESSAGES" icon={MessageSquare} label={t.messagesTab} count={myChats.length} />
          <SidebarItem view="HISTORY" icon={History} label={t.historyTab} />
          <SidebarItem view="FAVORITES" icon={Heart} label={t.favoritesTab} />
        </nav>

        <div className="mt-auto">
          <button onClick={onViewProfile} className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
            <User size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 sm:pb-8 h-[calc(100vh-64px)]">
        <AnimatePresence mode="wait">
          
          {/* VIEW: MY REQUESTS (LIST) */}
          {currentView === 'REQUESTS' && (
            <motion.div 
              key="requests"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-4 md:p-8 max-w-5xl mx-auto"
            >
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t.myRequests}</h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base">{t.manageRequests}</p>
                    </div>
                    <Button onClick={onCreateNew} className="hidden sm:flex items-center gap-2">
                        <Plus size={18} /> {t.createFirstRequest}
                    </Button>
                </div>

                {jobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED').length === 0 ? (
                    <div className="text-center py-16 md:py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 mx-auto">
                        <FileText className="w-12 h-12 md:w-16 md:h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">{t.noActiveRequests}</p>
                        <Button onClick={onCreateNew} variant="outline" className="mt-4">
                            {t.createFirstRequest}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {jobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED').map((job, i) => (
                            <motion.div 
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 hover:shadow-lg transition-all group border-l-4 border-l-emerald-500">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] md:text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                                                {tCategory(job.category)}
                                            </span>
                                            <span className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            {job.title || job.description}
                                        </h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                            <span className="flex items-center gap-1"><Euro size={14} /> {job.suggestedPrice}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 justify-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => onEdit(job)} 
                                                className="p-2 md:p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors bg-slate-50 dark:bg-slate-800 md:bg-transparent" 
                                                title={t.editRequest}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                className="p-2 md:p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors bg-slate-50 dark:bg-slate-800 md:bg-transparent" 
                                                title={t.deleteRequest}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        
                                        <Button 
                                            onClick={() => handleGoToMarket(job)}
                                            className="flex-1 md:flex-none bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Activity size={16} className="text-emerald-500" />
                                            {t.goToMarket} ({proposals.filter(p => p.jobId === job.id).length})
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
          )}

          {/* VIEW: LIVE MARKET (For Specific Job) */}
          {currentView === 'MARKET' && selectedJobForMarket && (
            <motion.div 
              key="market"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 md:p-8 max-w-5xl mx-auto"
            >
               <div className="flex items-center gap-4 mb-6">
                   <button onClick={() => setCurrentView('REQUESTS')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><ArrowLeft size={20} /></button>
                   <div>
                       <h2 className="text-xl md:text-2xl font-black">{t.liveMarket}</h2>
                       <p className="text-slate-500 text-xs md:text-sm">{selectedJobForMarket.title}</p>
                   </div>
               </div>

               {liveBids.length === 0 ? (
                   <div className="text-center py-20">
                       <p className="text-slate-400 animate-pulse">{t.waitingClient}</p>
                   </div>
               ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {liveBids.map(bid => (
                           <Card key={bid.id} className="p-4 flex flex-col gap-4">
                               <div className="flex items-center gap-3">
                                   <img src={bid.proAvatar} className="w-12 h-12 rounded-full object-cover" />
                                   <div>
                                       <h4 className="font-bold">{bid.proName}</h4>
                                       <div className="flex items-center gap-1 text-xs text-amber-500 font-bold"><Star size={12} fill="currentColor"/> {bid.proRating}</div>
                                   </div>
                                   <div className="ml-auto text-xl font-black text-emerald-500">€ {bid.price}</div>
                               </div>
                               <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{bid.message}"</p>
                               <Button onClick={() => onSelectProposal(bid)}>{t.acceptAndChat}</Button>
                           </Card>
                       ))}
                   </div>
               )}
            </motion.div>
          )}

          {/* VIEW: MESSAGES */}
          {currentView === 'MESSAGES' && (
            <motion.div 
              key="messages"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 md:p-8 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{t.messagesTab}</h2>
              <div className="space-y-3 mt-6">
                {myChats.length === 0 ? (
                    <p className="text-slate-500">{t.noActiveRequests}</p>
                ) : (
                    myChats.map((chat, i) => (
                    <motion.div 
                        key={chat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => onSelectProposal(chat)}
                        className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-emerald-500/30 transition-all cursor-pointer group flex gap-4"
                    >
                        <div className="relative shrink-0">
                            <img src={chat.proAvatar} className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{chat.proName}</h3>
                            <p className="text-sm text-slate-500 truncate">{chat.message}</p>
                        </div>
                    </motion.div>
                    ))
                )}
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
              className="p-4 md:p-8 max-w-4xl mx-auto"
            >
               <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{t.historyTab}</h2>
               <div className="space-y-4 mt-6">
                   {jobs.filter(j => j.status === 'COMPLETED').map(job => (
                       <Card key={job.id} className="p-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
                           <div className="min-w-0 flex-1 mr-4">
                               <h4 className="font-bold truncate">{job.title || job.description}</h4>
                               <p className="text-xs text-slate-500">{new Date(job.finishedAt!).toLocaleDateString()}</p>
                           </div>
                           <span className="font-black text-emerald-500 whitespace-nowrap">€ {job.finalPrice}</span>
                       </Card>
                   ))}
                   {jobs.filter(j => j.status === 'COMPLETED').length === 0 && <p className="text-slate-500">{t.noRequestsDesc}</p>}
               </div>
            </motion.div>
          )}

          {/* VIEW: FAVORITES */}
          {currentView === 'FAVORITES' && (
            <motion.div 
              key="favorites"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 md:p-8 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{t.favoritesTab}</h2>
              <p className="text-slate-500 mb-8">Your trusted professionals.</p>

              {favorites.length === 0 ? (
                 <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">{t.noFavorites}</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {users.filter(u => favorites.includes(u.id) && u.role === 'PRO').map(pro => (
                    <Card key={pro.id} className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all">
                       <img src={pro.avatar} className="w-16 h-16 rounded-2xl object-cover" />
                       <div>
                          <h4 className="font-bold text-lg">{pro.name}</h4>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                             <Star size={14} className="text-amber-500 fill-current" /> {pro.rating}
                          </div>
                       </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
        
        <AnimatePresence>
            {viewingPro && (
              <UserProfileModal
                user={{
                  id: viewingPro.proId,
                  name: viewingPro.proName,
                  avatar: viewingPro.proAvatar,
                  role: 'PRO',
                  rating: viewingPro.proRating,
                  level: viewingPro.proLevel,
                  languages: ['PT', 'FR', 'EN']
                }} 
                onClose={() => setViewingPro(null)}
                onHire={() => onSelectProposal(viewingPro)}
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
        <button onClick={() => setCurrentView('FAVORITES')} className={`p-2 rounded-xl flex flex-col items-center ${currentView === 'FAVORITES' ? 'text-emerald-500' : 'text-slate-400'}`}>
           <Heart size={24} />
           <span className="text-[10px] font-bold mt-1">Favs</span>
        </button>
      </div>
    </div>
  );
};
