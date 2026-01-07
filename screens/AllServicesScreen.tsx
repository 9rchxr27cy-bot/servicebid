
import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, Zap, Droplets, Flower2, Laptop, Truck, Scissors, Dog, Paintbrush, Bike, Sun, Sparkles, Home, Car, Monitor, Heart, Wrench, ShieldAlert, Hammer, Thermometer, Lock, Grid, Bug, Layout, Code, PenTool, Languages, FileText, Camera, Video, Smile, Dumbbell, BookOpen, Baby, Calendar, Music, ChefHat, Briefcase, GraduationCap, Glasses, Compass, Shield, Wifi, Smartphone, Anchor, Gift, Database, Users, TrendingUp, ShoppingBag, Globe, Calculator, Palette, Search as SearchIcon, Edit3 } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Card, Button } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { Category } from '../types';

interface AllServicesProps {
  onBack: () => void;
  onSelectCategory: (cat: string) => void;
}

// Massive Icon Map for 80+ Categories
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
  Hammer: <Hammer />,
  Home: <Home />,
  Thermometer: <Thermometer />,
  Lock: <Lock />,
  Grid: <Grid />,
  Bug: <Bug />,
  Layout: <Layout />,
  Car: <Car />,
  Code: <Code />,
  PenTool: <PenTool />,
  Languages: <Languages />,
  FileText: <FileText />,
  Camera: <Camera />,
  Video: <Video />,
  Smile: <Smile />,
  Dumbbell: <Dumbbell />,
  Heart: <Heart />,
  BookOpen: <BookOpen />,
  Baby: <Baby />,
  Calendar: <Calendar />,
  Music: <Music />,
  ChefHat: <ChefHat />,
  Briefcase: <Briefcase />,
  GraduationCap: <GraduationCap />,
  Glasses: <Glasses />, // For Bartender/Sommelier maybe
  Compass: <Compass />,
  Shield: <Shield />,
  Wifi: <Wifi />,
  Smartphone: <Smartphone />,
  Anchor: <Anchor />,
  Gift: <Gift />,
  Database: <Database />,
  Users: <Users />,
  TrendingUp: <TrendingUp />,
  ShoppingBag: <ShoppingBag />,
  Globe: <Globe />,
  Calculator: <Calculator />,
  Palette: <Palette />,
  Search: <SearchIcon />,
  Edit3: <Edit3 />
};

// Explicit Blacklist for Medical/Health terms (Double Safety)
const BLACKLIST_KEYWORDS = ['Doctor', 'Dentist', 'Nurse', 'Medical', 'Health', 'Therapy', 'Psychologist', 'Medicine', 'Hospital', 'Physio'];

export const AllServicesScreen: React.FC<AllServicesProps> = ({ onBack, onSelectCategory }) => {
  const { t, tCategory } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced Group Mapping Strategy (7 Sectors)
  const getSector = (catId: Category): string => {
      // Home & Construction
      if (['Cleaning', 'Electrician', 'Plumbing', 'Gardening', 'SolarEnergy', 'Painter', 'Carpenter', 'Roofer', 'HVAC', 'Locksmith', 'Flooring', 'PoolMaintenance', 'PestControl', 'InteriorDesign', 'Handyman', 'Mason', 'Welder', 'Glazier', 'ChimneySweep', 'SecuritySys', 'SmartHome', 'FengShui', 'Architect', 'Insulation', 'Demolition'].includes(catId)) {
          return 'sectorHome';
      }
      // Auto & Transport
      if (['Mechanic', 'ElectricVehicle', 'AutoBody', 'CarWash', 'Towing', 'Micromobility', 'Moving', 'Driver', 'DrivingInstructor', 'BoatMechanic', 'BikeRepair', 'CarDetailing', 'Logistics'].includes(catId)) {
          return 'sectorAuto';
      }
      // Tech & Digital
      if (['IT Support', 'WebDev', 'GraphicDesign', 'VideoEditor', 'SEO', 'SocialMedia', 'DataRecovery', 'PhoneRepair', 'ApplianceRepair', 'NetworkAdmin', 'CyberSecurity'].includes(catId)) {
          return 'sectorTech';
      }
      // Business & Legal
      if (['Accountant', 'Translator', 'Lawyer', 'Notary', 'TaxAdvisor', 'HRConsultant', 'Copywriter', 'BusinessCoach', 'VirtualAssistant'].includes(catId)) {
          return 'sectorBusiness';
      }
      // Events & Party
      if (['EventPlanner', 'DJ', 'Photographer', 'Caterer', 'Florist', 'Musician', 'Magician', 'Bartender', 'WeddingOfficiant', 'PartyDecorator'].includes(catId)) {
          return 'sectorEvents';
      }
      // Lifestyle & Care
      if (['Beauty', 'Pet Sitter', 'Hairdresser', 'MakeupArtist', 'PersonalTrainer', 'Yoga', 'Massage', 'Babysitter', 'Chef', 'Tailor', 'Shoemaker', 'PersonalShopper', 'LifeCoach', 'Astrologer', 'TravelPlanner', 'DogWalker', 'DogTrainer'].includes(catId)) {
          return 'sectorLifestyle';
      }
      // Education & Music
      if (['Tutor', 'LanguageTutor', 'MusicTeacher', 'ArtTeacher', 'CodingTutor', 'MathTutor'].includes(catId)) {
          return 'sectorEducation';
      }
      
      return 'sectorHome'; // Fallback
  };

  const SECTOR_ICONS: Record<string, any> = {
      sectorHome: <Home size={20} />,
      sectorAuto: <Car size={20} />,
      sectorTech: <Monitor size={20} />,
      sectorBusiness: <Briefcase size={20} />,
      sectorEvents: <Calendar size={20} />,
      sectorLifestyle: <Heart size={20} />,
      sectorEducation: <BookOpen size={20} />
  };

  const filteredGroupedCategories = useMemo(() => {
    const search = searchTerm.toLowerCase();
    
    // 1. Filter and Blacklist Check
    const validCats = CATEGORIES.filter(cat => {
        // Safety Check (Blacklist)
        const isRestricted = BLACKLIST_KEYWORDS.some(keyword => cat.id.includes(keyword) || cat.label.includes(keyword));
        if (isRestricted) return false;

        // Search Match
        if (!search) return true;
        const translatedName = tCategory(cat.id).toLowerCase();
        const originalName = cat.label.toLowerCase();
        return translatedName.includes(search) || originalName.includes(search);
    });

    // 2. Group by Sector
    const groups: Record<string, typeof CATEGORIES> = {};
    
    validCats.forEach(cat => {
        const sectorKey = getSector(cat.id);
        if (!groups[sectorKey]) groups[sectorKey] = [];
        groups[sectorKey].push(cat);
    });

    return groups;
  }, [searchTerm, tCategory]);

  const sectorKeys = Object.keys(filteredGroupedCategories);

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950">
      
      {/* Header / Hero */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t.allServicesTitle}</h1>
            </div>

            {/* Search Bar (Reused Style) */}
            <div className="relative w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Search size={20} />
                </div>
                <input 
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all border-none"
                    autoFocus
                />
            </div>
          </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 pb-20">
        
        {sectorKeys.length === 0 ? (
             <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold">{t.noServices} "{searchTerm}"</p>
                <button 
                    onClick={() => setSearchTerm('')}
                    className="text-emerald-600 font-black text-xs uppercase tracking-widest underline underline-offset-4 mt-4"
                >
                    {t.clearSearch}
                </button>
            </div>
        ) : (
            <div className="space-y-10">
                {sectorKeys.map(sector => (
                    <div key={sector}>
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                {SECTOR_ICONS[sector] || <Zap size={20} />}
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                                {t[sector as keyof typeof t] || sector}
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {filteredGroupedCategories[sector].map(cat => (
                                <Card 
                                    key={cat.id} 
                                    onClick={() => onSelectCategory(cat.id)}
                                    className="p-4 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group active:scale-95 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                                >
                                    <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        {React.cloneElement(ICON_MAP[cat.icon] || <Zap />, { size: 28 })}
                                    </div>
                                    <span className="text-xs font-bold text-center text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white leading-tight">
                                        {tCategory(cat.id)}
                                    </span>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Safety Note Footer */}
        <div className="mt-12 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-start gap-3 text-slate-500 text-xs">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <p>
                ServiceBid does not list medical or healthcare professionals. For medical emergencies, please contact 112 or visit a doctor.
            </p>
        </div>

      </div>
    </div>
  );
};
