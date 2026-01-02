
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Loader2, X, ExternalLink, Zap, RefreshCw, Grid } from 'lucide-react';
import { Button, Card } from './ui';
import { instagramService, InstagramMedia } from '../services/instagramService';
import { useLanguage } from '../contexts/LanguageContext';

export const InstaPortfolio: React.FC = () => {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<InstagramMedia | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const connected = instagramService.isConnected();
    setIsConnected(connected);
    if (connected) {
      loadMedia();
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    await instagramService.initiateAuth();
    setIsConnected(true);
    await loadMedia();
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    instagramService.disconnect();
    setIsConnected(false);
    setMedia([]);
  };

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const data = await instagramService.getMedia();
      setMedia(data);
    } catch (error) {
      console.error("Failed to load Instagram media", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20 transform rotate-6">
          <Instagram className="text-white w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          {t.connectPortfolio}
        </h3>
        <p className="text-slate-500 max-w-md mb-8">
          {t.connectPortfolioDesc}
        </p>
        <Button 
          onClick={handleConnect} 
          disabled={isLoading}
          className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white h-14 px-8 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-transform"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Instagram size={20} />}
          {isLoading ? t.connecting : t.connectBtn}
        </Button>
        <p className="mt-4 text-xs text-slate-400 font-medium flex items-center gap-1">
          <Zap size={12} className="text-emerald-500" /> {t.autoSync}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
            <Instagram size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm">{t.instaConnected}</h4>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
                <span className="text-[10px] text-slate-400">• {media.length} {t.itemsSynced}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={loadMedia} disabled={isLoading}>
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                {t.disconnect}
            </Button>
        </div>
      </div>

      {isLoading && media.length === 0 ? (
        <div className="grid grid-cols-3 gap-1 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
          {media.map((item) => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              onClick={() => setSelectedMedia(item)}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url}
                alt={item.caption || 'Instagram content'}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-2">
                 {item.media_type === 'VIDEO' && <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><Zap size={12} className="text-white" /></div>}
                 <p className="text-[10px] text-white line-clamp-2 font-medium">{item.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Internal Modal - Anti Leakage */}
      <AnimatePresence>
        {selectedMedia && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMedia(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              layoutId={selectedMedia.id}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[80vh]"
            >
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px]">
                {selectedMedia.media_type === 'VIDEO' ? (
                   <video 
                     src={selectedMedia.media_url} 
                     controls 
                     className="max-h-full max-w-full object-contain"
                     poster={selectedMedia.thumbnail_url}
                   />
                ) : (
                    <img
                    src={selectedMedia.media_url}
                    alt="Detail"
                    className="max-h-full max-w-full object-contain"
                    />
                )}
              </div>

              <div className="w-full md:w-80 p-6 flex flex-col bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-[2px]">
                            <div className="w-full h-full bg-slate-200 rounded-full" />
                        </div>
                    </div>
                    <span className="font-bold text-sm">@roberto.pro</span>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-6">
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedMedia.caption || t.noCaption}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block uppercase tracking-widest">
                        {t.postedOn} {new Date(selectedMedia.timestamp).toLocaleDateString()}
                    </span>
                </div>

                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black h-12 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95">
                  {t.wantService}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
