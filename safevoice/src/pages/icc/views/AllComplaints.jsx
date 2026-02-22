import { useState } from 'react';
import { useIccStore } from '../../../store/iccStore';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ChevronRight, Filter, Search } from 'lucide-react';

export default function AllComplaints({ onSelectCase }) {
    const { getComputedCases } = useIccStore();
    const cases = getComputedCases();
    const [filter, setFilter] = useState('all');
    const [deptFilter, setDeptFilter] = useState('');
    const [search, setSearch] = useState('');

    const filteredCases = cases.filter(c => {
        if (filter === 'overdue' && !Object.values(c.deadlineStatus).includes('OVERDUE')) return false;
        if (filter === 'active' && c.stage.startsWith('CLOSED')) return false;
        if (deptFilter && c.accusedDepartment !== deptFilter) return false;
        if (search && !c.id.toLowerCase().includes(search.toLowerCase()) && !c.category.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const uniqueDepts = [...new Set(cases.map(c => c.accusedDepartment))];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-display text-text-primary mb-2">All Complaints</h1>
                    <p className="text-text-muted">Master log of all POSH inquiries and statuses.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search ID or Category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-bg-secondary border border-border-default rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary focus:border-accent-primary outline-none focus:ring-1 focus:ring-accent-primary transition-all w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="bg-bg-secondary border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary outline-none focus:border-accent-primary transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All Departments</option>
                        {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </header>

            <section className="bg-bg-secondary border border-border-default rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface/30">
                    <div className="flex gap-2 text-sm">
                        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-lg transition-colors font-medium ${filter === 'all' ? 'bg-bg-primary text-text-primary border border-border-default shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>All Cases</button>
                        <button onClick={() => setFilter('active')} className={`px-4 py-1.5 rounded-lg transition-colors font-medium ${filter === 'active' ? 'bg-bg-primary text-text-primary border border-border-default shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Active Only</button>
                        <button onClick={() => setFilter('overdue')} className={`px-4 py-1.5 rounded-lg transition-colors font-medium ${filter === 'overdue' ? 'bg-accent-danger/10 text-accent-danger border border-accent-danger/20' : 'text-text-muted hover:text-accent-danger'}`}>Overdue Deadlines</button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-primary/50 border-b border-border-default text-xs uppercase tracking-wider text-text-muted font-bold">
                                <th className="p-4 pl-6">Case ID</th>
                                <th className="p-4">Filed Date</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Accused Dept</th>
                                <th className="p-4">Power Dynamic</th>
                                <th className="p-4">Stage</th>
                                <th className="p-4 pr-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                            {filteredCases.map((c) => (
                                <tr key={c.id} className="hover:bg-bg-surface/50 transition-colors group cursor-pointer" onClick={() => onSelectCase(c.id)}>
                                    <td className="p-4 pl-6">
                                        <div className="font-mono text-sm text-text-primary">{c.id}</div>
                                        {Object.values(c.deadlineStatus).includes('OVERDUE') && <span className="text-[10px] uppercase font-bold text-accent-danger mt-1 tracking-wider inline-block">Overdue Needs Attention</span>}
                                    </td>
                                    <td className="p-4 text-sm text-text-muted">{new Date(c.filedDate).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm font-medium text-text-primary">{c.category.replace('_', ' ')}</td>
                                    <td className="p-4 text-sm text-text-muted">{c.accusedDepartment}</td>
                                    <td className="p-4">
                                        {c.powerDynamic ? (
                                            <span className="px-2 py-1 bg-accent-warm/10 text-accent-warm border border-accent-warm/20 rounded text-xs font-bold uppercase">Yes</span>
                                        ) : (
                                            <span className="text-xs text-text-muted">No</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Badge status={c.stage === 'CLOSED_PROVEN' ? 'closed' : c.stage.includes('OVERDUE') ? 'overdue' : 'active'}>{c.stage.replace(/_/g, ' ')}</Badge>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onSelectCase(c.id); }}>
                                            View <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCases.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-bg-primary flex items-center justify-center border border-border-default">
                                <Search className="w-6 h-6 text-text-muted" />
                            </div>
                            <p className="text-text-muted font-medium">No cases match the given filter parameters.</p>
                            <Button variant="outline" onClick={() => { setFilter('all'); setDeptFilter(''); setSearch(''); }}>Clear Filters</Button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
