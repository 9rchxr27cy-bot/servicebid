
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Star, ArrowLeft, Tag, X, AlertTriangle, Check, CreditCard, Car, MapPin, Play, Square, FileText } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { Proposal, ChatMessage, JobStatus } from '../types';
import { ProProfileModal, PortfolioOverlay } from '../components/ServiceModals';
import { useLanguage } from '../contexts/LanguageContext';
import { ServiceStatusHeader } from '../components/ServiceStatusHeader';

interface ChatProps {
  proposal: Proposal;
  onBack: () => void;
  onComplete: (rating: number, review: string) => void;
  currentUserRole: 'CLIENT' | 'PRO';
}

export const ChatScreen: React.FC<ChatProps> = ({ proposal, onBack, onComplete, currentUserRole }) => {
  const { t } = useLanguage();
  const [currentPrice, setCurrentPrice] = useState(proposal.price);
  
  // State Machine for Service Workflow
  // Initialize from proposal status if available (e.g. 'CONFIRMED' from quick accept), otherwise 'NEGOTIATING'
  const [jobStatus, setJobStatus] = useState<JobStatus>(proposal.status || 'NEGOTIATING');
  const [startTime, setStartTime] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      senderId: 'system', 
      text: `${t.serviceAgreed} € ${proposal.price}. ${t.chatStarted}`, 
      timestamp: 'Now', 
      isSystem: true,
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  
  // Modals State
  const [showProfile, setShowProfile] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [showExitGuard, setShowExitGuard] = useState(false); // Navigation Guard
  
  // Negotiation Logic State
  const [newOfferPrice, setNewOfferPrice] = useState('');
  const [newOfferReason, setNewOfferReason] = useState('');
  const [pendingConfirmationId, setPendingConfirmationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- NAVIGATION GUARD ---
  const handleBackAttempt = () => {
      // Logic: If status is negotiation or active service, warn user
      if (jobStatus !== 'COMPLETED' && jobStatus !== 'CANCELLED') {
          setShowExitGuard(true);
      } else {
          onBack();
      }
  };

  // --- SERVICE WORKFLOW ACTIONS (PRO ONLY) ---
  const updateServiceStatus = (newStatus: JobStatus) => {
      setJobStatus(newStatus);
      
      let sysMsgText = '';
      if (newStatus === 'EN_ROUTE') sysMsgText = t.msgOnWay;
      if (newStatus === 'ARRIVED') sysMsgText = t.msgArrived;
      if (newStatus === 'IN_PROGRESS') {
          sysMsgText = t.msgStarted;
          setStartTime(Date.now());
      }
      if (newStatus === 'COMPLETED') {
          // Generate Receipt
          const endTime = Date.now();
          const start = startTime || (endTime - 3600000); // Mock 1h if no start
          const durationMs = endTime - start;
          const hours = Math.floor(durationMs / 3600000);
          const mins = Math.floor((durationMs % 3600000) / 60000);
          
          const receiptMsg: ChatMessage = {
              id: `receipt-${Date.now()}`,
              senderId: 'system',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'receipt',
              receiptDetails: {
                  startTime: new Date(start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                  endTime: new Date(endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                  duration: `${hours}h ${mins}m`,
                  totalAmount: currentPrice
              }
          };
          setMessages(prev => [...prev, receiptMsg]);
          
          if (currentUserRole === 'CLIENT') {
              setIsCompleting(true); // Auto open review for client
          }
          return;
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
          setMessages(prev => [...prev, sysMsg]);
      }
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
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Simulate simple reply if needed
    if (messages.length < 3) {
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                senderId: 'other',
                text: currentUserRole === 'CLIENT' ? "I'm on my way!" : "Please confirm the address.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'text'
            }]);
        }, 1500);
    }
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

    setMessages([...messages, offerMsg]);
    setIsOfferModalOpen(false);
    setNewOfferPrice('');
    setNewOfferReason('');
  };

  const handleRespondToOffer = (msgId: string, accept: boolean) => {
    if (accept) {
       // Open Double Check Modal
       setPendingConfirmationId(msgId);
    } else {
       // Reject immediately
       updateMessageStatus(msgId, 'REJECTED');
    }
  };

  const confirmAcceptOffer = () => {
    if (!pendingConfirmationId) return;
    
    const msg = messages.find(m => m.id === pendingConfirmationId);
    if (msg && msg.offerDetails) {
        // Update Global Price
        setCurrentPrice(msg.offerDetails.newPrice);
        
        // Update Message Status
        updateMessageStatus(pendingConfirmationId, 'ACCEPTED');
        
        // If negotiating, move to CONFIRMED
        if (jobStatus === 'NEGOTIATING') {
            setJobStatus('CONFIRMED');
        }
        
        // Add System Message
        const sysMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            text: `${t.msgPriceUpdate} ${msg.offerDetails.newPrice}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
            type: 'text'
        };
        setMessages(prev => [...prev, sysMsg]);
    }
    setPendingConfirmationId(null);
  };

  const updateMessageStatus = (msgId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.offerDetails) {
            return { ...m, offerDetails: { ...m.offerDetails, status } };
        }
        return m;
    }));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- SUB-COMPONENTS ---

  const OfferBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
    if (!msg.offerDetails) return null;
    const { oldPrice, newPrice, reason, status } = msg.offerDetails;
    const isMe = msg.senderId === 'me';
    const canInteract = !isMe && status === 'PENDING'; // Only receiver can act on pending

    return (
      <div className={`max-w-[85%] sm:max-w-[70%] p-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
         {/* Header */}
         <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <Tag size={16} className="text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">{t.proposalUpdate}</span>
         </div>
         
         {/* Body */}
         <div className="p-4">
            <div className="flex items-end gap-3 mb-2">
                <span className="text-sm text-slate-400 line-through decoration-red-400">€ {oldPrice}</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">€ {newPrice}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-4">"{reason}"</p>
            
            {/* Actions or Status */}
            {status === 'PENDING' ? (
                canInteract ? (
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-9" 
                            onClick={() => handleRespondToOffer(msg.id, true)}
                        >
                            {t.acceptOffer}
                        </Button>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 h-9 border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                            onClick={() => handleRespondToOffer(msg.id, false)}
                        >
                            Reject
                        </Button>
                    </div>
                ) : (
                    <div className="text-xs text-center text-slate-400 font-medium py-1 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        Waiting for response...
                    </div>
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

  const ReceiptBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
      if (!msg.receiptDetails) return null;
      const { startTime, endTime, duration, totalAmount } = msg.receiptDetails;
      return (
          <div className="w-full max-w-[80%] mx-auto my-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="bg-slate-900 dark:bg-slate-950 p-4 flex items-center justify-center gap-2">
                 <CheckCircle className="text-emerald-500" />
                 <span className="text-white font-bold uppercase tracking-widest">{t.receiptTitle}</span>
             </div>
             <div className="p-6 space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                     <span className="text-slate-500 text-sm">{t.startTime}</span>
                     <span className="font-mono font-bold">{startTime}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                     <span className="text-slate-500 text-sm">{t.endTime}</span>
                     <span className="font-mono font-bold">{endTime}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                     <span className="text-slate-500 text-sm">{t.duration}</span>
                     <span className="font-mono font-bold">{duration}</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                     <span className="text-slate-900 dark:text-white font-black text-lg">{t.total}</span>
                     <span className="text-emerald-500 font-black text-2xl">€ {totalAmount}</span>
                 </div>
             </div>
          </div>
      );
  };

  const WorkflowControls = () => {
      if (currentUserRole !== 'PRO') return null;
      
      const buttonBase = "flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95";

      switch (jobStatus) {
          case 'NEGOTIATING': 
             // If negotiating, usually waiting for offer accept, but let's assume they can start workflow if client accepted manually
             return null; 
          case 'CONFIRMED':
             return (
                 <button 
                    onClick={() => updateServiceStatus('EN_ROUTE')}
                    className={`${buttonBase} bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30`}
                 >
                     <Car size={20} /> {t.actionOnWay}
                 </button>
             );
          case 'EN_ROUTE':
             return (
                 <button 
                    onClick={() => updateServiceStatus('ARRIVED')}
                    className={`${buttonBase} bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30`}
                 >
                     <MapPin size={20} /> {t.actionArrived}
                 </button>
             );
          case 'ARRIVED':
              return (
                 <button 
                    onClick={() => updateServiceStatus('IN_PROGRESS')}
                    className={`${buttonBase} bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30`}
                 >
                     <Play size={20} /> {t.actionStart}
                 </button>
              );
          case 'IN_PROGRESS':
              return (
                 <button 
                    onClick={() => updateServiceStatus('COMPLETED')}
                    className={`${buttonBase} bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/30`}
                 >
                     <Square size={20} fill="currentColor" /> {t.actionFinish}
                 </button>
              );
          default:
              return null;
      }
  };

  // --- RENDER ---

  if (isCompleting) {
    return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold">{t.serviceCompleted}</h2>
                <p className="text-slate-500">{t.experienceQuestion} {proposal.proName}?</p>
            </motion.div>

            <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110 focus:outline-none">
                        <Star className={`w-10 h-10 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                ))}
            </div>

            <textarea 
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-6 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder={t.writeReview}
                rows={3}
                value={review}
                onChange={e => setReview(e.target.value)}
            />

            <Button className="w-full" onClick={() => onComplete(rating, review)} disabled={rating === 0}>
                {t.submitReview}
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Service Status Header */}
      <ServiceStatusHeader status={jobStatus} />

      {/* Chat Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
            <button onClick={handleBackAttempt}><ArrowLeft className="w-6 h-6 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" /></button>
            
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity p-1 rounded-lg"
              onClick={() => setShowProfile(true)}
            >
                <div className="relative">
                    <img src={proposal.proAvatar} className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-700 object-cover" alt="User" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                </div>
                <div>
                    <h3 className="font-bold text-sm leading-none flex items-center gap-1">
                      {proposal.proName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t.onlineNow}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">€ {currentPrice}</span>
                    </div>
                </div>
            </div>
        </div>
        {currentUserRole === 'CLIENT' && jobStatus === 'COMPLETED' && (
            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => setIsCompleting(true)}>{t.finishJob}</Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
        {messages.map(msg => (
            <div key={msg.id} className={`flex w-full ${msg.isSystem ? 'justify-center' : msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'receipt' ? (
                    <ReceiptBubble msg={msg} />
                ) : msg.isSystem ? (
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full opacity-70">
                        {msg.text}
                    </span>
                ) : msg.type === 'offer_update' ? (
                    <OfferBubble msg={msg} />
                ) : (
                    <div className={`max-w-[80%] p-3 px-4 shadow-sm ${
                        msg.senderId === 'me' 
                        ? 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700'
                    }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <span className={`block text-[10px] mt-1 text-right opacity-70`}>
                            {msg.timestamp}
                        </span>
                    </div>
                )}
            </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* PRO WORKFLOW CONTROLS (Floating or Bottom) */}
      {currentUserRole === 'PRO' && jobStatus !== 'NEGOTIATING' && jobStatus !== 'COMPLETED' && (
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <WorkflowControls />
          </div>
      )}

      {/* Input Area */}
      {jobStatus !== 'COMPLETED' && (
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-end pb-6 sm:pb-3">
        {currentUserRole === 'PRO' && (
            <Button 
                variant="outline"
                className="rounded-full w-12 h-12 p-0 flex-shrink-0 border-slate-200 text-slate-500 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50" 
                onClick={() => setIsOfferModalOpen(true)}
                title="Change Offer"
            >
                <Tag className="w-5 h-5" />
            </Button>
        )}
        
        <Input 
            value={inputText} 
            onChange={e => setInputText(e.target.value)} 
            placeholder={t.typeMessage} 
            className="rounded-full bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900"
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <Button className="rounded-full w-12 h-12 p-0 flex-shrink-0 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600" onClick={sendMessage}>
            <Send className="w-5 h-5 ml-1" />
        </Button>
      </div>
      )}

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* Navigation Guard Modal */}
        {showExitGuard && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                    onClick={() => setShowExitGuard(false)}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-20 text-center"
                >
                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t.leaveNegotiation}</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        {t.leaveNegotiationDesc}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <Button 
                            className="w-full h-12 font-bold bg-slate-900 dark:bg-white dark:text-slate-900" 
                            onClick={onBack}
                        >
                            {t.returnToMarket}
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full text-slate-500" 
                            onClick={() => setShowExitGuard(false)}
                        >
                            {t.stayHere}
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}

        {/* Pro Profile */}
        {showProfile && (
          <ProProfileModal 
            proposal={proposal}
            onClose={() => setShowProfile(false)}
            onViewPortfolio={() => setShowPortfolio(true)}
            hideHireAction={true} 
          />
        )}
        
        {/* Portfolio */}
        {showPortfolio && (
          <PortfolioOverlay 
            proposal={proposal} 
            onClose={() => setShowPortfolio(false)} 
          />
        )}

        {/* Pro Negotiation Modal */}
        {isOfferModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOfferModalOpen(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Tag size={20} className="text-emerald-500" /> {t.updateOffer}
                        </h3>
                        <button onClick={() => setIsOfferModalOpen(false)} className="p-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.newPrice}</label>
                            <Input 
                                type="number" 
                                value={newOfferPrice} 
                                onChange={e => setNewOfferPrice(e.target.value)} 
                                placeholder="e.g. 400"
                                className="text-2xl font-black"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.reasonChange}</label>
                            <textarea 
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                rows={3}
                                placeholder="e.g. Extra cabling required..."
                                value={newOfferReason}
                                onChange={e => setNewOfferReason(e.target.value)}
                            />
                        </div>
                        <Button className="w-full h-12 text-lg font-bold mt-2" onClick={handleSendOffer}>
                            {t.sendUpdate}
                        </Button>
                    </div>
                </motion.div>
             </div>
        )}

        {/* Client Confirmation Modal (Double Check) */}
        {pendingConfirmationId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                    onClick={() => setPendingConfirmationId(null)}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl z-20 text-center"
                >
                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t.confirmChange}</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        {t.confirmChangeDesc} <strong className="text-slate-900 dark:text-white">€ {messages.find(m => m.id === pendingConfirmationId)?.offerDetails?.newPrice}</strong>. 
                        {t.confirmChangeSuffix}
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <Button 
                            className="w-full h-12 font-bold bg-emerald-500 hover:bg-emerald-600" 
                            onClick={confirmAcceptOffer}
                        >
                            {t.yesConfirm}
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full text-slate-500" 
                            onClick={() => setPendingConfirmationId(null)}
                        >
                            {t.cancel}
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}

      </AnimatePresence>
    </div>
  );
};
