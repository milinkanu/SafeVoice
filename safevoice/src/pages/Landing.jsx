import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ChevronDown, Compass, Lock, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useReportStore } from '../store/reportStore';

export default function Landing() {
    const [activeFaq, setActiveFaq] = useState(null);
    const navigate = useNavigate();
    const clearReportDraft = useReportStore(state => state.clearReportDraft);

    const toggleFaq = (idx) => {
        setActiveFaq(activeFaq === idx ? null : idx);
    };

    const faqs = [
        {
            q: "What does POSH mean?",
            a: "POSH stands for the Prevention of Sexual Harassment at Workplace Act (2013). It is an Indian law mandating all workplaces with 10 or more employees to form an Internal Complaints Committee (ICC) to investigate complaints impartially."
        },
        {
            q: "How does SafeVoice keep me anonymous?",
            a: "When you report, SafeVoice uses your browser to generate a cryptographic keypair (a 12-word passphrase). The server only sees public keys and encrypted text. Your passphrase never leaves your device."
        },
        {
            q: "Can my employer track my IP address?",
            a: "No. SafeVoice does not log IP addresses, nor do we store browser fingerprint data. If you upload evidence files, they are stripped of metadata (like GPS location on photos) and cryptographically sealed."
        },
        {
            q: "What if the ICC ignores my complaint?",
            a: "SafeVoice tracks legal deadlines automatically. If the ICC fails to acknowledge your complaint in 7 days, or fails to conclude inquiry in 90 days, we instantly generate the necessary legal documents for you to escalate the matter to external authorities."
        }
    ];

    return (
        <div className="w-full flex flex-col pt-10 sm:pt-20 items-center">

            {/* 1. Hero Section */}
            <section className="relative w-full max-w-5xl mx-auto px-4 text-center mb-32 flex flex-col items-center">
                {/* Animated Shield Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    className="relative inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-[2rem] bg-gradient-to-br from-bg-surface to-bg-primary shadow-2xl border border-white/10 mb-8"
                >
                    <div className="absolute inset-0 bg-accent-primary opacity-20 blur-2xl rounded-full animate-pulse pointer-events-none"></div>
                    <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-accent-primary" />
                </motion.div>

                <h1 className="text-5xl sm:text-7xl font-display text-text-primary mb-6 leading-[1.1] max-w-4xl mx-auto tracking-tight">
                    Your Voice. <br className="sm:hidden" /> Protected.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-accent-primary">
                        Mathematically Anonymous.
                    </span>
                </h1>

                <p className="text-lg sm:text-2xl text-text-muted mb-12 max-w-2xl mx-auto font-light">
                    A zero-knowledge POSH reporting platform.
                    Hold your organization accountable without compromising your safety.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md mx-auto sm:max-w-none">
                    <Button
                        size="lg"
                        onClick={() => {
                            clearReportDraft();
                            navigate('/report');
                        }}
                        className="w-full sm:w-auto h-14 px-8 text-base shadow-[0_0_30px_-5px_var(--accent-primary)] hover:shadow-none hover:-translate-y-0.5 transition-all"
                    >
                        Report an Incident
                    </Button>
                    <Link to="/compass" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base">
                            Check Your Eligibility
                        </Button>
                    </Link>
                </div>
            </section>

            {/* 2. How It Works */}
            <section className="w-full max-w-6xl mx-auto px-4 mb-32 relative">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-5xl font-display text-text-primary mb-4">How SafeVoice Works</h2>
                    <p className="text-text-muted text-lg max-w-2xl mx-auto">An end-to-end encrypted protocol designed to put power back in your hands.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-4 relative">
                    {/* Connector Line hidden on mobile */}
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border-default z-0"></div>

                    {[
                        { tag: "01", title: "Assess", desc: "Use our 8-q Compass to see if POSH laws apply.", icon: Compass },
                        { tag: "02", title: "Report", desc: "Your device encrypts all details before sending.", icon: FileText },
                        { tag: "03", title: "Lock", desc: "We give you a 12-word passphrase key.", icon: Lock },
                        { tag: "04", title: "Track", desc: "Monitor the ICC deadlines invisibly.", icon: RefreshCw },
                    ].map((step, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center text-center p-6 bg-bg-secondary rounded-2xl border border-border-default shadow-lg hover:-translate-y-1 transition-transform cursor-default">
                            <div className="w-16 h-16 rounded-full bg-bg-surface border border-accent-primary/50 text-accent-primary flex items-center justify-center mb-6 shadow-lg shadow-accent-primary/20">
                                <step.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                                <span className="text-xs text-text-muted font-mono">{step.tag}</span>
                                {step.title}
                            </h3>
                            <p className="text-sm text-text-muted">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Why SafeVoice */}
            <section className="w-full max-w-6xl mx-auto px-4 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 p-8 rounded-3xl bg-bg-surface border border-white/5 shadow-2xl">
                        <h3 className="text-2xl font-display text-text-primary mb-4">Truly Anonymous</h3>
                        <p className="text-text-muted mb-6">Built like a cryptocurrency wallet. You own your data. We have zero knowledge of who you are.</p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-text-primary"><CheckCircle2 className="w-5 h-5 text-accent-primary" /> No Emails Required</li>
                            <li className="flex items-center gap-3 text-sm text-text-primary"><CheckCircle2 className="w-5 h-5 text-accent-primary" /> No Passwords Stored</li>
                            <li className="flex items-center gap-3 text-sm text-text-primary"><CheckCircle2 className="w-5 h-5 text-accent-primary" /> E2E Encrypted Payload</li>
                        </ul>
                    </div>

                    <div className="md:col-span-1 p-8 rounded-3xl bg-accent-primary/10 border border-accent-primary/20 shadow-2xl">
                        <h3 className="text-2xl font-display text-accent-primary mb-4">POSH Compliant Engine</h3>
                        <p className="text-text-primary/80">Structured exclusively around the 2013 Indian Act. We ensure your report gives HR everything they legally need to initiate an inquiry.</p>
                    </div>

                    <div className="md:col-span-1 p-8 rounded-3xl bg-bg-surface border border-white/5 shadow-2xl flex flex-col justify-center">
                        <h3 className="text-2xl font-display text-text-primary mb-4">Auto-Escalation</h3>
                        <p className="text-text-muted">If the ICC stalls or misses their 7-day or 90-day legally mandated windows, SafeVoice generates pre-filled legal documents for your protection.</p>
                    </div>
                </div>
            </section>

            {/* 4. FAQ */}
            <section className="w-full max-w-3xl mx-auto px-4 mb-32">
                <h2 className="text-3xl font-display text-text-primary mb-8 text-center">Know Your Rights</h2>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="border border-border-default bg-bg-secondary rounded-xl overflow-hidden transition-colors hover:border-text-muted/50">
                            <button
                                onClick={() => toggleFaq(idx)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className="font-semibold text-text-primary text-lg">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {activeFaq === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-6 pb-6 text-text-muted leading-relaxed"
                                    >
                                        {faq.a}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Footer */}
            <footer className="w-full border-t border-border-default bg-bg-secondary py-12 mt-auto">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-accent-primary" />
                        <span className="font-display text-xl text-text-primary">SafeVoice</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 text-center text-sm font-medium">
                        <Link to="/icc/login" className="text-text-muted hover:text-accent-primary transition-colors">Organization Login</Link>
                        <span className="text-text-muted hidden sm:inline">•</span>
                        <a href="https://ncw.nic.in" target="_blank" rel="noreferrer" className="text-text-muted hover:text-text-primary transition-colors">National Commission for Women</a>
                        <span className="text-text-muted hidden sm:inline">•</span>
                        <span className="text-text-muted">Emergency: Dial 112 / 1091</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
