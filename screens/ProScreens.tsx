
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Euro, Send, X, TrendingUp, Calendar, CheckCircle2, DollarSign, LayoutDashboard, Briefcase, BarChart3, MessageSquare, History, ChevronRight, Clock, Check, Download, FileText, Lock, Crown, ArrowUpRight, Printer, Eye, ChevronDown } from 'lucide-react';
import { Button, Input, Card, LevelBadge } from '../components/ui';
import { MOCK_PRO } from '../constants';
import { JobRequest, Proposal, Invoice } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { createInvoiceObject, downloadInvoicePDF, calculateInvoiceTotals, downloadFiscalReport } from '../utils/pdfGenerator';
import { useDatabase } from '../contexts/DatabaseContext';

interface ProScreensProps {
  onViewProfile: () => void;
  onBid: (jobId: string, amount: number) => void;
  onChatSelect?: (proposal: Proposal) => void;
}

// ... (InvoicePreviewModal remains the same) ...
const InvoicePreviewModal: React.FC<{ invoice: Invoice; onClose: () => void }> = ({ invoice, onClose }) => {
    const { t } = useLanguage();

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-2xl bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Modal Toolbar */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                    <h3 className="font-bold flex items-center gap-2 text-sm md:text-base">
                        <FileText size={18} /> 
                        Invoice #{invoice.id}
                    </h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 hidden md:flex" onClick={() => window.print()}>
                            <Printer size={18} />
                        </Button>
                        <Button 
                            size="sm" 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                            onClick={() => { downloadInvoicePDF(invoice); onClose(); }}
                        >
                            <Download size={18} className="mr-2" /> <span className="hidden md:inline">{t.downloadPdf}</span>
                        </Button>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* INVOICE PAPER (Scrollable) */}
                <div className="overflow-y-auto p-4 md:p-6 flex-1 bg-slate-200/50 dark:bg-black/20">
                    <div className="bg-white text-slate-900 shadow-xl mx-auto max-w-[210mm] min-h-[297mm] p-6 md:p-12 text-xs md:text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                        
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-100 pb-8 mb-8 gap-4">
                            <div className="space-y-1">
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-widest mb-4">INVOICE</h1>
                                <p className="font-bold text-base md:text-lg">{invoice.issuer.legalName}</p>
                                <p className="text-slate-500 max-w-[200px]">{invoice.issuer.address}</p>
                                <div className="mt-4 text-[10px] md:text-xs text-slate-500 space-y-0.5">
                                    <p>TVA: {invoice.issuer.vatNumber}</p>
                                    <p>RCS: {invoice.issuer.rcsNumber}</p>
                                    <p>IBAN: {invoice.issuer.iban}</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right space-y-1 w-full md:w-auto">
                                <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg text-right mb-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase">{t.invoiceNo}</p>
                                    <p className="text-lg md:text-xl font-mono font-bold text-slate-900">#{invoice.id}</p>
                                </div>
                                <p><span className="text-slate-400 font-medium mr-2">{t.invDate}:</span> {new Date(invoice.date).toLocaleDateString()}</p>
                                <p><span className="text-slate-400 font-medium mr-2">{t.invDue}:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-12">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.invBillTo}</h4>
                            <p className="font-bold text-lg">{invoice.client.name}</p>
                            <p className="text-slate-500">{invoice.client.address}</p>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full mb-12 min-w-[500px]">
                                <thead className="border-b-2 border-slate-900 text-slate-900">
                                    <tr>
                                        <th className="py-3 text-left font-black uppercase text-xs tracking-wider w-[50%]">{t.invDesc}</th>
                                        <th className="py-3 text-center font-black uppercase text-xs tracking-wider">{t.invQty}</th>
                                        <th className="py-3 text-right font-black uppercase text-xs tracking-wider">{t.invRate}</th>
                                        <th className="py-3 text-right font-black uppercase text-xs tracking-wider">TVA</th>
                                        <th className="py-3 text-right font-black uppercase text-xs tracking-wider">{t.invTotal}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoice.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-4 font-medium text-slate-700">{item.description}</td>
                                            <td className="py-4 text-center text-slate-500">{item.quantity}</td>
                                            <td className="py-4 text-right text-slate-700">€ {item.unitPrice.toFixed(2)}</td>
                                            <td className="py-4 text-right text-slate-500">{item.vatRate}%</td>
                                            <td className="py-4 text-right font-bold text-slate-900">€ {item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-12">
                            <div className="w-full md:w-1/2 space-y-3">
                                <div className="flex justify-between text-slate-500">
                                    <span>{t.invSubtotal}</span>
                                    <span className="font-mono">€ {invoice.subtotalHT.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>{t.invVatAmt} (17%)</span>
                                    <span className="font-mono">€ {invoice.totalVAT.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t-2 border-slate-900 pt-3 text-lg font-black text-slate-900">
                                    <span>{t.invTotalDue}</span>
                                    <span>€ {invoice.totalTTC.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
                            <p className="font-medium mb-1">{invoice.issuer.legalName} • {invoice.issuer.address}</p>
                            <p>{t.invFooter}</p>
                            <p className="mt-2 font-mono">Bank: {invoice.issuer.bankName || 'BGL BNP Paribas'} • IBAN: {invoice.issuer.iban} • BIC: {invoice.issuer.bic || 'N/A'}</p>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- FINANCIAL DASHBOARD (ERP Light) ---
const ProAnalytics: React.FC = () => {
    const { t } = useLanguage();
    const { jobs } = useDatabase(); // Use DB
    // FORCE Premium for Demo Purposes
    const isPremium = true; 

    // Date Range State
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [preset, setPreset] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'>('MONTH');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    // Filter Logic using REAL DB JOBS (that are completed)
    const filteredJobs = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day

        return jobs.filter(j => {
            if (j.status !== 'COMPLETED' || !j.finishedAt) return false;
            const jobDate = new Date(j.finishedAt);
            return jobDate >= start && jobDate <= end;
        }).sort((a, b) => new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime());
    }, [startDate, endDate, jobs]);

    // Financial Totals based on Filter
    const totals = useMemo(() => {
        const gross = filteredJobs.reduce((acc, j) => acc + (j.finalPrice || 0), 0);
        const vat = gross * 0.17;
        // Mock pending calculation: if job finished within last 3 days
        const pending = filteredJobs.filter(j => {
            const daysAgo = (Date.now() - new Date(j.finishedAt!).getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo < 3;
        }).reduce((acc, j) => acc + (j.finalPrice || 0), 0);
        const available = gross - vat - pending; // Simplified logic

        return { gross, vat, pending, available, count: filteredJobs.length };
    }, [filteredJobs]);

    // Dynamic Chart Data Generator
    const chartData = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        // Strategy: if diff > 32 days, group by Month. Else group by Day.
        const isMonthly = diffDays > 32;
        const data: { label: string, value: number, fullDate?: string }[] = [];

        if (isMonthly) {
            // Generate months between start and end
            let current = new Date(start.getFullYear(), start.getMonth(), 1);
            while (current <= end) {
                const monthKey = `${current.getFullYear()}-${current.getMonth()}`;
                const label = current.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                
                const val = filteredJobs.filter(j => {
                    const d = new Date(j.finishedAt!);
                    return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
                }).reduce((acc, j) => acc + (j.finalPrice || 0), 0);

                data.push({ label, value: val });
                current.setMonth(current.getMonth() + 1);
            }
        } else {
            // Generate days
            let current = new Date(start);
            while (current <= end) {
                const dayKey = current.toISOString().split('T')[0];
                const label = current.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
                
                const val = filteredJobs.filter(j => j.finishedAt?.startsWith(dayKey)).reduce((acc, j) => acc + (j.finalPrice || 0), 0);

                data.push({ label, value: val, fullDate: dayKey });
                current.setDate(current.getDate() + 1);
            }
        }
        return data;
    }, [filteredJobs, startDate, endDate]);

    const handlePresetChange = (p: typeof preset) => {
        setPreset(p);
        const end = new Date();
        const start = new Date();
        if (p === 'TODAY') {
            // start is today
        } else if (p === 'WEEK') {
            start.setDate(end.getDate() - 7);
        } else if (p === 'MONTH') {
            start.setDate(end.getDate() - 30);
        } else if (p === 'YEAR') {
            start.setFullYear(end.getFullYear(), 0, 1);
        }
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    // Calculate max value for chart scaling
    const maxChartValue = Math.max(...chartData.map(d => d.value), 100);

    const handleViewInvoice = (job: JobRequest) => {
        const inv = createInvoiceObject(MOCK_PRO, "Client", job, job.finalPrice || 0);
        setSelectedInvoice(inv);
    };

    const handleDownloadInvoiceDirect = (job: JobRequest, e: React.MouseEvent) => {
        e.stopPropagation();
        const inv = createInvoiceObject(MOCK_PRO, "Client", job, job.finalPrice || 0);
        downloadInvoicePDF(inv);
    };

    return (
        <div className="space-y-8 relative pb-24">
            
            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-20">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" /> {t.financialPerformance}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">{t.customRange}</p>
                </div>
                <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => downloadFiscalReport(new Date().getFullYear())}
                    className="border-slate-200 hover:bg-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 w-full md:w-auto"
                >
                    <Download size={16} className="mr-2" /> {t.exportReport}
                </Button>
            </div>

            {/* ADVANCED FILTER BAR */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center relative z-20">
                {/* Presets */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full xl:w-auto overflow-x-auto no-scrollbar">
                    {(['TODAY', 'WEEK', 'MONTH', 'YEAR'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePresetChange(p)}
                            className={`flex-1 xl:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                preset === p 
                                ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}
                        >
                            {t[`filter${p.charAt(0) + p.slice(1).toLowerCase()}` as keyof typeof t]}
                        </button>
                    ))}
                </div>

                {/* Date Inputs */}
                <div className="flex items-center gap-2 w-full xl:w-auto">
                    <div className="relative flex-1 xl:flex-none group w-full">
                        <span className="absolute top-1 left-2 text-[8px] font-bold text-slate-400 uppercase tracking-wider">{t.startDate}</span>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPreset('MONTH'); /* clear preset visual */ }}
                            className="pt-4 pb-1 px-3 w-full xl:w-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <span className="text-slate-300">-</span>
                    <div className="relative flex-1 xl:flex-none group w-full">
                        <span className="absolute top-1 left-2 text-[8px] font-bold text-slate-400 uppercase tracking-wider">{t.endDate}</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPreset('MONTH'); }}
                            className="pt-4 pb-1 px-3 w-full xl:w-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
            </div>

            {/* KPI GRID (Dynamic) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-20">
                <Card className="p-4 md:p-5 bg-slate-900 text-white border-none shadow-xl shadow-slate-900/20">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.availBalance}</p>
                        <div className="p-1.5 bg-emerald-500/20 rounded-lg"><DollarSign size={14} className="text-emerald-400" /></div>
                    </div>
                    <p className="text-xl md:text-2xl font-black">€ {totals.available.toFixed(2)}</p>
                </Card>

                <Card className="p-4 md:p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.pendingBalance}</p>
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><Clock size={14} className="text-amber-500" /></div>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">€ {totals.pending.toFixed(2)}</p>
                </Card>

                <Card className="p-4 md:p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.totalEarnings}</p>
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><TrendingUp size={14} className="text-blue-500" /></div>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-emerald-500">€ {totals.gross.toFixed(2)}</p>
                </Card>

                <Card className="p-4 md:p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.vatEstimate}</p>
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><FileText size={14} className="text-purple-500" /></div>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">€ {totals.vat.toFixed(2)}</p>
                </Card>
            </div>

            {/* DYNAMIC PERFORMANCE CHART */}
            <Card className="p-4 md:p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 relative z-20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <BarChart3 size={16} className="text-emerald-500" /> {t.revenueTrend}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {chartData.length > 31 ? 'Monthly Aggregation' : 'Daily Breakdown'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.averageValue}</span>
                            <span className="font-bold text-slate-900 dark:text-white">€ {(totals.count > 0 ? totals.gross / totals.count : 0).toFixed(0)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="h-48 flex items-end justify-between gap-1 sm:gap-2">
                    {chartData.map((d, i) => {
                        const heightPct = (d.value / maxChartValue) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer relative">
                                <div 
                                    className={`w-full rounded-t-md relative transition-all duration-500 ${d.value > 0 ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-slate-100 dark:bg-slate-700 h-1'}`} 
                                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap shadow-lg">
                                        <span className="font-bold block">€{d.value}</span>
                                        <span className="text-slate-400 text-[9px]">{d.label}</span>
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 text-center truncate w-full block h-3">
                                    {/* Show label only for specific indices to avoid clutter if too many */}
                                    {(chartData.length < 15 || i % Math.ceil(chartData.length / 8) === 0) ? d.label : ''}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* FILTERED TRANSACTIONS TABLE */}
            <div className="relative z-20">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">{t.breakdown} ({totals.count})</h3>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-4 md:px-6 py-4">{t.invoiceNo}</th>
                                    <th className="px-4 md:px-6 py-4">Date</th>
                                    <th className="px-4 md:px-6 py-4 hidden md:table-cell">{t.client}</th>
                                    <th className="px-4 md:px-6 py-4">{t.service}</th>
                                    <th className="px-4 md:px-6 py-4 text-right hidden md:table-cell">{t.amountHT}</th>
                                    <th className="px-4 md:px-6 py-4 text-right hidden md:table-cell">TVA</th>
                                    <th className="px-4 md:px-6 py-4 text-right">{t.amountTTC}</th>
                                    <th className="px-4 md:px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredJobs.map(job => {
                                    const totals = calculateInvoiceTotals(job.finalPrice || 0);
                                    const dateObj = new Date(job.finishedAt!);
                                    return (
                                        <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => handleViewInvoice(job)}>
                                            <td className="px-4 md:px-6 py-4 font-mono text-xs text-slate-400">#{job.id.slice(-6)}</td>
                                            <td className="px-4 md:px-6 py-4 text-slate-500 text-xs">
                                                {dateObj.toLocaleDateString()} <span className="text-slate-300 ml-1 hidden sm:inline">{dateObj.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 font-bold text-slate-900 dark:text-white hidden md:table-cell">
                                                Client
                                            </td>
                                            <td className="px-4 md:px-6 py-4 text-slate-500">{job.category}</td>
                                            <td className="px-4 md:px-6 py-4 text-right font-mono text-slate-500 hidden md:table-cell">€ {totals.subtotalHT.toFixed(2)}</td>
                                            <td className="px-4 md:px-6 py-4 text-right font-mono text-slate-400 text-xs hidden md:table-cell">€ {totals.totalVAT.toFixed(2)}</td>
                                            <td className="px-4 md:px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400">€ {totals.totalTTC.toFixed(2)}</td>
                                            <td className="px-4 md:px-6 py-4 flex justify-center gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleViewInvoice(job); }}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Preview Invoice"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDownloadInvoiceDirect(job, e)}
                                                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                    title={t.downloadPdf}
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredJobs.length === 0 && (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Calendar size={24} className="text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">{t.noJobsPeriod}</p>
                                <p className="text-xs text-slate-400 mt-1">Try selecting a wider date range.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* INVOICE MODAL */}
            <AnimatePresence>
                {selectedInvoice && (
                    <InvoicePreviewModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
                )}
            </AnimatePresence>

            {/* UPSELL LOCK OVERLAY (If not Premium) */}
            {!isPremium && (
                <div className="absolute inset-0 z-50 backdrop-blur-md bg-white/30 dark:bg-slate-950/30 flex flex-col items-center justify-center text-center p-6 rounded-3xl border border-white/20">
                    <div className="bg-slate-900 text-white p-4 rounded-2xl mb-4 shadow-2xl">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t.upgradePro}</h3>
                    <p className="text-slate-600 dark:text-slate-300 max-w-sm mb-6 font-medium">
                        {t.upgradeDesc}
                    </p>
                    <Button className="h-12 px-8 font-bold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-none shadow-lg shadow-orange-500/20">
                        <Crown size={18} className="mr-2" /> {t.upgradeNow}
                    </Button>
                </div>
            )}
        </div>
    );
};

const ProMessagesList: React.FC<{ onSelect: (p: Proposal) => void }> = ({ onSelect }) => {
    const { t } = useLanguage();
    const { proposals, jobs } = useDatabase(); // Use DB proposals

    // Filter relevant chats: Proposals where I am the pro, and the job is active
    // For demo simplicity, we show proposals that have a status or job is not open
    const activeChats = proposals.filter(p => {
        // Here we'd normally check p.proId === currentUserId, but for simplicity assuming global scope for now
        // or filtered in parent.
        // Assuming we are seeing chats relevant to 'ME' (The logged in Pro)
        // In ProScreens parent, we will filter. Here we just map what's passed or fetch relevant.
        const job = jobs.find(j => j.id === p.jobId);
        return job && (p.status === 'CONFIRMED' || job.status !== 'OPEN');
    }).map(p => ({
        ...p,
        message: p.message || t.chatStarted // Ensure message
    }));

    if (activeChats.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">{t.noActiveRequests}</p>
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
                            <h4 className="font-bold text-slate-900 dark:text-white">Client</h4>
                            <span className="text-xs text-slate-400">Now</span>
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
    const { t } = useLanguage();
    const { jobs } = useDatabase();
    
    // Filter completed jobs from DB
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

    if (completedJobs.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">{t.noRequestsDesc}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {completedJobs.map(job => (
                <div key={job.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">{job.category}</span>
                            <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(job.finishedAt || '').toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{job.description}</h4>
                    </div>
                    <div className="text-right">
                        <span className="block text-lg font-black text-emerald-500 whitespace-nowrap">+ € {job.finalPrice}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Paid</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const ProDashboard: React.FC<ProScreensProps> = ({ onViewProfile, onBid, onChatSelect }) => {
  const { t, tCategory } = useLanguage();
  const { jobs, createProposal, users, updateJob } = useDatabase(); // Access Real DB, including updateJob
  
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MESSAGES' | 'HISTORY' | 'ANALYTICS'>('DASHBOARD');
  
  // Real live jobs from DB (Status OPEN)
  const liveJobs = useMemo(() => jobs.filter(j => j.status === 'OPEN'), [jobs]);

  const handleAcceptAndChat = () => {
      if (selectedJob && onChatSelect) {
          // 1. Create a real proposal in DB
          const newProposal: Proposal = {
              id: `prop-${Date.now()}`,
              jobId: selectedJob.id,
              proId: MOCK_PRO.id, // In real app, from Auth Context
              proName: MOCK_PRO.name,
              proAvatar: MOCK_PRO.avatar,
              proLevel: MOCK_PRO.level || 'Expert',
              proRating: MOCK_PRO.rating || 5,
              price: Number(bidAmount) || selectedJob.suggestedPrice || 0,
              message: t.chatStarted,
              createdAt: new Date().toISOString(),
              status: 'CONFIRMED',
              distance: selectedJob.distance
          };
          
          createProposal(newProposal);

          // 2. IMPORTANT: Update Job status to CONFIRMED to unlock Chat controls
          const confirmedJob: JobRequest = {
              ...selectedJob,
              status: 'CONFIRMED',
              finalPrice: newProposal.price
          };
          updateJob(confirmedJob);

          onChatSelect(newProposal);
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

        {/* Random dots based on job count */}
        {liveJobs.length > 0 && liveJobs.slice(0, 3).map((_, i) => (
            <div key={i} className="absolute w-3 h-3 bg-amber-500 rounded-full animate-ping" style={{ top: `${20 + i * 20}%`, left: `${20 + i * 20}%`}}></div>
        ))}

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
            {t.opportunities}
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
            {t.financialErp}
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
                {t.liveFeed}
            </div>
        </div>
        
        <div className="space-y-4">
            <AnimatePresence initial={false}>
            {liveJobs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    {t.scanningJobs}
                </div>
            ) : (
                liveJobs.map((job) => (
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
                                    <Clock size={10} /> {new Date(job.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                            <h3 className="font-bold mb-2">{job.description}</h3>
                            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {job.distance || '5 km'}
                                </div>
                                <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                    <Euro className="w-4 h-4" />
                                    {t.offerLabel}: € {job.suggestedPrice}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))
            )}
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
                <p className="text-slate-500 text-sm mb-6">{selectedJob.location} • {selectedJob.distance || 'Near'}</p>

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
