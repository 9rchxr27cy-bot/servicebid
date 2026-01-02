
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
import { User, Proposal, JobRequest } from './types';
import { MOCK_CLIENT, MOCK_PRO, MOCK_JOBS } from './constants';
import { LanguageProvider } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userJobs, setUserJobs] = useState<JobRequest[]>(MOCK_JOBS);
  const [screen, setScreen] = useState<'LANDING' | 'WIZARD' | 'DASHBOARD' | 'CHAT' | 'WELCOME' | 'ONBOARDING' | 'PROFILE' | 'COMPANY_CREATION'>('LANDING');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // State to hold a job created by a guest before they log in
  const [pendingJob, setPendingJob] = useState<Partial<JobRequest> | null>(null);
  // State to hold the job currently being edited
  const [editingJob, setEditingJob] = useState<JobRequest | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('servicebid_user');
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
    localStorage.setItem('servicebid_user', JSON.stringify(user));
    
    // Check if there is a pending job from the wizard
    if (pendingJob) {
      const newJob: JobRequest = {
        ...(pendingJob as JobRequest),
        id: `job-${Date.now()}`,
        clientId: user.id,
        createdAt: 'Just now',
        status: 'OPEN',
        proposalsCount: 0
      };
      setUserJobs(prev => [newJob, ...prev]);
      setPendingJob(null);
      setScreen('DASHBOARD');
    } else {
      setScreen('DASHBOARD');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('servicebid_user');
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
        // UPDATE EXISTING
        setUserJobs(prev => prev.map(job => 
            job.id === editingJob.id ? { ...job, ...commonData } : job
        ));
        setEditingJob(null);
      } else {
        // CREATE NEW
        const newJob: JobRequest = {
            ...commonData,
            id: `job-${Date.now()}`,
            clientId: currentUser.id,
            status: 'OPEN',
            createdAt: 'Just now',
            proposalsCount: 0,
            photos: jobData.photos || []
        } as JobRequest;
        setUserJobs(prev => [newJob, ...prev]);
      }
      setScreen('DASHBOARD');
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'LANDING':
        return (
          <LandingScreen 
            onSelectCategory={handleStartWizard} 
            onRegisterPro={() => setScreen('WELCOME')}
            onOpenCompanyHelp={() => setScreen('COMPANY_CREATION')}
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
            email: 'pro@servicebid.lu',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.fullName}`,
            role: 'PRO',
            isVerified: false,
            level: 'Novice',
            xp: 0,
            rating: 5.0,
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
            }]
          };
          handleLogin(newPro);
        }} />;
      case 'COMPANY_CREATION':
        return <CompanyCreationScreen onBack={() => setScreen('LANDING')} />;
      case 'DASHBOARD':
        return currentUser?.role === 'CLIENT' ? (
          <ClientDashboard 
            jobs={userJobs}
            onSelectProposal={(p) => {
              setActiveProposal(p);
              setScreen('CHAT');
            }}
            onCreateNew={() => setScreen('LANDING')} // FIX: Go to Landing/Categories
            onViewProfile={() => setScreen('PROFILE')}
            onEdit={handleEditRequest} 
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
              localStorage.setItem('servicebid_user', JSON.stringify(updated));
            }}
          />
        ) : null;
      default:
        return <LandingScreen onSelectCategory={handleStartWizard} onRegisterPro={() => setScreen('WELCOME')} onOpenCompanyHelp={() => setScreen('COMPANY_CREATION')} />;
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
        const lowerKey = userKey.toLowerCase();
        
        if (lowerKey.includes('roberto') || lowerKey.includes('pro')) {
          handleLogin(MOCK_PRO);
        } else if (lowerKey === 'alice.j@email.lu') {
           handleLogin(MOCK_CLIENT);
        } else {
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
           handleLogin(newUser);
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
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
