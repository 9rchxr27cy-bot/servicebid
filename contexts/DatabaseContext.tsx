
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, JobRequest, Proposal, ChatMessage, JobStatus } from '../types';
import { MOCK_CLIENT, MOCK_PRO, MOCK_JOBS, MOCK_PROPOSALS } from '../constants';

interface DatabaseContextType {
  users: User[];
  jobs: JobRequest[];
  proposals: Proposal[];
  chats: Record<string, ChatMessage[]>; // Key is proposalId or jobId
  // Actions
  registerUser: (user: User) => void;
  updateUser: (user: User) => void;
  createJob: (job: JobRequest) => void;
  updateJob: (job: JobRequest) => void;
  createProposal: (proposal: Proposal) => void;
  addChatMessage: (chatId: string, message: ChatMessage) => void;
  getChatMessages: (chatId: string) => ChatMessage[];
  loginUser: (email: string, pass: string) => User | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or Fallback to Mocks
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sb_users');
    return saved ? JSON.parse(saved) : [MOCK_CLIENT, MOCK_PRO];
  });

  const [jobs, setJobs] = useState<JobRequest[]>(() => {
    const saved = localStorage.getItem('sb_jobs');
    return saved ? JSON.parse(saved) : MOCK_JOBS;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('sb_proposals');
    return saved ? JSON.parse(saved) : MOCK_PROPOSALS;
  });

  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('sb_chats');
    return saved ? JSON.parse(saved) : {};
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('sb_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('sb_jobs', JSON.stringify(jobs)), [jobs]);
  useEffect(() => localStorage.setItem('sb_proposals', JSON.stringify(proposals)), [proposals]);
  useEffect(() => localStorage.setItem('sb_chats', JSON.stringify(chats)), [chats]);

  // Actions
  const registerUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const loginUser = (email: string, pass: string): User | null => {
    // Simulating password check (accepts any password for demo if user exists)
    // In a real app, never store passwords like this.
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  };

  const createJob = (job: JobRequest) => {
    setJobs(prev => [job, ...prev]);
  };

  const updateJob = (updatedJob: JobRequest) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const createProposal = (proposal: Proposal) => {
    setProposals(prev => [proposal, ...prev]);
    // Also update Job proposal count
    setJobs(prev => prev.map(j => 
        j.id === proposal.jobId 
        ? { ...j, proposalsCount: (j.proposalsCount || 0) + 1 } 
        : j
    ));
  };

  const addChatMessage = (chatId: string, message: ChatMessage) => {
    setChats(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), message]
    }));
  };

  const getChatMessages = (chatId: string) => {
      return chats[chatId] || [];
  };

  return (
    <DatabaseContext.Provider value={{
      users,
      jobs,
      proposals,
      chats,
      registerUser,
      updateUser,
      createJob,
      updateJob,
      createProposal,
      addChatMessage,
      getChatMessages,
      loginUser
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
