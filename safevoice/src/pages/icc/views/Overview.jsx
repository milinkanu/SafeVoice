import { useIccStore } from '../../../store/iccStore';
import { AlertTriangle, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function Overview({ onSelectCase }) {
    const { getComputedCases } = useIccStore();
    const cases = getComputedCases();

    const stats = {
        total: cases.length,
        active: cases.filter(c => !c.stage.startsWith('CLOSED')).length,
        overdue: cases.filter(c => Object.values(c.deadlineStatus).includes('OVERDUE')).length,
        closed: cases.filter(c => c.stage.startsWith('CLOSED')).length
    };

    // Pattern Detection
    const deptCounts = cases.reduce((acc, c) => {
        acc[c.accusedDepartment] = (acc[c.accusedDepartment] || 0) + 1;
        return acc;
    }, {});
    const avg = cases.length / Object.keys(deptCounts).length;
    const patternedDepts = Object.keys(deptCounts).filter(d => deptCounts[d] > 1.5 * avg && deptCounts[d] >= 2);

    // Activity Feed (flatten and sort)
    const activities = cases.flatMap(c => c.timelineLog.map(log => ({ ...log, caseId: c.id })))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <header>
                <h1 className="text-3xl font-display text-text-primary mb-2">Dashboard Overview</h1>
                <p className="text-text-muted">Monitor POSH compliance metrics and active case deadlines.</p>
            </header>

            {patternedDepts.length > 0 && (
                <div className="bg-accent-warm/10 border p-4 rounded-xl flex items-start sm:items-center gap-4 shadow-lg animate-pulse border-accent-warm">
                    <AlertTriangle className="w-6 h-6 text-accent-warm shrink-0 mt-0.5 sm:mt-0" />
                    <div className="flex-1">
                        <h3 className="font-bold text-accent-warm text-sm uppercase tracking-wider">Pattern Detected</h3>
                        <p className="text-sm text-text-primary mt-1">
                            The following departments have high complaint concentrations: <span className="font-bold text-accent-warm">{patternedDepts.join(', ')}</span>.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Cases" value={stats.total} icon={Activity} />
                <StatCard label="Active Inquiries" value={stats.active} icon={Clock} />
                <StatCard label="Overdue Deadlines" value={stats.overdue} icon={AlertTriangle} variant="danger" />
                <StatCard label="Closed Cases" value={stats.closed} icon={CheckCircle2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Deadlines */}
                <div className="lg:col-span-2 bg-bg-secondary border border-border-default rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent-primary" /> Urgent Deadlines
                    </h2>
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border-default text-text-muted">
                                <th className="pb-3 font-medium">Case ID</th>
                                <th className="pb-3 font-medium">Stage</th>
                                <th className="pb-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                            {cases.filter(c => !c.stage.startsWith('CLOSED')).slice(0, 5).map(c => {
                                const isOverdue = Object.values(c.deadlineStatus).includes('OVERDUE');
                                return (
                                    <tr key={c.id} className="hover:bg-bg-surface/30 group">
                                        <td className="py-4">
                                            <span className="font-mono text-text-primary bg-bg-primary/50 px-2 py-1 rounded border border-white/5">{c.id}</span>
                                            {isOverdue && <span className="ml-2 px-2 py-0.5 bg-accent-danger/20 text-accent-danger rounded text-xs font-bold">OVERDUE</span>}
                                        </td>
                                        <td className="py-4 font-medium text-text-primary">{c.stage.replace(/_/g, ' ')}</td>
                                        <td className="py-4 text-right">
                                            <Button variant="ghost" className="opacity-0 group-hover:opacity-100 h-8 text-xs px-3" onClick={() => onSelectCase(c.id)}>
                                                Review Case
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Activity Feed */}
                <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 shadow-xl">
                    <h2 className="text-lg font-semibold text-text-primary mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        {activities.map((a, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-accent-primary mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-text-primary mb-1">{a.action}</p>
                                    <div className="flex justify-between items-center text-xs text-text-muted">
                                        <span className="font-mono">{a.caseId}</span>
                                        <span>{new Date(a.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, variant = 'primary', icon: Icon }) {
    return (
        <div className={`p-6 rounded-2xl border ${variant === 'danger' ? 'bg-accent-danger/5 border-accent-danger/20' : 'bg-bg-secondary border-border-default'} shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-sm font-medium text-text-muted mb-2">{label}</p>
                <h3 className={`text-4xl font-display ${variant === 'danger' ? 'text-accent-danger' : 'text-text-primary'}`}>{value}</h3>
            </div>
            {Icon && <Icon className={`w-10 h-10 ${variant === 'danger' ? 'text-accent-danger/20' : 'text-accent-primary/20'}`} />}
        </div>
    );
}
