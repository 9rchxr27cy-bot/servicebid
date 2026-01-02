
import React from 'react';
import { motion } from 'framer-motion';
import { Car, MapPin, Play, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { JobStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ServiceStatusHeaderProps {
  status: JobStatus;
}

export const ServiceStatusHeader: React.FC<ServiceStatusHeaderProps> = ({ status }) => {
  const { t } = useLanguage();

  if (status === 'OPEN' || status === 'NEGOTIATING' || status === 'CANCELLED') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'CONFIRMED':
        return {
          color: 'bg-blue-500',
          text: t.statusConfirmed,
          sub: t.subConfirmed,
          icon: <CheckCircle2 className="text-white w-5 h-5" />
        };
      case 'EN_ROUTE':
        return {
          color: 'bg-indigo-500',
          text: t.statusEnRoute,
          sub: t.subEnRoute,
          icon: <Car className="text-white w-5 h-5 animate-bounce" />
        };
      case 'ARRIVED':
        return {
          color: 'bg-emerald-500',
          text: t.statusArrived,
          sub: t.subArrived,
          icon: <MapPin className="text-white w-5 h-5" />
        };
      case 'IN_PROGRESS':
        return {
          color: 'bg-amber-500',
          text: t.statusInProgress,
          sub: t.subInProgress,
          icon: <Loader2 className="text-white w-5 h-5 animate-spin" />
        };
      case 'COMPLETED':
        return {
          color: 'bg-slate-700',
          text: t.statusCompleted,
          sub: t.subCompleted,
          icon: <CheckCircle2 className="text-white w-5 h-5" />
        };
      default:
        return { color: 'bg-slate-500', text: status, sub: '', icon: null };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-20"
    >
      <div className="px-4 py-3 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
            {config.text}
          </h4>
          <p className="text-xs text-slate-500 truncate">
            {config.sub}
          </p>
        </div>
        {status === 'IN_PROGRESS' && (
           <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded animate-pulse">
              {t.recording}
           </div>
        )}
      </div>
      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
        <motion.div 
            className={`h-full ${config.color}`} 
            initial={{ width: '0%' }}
            animate={{ 
                width: status === 'CONFIRMED' ? '20%' : 
                       status === 'EN_ROUTE' ? '40%' :
                       status === 'ARRIVED' ? '60%' :
                       status === 'IN_PROGRESS' ? '80%' : '100%'
            }}
            transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};
