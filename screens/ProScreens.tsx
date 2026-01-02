
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Euro, Send, X, TrendingUp, Calendar, CheckCircle2, DollarSign, LayoutDashboard, Briefcase, BarChart3, MessageSquare, History, ChevronRight, Clock, Check } from 'lucide-react';
import { Button, Input, Card, LevelBadge } from '../components/ui';
import { MOCK_JOBS, MOCK_PRO } from '../constants';
import { JobRequest, Proposal } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProScreensProps {
  onViewProfile: () => void;
  onBid: (jobId: string, amount: number) => void;
  onChatSelect?: (proposal: Proposal) => void;
}

const ProAnalytics: React.FC = () => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'>('WEEK');

    const stats = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        let filteredJobs = MOCK_JOBS.filter(j => j.status === 'COMPLETED' && j.finishedAt);
        
        // Filter Logic
        filteredJobs = filteredJobs.filter(j => {
            const date = new Date(j.finishedAt!).getTime();
            if (filter === 'TODAY') return date >= startOfDay;
            if (filter === 'WEEK') return date >= startOfWeek;
            if (filter === 'MONTH') return date >= startOfMonth;
            if (filter === 'YEAR') return date >= startOfYear;
            return true;
        });

        const totalEarned = filteredJobs.reduce((acc, j) => acc + (j.finalPrice || j.suggestedPrice || 0), 0);
        const count = filteredJobs.length;

        return { totalEarned, count, jobs: filteredJobs };
    }, [filter]);

    const filterLabels = {
        TODAY: t.filterToday,
        WEEK: t.filterWeek,
        MONTH: t.filterMonth,
        YEAR: t.filterYear
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" /> {t.financialPerformance}
            </h2>

            {/* Filters */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1">
                {(['TODAY', 'WEEK', 'MONTH', 'YEAR'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${filter === f ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {filterLabels[f]}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-emerald-500 text-white border-none">
                    <p className="text-emerald-100 text-xs font-bold uppercase mb-1">{t.totalEarnings}</p>
                    <p className="text-3xl font-black">€ {stats.totalEarned.toLocaleString()}</p>
                </Card>
                <Card className="p-4 bg-white dark:bg-slate-800">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">{t.jobsCompleted}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.count}</p>
                </Card>
            </div>

            {/* Job List for Period */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">{t.breakdown}</h3>
                {stats.jobs.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <BarChart3 className="mx-auto text-slate-300 w-10 h-10 mb-2" />
                        <p className="text-slate-400 text-sm">{t.noJobsPeriod}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stats.jobs.map(job => (
                            <div key={job.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">{job.category}</p>
                                        <p className="text-xs text-slate-400">{new Date(job.finishedAt!).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">+ €{job.finalPrice || job.suggestedPrice}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProMessagesList: React.FC<{ onSelect: (p: Proposal) => void }> = ({ onSelect }) => {
    // Simulating active chats based on jobs that are NOT Open (meaning accepted/in progress)
    // We create a mock proposal object to pass to the ChatScreen
    const activeChats = MOCK_JOBS.filter(j => j.status !== 'OPEN' && j.status !== 'CANCELLED' && j.status !== 'COMPLETED').map(job => ({
        id: `chat-${job.id}`,
        jobId: job.id,
        proId: MOCK_PRO.id,
        proName: "Alice J.", // Mock client name
        proAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        proLevel: "Client",
        proRating: 5,
        price: job.finalPrice || job.suggestedPrice || 0,
        message: job.status === 'CONFIRMED' ? "Booking confirmed! When can you arrive?" : "Service in progress...",
        createdAt: "Now",
        distance: job.distance,
        status: job.status
    } as Proposal));

    if (activeChats.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No active conversations.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activeChats.map(chat => (
                <div 
                    key={chat.id}
                    onClick={() => onSelect(chat)}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer group"
                >
                    <div className="relative">
                        <img src={chat.proAvatar} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <h4 className="font-bold text-slate-900 dark:text-white">{chat.proName}</h4>
                            <span className="text-xs text-slate-400">12:00</span>
                        </div>
                        <p className="text-sm text-slate-500 truncate group-hover:text-emerald-500 transition-colors">{chat.message}</p>
                    </div>
                    <ChevronRight className="text-slate-300" size={18} />
                </div>
            ))}
        </div>
    );
};

const ProHistoryList: React.FC = () => {
    const completedJobs = MOCK_JOBS.filter(j => j.status === 'COMPLETED');

    if (completedJobs.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No completed jobs yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {completedJobs.map(job => (
                <div key={job.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">{job.category}</span>
                            <span className="text-xs text-slate-400">{new Date(job.finishedAt || '').toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{job.description}</h4>
                    </div>
                    <div className="text-right">
                        <span className="block text-lg font-black text-emerald-500">+ € {job.finalPrice}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Paid</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const ProDashboard: React.FC<ProScreensProps> = ({ onViewProfile, onBid, onChatSelect }) => {
  const { t, tCategory } = useLanguage();
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MESSAGES' | 'HISTORY' | 'ANALYTICS'>('DASHBOARD');
  
  // State for simulated incoming jobs
  const [liveJobs, setLiveJobs] = useState<JobRequest[]>([]);

  // Initialize with open jobs on mount
  useEffect(() => {
      setLiveJobs(MOCK_JOBS.filter(j => j.status === 'OPEN'));
  }, []);

  // Simulate incoming jobs when on Dashboard tab
  useEffect(() => {
    if (activeTab === 'DASHBOARD') {
        const interval = setInterval(() => {
            const categories = ['Plumbing', 'Electrician', 'Gardening', 'Cleaning', 'IT Support', 'Moving'];
            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            const urgencyTypes = ['URGENT', 'THIS_WEEK', 'PLANNING'] as const;
            
            const newJob: JobRequest = {
                id: `job-sim-${Date.now()}`,
                clientId: `client-${Date.now()}`,
                category: randomCat as any,
                description: `New Request: ${randomCat} needed near city center. Auto-generated.`,
                photos: [],
                location: 'Simulated Location, LU',
                urgency: urgencyTypes[Math.floor(Math.random() * urgencyTypes.length)],
                suggestedPrice: Math.floor(Math.random() * 200) + 80,
                status: 'OPEN',
                createdAt: 'Just now',
                distance: (Math.random() * 8).toFixed(1) + ' km',
                proposalsCount: 0
            };
            
            setLiveJobs(prev => [newJob, ...prev]);
        }, 5000); // New job every 5 seconds

        return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleAcceptAndChat = () => {
      if (selectedJob && onChatSelect) {
          const proposal: Proposal = {
              id: `prop-${Date.now()}`,
              jobId: selectedJob.id,
              proId: MOCK_PRO.id,
              proName: "Alice J.", // Mock client Name for chat header
              proAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
              proLevel: "Client",
              proRating: 5,
              price: Number(bidAmount) || selectedJob.suggestedPrice || 0,
              message: "Chat started.",
              createdAt: "Just now",
              // CRITICAL: Set status to CONFIRMED to unlock workflow buttons in ChatScreen
              status: 'CONFIRMED' 
          };
          onChatSelect(proposal);
          setSelectedJob(null);
      }
  };

  const RadarMap = () => (
    <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden mb-6 border border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-32 h-32 rounded-full border border-slate-500"></div>
            <div className="w-64 h-64 rounded-full border border-slate-500 absolute"></div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-emerald-500/30 animate-pulse"></div>
        </div>

        {/* Random dots simulating requests */}
        <div className="absolute top-1/3 left-1/4"><div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div></div>
        <div className="absolute bottom-1/4 right-1/3"><div className="w-3 h-3 bg-amber-500 rounded-full"></div></div>
        <div className="absolute top-20 right-20"><div className="w-2 h-2 bg-slate-400 rounded-full"></div></div>

        <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm opacity-80 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t.radar}
        </div>
    </div>
  );

  return (
    <div className="p-4 pb-24">
      <div 
        onClick={onViewProfile}
        className="flex items-center justify-between mb-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors"
      >
         <div className="flex items-center gap-3">
             <img src={MOCK_PRO.avatar} className="w-10 h-10 rounded-full border border-slate-300" alt="Me" />
             <div>
                 <h3 className="font-bold text-sm">{MOCK_PRO.name}</h3>
                 <div className="flex items-center gap-2">
                     <LevelBadge level={MOCK_PRO.level || 'Novice'} />
                     <span className="text-xs text-slate-500">{MOCK_PRO.xp} XP</span>
                 </div>
             </div>
         </div>
         <div className="text-right">
             <span className="block text-xs text-slate-500 uppercase font-bold">{t.rating}</span>
             <span className="text-amber-500 font-bold">★ {MOCK_PRO.rating}</span>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'DASHBOARD' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'}`}
          >
            Opportunities
          </button>
          <button 
            onClick={() => setActiveTab('MESSAGES')}
            className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'MESSAGES' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'}`}
          >
            {t.messagesTab}
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'HISTORY' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'}`}
          >
            {t.historyTab}
          </button>
          <button 
            onClick={() => setActiveTab('ANALYTICS')}
            className={`pb-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'ANALYTICS' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'}`}
          >
            Analytics
          </button>
      </div>

      {activeTab === 'ANALYTICS' && <ProAnalytics />}
      
      {activeTab === 'MESSAGES' && <ProMessagesList onSelect={onChatSelect || (() => {})} />}
      
      {activeTab === 'HISTORY' && <ProHistoryList />}

      {activeTab === 'DASHBOARD' && (
      <>
        <RadarMap />
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">{t.nearby}</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Feed
            </div>
        </div>
        
        <div className="space-y-4">
            <AnimatePresence initial={false}>
            {liveJobs.map((job) => (
                <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    layout
                >
                    <Card onClick={() => { setSelectedJob(job); setBidAmount(job.suggestedPrice?.toString() || ''); }}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold uppercase">{tCategory(job.category)}</span>
                            <span className="text-slate-400 text-xs flex items-center gap-1">
                                <Clock size={10} /> {job.createdAt}
                            </span>
                        </div>
                        <h3 className="font-bold mb-2">{job.description}</h3>
                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {job.distance}
                            </div>
                            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                <Euro className="w-4 h-4" />
                                {t.offerLabel}: € {job.suggestedPrice}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
            </AnimatePresence>
        </div>
      </>
      )}

      {selectedJob && (
         <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
             <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl"
             >
                <button onClick={() => setSelectedJob(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                </button>

                <h3 className="text-xl font-bold mb-1">{tCategory(selectedJob.category)}</h3>
                <p className="text-slate-500 text-sm mb-6">{selectedJob.location} • {selectedJob.distance}</p>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6">
                    <p className="text-sm italic text-slate-700 dark:text-slate-300">"{selectedJob.description}"</p>
                    {selectedJob.photos.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto">
                            {selectedJob.photos.map((p, i) => (
                                <img key={i} src={p} className="w-16 h-16 rounded-lg object-cover" alt="job" />
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.yourOffer} (€)</label>
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <Input 
                            type="number" 
                            value={bidAmount} 
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="text-lg font-bold"
                        />
                        {/* Changed Button to trigger Chat immediately with CONFIRMED status */}
                        <Button 
                            className="flex-1 w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg" 
                            onClick={handleAcceptAndChat}
                        >
                            <Check size={20} className="mr-2" />
                            {t.acceptAndChat}
                        </Button>
                    </div>
                </div>
             </motion.div>
         </div>
      )}
    </div>
  );
};
