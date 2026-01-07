
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Star, ArrowLeft, Tag, X, AlertTriangle, Check, CreditCard, Car, MapPin, Play, Square, FileText, Download, RotateCcw, Lock, Bot } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { Proposal, ChatMessage, JobStatus, JobRequest } from '../types';
import { UserProfileModal, PortfolioOverlay } from '../components/ServiceModals';
import { useLanguage } from '../contexts/LanguageContext';
import { ServiceStatusHeader } from '../components/ServiceStatusHeader';
import { MOCK_CLIENT, MOCK_PRO } from '../constants';
import { createInvoiceObject, downloadInvoicePDF } from '../utils/pdfGenerator';
import { useDatabase } from '../contexts/DatabaseContext';

interface ChatProps {
  proposal: Proposal;
  onBack: () => void;
  onComplete: (rating: number, review: string) => void;
  currentUserRole: 'CLIENT' | 'PRO';
  onToggleFavorite?: (id: string) => void;
  onToggleBlock?: (id: string) => void;
  isFavorited?: boolean;
  isBlocked?: boolean;
}

export const ChatScreen: React.FC<ChatProps> = ({ 
    proposal, 
    onBack, 
    onComplete, 
    currentUserRole,
    onToggleFavorite,
    onToggleBlock,
    isFavorited,
    isBlocked
}) => {
  const { t } = useLanguage();
  const { getChatMessages, addChatMessage, updateJob, jobs, users } = useDatabase();
  const [currentPrice, setCurrentPrice] = useState(proposal.price);
  
  // State Machine for Service Workflow - Synced with DB
  // Fallback: If proposal says CONFIRMED, trust it over OPEN job status initially
  const [jobStatus, setJobStatus] = useState<JobStatus>(() => {
      const dbJob = jobs.find(j => j.id === proposal.jobId);
      if (dbJob && dbJob.status !== 'OPEN') return dbJob.status;
      return proposal.status === 'CONFIRMED' ? 'CONFIRMED' : (proposal.status || 'NEGOTIATING');
  });

  const [startTime, setStartTime] = useState<number | null>(null);

  // Load messages from DB
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Rating State
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Modals State
  const [showProfile, setShowProfile] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [showExitGuard, setShowExitGuard] = useState(false);
  
  // Negotiation Logic State
  const [newOfferPrice, setNewOfferPrice] = useState('');
  const [newOfferReason, setNewOfferReason] = useState('');
  const [pendingConfirmationId, setPendingConfirmationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- SMART REPLY LOGIC (Pro Bot) ---
  useEffect(() => {
      const proUser = users.find(u => u.id === proposal.proId);
      
      if (currentUserRole === 'PRO' || !proUser || !proUser.autoReplyConfig?.enabled) return;

      const hasProRepliedManually = messages.some(m => m.senderId !== 'me' && m.senderId !== 'system' && !m.isAutoReply); 
      const hasBotReplied = messages.some(m => m.isAutoReply);

      if (hasProRepliedManually || hasBotReplied) return;

      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId === 'me') {
          const delayMs = (proUser.autoReplyConfig.delay === 0 ? 2000 : proUser.autoReplyConfig.delay * 60 * 1000); 
          
          const timer = setTimeout(() => {
              const freshMessages = getChatMessages(proposal.id);
              if (freshMessages.some(m => m.isAutoReply) || freshMessages.some(m => !m.isSystem && m.senderId === 'other' && !m.isAutoReply)) return;

              let botText = "";
              switch (proUser.autoReplyConfig?.template) {
                  case 'AGILITY':
                      botText = t.botMessageAgility;
                      break;
                  case 'DATA':
                      botText = t.botMessageData;
                      break;
                  case 'CUSTOM':
                      botText = proUser.autoReplyConfig?.customMessage || t.botMessageCustomDefault;
                      break;
              }

              const botMsg: ChatMessage = {
                  id: `bot-${Date.now()}`,
                  senderId: 'other', 
                  text: botText,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: 'text',
                  isAutoReply: true
              };
              handleAddMessage(botMsg);

          }, delayMs);

          return () => clearTimeout(timer);
      }

  }, [messages, currentUserRole, proposal.proId, users, t]);

  // --- INIT & SYNC ---
  useEffect(() => {
      const storedMsgs = getChatMessages(proposal.id);
      if (storedMsgs.length === 0) {
          const initMsg: ChatMessage = {
            id: '1', 
            senderId: 'system', 
            text: `${t.serviceAgreed} € ${proposal.price}. ${t.chatStarted}`, 
            timestamp: new Date().toLocaleTimeString(), 
            isSystem: true,
            type: 'text'
          };
          addChatMessage(proposal.id, initMsg);
          setMessages([initMsg]);
      } else {
          setMessages(storedMsgs);
      }

      const realJob = jobs.find(j => j.id === proposal.jobId);
      if (realJob && realJob.status !== 'OPEN') {
          setJobStatus(realJob.status);
      } else if (proposal.status === 'CONFIRMED') {
          setJobStatus('CONFIRMED');
      }
  }, [proposal.id, jobs]); // Added jobs to dependency to react to external updates

  const handleAddMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      addChatMessage(proposal.id, msg);
  };

  // --- DETERMINE CHAT PARTNER ---
  const chatPartner = {
    name: currentUserRole === 'CLIENT' ? proposal.proName : "Client", 
    avatar: currentUserRole === 'CLIENT' ? proposal.proAvatar : MOCK_CLIENT.avatar, 
    role: currentUserRole === 'CLIENT' ? 'PRO' : 'CLIENT' as 'PRO' | 'CLIENT',
    id: currentUserRole === 'CLIENT' ? proposal.proId : proposal.jobId 
  };

  // --- NAVIGATION GUARD ---
  const handleBackAttempt = () => {
      if (jobStatus !== 'COMPLETED' && jobStatus !== 'CANCELLED') {
          setShowExitGuard(true);
      } else {
          onBack();
      }
  };

  // --- SERVICE WORKFLOW ACTIONS (PRO ONLY) ---
  const updateServiceStatus = (newStatus: JobStatus) => {
      setJobStatus(newStatus);
      const realJob = jobs.find(j => j.id === proposal.jobId);
      if (realJob) {
          updateJob({ ...realJob, status: newStatus, finishedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined });
      }
      
      let sysMsgText = '';
      if (newStatus === 'EN_ROUTE') sysMsgText = t.msgOnWay;
      if (newStatus === 'ARRIVED') sysMsgText = t.msgArrived;
      if (newStatus === 'IN_PROGRESS') {
          sysMsgText = t.msgStarted;
          setStartTime(Date.now());
      }
      
      if (newStatus === 'REVIEW_PENDING') {
          const mockJob: JobRequest = {
              id: proposal.jobId,
              clientId: 'client-id',
              category: 'Plumbing', // fallback
              description: 'Service',
              photos: [],
              location: 'Luxembourg',
              urgency: 'THIS_WEEK',
              status: 'COMPLETED',
              createdAt: '',
              suggestedPrice: currentPrice,
              finalPrice: currentPrice
          };
          const invoice = createInvoiceObject(MOCK_PRO, chatPartner.name, mockJob, currentPrice);
          const invoiceMsg: ChatMessage = {
              id: `invoice-${Date.now()}`,
              senderId: 'system',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'invoice',
              invoiceDetails: invoice
          };
          handleAddMessage(invoiceMsg);
          sysMsgText = t.invoiceGen;
      }

      if (newStatus === 'COMPLETED') {
          sysMsgText = t.jobClosed;
      }

      if (sysMsgText) {
          const sysMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            text: sysMsgText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            type: 'text'
          };
          handleAddMessage(sysMsg);
      }
  };

  // --- CLIENT ACTIONS ---
  const handleClientConfirmCompletion = () => {
      // Step 2 part A: Client says "Yes, work is done"
  };

  const handleSubmitRating = () => {
      setJobStatus('PAYMENT_PENDING');
      const realJob = jobs.find(j => j.id === proposal.jobId);
      if (realJob) updateJob({ ...realJob, status: 'PAYMENT_PENDING' });
      
      const sysMsg: ChatMessage = {
          id: `sys-rated-${Date.now()}`,
          senderId: 'system',
          text: `Client rated: ${rating} Stars. Payment Verification Pending.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
          type: 'text'
      };
      handleAddMessage(sysMsg);
  };

  const handleProConfirmPayment = () => {
      updateServiceStatus('COMPLETED');
      onComplete(rating, review); 
  };

  const handleReopenChat = () => {
      setJobStatus('IN_PROGRESS'); 
      const realJob = jobs.find(j => j.id === proposal.jobId);
      if (realJob) updateJob({ ...realJob, status: 'IN_PROGRESS' });

      const sysMsg: ChatMessage = {
          id: `sys-reopen-${Date.now()}`,
          senderId: 'system',
          text: t.chatReopened,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
          type: 'text'
      };
      handleAddMessage(sysMsg);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        text: inputText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
    };
    handleAddMessage(newMessage);
    setInputText('');
  };

  const handleSendOffer = () => {
    if (!newOfferPrice || !newOfferReason) return;
    
    const offerMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'offer_update',
      offerDetails: {
        oldPrice: currentPrice,
        newPrice: Number(newOfferPrice),
        reason: newOfferReason,
        status: 'PENDING'
      }
    };

    handleAddMessage(offerMsg);
    setIsOfferModalOpen(false);
    setNewOfferPrice('');
    setNewOfferReason('');
  };

  const handleRespondToOffer = (msgId: string, accept: boolean) => {
    if (accept) {
       setPendingConfirmationId(msgId);
    } else {
       updateMessageStatus(msgId, 'REJECTED');
    }
  };

  const confirmAcceptOffer = () => {
    if (!pendingConfirmationId) return;
    const msg = messages.find(m => m.id === pendingConfirmationId);
    if (msg && msg.offerDetails) {
        setCurrentPrice(msg.offerDetails.newPrice);
        updateMessageStatus(pendingConfirmationId, 'ACCEPTED');
        if (jobStatus === 'NEGOTIATING') {
            setJobStatus('CONFIRMED');
            const realJob = jobs.find(j => j.id === proposal.jobId);
            if (realJob) updateJob({ ...realJob, status: 'CONFIRMED', finalPrice: msg.offerDetails.newPrice });
        }
        const sysMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            text: `${t.msgPriceUpdate} ${msg.offerDetails.newPrice}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            type: 'text'
        };
        handleAddMessage(sysMsg);
    }
    setPendingConfirmationId(null);
  };

  const updateMessageStatus = (msgId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const updatedMsgs = messages.map(m => {
        if (m.id === msgId && m.offerDetails) {
            return { ...m, offerDetails: { ...m.offerDetails, status } };
        }
        return m;
    });
    setMessages(updatedMsgs); 
  };

  const toggleTag = (tag: string) => {
      if (selectedTags.includes(tag)) {
          setSelectedTags(selectedTags.filter(t => t !== tag));
      } else {
          setSelectedTags([...selectedTags, tag]);
      }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, jobStatus]);

  // --- SUB-COMPONENTS ---
  const OfferBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    if (!msg.offerDetails) return null;
    const { oldPrice, newPrice, reason, status } = msg.offerDetails;
    const isMe = msg.senderId === 'me';
    const canInteract = !isMe && status === 'PENDING'; 

    return (
      <div className={`max-w-[85%] sm:max-w-[70%] p-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
         <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <Tag size={16} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">{t.proposalUpdate}</span>
         </div>
         <div className="p-4">
            <div className="flex items-end gap-3 mb-2">
                <span className="text-sm text-slate-400 line-through decoration-red-400">€ {oldPrice}</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">€ {newPrice}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-4">"{reason}"</p>
            {status === 'PENDING' ? (
                canInteract ? (
                    <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-9" onClick={() => handleRespondToOffer(msg.id, true)}>{t.acceptOffer}</Button>
                        <Button size="sm" variant="outline" className="flex-1 h-9 border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200" onClick={() => handleRespondToOffer(msg.id, false)}>Reject</Button>
                    </div>
                ) : (
                    <div className="text-xs text-center text-slate-400 font-medium py-1 bg-slate-50 dark:bg-slate-900 rounded-lg">Waiting for response...</div>
                )
            ) : (
                <div className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs ${status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}>
                    {status === 'ACCEPTED' ? <CheckCircle size={14} /> : <X size={14} />}
                    {status === 'ACCEPTED' ? t.offerAccepted : t.offerDeclined}
                </div>
            )}
         </div>
         <div className="px-3 pb-2 text-[10px] text-slate-400 text-right">{msg.timestamp}</div>
      </div>
    );
  };

  const InvoiceBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
      if (!msg.invoiceDetails) return null;
      const inv = msg.invoiceDetails;
      // Translation hook is already available in the parent, but we use keys from context.
      // Since this is inside ChatScreen which has useLanguage, we can assume parent's context is fine,
      // but t isn't passed down. We can use the parent 't' by defining this component inside ChatScreen or passing props.
      // Since it's defined inside ChatScreen, it has access to 't'.
      
      return (
          <div className="w-full max-w-[95%] sm:max-w-[90%] mx-auto my-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
             {/* Header */}
             <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                 <div className="flex items-center gap-2">
                     <FileText size={18} className="text-emerald-400" />
                     <span className="font-bold tracking-wider text-sm">{t.invoiceNo} {inv.id}</span>
                 </div>
                 <span className="text-[10px] opacity-70 font-mono">{new Date(inv.date).toLocaleDateString()}</span>
             </div>

             {/* Content */}
             <div className="p-5">
                 {/* Issuer & Client Info (Condensed) */}
                 <div className="flex justify-between text-xs mb-6 text-slate-500">
                     <div>
                         <span className="font-bold block text-slate-900 dark:text-white">{inv.issuer.legalName}</span>
                         <span>{inv.issuer.vatNumber}</span>
                     </div>
                     <div className="text-right">
                         <span className="block text-[10px] uppercase tracking-wider mb-0.5">{t.invBillTo}</span>
                         <span className="font-bold text-slate-900 dark:text-white">{inv.client.name}</span>
                     </div>
                 </div>

                 {/* Line Items */}
                 <div className="space-y-3 mb-6">
                     {inv.items.map((item, i) => (
                         <div key={i} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                             <div className="flex-1">
                                 <span className="font-medium text-slate-800 dark:text-slate-200">{item.description}</span>
                                 <div className="text-[10px] text-slate-400">Qty: {item.quantity} × €{item.unitPrice.toFixed(2)}</div>
                             </div>
                             <span className="font-mono font-bold text-slate-900 dark:text-white">€ {item.total.toFixed(2)}</span>
                         </div>
                     ))}
                 </div>

                 {/* Totals Section */}
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2">
                     <div className="flex justify-between text-xs text-slate-500">
                         <span>{t.invSubtotal}</span>
                         <span className="font-mono">€ {inv.subtotalHT.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-xs text-slate-500">
                         <span>{t.invVatAmt} ({inv.items[0]?.vatRate || 17}%)</span>
                         <span className="font-mono">€ {inv.totalVAT.toFixed(2)}</span>
                     </div>
                     <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between text-base font-black text-emerald-600 dark:text-emerald-400">
                         <span>{t.invTotalDue}</span>
                         <span>€ {inv.totalTTC.toFixed(2)}</span>
                     </div>
                 </div>

                 {/* Action */}
                 <Button
                     onClick={() => downloadInvoicePDF(inv)}
                     className="w-full mt-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 shadow-none border-none h-12"
                 >
                     <Download size={18} className="mr-2" /> {t.downloadPdf}
                 </Button>
             </div>
          </div>
      );
  };

  const WorkflowControls = () => {
      // Logic for what buttons to show based on jobStatus
      if (currentUserRole !== 'PRO') return null;
      const buttonBase = "flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95";

      switch (jobStatus) {
          case 'NEGOTIATING': 
          case 'OPEN':
             // If proposal is confirmed but status isn't synced yet, show start controls
             if (proposal.status === 'CONFIRMED') {
                 return <button onClick={() => updateServiceStatus('EN_ROUTE')} className={`${buttonBase} bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30`}><Car size={20} /> {t.actionOnWay}</button>;
             }
             return null;
          case 'CONFIRMED':
             return <button onClick={() => updateServiceStatus('EN_ROUTE')} className={`${buttonBase} bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30`}><Car size={20} /> {t.actionOnWay}</button>;
          case 'EN_ROUTE':
             return <button onClick={() => updateServiceStatus('ARRIVED')} className={`${buttonBase} bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30`}><MapPin size={20} /> {t.actionArrived}</button>;
          case 'ARRIVED':
              return <button onClick={() => updateServiceStatus('IN_PROGRESS')} className={`${buttonBase} bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30`}><Play size={20} /> {t.actionStart}</button>;
          case 'IN_PROGRESS':
              return <button onClick={() => updateServiceStatus('REVIEW_PENDING')} className={`${buttonBase} bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/30`}><Square size={20} fill="currentColor" /> {t.finishJob}</button>;
          case 'REVIEW_PENDING':
              return <div className="text-center text-xs font-bold text-slate-400 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">{t.waitingClient}</div>;
          case 'PAYMENT_PENDING':
              // Handled by parent wrapper usually, but safe fallback
              return <button onClick={handleProConfirmPayment} className={`${buttonBase} bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30`}><CreditCard size={20} /> {t.confirmPayment}</button>;
          default: 
             return null;
      }
  };

  const ClientConfirmationView = () => (
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="text-center">
              <h3 className="text-lg font-bold mb-1">{t.confirmWorkDone}</h3>
              <p className="text-sm text-slate-500 mb-4">{t.confirmWorkDoneDesc}</p>
              
              {/* Rating UI embedded */}
              <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110 focus:outline-none">
                          <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                      </button>
                  ))}
              </div>
              
              {rating > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {['Punctual', 'Clean', 'Professional', 'Friendly', 'Fair'].map(tag => (
                          <button 
                            key={tag} 
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${selectedTags.includes(tag) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-200 text-slate-500'}`}
                          >
                              {t[`tag${tag}` as keyof typeof t] || tag}
                          </button>
                      ))}
                  </div>
              )}

              <Button 
                onClick={handleSubmitRating} 
                disabled={rating === 0} 
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                  {t.yesFinished}
              </Button>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Service Status Header */}
      <ServiceStatusHeader status={jobStatus === 'REVIEW_PENDING' || jobStatus === 'PAYMENT_PENDING' ? 'IN_PROGRESS' : jobStatus} />

      {/* Chat Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
            <button onClick={handleBackAttempt}><ArrowLeft className="w-6 h-6 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" /></button>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity p-1 rounded-lg" onClick={() => setShowProfile(true)}>
                <div className="relative">
                    <img src={chatPartner.avatar} className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-700 object-cover" alt="User" />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-slate-900 rounded-full ${chatPartner.role === 'CLIENT' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                </div>
                <div>
                    <h3 className="font-bold text-sm leading-none flex items-center gap-1">{chatPartner.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-medium ${chatPartner.role === 'CLIENT' ? 'text-blue-500' : 'text-emerald-500'}`}>{t.onlineNow}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">€ {currentPrice}</span>
                    </div>
                </div>
            </div>
        </div>
        {jobStatus === 'COMPLETED' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                <Lock size={12} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase text-slate-500">{t.chatArchived}</span>
            </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
        {messages.map(msg => (
            <div key={msg.id} className={`flex w-full ${msg.isSystem ? 'justify-center' : msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'invoice' ? (
                    <InvoiceBubble msg={msg} />
                ) : msg.isSystem ? (
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full opacity-70">
                        {msg.text}
                    </span>
                ) : msg.type === 'offer_update' ? (
                    <OfferBubble msg={msg} />
                ) : (
                    <div className={`max-w-[80%] shadow-sm ${msg.isAutoReply ? 'bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800/30' : (msg.senderId === 'me' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700')} ${msg.senderId === 'me' ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}`}>
                        {/* Auto Reply Badge */}
                        {msg.isAutoReply && (
                            <div className="px-3 pt-2 pb-1 flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-800/30">
                                <div className="p-1 bg-emerald-200 dark:bg-emerald-800 rounded-full">
                                    <Bot size={12} className="text-emerald-700 dark:text-emerald-200" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Smart Reply</span>
                            </div>
                        )}
                        
                        <div className="p-3 px-4">
                            <p className={`text-sm leading-relaxed ${msg.isAutoReply ? 'text-slate-700 dark:text-slate-200 italic' : (msg.senderId === 'me' ? 'text-white' : 'text-slate-800 dark:text-slate-200')}`}>
                                {msg.text}
                            </p>
                            <div className={`flex justify-between items-center mt-1`}>
                                {msg.isAutoReply && <span className="text-[9px] text-slate-400">{t.botMsgFooter}</span>}
                                <span className={`block text-[10px] ml-auto opacity-70`}>{msg.timestamp}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER ACTIONS AREA */}
      {jobStatus === 'COMPLETED' ? (
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center">
              <Button onClick={handleReopenChat} variant="secondary" className="gap-2">
                  <RotateCcw size={16} /> {t.reopenChat}
              </Button>
          </div>
      ) : (
          <>
            {/* PRO WORKFLOW BUTTONS */}
            {/* Logic: Show controls if PRO AND (Not Negotiating OR Payment Pending is handled elsewhere OR Review Pending is valid) OR (Confirmed but might be Open in legacy) */}
            {currentUserRole === 'PRO' && (jobStatus !== 'NEGOTIATING' && jobStatus !== 'PAYMENT_PENDING' && jobStatus !== 'OPEN') && (
                <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <WorkflowControls />
                </div>
            )}

            {/* CLIENT CONFIRMATION UI */}
            {currentUserRole === 'CLIENT' && jobStatus === 'REVIEW_PENDING' && (
                <ClientConfirmationView />
            )}

            {/* PAYMENT VERIFICATION (PRO) */}
            {currentUserRole === 'PRO' && jobStatus === 'PAYMENT_PENDING' && (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-center mb-4 border border-emerald-100 dark:border-emerald-800">
                        <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                        <h3 className="font-bold text-emerald-700 dark:text-emerald-400">{t.confirmPayment}</h3>
                        <p className="text-xs text-slate-500 mt-1">{t.confirmPaymentDesc}</p>
                    </div>
                    <WorkflowControls />
                </div>
            )}

            {/* Normal Input Area (Hidden during specialized states) */}
            {jobStatus !== 'REVIEW_PENDING' && jobStatus !== 'PAYMENT_PENDING' && (
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-end pb-6 sm:pb-3">
                    {currentUserRole === 'PRO' && (
                        <Button variant="outline" className="rounded-full w-12 h-12 p-0 flex-shrink-0 border-slate-200 text-slate-500 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50" onClick={() => setIsOfferModalOpen(true)} title="Change Offer">
                            <Tag className="w-5 h-5" />
                        </Button>
                    )}
                    <Input value={inputText} onChange={e => setInputText(e.target.value)} placeholder={t.typeMessage} className="rounded-full bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900" onKeyDown={e => e.key === 'Enter' && sendMessage()} disabled={isBlocked} />
                    <Button className="rounded-full w-12 h-12 p-0 flex-shrink-0 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600" onClick={sendMessage} disabled={isBlocked}>
                        <Send className="w-5 h-5 ml-1" />
                    </Button>
                </div>
            )}
          </>
      )}

      {/* --- MODALS (Existing) --- */}
      <AnimatePresence>
        {showExitGuard && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowExitGuard(false)} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-20 text-center">
                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={28} /></div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t.leaveNegotiation}</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">{t.leaveNegotiationDesc}</p>
                    <div className="flex flex-col gap-3">
                        <Button className="w-full h-12 font-bold bg-slate-900 dark:bg-white dark:text-slate-900" onClick={onBack}>{t.returnToMarket}</Button>
                        <Button variant="ghost" className="w-full text-slate-500" onClick={() => setShowExitGuard(false)}>{t.stayHere}</Button>
                    </div>
                </motion.div>
            </div>
        )}

        {showProfile && (
          <UserProfileModal 
            user={{ id: chatPartner.id, name: chatPartner.name, avatar: chatPartner.avatar, role: chatPartner.role, rating: chatPartner.role === 'PRO' ? proposal.proRating : 5.0, level: chatPartner.role === 'PRO' ? proposal.proLevel : undefined, languages: chatPartner.role === 'PRO' ? ['PT', 'FR', 'EN'] : undefined, openingTime: "08:00", closingTime: "18:00" }}
            onClose={() => setShowProfile(false)}
            onViewPortfolio={() => setShowPortfolio(true)}
            hideHireAction={true}
            onToggleFavorite={onToggleFavorite}
            onToggleBlock={onToggleBlock}
            isFavorited={isFavorited}
            isBlocked={isBlocked}
          />
        )}
        
        {showPortfolio && chatPartner.role === 'PRO' && (<PortfolioOverlay proposal={proposal} onClose={() => setShowPortfolio(false)} />)}

        {isOfferModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOfferModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Tag size={20} className="text-emerald-500" /> {t.updateOffer}</h3>
                        <button onClick={() => setIsOfferModalOpen(false)} className="p-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.newPrice}</label>
                            <Input type="number" value={newOfferPrice} onChange={e => setNewOfferPrice(e.target.value)} placeholder="e.g. 400" className="text-2xl font-black" autoFocus />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.reasonChange}</label>
                            <textarea className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" rows={3} placeholder="e.g. Extra cabling required..." value={newOfferReason} onChange={e => setNewOfferReason(e.target.value)} />
                        </div>
                        <Button className="w-full h-12 text-lg font-bold mt-2" onClick={handleSendOffer}>{t.sendUpdate}</Button>
                    </div>
                </motion.div>
             </div>
        )}

        {pendingConfirmationId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPendingConfirmationId(null)} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-20 text-center">
                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={28} /></div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t.confirmChange}</h3>
                    <p className="text-sm text-slate-500 mb-6">{t.confirmChangeDesc} <strong className="text-slate-900 dark:text-white">€ {messages.find(m => m.id === pendingConfirmationId)?.offerDetails?.newPrice}</strong>. {t.confirmChangeSuffix}</p>
                    <div className="flex flex-col gap-3">
                        <Button className="w-full h-12 font-bold bg-emerald-500 hover:bg-emerald-600" onClick={confirmAcceptOffer}>{t.yesConfirm}</Button>
                        <Button variant="ghost" className="w-full text-slate-500" onClick={() => setPendingConfirmationId(null)}>{t.cancel}</Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
