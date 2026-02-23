import { useIccStore } from '../../../store/iccStore';
import { Network, Activity, Clock, ShieldAlert } from 'lucide-react';

export default function Analytics() {
    const { getComputedCases } = useIccStore();
    const cases = getComputedCases();

    // Stats
    const total = cases.length;

    // Stage counts
    const stages = cases.reduce((acc, c) => {
        acc[c.stage] = (acc[c.stage] || 0) + 1;
        return acc;
    }, {});

    // Dept counts
    const depts = cases.reduce((acc, c) => {
        acc[c.accusedDepartment] = (acc[c.accusedDepartment] || 0) + 1;
        return acc;
    }, {});

    // Category
    const cats = cases.reduce((acc, c) => {
        if (!acc[c.category]) acc[c.category] = 0;
        acc[c.category]++;
        return acc;
    }, {});

    // Colors
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Conic gradient string generator for Pie chart
    let pieStyle = "";
    if (total > 0) {
        let currentPos = 0;
        let gradients = [];
        Object.values(cats).forEach((count, i) => {
            const percentage = (count / total) * 100;
            gradients.push(`${colors[i % colors.length]} ${currentPos}% ${currentPos + percentage}%`);
            currentPos += percentage;
        });
        pieStyle = `conic-gradient(${gradients.join(', ')})`;
    }

    // Average dept rate for Pattern detection
    const avg = total / Math.max(1, Object.keys(depts).length);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <header className="mb-4">
                <h1 className="text-3xl font-display text-text-primary mb-2">Platform Analytics</h1>
                <p className="text-text-muted">Data-driven insights to proactively detect and mitigate systemic compliance risks.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-bg-secondary border border-border-default shadow flex flex-col items-center text-center">
                    <Activity className="w-8 h-8 text-accent-primary mb-2" />
                    <p className="text-3xl font-display text-text-primary mb-1">26</p>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Avg Resolution Days</p>
                </div>
                <div className="p-6 rounded-2xl bg-bg-secondary border border-border-default shadow flex flex-col items-center text-center">
                    <Network className="w-8 h-8 text-accent-warm mb-2" />
                    <p className="text-3xl font-display text-text-primary mb-1">100%</p>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">LCC Routing Success</p>
                </div>
                <div className="p-6 rounded-2xl bg-bg-secondary border border-border-default shadow flex flex-col items-center text-center">
                    <Clock className="w-8 h-8 text-accent-danger mb-2" />
                    <p className="text-3xl font-display text-text-primary mb-1">1</p>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Overdue SLA Breaches</p>
                </div>
                <div className="p-6 rounded-2xl bg-bg-secondary border border-border-default shadow flex flex-col items-center text-center">
                    <ShieldAlert className="w-8 h-8 text-text-primary mb-2" />
                    <p className="text-3xl font-display text-text-primary mb-1">{total}</p>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Total Active Corpus</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Horizontal Bar Chart (Stages) */}
                <div className="bg-bg-secondary border border-border-default rounded-2xl shadow p-6">
                    <h2 className="text-lg font-bold text-text-primary mb-6">Current Case Pipeline</h2>
                    <div className="space-y-5 border-l-2 border-border-default pl-4">
                        {Object.entries(stages).map(([stage, count]) => (
                            <div key={stage} className="relative group">
                                <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                                    <span>{stage.replace(/_/g, ' ')}</span>
                                    <span>{count} Cases</span>
                                </div>
                                <div className="h-3 w-full bg-bg-surface rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-primary transition-all duration-1000 ease-out" style={{ width: `${(count / total) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pie Chart (Categories) */}
                <div className="bg-bg-secondary border border-border-default rounded-2xl shadow p-6 flex flex-col items-center justify-center">
                    <h2 className="text-lg font-bold text-text-primary mb-6 self-start w-full">POSH Category Breakdown</h2>
                    <div className="w-48 h-48 rounded-full mb-8 shadow-inner border-[8px] border-bg-surface flex items-center justify-center" style={{ background: pieStyle }}>
                        {/* Donut hole calculation */}
                        <div className="w-32 h-32 rounded-full bg-bg-secondary flex items-center justify-center shadow-2xl">
                            <span className="text-2xl font-bold text-text-primary">{total}</span>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-3 pb-4">
                        {Object.entries(cats).map(([cat, count], i) => (
                            <div key={cat} className="flex items-center gap-2 text-xs text-text-primary font-medium">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                                <span className="truncate" title={cat}>{cat.replace('_', ' ')}</span>
                                <span className="text-text-muted ml-auto font-bold">{Math.round((count / total) * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vertical Bar Chart (Departments) & Trend */}
                <div className="lg:col-span-2 bg-bg-secondary border border-border-default rounded-2xl shadow p-6 flex flex-col min-h-[300px]">
                    <h2 className="text-lg font-bold text-text-primary mb-2 flex justify-between items-center w-full focus:outline-none">
                        <span>Pattern Detection Array (Departmental Heatmap)</span>
                        <span className="text-xs text-text-muted font-normal bg-bg-surface px-3 py-1 rounded-full border border-border-default">System Average: {avg.toFixed(1)}</span>
                    </h2>

                    <div className="flex-1 flex items-end gap-4 pt-10 mt-auto h-[250px] border-b-2 border-border-default mb-6">
                        {Object.entries(depts).map(([dept, count]) => {
                            const isPattern = count > avg * 1.5 && count >= 2;
                            const maxCount = Math.max(...Object.values(depts), 1);
                            const heightPercent = (count / maxCount) * 100;

                            return (
                                <div key={dept} className="relative flex-1 group flex flex-col items-center justify-end w-full" style={{ height: `${heightPercent}%` }}>
                                    {isPattern && <span className="absolute -top-10 text-[10px] font-bold text-white bg-accent-danger px-2 py-1 rounded shadow-lg animate-bounce uppercase whitespace-nowrap z-10">Risk</span>}
                                    <div className="text-xs font-bold text-text-primary mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 bg-bg-surface px-2 py-1 rounded shadow-md z-20">{count}</div>
                                    <div className={`w-full h-full rounded-t-lg transition-all duration-1000 origin-bottom ${isPattern ? 'bg-gradient-to-t from-accent-danger/80 to-accent-danger' : 'bg-gradient-to-t from-border-default to-text-muted/50'}`} />
                                    <span className="absolute -bottom-6 text-[10px] font-bold text-text-muted uppercase text-center w-full truncate px-1">{dept}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
