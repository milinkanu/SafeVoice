import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { RefreshCw, FileText, Download, UserX, MessageSquare, AlertTriangle } from 'lucide-react';
import { PassphraseInput } from '../components/features/PassphraseInput';
import { CaseTimeline } from '../components/features/CaseTimeline';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { deriveKeyFromMnemonic, signChallenge } from '../lib/crypto';
import jsPDF from 'jspdf';

export default function Track() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [caseData, setCaseData] = useState(null);
    const [authPassphrase, setAuthPassphrase] = useState(null);

    const fetchCaseData = async (passphrase) => {
        const response = await axios.get('http://localhost:5000/api/icc/complaints');
        const storedCases = response.data.data.map(c => {
            let parsedHistory = [{ stage: 'filed', date: c.created_at }];
            if (c.history) {
                try {
                    const parsed = typeof c.history === 'string' ? JSON.parse(c.history) : c.history;
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        parsedHistory = parsed;
                    }
                } catch (e) { console.error("History parse err:", e); }
            }

            let parsedMessages = [];
            if (c.icc_message) {
                try {
                    const mParsed = typeof c.icc_message === 'string' ? JSON.parse(c.icc_message) : c.icc_message;
                    if (Array.isArray(mParsed)) {
                        parsedMessages = mParsed;
                    } else if (typeof mParsed === 'string') {
                        parsedMessages = [{ sender: 'ICC', text: mParsed, date: c.created_at }];
                    }
                } catch (e) {
                    parsedMessages = [{ sender: 'ICC', text: c.icc_message, date: c.created_at }];
                }
            }

            return {
                id: c.case_id,
                filedDate: c.created_at,
                status: c.status?.toLowerCase() || 'pending',
                history: parsedHistory,
                messages: parsedMessages
            };
        });

        const sessionCaseId = sessionStorage.getItem('tempCaseId');
        let matchedCase = storedCases.find(c => c.id === sessionCaseId);

        if (!matchedCase) {
            matchedCase = storedCases.find(c => c.status === 'overdue_acknowledge' || c.status === 'overdue')
                || storedCases[0]
                || {
                id: "SV-ERROR-404",
                filedDate: new Date().toISOString(),
                status: "pending",
                history: [{ stage: 'filed', date: new Date().toISOString() }],
                messages: []
            };
        }

        setCaseData({
            ...matchedCase,
            filedAt: matchedCase.filedDate,
            status: matchedCase.status === 'overdue' ? 'overdue_acknowledge' : matchedCase.status,
            history: matchedCase.history || [{ stage: 'filed', date: matchedCase.filedDate }]
        });
    };

    const handleAuth = async (passphrase) => {
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1500));
            const words = passphrase.trim().split(/\s+/);
            if (words.length !== 12) {
                throw new Error(`Invalid phrase: Found ${words.length} words instead of 12`);
            }
            await fetchCaseData(passphrase);
            setAuthPassphrase(passphrase);
            setIsAuthenticated(true);
        } catch (err) {
            console.error("Auth process error:", err);
            alert(`Authentication failed: ${err.message || 'Unknown error. Are your 12 words exact?'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Polling for realtime updates
    useEffect(() => {
        let interval;
        if (isAuthenticated && authPassphrase && !caseData?.isSimulation) {
            interval = setInterval(() => {
                fetchCaseData(authPassphrase).catch(console.error);
            }, 5000); // 5 sec realtime poll
        }
        return () => clearInterval(interval);
    }, [isAuthenticated, authPassphrase, caseData?.isSimulation]);

    const handleDownloadNotice = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("NOTICE OF DELAY IN POSH PROCEEDINGS", 20, 30);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Reference Case ID: ${caseData.id}`, 20, 50);
        doc.text(`Filing Date: ${new Date(caseData.filedAt).toLocaleDateString()}`, 20, 60);

        doc.text("To the Presiding Officer / HR representative,", 20, 80);

        const body = `This is to formally notify you that the complaint filed under the reference ID above has not received a formal acknowledgment within the mandated 7-day period as per standard guidelines interpreting the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH Act).`;

        const splittedText = doc.splitTextToSize(body, 170);
        doc.text(splittedText, 20, 95);

        doc.text("Immediate acknowledgment and commencement of inquiry is requested.", 20, 140);

        doc.text("Signature: ______________", 20, 170);
        doc.save(`Legal-Notice-${caseData.id}.pdf`);
    };

    const handleDownloadLccEscalation = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("FORMAL LCC ESCALATION PETITION", 20, 30);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Reference Case ID: ${caseData.id}`, 20, 50);
        doc.text(`Original Filing Date: ${new Date(caseData.filedAt).toLocaleDateString()}`, 20, 60);

        doc.text("To the District Magistrate / Local Complaints Committee (LCC),", 20, 80);

        const body = `This document serves as a formal escalation of a POSH complaint. The Internal Complaints Committee (ICC) of the respective organization has failed to provide a resolution within the legally mandated 90-day period. 

Under Section 11 of the POSH Act, 2013, jurisdiction is hereby requested to be transferred to the LCC. A statutory directive should be issued to the organization to surrender the cryptographically sealed evidence hash chain immediately.`;

        const splittedText = doc.splitTextToSize(body, 170);
        doc.text(splittedText, 20, 95);

        doc.text("Action Required: Immediate Case Transfer Protocol.", 20, 150);

        doc.text("Complainant Signature: ______________", 20, 180);
        doc.save(`LCC-Escalation-${caseData.id}.pdf`);
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-surface border border-border-default shadow-lg text-accent-primary mb-6">
                        <RefreshCw className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display text-text-primary mb-4">
                        Track Your Case
                    </h1>
                    <p className="text-lg text-text-muted max-w-2xl mx-auto">
                        Log in securely without providing your name. Your 12-word passphrase encrypts your session right in your browser.
                    </p>
                </div>
                <PassphraseInput onSubmit={handleAuth} isLoading={isLoading} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">

            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-sm">
                <div>
                    <h1 className="text-3xl font-display text-text-primary mb-2 flex items-center gap-3">
                        Case Dashboard <Badge status={caseData.status}>{caseData.status.replace('_', ' ')}</Badge>
                    </h1>
                    <p className="font-mono text-text-muted">ID: {caseData.id}</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="hidden sm:inline-flex">
                        <FileText className="w-4 h-4 mr-2" /> Add Evidence
                    </Button>
                    <Button variant="ghost" onClick={() => setIsAuthenticated(false)}>
                        <UserX className="w-4 h-4 mr-2" /> Disconnect
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Timeline) */}
                <div className="lg:col-span-2 space-y-8">
                    <CaseTimeline historyEvents={caseData.history} initialDate={caseData.filedAt} />

                    {/* Messages block */}
                    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-xl max-h-[400px] overflow-y-auto flex flex-col">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-accent-primary" />
                            Secure Case Messages
                        </h3>
                        {caseData.messages && caseData.messages.length > 0 ? (
                            <div className="space-y-4 flex-1">
                                {caseData.messages.map((msg, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border ${msg.sender === 'Complainant' ? 'bg-bg-primary border-accent-primary/20 ml-8' : 'bg-bg-surface border-border-default mr-8'}`}>
                                        <p className="text-xs text-text-muted mb-1 font-semibold flex items-center justify-between">
                                            <span>{msg.sender}</span>
                                            <span>{new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString()}</span>
                                        </p>
                                        <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-bg-primary/50 border border-white/5 rounded-xl border-dashed">
                                <p className="text-text-muted italic">No messages sent or received yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Actions & Intelligence) */}
                <div className="space-y-6">

                    <div className="rounded-2xl p-6 shadow-sm mb-6 bg-purple-900/10 border border-purple-500/30">
                        <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                            <span className="bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Judges / Demo</span>
                            Simulation Controls
                        </h3>
                        <p className="text-sm text-text-muted mb-4">Demonstrate SLA breaches and Local Complaints Committee (LCC) escalations.</p>
                        <div className="flex gap-3 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setCaseData({ ...caseData, status: 'overdue_acknowledge', isSimulation: true })}>
                                Simulate: ICC Ignored (7+ Days)
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCaseData({ ...caseData, status: 'unresolved', filedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(), isSimulation: true })}>
                                Simulate: Resolution Overdue (90+ Days)
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                                setCaseData(prev => ({ ...prev, isSimulation: false }));
                                fetchCaseData(authPassphrase);
                            }}>
                                Reset Simulation
                            </Button>
                        </div>
                    </div>

                    {/* LCC Escalation Alert (For Unresolved > 90 days) */}
                    {caseData.status === 'unresolved' && (
                        <div className="bg-accent-danger/10 border border-accent-danger/20 rounded-2xl p-6 text-accent-danger shadow-inner animate-in slide-in-from-right duration-500 mb-6">
                            <h3 className="font-bold flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5" /> Statutory LCC Escalation Available
                            </h3>
                            <p className="text-sm mb-4 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all duration-300">
                                As per Section 11 of the POSH Act 2013, since the ICC has not provided a resolution within the mandated 90-day period (or if you are dissatisfied with the findings), you have the legal right to escalate your complaint to the District Local Complaints Committee (LCC) or an Appellate Authority.
                            </p>
                            <Button variant="danger" className="w-full text-xs sm:text-sm font-semibold h-auto py-3 leading-normal" onClick={handleDownloadLccEscalation}>
                                <Download className="w-4 h-4 mr-2 shrink-0" />
                                Proceed to LCC Portal (Download Petition)
                            </Button>
                        </div>
                    )}

                    {/* Overdue Action Alert */}
                    {caseData.status === 'overdue_acknowledge' && (
                        <div className="bg-accent-danger/10 border border-accent-danger/20 rounded-2xl p-6 text-accent-danger shadow-inner animate-in pulse mb-6">
                            <h3 className="font-bold flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5" /> ICC Deadline Missed
                            </h3>
                            <p className="text-sm mb-4 leading-relaxed">
                                The company has failed to acknowledge your complaint within 7 days. You have the right to serve them an official legal notice pressing them to act.
                            </p>
                            <Button variant="danger" className="w-full text-xs sm:text-sm font-semibold whitespace-nowrap" onClick={handleDownloadNotice}>
                                <Download className="w-4 h-4 mr-2 shrink-0" />
                                Download Legal Notice
                            </Button>
                        </div>
                    )}

                    <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
                        <ul className="space-y-3">
                            <li>
                                <Button variant="outline" className="w-full justify-start text-text-muted">
                                    <FileText className="w-4 h-4 mr-3" /> View Evidence Hash Certs
                                </Button>
                            </li>
                            <li>
                                <Button variant="outline" className="w-full justify-start text-text-muted" onClick={async () => {
                                    const msgText = prompt("Enter your anonymous reply to the ICC:");
                                    if (msgText) {
                                        const newMsg = { sender: 'Complainant', text: msgText, date: new Date().toISOString() };
                                        const newMessages = [...(caseData.messages || []), newMsg];
                                        try {
                                            await axios.patch(`http://localhost:5000/api/icc/complaints/${caseData.id}`, { iccMessage: JSON.stringify(newMessages) });
                                            setCaseData({ ...caseData, messages: newMessages });
                                        } catch (e) {
                                            alert("Failed to send message.");
                                        }
                                    }
                                }}>
                                    <MessageSquare className="w-4 h-4 mr-3" /> Reply Annonymously
                                </Button>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>
        </div>
    );
}
