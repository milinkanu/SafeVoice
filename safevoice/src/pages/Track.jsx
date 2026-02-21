import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

    const handleAuth = async (passphrase) => {
        setIsLoading(true);
        try {
            // 1. Derive private key locally from the mnemonic (This fails conceptually right now in crypto.js as explained, 
            // but we mocked it effectively via password-based challenge).
            // Mocking successful authentication for Phase 1 Demo:
            await new Promise(r => setTimeout(r, 1500));

            if (passphrase.split(' ').length !== 12) {
                throw new Error('Invalid phrase');
            }

            // 2. Fetch case data from localStorage
            const storedCases = JSON.parse(localStorage.getItem('icc_cases')) || [];

            // For demo: Try to load the case from this session, 
            // OR default to the first overdue case to demonstrate the Legal Notice feature.
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
                    iccMessage: null
                };
            }

            setCaseData({
                ...matchedCase,
                filedAt: matchedCase.filedDate, // alias for component
                status: matchedCase.status === 'overdue' ? 'overdue_acknowledge' : matchedCase.status,
                history: matchedCase.history || [{ stage: 'filed', date: matchedCase.filedDate }]
            });
            setIsAuthenticated(true);
        } catch (err) {
            alert("Authentication failed. Ensure the 12-words are exact.");
        } finally {
            setIsLoading(false);
        }
    };

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

                    {/* ICC Messaging block */}
                    <div className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-xl">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-accent-primary" />
                            Messages from ICC
                        </h3>
                        {caseData.iccMessage ? (
                            <div className="p-4 bg-bg-surface border border-border-default rounded-xl text-text-primary">
                                {caseData.iccMessage}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-bg-primary/50 border border-white/5 rounded-xl border-dashed">
                                <p className="text-text-muted italic">No messages received yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Actions & Intelligence) */}
                <div className="space-y-6">

                    {/* Overdue Action Alert */}
                    {caseData.status === 'overdue_acknowledge' && (
                        <div className="bg-accent-danger/10 border border-accent-danger/20 rounded-2xl p-6 text-accent-danger shadow-inner animate-in pulse">
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
                                <Button variant="outline" className="w-full justify-start text-text-muted">
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
