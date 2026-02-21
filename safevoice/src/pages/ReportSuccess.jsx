import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Download, Copy, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generateSuccessCertificate } from '../lib/pdfgen';

export default function ReportSuccess() {
    const navigate = useNavigate();
    const [passphraseVisible, setPassphraseVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)

    // Retrieve temporary sensitive data
    const caseId = sessionStorage.getItem('tempCaseId') || "DEBUG-CASE-ID-404";
    const passphrase = sessionStorage.getItem('tempPassphrase') || "debug passphrase missing oops error fallback to this mock string data";

    useEffect(() => {
        // If entered directly without session data, redirect home
        if (!sessionStorage.getItem('tempCaseId')) {
            navigate('/');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    cleanupAndRedirect();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const cleanupAndRedirect = () => {
        sessionStorage.removeItem('tempCaseId');
        sessionStorage.removeItem('tempPassphrase');
        navigate('/track', { replace: true });
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(passphrase);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleDownload = () => {
        generateSuccessCertificate(caseId, passphrase);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
            <div className="bg-bg-secondary w-full border-t-[6px] border-accent-primary rounded-xl rounded-t-none shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">

                {/* Timer Banner */}
                <div className="absolute top-0 left-0 w-full bg-accent-warm/10 py-1.5 flex justify-center items-center gap-2 border-b border-accent-warm/20">
                    <AlertTriangle className="w-4 h-4 text-accent-warm" />
                    <span className="text-xs font-semibold text-accent-warm tracking-wide">
                        PAGE LOCKS IN: {formatTime(timeLeft)}
                    </span>
                </div>

                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-primary/10 mb-6 mt-4 ring-8 ring-accent-primary/5">
                    <ShieldCheck className="w-10 h-10 text-accent-primary" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-display text-text-primary mb-2">Complaint Secured</h1>
                <p className="text-text-muted mb-8 max-w-lg mx-auto">
                    Your report has been encrypted and submitted anonymously. Save the exact credentials below immediately.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                    {/* Case ID */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-inner">
                        <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Your Case ID</p>
                        <p className="font-mono text-xl sm:text-2xl text-accent-primary font-bold tracking-tight">
                            {caseId}
                        </p>
                    </div>

                    {/* Passphrase Area */}
                    <div className="bg-bg-surface border border-accent-warm/30 rounded-xl shadow-inner overflow-hidden flex flex-col">
                        <div className="px-5 py-3 bg-accent-warm/5 flex justify-between items-center border-b border-white/5">
                            <p className="text-xs text-accent-warm font-bold uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Secret Passphrase
                            </p>
                            <button
                                onClick={() => setPassphraseVisible(!passphraseVisible)}
                                className="text-text-muted hover:text-text-primary p-1 transition-colors"
                                title={passphraseVisible ? "Hide" : "Show"}
                            >
                                {passphraseVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="p-5 flex-1 flex items-center justify-center relative group min-h-[140px]">
                            {passphraseVisible ? (
                                <p className="font-mono text-lg text-text-primary tracking-wide text-center leading-relaxed">
                                    {passphrase.split(' ').map((word, i) => (
                                        <span key={i} className="inline-block bg-bg-primary/50 px-2 py-0.5 m-1 rounded border border-white/10 select-all">
                                            {word}
                                        </span>
                                    ))}
                                </p>
                            ) : (
                                <div className="w-full h-full bg-bg-primary/80 backdrop-blur-[2px] absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={() => setPassphraseVisible(true)}>
                                    <p className="text-text-muted font-medium tracking-widest uppercase text-sm flex gap-2">
                                        <Lock className="w-4 h-4" /> Click to reveal
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warning text */}
                <p className="text-accent-warm font-medium bg-accent-warm/10 p-3 rounded-md mb-8 inline-block max-w-xl text-sm border border-accent-warm/20">
                    We do not store your passphrase on our servers. If you lose it, you will never be able to access your case tracking again.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button variant="outline" className="w-full sm:w-auto min-w-[160px]" onClick={handleCopy}>
                        {copied ? <span className="text-emerald-500">Copied!</span> : <><Copy className="w-4 h-4 mr-2" /> Copy Passphrase</>}
                    </Button>

                    <Button variant="primary" className="w-full sm:w-auto min-w-[200px]" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" /> Download PDF Record
                    </Button>
                </div>

            </div>

            <div className="mt-6 flex justify-center w-full">
                <Button variant="ghost" onClick={cleanupAndRedirect}>
                    Go to Tracking Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

        </div>
    );
}

// Temporary import for the icon used above
import { Lock, ArrowRight } from 'lucide-react';
