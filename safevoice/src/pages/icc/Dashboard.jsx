import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Activity, Users, AlertTriangle, FileText, CheckCircle2, FlaskConical, LogOut } from 'lucide-react';
import Overview from './views/Overview';
import AllComplaints from './views/AllComplaints';
import ComplaintDetail from './views/ComplaintDetail';
import Analytics from './views/Analytics';
import SimulationPanel from './views/SimulationPanel';

export default function Dashboard() {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');
    const [selectedCaseId, setSelectedCaseId] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('icc_token');
        localStorage.removeItem('icc_user');
        navigate('/icc/login');
    };

    const navItems = [
        { id: 'overview', icon: Activity, label: 'Overview' },
        { id: 'complaints', icon: FileText, label: 'All Complaints' },
        { id: 'action', icon: AlertTriangle, label: 'Action Required', badge: '2', variant: 'danger' },
        { id: 'analytics', icon: CheckCircle2, label: 'Analytics' },
        { id: 'simulation', icon: FlaskConical, label: 'Simulation Panel' }
    ];

    const renderView = () => {
        if (selectedCaseId) {
            return <ComplaintDetail caseId={selectedCaseId} onBack={() => setSelectedCaseId(null)} />;
        }
        switch (activeView) {
            case 'overview': return <Overview onSelectCase={(id) => setSelectedCaseId(id)} />;
            case 'complaints': return <AllComplaints onSelectCase={(id) => setSelectedCaseId(id)} />;
            case 'analytics': return <Analytics />;
            case 'simulation': return <SimulationPanel />;
            default: return <Overview onSelectCase={(id) => setSelectedCaseId(id)} />;
        }
    };

    return (
        <div className="flex bg-bg-primary min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-bg-secondary border-r border-border-default flex flex-col hidden md:flex sticky top-0 h-screen">
                <div className="p-6 border-b border-border-default flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-accent-primary" />
                    <div>
                        <h2 className="font-display text-lg text-text-primary leading-tight">Acme Corp ICC</h2>
                        <p className="text-xs text-text-muted">Presiding Officer</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveView(item.id); setSelectedCaseId(null); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeView === item.id && !selectedCaseId ? 'bg-bg-surface text-text-primary border-l-4 border-accent-primary shadow-sm' : 'text-text-muted hover:bg-bg-surface/50 hover:text-text-primary'}`}
                        >
                            <item.icon className={`w-5 h-5 ${activeView === item.id && !selectedCaseId ? 'text-accent-primary' : ''} ${item.variant === 'danger' && 'text-accent-danger'}`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.variant === 'danger' ? 'bg-accent-danger text-white' : 'bg-bg-primary border border-border-default'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-border-default">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-medium text-text-muted hover:text-accent-danger transition-colors w-full p-2 rounded-lg hover:bg-bg-surface">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                    <p className="text-[10px] text-text-muted/50 text-center mt-2">Dr. Sarah Jenkins</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 animate-in fade-in duration-300">
                {renderView()}
            </main>
        </div>
    );
}
