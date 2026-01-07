
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/Layout';
import { WelcomeScreen, ProOnboarding, CompanyCreationScreen } from './screens/AuthScreens';
import { LandingScreen } from './screens/LandingScreen';
import { WizardScreen } from './screens/WizardScreen';
import { ClientDashboard } from './screens/ClientScreens';
import { ProDashboard } from './screens/ProScreens';
import { ChatScreen } from './screens/ChatScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AllServicesScreen } from './screens/AllServicesScreen';
import { User, Proposal, JobRequest } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { DatabaseProvider, useDatabase } from './contexts/DatabaseContext';

const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // REMOVED: const [userJobs, setUserJobs] = useState<JobRequest[]>(MOCK_JOBS); -> Now using useDatabase
  const { users, jobs, registerUser, createJob, updateJob, loginUser, updateUser } = useDatabase();
  
  const [screen, setScreen] = useState<'LANDING' | 'WIZARD' | 'DASHBOARD' | 'CHAT' | 'WELCOME' | 'ONBOARDING' | 'PROFILE' | 'COMPANY_CREATION' | 'ALL_CATEGORIES'>('LANDING');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // State to hold a job created by a guest before they log in
  const [pendingJob, setPendingJob] = useState<Partial<JobRequest> | null>(null);
  // State to hold the job currently being edited
  const [editingJob, setEditingJob] = useState<JobRequest | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('servicebid_current_session_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // FIX: Always go to LANDING (Home Page) when clicking logo
  const handleLogoClick = () => {
    setEditingJob(null);
    setScreen('LANDING');
  };

  const handleStartWizard = (category: string) => {
    setSelectedCategory(category);
    setEditingJob(null); // Clear editing state when starting new
    setScreen('WIZARD');
  };

  const handleEditRequest = (job: JobRequest) => {
    setEditingJob(job);
    setSelectedCategory(job.category);
    setScreen('WIZARD');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('servicebid_current_session_user', JSON.stringify(user));
    
    // Check if there is a pending job from the wizard
    if (pendingJob) {
      const newJob: JobRequest = {
        ...(pendingJob as JobRequest),
        id: `job-${Date.now()}`,
        clientId: user.id,
        createdAt: new Date().toISOString(), // Use ISO string for realism
        status: 'OPEN',
        proposalsCount: 0
      };
      createJob(newJob);
      setPendingJob(null);
      setScreen('DASHBOARD');
    } else {
      setScreen('DASHBOARD');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('servicebid_current_session_user');
    setScreen('LANDING');
  };

  const handleSaveJob = (jobData: any) => {
    const commonData = {
      category: (editingJob ? editingJob.category : selectedCategory) as any,
      title: jobData.title,
      description: jobData.description,
      photos: jobData.photos,
      location: jobData.location,
      urgency: jobData.urgency,
      scheduledDate: jobData.scheduledDate,
      suggestedPrice: Number(jobData.suggestedPrice) || 0,
    };

    if (!currentUser) {
      // User is Guest: Save pending job and force login/signup
      setPendingJob(commonData);
      setScreen('WELCOME'); // Redirect to Auth
    } else {
      if (editingJob) {
        // UPDATE EXISTING VIA DB
        updateJob({ ...editingJob, ...commonData });
        setEditingJob(null);
      } else {
        // CREATE NEW VIA DB
        const newJob: JobRequest = {
            ...commonData,
            id: `job-${Date.now()}`,
            clientId: currentUser.id,
            status: 'OPEN',
            createdAt: new Date().toISOString(), // Use Real date
            proposalsCount: 0,
            photos: jobData.photos || []
        } as JobRequest;
        createJob(newJob);
      }
      setScreen('DASHBOARD');
    }
  };

  // --- ACTIONS: Favorites & Blocking ---
  const handleToggleFavorite = (targetUserId: string) => {
      if (!currentUser) return;
      const currentFavs = currentUser.favorites || [];
      const newFavs = currentFavs.includes(targetUserId) 
          ? currentFavs.filter(id => id !== targetUserId)
          : [...currentFavs, targetUserId];
      
      const updatedUser = { ...currentUser, favorites: newFavs };
      setCurrentUser(updatedUser);
      updateUser(updatedUser); // Update in DB
      localStorage.setItem('servicebid_current_session_user', JSON.stringify(updatedUser)); // Update Session
  };

  const handleToggleBlock = (targetUserId: string) => {
      if (!currentUser) return;
      const currentBlocked = currentUser.blockedUsers || [];
      const newBlocked = currentBlocked.includes(targetUserId)
          ? currentBlocked.filter(id => id !== targetUserId)
          : [...currentBlocked, targetUserId];
      
      const updatedUser = { ...currentUser, blockedUsers: newBlocked };
      setCurrentUser(updatedUser);
      updateUser(updatedUser); // Update in DB
      localStorage.setItem('servicebid_current_session_user', JSON.stringify(updatedUser)); // Update Session
  };

  const renderScreen = () => {
    switch (screen) {
      case 'LANDING':
        return (
          <LandingScreen 
            onSelectCategory={handleStartWizard} 
            onRegisterPro={() => setScreen('WELCOME')}
            onOpenCompanyHelp={() => setScreen('COMPANY_CREATION')}
            onViewAllServices={() => setScreen('ALL_CATEGORIES')}
          />
        );
      case 'ALL_CATEGORIES':
        return (
            <AllServicesScreen 
                onBack={() => setScreen('LANDING')}
                onSelectCategory={handleStartWizard}
            />
        );
      case 'WIZARD':
        return (
          <WizardScreen 
            category={selectedCategory} 
            currentUser={currentUser}
            initialData={editingJob} // Pass data for editing
            onComplete={handleSaveJob}
            onCancel={() => {
                setEditingJob(null);
                setScreen(currentUser ? 'DASHBOARD' : 'LANDING');
            }}
          />
        );
      case 'WELCOME':
        return <WelcomeScreen onLogin={(role) => {
          if (role === 'CLIENT') {
             setAuthModalOpen(true);
          }
          else setScreen('ONBOARDING');
        }} />;
      case 'ONBOARDING':
        return <ProOnboarding onComplete={(data) => {
          const newPro: User = {
            id: 'pro-' + Date.now(),
            name: data.fullName,
            email: data.email, // Use Real Input Data
            phone: data.phone, // Use Real Input Data
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.fullName}`,
            role: 'PRO',
            isVerified: false, // New pros need verification
            level: 'Novice',
            xp: 0,
            rating: 5.0, // Start with 5 stars (New)
            languages: ['EN', 'FR'],
            addresses: [{
                id: 'addr-pro',
                label: 'Business',
                street: data.street,
                number: data.houseNumber,
                postalCode: data.postalCode,
                locality: data.locality,
                hasElevator: false,
                easyParking: true
            }],
            companyDetails: {
                legalName: data.companyName || data.fullName,
                legalType: data.legalType,
                vatNumber: data.tvaNumber,
                rcsNumber: data.rcsNumber,
                licenseNumber: data.licenseNum,
                licenseExpiry: data.licenseExpiry,
                iban: data.iban,
                plan: data.selectedPlan
            }
          };
          registerUser(newPro); // Save to DB
          handleLogin(newPro);
        }} />;
      case 'COMPANY_CREATION':
        return <CompanyCreationScreen onBack={() => setScreen('LANDING')} />;
      case 'DASHBOARD':
        return currentUser?.role === 'CLIENT' ? (
          <ClientDashboard 
            // Filter jobs from DB for this client
            jobs={jobs.filter(j => j.clientId === currentUser.id)}
            onSelectProposal={(p) => {
              setActiveProposal(p);
              setScreen('CHAT');
            }}
            onCreateNew={() => setScreen('LANDING')} 
            onViewProfile={() => setScreen('PROFILE')}
            onEdit={handleEditRequest}
            favorites={currentUser.favorites} 
          />
        ) : (
          <ProDashboard 
            onViewProfile={() => setScreen('PROFILE')} 
            onBid={() => {}} 
            onChatSelect={(proposal) => {
                setActiveProposal(proposal);
                setScreen('CHAT');
            }}
          />
        );
      case 'CHAT':
        return activeProposal ? (
          <ChatScreen 
            proposal={activeProposal} 
            onBack={() => setScreen('DASHBOARD')}
            currentUserRole={currentUser?.role || 'CLIENT'}
            onComplete={() => setScreen('DASHBOARD')}
            // Pass logic functions to ChatScreen to pass to Modal
            onToggleFavorite={handleToggleFavorite}
            onToggleBlock={handleToggleBlock}
            isFavorited={currentUser?.favorites?.includes(activeProposal.proId)}
            isBlocked={currentUser?.blockedUsers?.includes(activeProposal.proId)}
          />
        ) : null;
      case 'PROFILE':
        return currentUser ? (
          <ProfileScreen 
            user={currentUser} 
            onBack={() => setScreen('DASHBOARD')} 
            onUpdate={(data) => {
              const updated = { ...currentUser, ...data };
              setCurrentUser(updated);
              updateUser(updated); // Sync DB
              localStorage.setItem('servicebid_current_session_user', JSON.stringify(updated));
            }}
          />
        ) : null;
      default:
        return <LandingScreen 
            onSelectCategory={handleStartWizard} 
            onRegisterPro={() => setScreen('WELCOME')} 
            onOpenCompanyHelp={() => setScreen('COMPANY_CREATION')}
            onViewAllServices={() => setScreen('ALL_CATEGORIES')}
        />;
    }
  };

  return (
    <Layout 
      darkMode={darkMode} 
      toggleTheme={() => setDarkMode(!darkMode)} 
      user={currentUser}
      onLogout={handleLogout}
      onLogoClick={handleLogoClick}
      onProfileClick={() => setScreen('PROFILE')}
      onDashboardClick={() => setScreen('DASHBOARD')}
      authModalOpen={authModalOpen}
      setAuthModalOpen={setAuthModalOpen}
      onLogin={(userKey, pass) => {
        // REAL DB LOGIN
        const user = loginUser(userKey, pass);
        if (user) {
            handleLogin(user);
        } else {
            // Fallback for Demo hardcoded users if not in DB (safety net)
            // But prefer creating new user if not found in real app
            const lowerKey = userKey.toLowerCase();
            if (lowerKey.includes('alice')) handleLogin(users.find(u => u.role === 'CLIENT')!);
            else if (lowerKey.includes('roberto')) handleLogin(users.find(u => u.role === 'PRO')!);
            else {
               // Create temp user if not found (Demo convenience)
               const newUser: User = {
                 id: `client-${Date.now()}`,
                 name: userKey.split('@')[0],
                 email: userKey,
                 avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userKey}`,
                 role: 'CLIENT',
                 languages: ['EN'],
                 addresses: [],
                 twoFactorEnabled: false
               };
               registerUser(newUser);
               handleLogin(newUser);
            }
        }
      }}
      onSignUpClick={() => setScreen('WELCOME')}
    >
      <AnimatePresence mode='wait'>
        <motion.div 
          key={screen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

const App: React.FC = () => (
  <DatabaseProvider>
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
  </DatabaseProvider>
);

export default App;
