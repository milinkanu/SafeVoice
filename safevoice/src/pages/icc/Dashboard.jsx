import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
    Building2, Activity, Users, AlertTriangle,
    Search, Filter, ChevronRight, LogOut, FileText, CheckCircle2
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
// Initial mock data
const INITIAL_CASES = [
    { id: 'SV-2026-XQ3-4921', filedDate: '2026-02-13', category: 'Hostile Environment', status: 'overdue', daysElapsed: 8 },
    { id: 'SV-2026-BC9-1120', filedDate: '2026-02-18', category: 'Verbal Harassment', status: 'pending', daysElapsed: 3 },
    { id: 'SV-2026-PT7-6623', filedDate: '2026-01-10', category: 'Physical Advance', status: 'active', daysElapsed: 42 },
    { id: 'SV-2025-ZR1-9988', filedDate: '2025-11-20', category: 'Quid Pro Quo', status: 'closed', daysElapsed: 85 },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    // Manage cases in state
    const [cases, setCases] = useState([]);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/icc/complaints');
                const formattedCases = response.data.data.map(c => {
                    const incidentDetails = typeof c.incident_details === 'string' ? JSON.parse(c.incident_details) : (c.incident_details || {});
                    const accusedDetails = typeof c.accused_details === 'string' ? JSON.parse(c.accused_details) : (c.accused_details || {});

                    return {
                        id: c.case_id,
                        filedDate: c.created_at,
                        category: incidentDetails.description?.substring(0, 25) + '...' || 'Unspecified',
                        status: c.status?.toLowerCase() || 'pending',
                        daysElapsed: Math.max(0, Math.floor((new Date() - new Date(c.created_at)) / (1000 * 60 * 60 * 24))),

                        // Keep full details for the detail view
                        incidentDate: incidentDetails.date || 'Not specified',
                        description: incidentDetails.description || 'No description',
                        accused: {
                            designation: accusedDetails.designation || 'Unknown',
                            gender: accusedDetails.gender || 'Unknown',
                            department: accusedDetails.department || 'Unknown'
                        },
                        evidence: [], // Evidence is fetched separately in a real scenario
                        history: [{ stage: 'filed', date: c.created_at }]
                    };
                });

                setCases(formattedCases);
                // Temporarily cache locally so ComplaintDetail doesn't break until we refactor it too
                localStorage.setItem('icc_cases', JSON.stringify(formattedCases));
            } catch (err) {
                console.error("Failed to fetch cases from database:", err);
            }
        };

        fetchCases();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('icc_token');
        localStorage.removeItem('icc_user');
        navigate('/icc/login');
    };

    const filteredCases = cases.filter(c => {
        if (filter === 'all') return true;
        if (filter === 'overdue') return c.status === 'overdue';
        if (filter === 'active') return c.status === 'active' || c.status === 'pending';
        return true;
    });

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
                    <SidebarItem icon={Activity} label="Overview" active />
                    <SidebarItem icon={FileText} label="All Complaints" badge="3" />
                    <SidebarItem icon={AlertTriangle} label="Action Required" badge="1" variant="danger" />
                    <SidebarItem icon={CheckCircle2} label="Closed Cases" />
                    <SidebarItem icon={Users} label="ICC Roster" />
                </nav>

                <div className="p-4 border-t border-border-default">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-sm font-medium text-text-muted hover:text-accent-danger transition-colors w-full p-2 rounded-lg hover:bg-bg-surface"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 max-w-6xl mx-auto w-full">

                {/* Mobile Nav TopBar */}
                <div className="md:hidden flex items-center justify-between p-4 bg-bg-secondary border-b border-border-default">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-accent-primary" />
                        <span className="font-display">Acme Corp ICC</span>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-text-muted"><LogOut className="w-5 h-5" /></button>
                </div>

                <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">

                    <header>
                        <h1 className="text-3xl font-display text-text-primary mb-2">Dashboard Overview</h1>
                        <p className="text-text-muted">Monitor POSH compliance metrics and active case deadlines.</p>
                    </header>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Total Active" value="3" />
                        <StatCard label="Pending Ack." value="1" trend="+1 this week" />
                        <StatCard label="Overdue Actions" value="1" variant="danger" icon={AlertTriangle} />
                        <StatCard label="Closed (YTD)" value="4" />
                    </div>

                    {/* Alert Banner */}
                    <div className="bg-accent-warm/10 border-l-4 border-accent-warm p-4 rounded-r-xl flex items-start sm:items-center gap-4 shadow-inner">
                        <AlertTriangle className="w-6 h-6 text-accent-warm shrink-0 mt-0.5 sm:mt-0" />
                        <div className="flex-1">
                            <h3 className="font-bold text-accent-warm text-sm">PATTERN ALERT: Design Department</h3>
                            <p className="text-sm text-text-primary/80">3 new complaints filed from the Design Department within the last 45 days. Consider preemptive training intervention.</p>
                        </div>
                        <Button variant="outline" className="hidden sm:block border-accent-warm/20 text-accent-warm hover:bg-accent-warm/20 text-xs">View Analytics</Button>
                    </div>

                    {/* Case Table Section */}
                    <section className="bg-bg-secondary border border-border-default rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-xl font-semibold text-text-primary">Case Queue</h2>
                            <div className="flex gap-2 text-sm">
                                <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'all' ? 'bg-bg-surface text-text-primary border' : 'text-text-muted hover:text-text-primary'}`}>All</button>
                                <button onClick={() => setFilter('active')} className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'active' ? 'bg-bg-surface text-text-primary border' : 'text-text-muted hover:text-text-primary'}`}>Active</button>
                                <button onClick={() => setFilter('overdue')} className={`px-3 py-1.5 rounded-md transition-colors ${filter === 'overdue' ? 'bg-accent-danger/10 text-accent-danger border border-accent-danger/20' : 'text-text-muted hover:text-accent-danger'}`}>Overdue</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-bg-surface/50 border-b border-border-default text-xs uppercase tracking-wider text-text-muted">
                                        <th className="p-4 font-medium">Case ID</th>
                                        <th className="p-4 font-medium">Filed Date</th>
                                        <th className="p-4 font-medium">Nature</th>
                                        <th className="p-4 font-medium">Timeline</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default">
                                    {filteredCases.map((c) => (
                                        <tr key={c.id} className="hover:bg-bg-surface/30 transition-colors group">
                                            <td className="p-4">
                                                <span className="font-mono text-sm text-text-primary bg-bg-primary/50 px-2 py-1 rounded border border-white/5">{c.id}</span>
                                            </td>
                                            <td className="p-4 text-sm text-text-muted">{new Date(c.filedDate).toLocaleDateString()}</td>
                                            <td className="p-4 text-sm text-text-primary">{c.category}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-bg-surface rounded-full h-1.5 max-w-[80px]">
                                                        <div className={`h-1.5 rounded-full ${c.status === 'overdue' ? 'bg-accent-danger' : c.status === 'closed' ? 'bg-text-muted' : 'bg-accent-warm'}`} style={{ width: `${Math.min((c.daysElapsed / 90) * 100, 100)}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-text-muted font-mono">Day {c.daysElapsed}/90</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge status={c.status}>{c.status}</Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link to={`/icc/complaint/${c.id}`}>
                                                    <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        View <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredCases.length === 0 && (
                                <div className="p-8 text-center text-text-muted">No cases match the selected filter.</div>
                            )}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon: Icon, label, badge, active, variant = 'primary' }) {
    return (
        <a href="#" className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-bg-surface text-text-primary border border-border-default shadow-sm' : 'text-text-muted hover:bg-bg-surface/50 hover:text-text-primary'}`}>
            <Icon className={`w-5 h-5 ${active ? 'text-accent-primary' : ''} ${variant === 'danger' && 'text-accent-danger'}`} />
            <span className="flex-1">{label}</span>
            {badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${variant === 'danger' ? 'bg-accent-danger text-white' : 'bg-bg-primary border border-border-default'}`}>
                    {badge}
                </span>
            )}
        </a>
    );
}

function StatCard({ label, value, trend, variant = 'primary', icon: Icon }) {
    return (
        <div className={`p-5 rounded-2xl border ${variant === 'danger' ? 'bg-accent-danger/5 border-accent-danger/20' : 'bg-bg-secondary border-border-default'} shadow-sm`}>
            <p className="text-sm font-medium text-text-muted mb-1 flex items-center gap-2">
                {Icon && <Icon className={`w-4 h-4 ${variant === 'danger' ? 'text-accent-danger' : 'text-accent-primary'}`} />}
                {label}
            </p>
            <div className="flex items-end gap-3">
                <h3 className={`text-3xl font-display ${variant === 'danger' ? 'text-accent-danger' : 'text-text-primary'}`}>{value}</h3>
                {trend && <span className="text-xs text-text-muted mb-1 pb-0.5">{trend}</span>}
            </div>
        </div>
    );
}
