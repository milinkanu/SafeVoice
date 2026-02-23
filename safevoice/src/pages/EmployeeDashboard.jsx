import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Search, BookOpen, AlertCircle, Phone, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useReportStore } from '../store/reportStore';

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const clearReportDraft = useReportStore(state => state.clearReportDraft);

    return (
        <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500 py-8 px-4 sm:px-8">
            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-accent-primary/20 rounded-xl">
                            <Shield className="w-8 h-8 text-accent-primary" />
                        </div>
                        <h1 className="text-4xl font-display text-text-primary">Employee Secure Portal</h1>
                    </div>
                    <p className="text-lg text-text-muted max-w-2xl">
                        Your confidential space to report incidents, track case progress safely, and access workplace safety resources. Your identity remains protected by default.
                    </p>
                </div>
            </header>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* File Report Card */}
                <div
                    onClick={() => {
                        clearReportDraft();
                        navigate('/report');
                    }}
                    className="p-8 rounded-3xl bg-gradient-to-br from-bg-surface to-bg-secondary border border-border-default shadow-lg hover:border-accent-primary/50 hover:shadow-accent-primary/5 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[220px]"
                >
                    <div>
                        <div className="w-14 h-14 bg-accent-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileText className="w-7 h-7 text-accent-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">File a Incident Report</h2>
                        <p className="text-text-muted">
                            Submit a secure, timestamped complaint to the ICC. You can choose to remain completely anonymous or reveal your identity.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center text-accent-primary font-bold group-hover:translate-x-2 transition-transform">
                        Start Process <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>

                {/* Track Status Card */}
                <div
                    onClick={() => navigate('/track')}
                    className="p-8 rounded-3xl bg-gradient-to-br from-bg-surface to-bg-secondary border border-border-default shadow-lg hover:border-accent-warm/50 hover:shadow-accent-warm/5 transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[220px]"
                >
                    <div>
                        <div className="w-14 h-14 bg-accent-warm/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Search className="w-7 h-7 text-accent-warm" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Track Case Status</h2>
                        <p className="text-text-muted">
                            Use your secure 12-word passphrase to check case updates, submit anonymous replies, or escalate untreated cases to the LCC.
                        </p>
                    </div>
                    <div className="mt-6 flex items-center text-accent-warm font-bold group-hover:translate-x-2 transition-transform">
                        View Tracking <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </div>
            </div>

            {/* Employee Resources Section */}
            <h3 className="text-xl font-display text-text-primary mb-6">Workplace Safety & Policy Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Guidelines */}
                <div className="p-6 rounded-2xl bg-bg-secondary border border-border-default flex gap-4 hover:bg-bg-surface transition-colors">
                    <div className="shrink-0 p-3 bg-blue-500/10 rounded-xl h-fit">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-text-primary mb-1">Company POSH Policy</h4>
                        <p className="text-sm text-text-muted mb-3">Review the official guidelines against sexual harassment and employee rights.</p>
                        <button className="text-xs font-bold text-blue-400 hover:text-blue-300">Read PDF Document &rarr;</button>
                    </div>
                </div>

                {/* Rights */}
                <div className="p-6 rounded-2xl bg-bg-secondary border border-border-default flex gap-4 hover:bg-bg-surface transition-colors">
                    <div className="shrink-0 p-3 bg-green-500/10 rounded-xl h-fit">
                        <AlertCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-text-primary mb-1">Know Your Rights</h4>
                        <p className="text-sm text-text-muted mb-3">Learn about what constitutes harassment, retaliation protection, and deadlines.</p>
                        <button className="text-xs font-bold text-green-400 hover:text-green-300">View Article &rarr;</button>
                    </div>
                </div>

                {/* Helplines */}
                <div className="p-6 rounded-2xl bg-bg-secondary border border-border-default flex gap-4 hover:bg-bg-surface transition-colors">
                    <div className="shrink-0 p-3 bg-red-500/10 rounded-xl h-fit">
                        <Phone className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-text-primary mb-1">Emergency Contacts</h4>
                        <p className="text-sm text-text-muted mb-3">Access internal mental health counseling teams and national helpline numbers.</p>
                        <button className="text-xs font-bold text-red-400 hover:text-red-300">View Contacts &rarr;</button>
                    </div>
                </div>

            </div>

        </div>
    );
}
