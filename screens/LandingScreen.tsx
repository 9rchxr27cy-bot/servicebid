
import React, { useState, useMemo } from 'react';
import { Search, Star, ShieldCheck, Clock, Wrench, Zap, Droplets, Flower2, Laptop, Truck, Scissors, Dog, Paintbrush, Bike, Sun, Sparkles, Building2, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Card } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingProps {
  onSelectCategory: (cat: string) => void;
  onRegisterPro: () => void;
  onOpenCompanyHelp?: () => void;
}

const ICON_MAP: Record<string, any> = {
  Sparkles: <Sparkles />,
  Zap: <Zap />,
  Droplets: <Droplets />,
  Wrench: <Wrench />,
  Paintbrush: <Paintbrush />,
  Bike: <Bike />,
  Sun: <Sun />,
  Flower2: <Flower2 />,
  Laptop: <Laptop />,
  Truck: <Truck />,
  Scissors: <Scissors />,
  Dog: <Dog />,
};

export const LandingScreen: React.FC<LandingProps> = ({ onSelectCategory, onRegisterPro, onOpenCompanyHelp }) => {
  const { t, tCategory } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return CATEGORIES;
    
    const search = searchTerm.toLowerCase();
    return CATEGORIES.filter(cat => {
      const translatedName = tCategory(cat.id).toLowerCase();
      return translatedName.includes(search);
    });
  }, [searchTerm, tCategory]);

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950">
      {/* Hero Section - Mantendo o estilo clean original */}
      <section className="px-6 py-12 md:py-20 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 
            className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight"
            dangerouslySetInnerHTML={{ __html: t.heroTitle }}
          />
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-xl mx-auto">
            {t.heroSubtitle}
          </p>
        </div>
        
        {/* Barra de Busca Centralizada */}
        <div className="relative max-w-xl mx-auto">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={24} />
          </div>
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-lg transition-all"
          />
        </div>
      </section>

      {/* Trust Badges - Estilo original de pílulas */}
      <section className="px-6 flex justify-center gap-3 overflow-x-auto scrollbar-hide pb-10">
        {[
          { icon: <ShieldCheck size={18} />, text: t.trustSecure },
          { icon: <Star size={18} />, text: t.trustStars },
          { icon: <Clock size={18} />, text: t.trustFast }
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
            <span className="text-emerald-500">{badge.icon}</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{badge.text}</span>
          </div>
        ))}
      </section>

      {/* Grid de Categorias - Estética original restaurada */}
      <section className="px-6 md:px-12 max-w-6xl mx-auto w-full space-y-6 pb-20">
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.popularCategories}</h2>
            <p className="text-slate-400 text-sm font-medium">{t.exploreServices}</p>
          </div>
          {searchTerm && (
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {filteredCategories.length} {t.results}
            </span>
          )}
        </div>
        
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((cat) => (
              <Card 
                key={cat.id} 
                onClick={() => onSelectCategory(cat.id)}
                className="group hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 active:scale-95 flex flex-col items-center justify-center p-8 gap-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:scale-110">
                  <span className="text-3xl">
                    {ICON_MAP[cat.icon] || <Zap />}
                  </span>
                </div>
                <span className="font-black text-slate-800 dark:text-slate-200 text-center text-xs uppercase tracking-widest leading-tight">
                  {tCategory(cat.id)}
                </span>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Search size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">{t.noServices} "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-emerald-600 font-black text-xs uppercase tracking-widest underline underline-offset-4"
            >
              {t.clearSearch}
            </button>
          </div>
        )}
      </section>

      {/* Seção PRO com CTA de Abertura de Empresa */}
      <section className="px-6 pb-20 max-w-6xl mx-auto w-full">
        <div className="bg-slate-900 dark:bg-emerald-900/10 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            
            {/* Esquerda: Registro Normal */}
            <div className="space-y-6">
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                {t.proCTA}
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                {t.proCTADesc}
                </p>
                <button 
                onClick={onRegisterPro}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 w-full md:w-auto"
                >
                {t.proCTABtn}
                </button>
            </div>

            {/* Direita: Abertura de Empresa (Novo) */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Building2 size={80} />
                </div>
                <h4 className="text-xl font-bold mb-2 text-white">{t.noCompany}</h4>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    We assist with administrative procedures to set up your legal status in Luxembourg.
                </p>
                <button 
                    onClick={onOpenCompanyHelp}
                    className="flex items-center gap-2 text-emerald-400 font-bold text-sm hover:text-emerald-300 transition-colors group-hover:translate-x-1 duration-300"
                >
                    {t.openCompanyBtn} <ChevronRight size={16} />
                </button>
            </div>

          </div>
          
          {/* Elemento Decorativo Original */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 translate-x-1/4 pointer-events-none">
            <Zap size={300} strokeWidth={1} />
          </div>
        </div>
      </section>
    </div>
  );
};
