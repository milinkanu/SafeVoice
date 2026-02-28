import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, FileText, CheckCircle2, AlertOctagon, LogOut, MessageSquare, Calendar, MapPin, User, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export default function LccDashboard() {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');
    const [selectedCase, setSelectedCase] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLccCases = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/lcc/complaints');
                const pData = await response.json();
                if (pData.success) {
                    setComplaints(pData.data);
                }

                const insightsRes = await fetch('http://localhost:5000/api/lcc/insights');
                const iData = await insightsRes.json();
                if (iData.success) {
                    setInsights(iData.data);
                }
            } catch (err) {
                console.error('Failed to fetch LCC cases:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLccCases();
        const interval = setInterval(fetchLccCases, 5000); // Polling for new telegram cases
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        // Clear LCC token if any
        navigate('/');
    };

    const navItems = [
        { id: 'overview', icon: Activity, label: 'Overview' },
        { id: 'complaints', icon: MessageSquare, label: 'Telegram Cases' },
        { id: 'insights', icon: Sparkles, label: 'AI Pattern Analysis', badge: insights.length.toString(), variant: insights.length > 0 ? 'warning' : 'default' },
        { id: 'action', icon: AlertOctagon, label: 'Action Required', badge: complaints.filter(c => c.status === 'Submitted').length.toString(), variant: 'danger' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Submitted': return 'bg-accent-danger/20 text-accent-danger border-accent-danger/30';
            case 'In Progress': return 'bg-accent-primary/20 text-accent-primary border-accent-primary/30';
            case 'Resolved': return 'bg-accent-success/20 text-accent-success border-accent-success/30';
            default: return 'bg-bg-surface text-text-muted';
        }
    };

    const renderCaseDetail = () => {
        if (!selectedCase) return null;

        const incident = selectedCase.incident_details || {};
        const accused = selectedCase.accused_details || {};

        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <button
                    onClick={() => setSelectedCase(null)}
                    className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
                >
                    ← Back to Cases
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-display text-text-primary">{selectedCase.case_id}</h2>
                        <p className="text-text-muted text-sm mt-1">Reported via Telegram Bot</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedCase.status)}`}>
                        {selectedCase.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Incident Details */}
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-accent-primary" /> Incident Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                                <p className="text-sm text-text-primary">{incident.date || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location/Department</p>
                                <p className="text-sm text-text-primary">{incident.location || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Description</p>
                                <div className="bg-bg-primary p-4 rounded-lg border border-border-default h-32 overflow-y-auto">
                                    <p className="text-sm text-text-primary whitespace-pre-wrap">{incident.description || 'No description provided.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Accused & Actions */}
                    <div className="space-y-6">
                        <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-display text-text-primary mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-accent-primary" /> Accused Details
                            </h3>
                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Role Level</p>
                                <p className="text-sm text-text-primary font-medium">{accused.roleLevel || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-display text-text-primary mb-4">LCC Actions</h3>
                            <p className="text-xs text-text-muted mb-4">Update the status of this local complaint to keep the victim informed.</p>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-accent-primary text-bg-primary py-2 rounded-lg font-medium text-sm hover:bg-accent-primary/90 transition-colors shadow-sm">
                                    Start Inquiry
                                </button>
                                <button className="flex-1 bg-bg-primary text-text-primary border border-border-default py-2 rounded-lg font-medium text-sm hover:bg-bg-surface transition-colors">
                                    Request Evidence
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderOverview = () => {
        return (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-display text-text-primary tracking-tight">LCC Dashboard</h1>
                        <p className="text-text-muted mt-1">Local Complaints Committee & Telegram Intake</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
                        <div className="w-12 h-12 bg-accent-primary/10 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-6 h-6 text-accent-primary" />
                        </div>
                        <h3 className="text-3xl font-display text-text-primary">{complaints.length}</h3>
                        <p className="text-sm text-text-muted">Total Telegram Cases</p>
                    </div>
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
                        <div className="w-12 h-12 bg-accent-danger/10 rounded-full flex items-center justify-center mb-4">
                            <AlertOctagon className="w-6 h-6 text-accent-danger" />
                        </div>
                        <h3 className="text-3xl font-display text-text-primary">{complaints.filter(c => c.status === 'Submitted').length}</h3>
                        <p className="text-sm text-text-muted">Action Required</p>
                    </div>
                    <div className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
                        <div className="w-12 h-12 bg-accent-success/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6 text-accent-success" />
                        </div>
                        <h3 className="text-3xl font-display text-text-primary">{complaints.filter(c => c.status === 'Resolved').length}</h3>
                        <p className="text-sm text-text-muted">Cases Resolved</p>
                    </div>
                </div>

                {/* Recent Complaints */}
                <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border-default">
                        <h3 className="text-lg font-display text-text-primary flex items-center gap-2">
                            Recent Telegram Submissions
                        </h3>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-text-muted animate-pulse">Loading LCC Cases...</div>
                    ) : complaints.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <Shield className="w-12 h-12 text-border-hover mb-4" />
                            <h3 className="text-text-primary font-medium mb-1">No Cases Yet</h3>
                            <p className="text-sm text-text-muted">New telegram complaints will appear here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border-default">
                            {complaints.map(complaint => (
                                <div
                                    key={complaint.case_id}
                                    onClick={() => setSelectedCase(complaint)}
                                    className="p-4 hover:bg-bg-primary transition-colors cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-accent-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{complaint.case_id}</p>
                                            <p className="text-xs text-text-muted truncate max-w-xs">{complaint.incident_details?.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderInsights = () => {
        return (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-display text-text-primary tracking-tight flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-accent-warm" />
                            AI Pattern Analysis
                        </h1>
                        <p className="text-text-muted mt-1">NLP-driven detection of hostile environments and serial offenders across anonymous data.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-text-muted animate-pulse">Running NLP Analysis...</div>
                ) : insights.length === 0 ? (
                    <div className="bg-bg-surface border border-border-default rounded-xl p-12 text-center flex flex-col items-center shadow-sm">
                        <CheckCircle2 className="w-12 h-12 text-accent-success mb-4" />
                        <h3 className="text-text-primary font-medium mb-1">No Patterns Detected</h3>
                        <p className="text-sm text-text-muted max-w-md">The linguistic and metadata analysis algorithms have not found any statistical anomalies, hostile environments, or serial offenders in the current dataset.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {insights.map(insight => (
                            <div key={insight.id} className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm relative overflow-hidden">
                                {insight.severity === 'CRITICAL' && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-accent-danger" />
                                )}
                                {insight.severity === 'HIGH' && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-accent-warm" />
                                )}
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-display text-text-primary flex items-center gap-2">
                                        <AlertTriangle className={`w-5 h-5 ${insight.severity === 'CRITICAL' ? 'text-accent-danger' : insight.severity === 'HIGH' ? 'text-accent-warm' : 'text-accent-primary'}`} />
                                        {insight.title}
                                    </h3>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${insight.severity === 'CRITICAL' ? 'bg-accent-danger/20 text-accent-danger border-accent-danger/30' : insight.severity === 'HIGH' ? 'bg-accent-warm/20 text-accent-warm border-accent-warm/30' : 'bg-accent-primary/20 text-accent-primary border-accent-primary/30'}`}>
                                        {insight.severity} SEVERITY
                                    </span>
                                </div>
                                <p className="text-text-muted mb-6 leading-relaxed bg-bg-primary/50 p-4 rounded-lg border border-border-glass">
                                    {insight.description}
                                </p>
                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-bold">Recommended LCC Action</p>
                                    <p className="text-sm text-text-primary font-medium flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4 text-accent-primary" />
                                        {insight.actionRecommended}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex bg-bg-primary min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-bg-secondary border-r border-border-default flex flex-col hidden md:flex sticky top-0 h-screen">
                <div className="p-6 border-b border-border-default flex items-center gap-3">
                    <Shield className="w-8 h-8 text-accent-primary" />
                    <div>
                        <h2 className="font-display text-lg text-text-primary leading-tight">LCC Desk</h2>
                        <p className="text-xs text-text-muted">Local Committee</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveView(item.id); setSelectedCase(null); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeView === item.id && !selectedCase ? 'bg-bg-surface text-text-primary border-l-4 border-accent-primary shadow-sm' : 'text-text-muted hover:bg-bg-surface/50 hover:text-text-primary'}`}
                        >
                            <item.icon className={`w-5 h-5 ${activeView === item.id && !selectedCase ? 'text-accent-primary' : ''} ${item.variant === 'danger' && 'text-accent-danger'}`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && item.badge !== "0" && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.variant === 'danger' ? 'bg-accent-danger text-text-primary' : item.variant === 'warning' ? 'bg-accent-warm text-bg-primary' : 'bg-bg-primary border border-border-default text-text-muted'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-border-default space-y-2">
                    <div className="flex items-center justify-between px-2 w-full mb-2">
                        <span className="text-xs text-text-muted font-medium uppercase">Theme</span>
                        <ThemeToggle />
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-medium text-text-muted hover:text-accent-danger transition-colors w-full p-2 rounded-lg hover:bg-bg-surface">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 animate-in fade-in duration-300 relative">
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 md:hidden z-10">
                    <ThemeToggle />
                </div>
                {activeView === 'insights' ? renderInsights() : selectedCase ? renderCaseDetail() : renderOverview()}
            </main>
        </div>
    );
}
