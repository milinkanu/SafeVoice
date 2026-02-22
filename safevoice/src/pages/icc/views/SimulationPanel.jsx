import { useState } from 'react';
import { useIccStore, addDays } from '../../../store/iccStore';
import { Button } from '../../../components/ui/Button';
import { FlaskConical, Play, RefreshCw, AlertTriangle, FastForward, Clock } from 'lucide-react';

const STAGE_ORDER = [
    "FILED", "RESPONDENT_NOTIFIED", "REPLY_RECEIVED", "INQUIRY_STARTED",
    "HEARINGS_IN_PROGRESS", "INQUIRY_COMPLETE", "REPORT_SUBMITTED",
    "EMPLOYER_ACTION_PENDING", "CLOSED_PROVEN"
];

export default function SimulationPanel() {
    const { getComputedCases, simulatedToday, setSimulatedToday, advanceStage, updateCase, resetCases } = useIccStore();
    const cases = getComputedCases();
    const [isDemoRunning, setIsDemoRunning] = useState(false);

    // Toast System
    const [toasts, setToasts] = useState([]);
    const addToast = (msg, type = 'info') => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
    };

    const handleAdvanceStr = (id, currentStage) => {
        const idx = STAGE_ORDER.indexOf(currentStage);
        if (idx < STAGE_ORDER.length - 1) {
            advanceStage(id, STAGE_ORDER[idx + 1], "Simulated progression");
            addToast(`[${id}] Advanced to ${STAGE_ORDER[idx + 1].replace(/_/g, ' ')}`, 'success');
        }
    };

    const handleRewindStr = (id, currentStage) => {
        const idx = STAGE_ORDER.indexOf(currentStage);
        if (idx > 0) {
            updateCase(id, { stage: STAGE_ORDER[idx - 1] }); // bypass logging for rewinds
            addToast(`[${id}] Rewinded to ${STAGE_ORDER[idx - 1].replace(/_/g, ' ')}`, 'warning');
        }
    };

    const jumpDate = (offsetDays) => {
        const newDate = addDays(simulatedToday, offsetDays);
        setSimulatedToday(newDate);
        addToast(`System time updated to ${newDate}`, 'info');
    };

    const runDemo = async () => {
        setIsDemoRunning(true);
        const demoCaseId = "SV-2025-XK9-4721";
        const c = cases.find(c => c.id === demoCaseId);

        resetCases(); // Fresh state
        setSimulatedToday("2025-11-15");
        addToast("Started Global Simulation for " + demoCaseId, "info");

        let currentIdx = STAGE_ORDER.indexOf("FILED");

        for (let i = currentIdx; i < STAGE_ORDER.length - 1; i++) {
            if (!isDemoRunning) { console.log('Checking component unmounts but cannot halt sync easily without complex refs. Abort via refresh.'); break; }
            await new Promise(r => setTimeout(r, 2000));
            advanceStage(demoCaseId, STAGE_ORDER[i + 1], "Demo bot progression");
            addToast(`${STAGE_ORDER[i]} ➜ ${STAGE_ORDER[i + 1]}`, 'success');
        }
        setIsDemoRunning(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 relative">

            {/* TOASTS CONTAINER */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`px-4 py-3 rounded-xl shadow-2xl border font-bold text-sm tracking-wide text-white transition-all transform origin-top animate-in fade-in slide-in-from-top-4 ${t.type === 'success' ? 'bg-accent-primary border-accent-primary/50' : t.type === 'warning' ? 'bg-accent-warm border-accent-warm/50' : t.type === 'danger' ? 'bg-accent-danger border-accent-danger/50' : 'bg-bg-secondary text-text-primary border-border-default'}`}>
                        {t.msg}
                    </div>
                ))}
            </div>

            <header className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <FlaskConical className="w-10 h-10 text-accent-primary" />
                    <div>
                        <h1 className="text-2xl font-display text-text-primary">Simulation Panel</h1>
                        <p className="text-text-muted text-sm mt-1">Manipulate timelines and stages to test deadline generation and routing logic.</p>
                    </div>
                </div>
                <Button className="shrink-0 font-bold bg-accent-primary animate-pulse" disabled={isDemoRunning} onClick={runDemo}>
                    <Play className="w-4 h-4 mr-2" fill="currentColor" /> Run Auto Demo
                </Button>
            </header>

            {/* GLOBAL TIME CONTROL */}
            <section className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow">
                <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent-warm" /> System Timetravel Engine
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-1 p-4 bg-bg-surface rounded-xl border border-border-default text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Current System Anchor Date</p>
                        <p className="text-3xl font-mono text-text-primary font-bold">{simulatedToday}</p>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                        <Button variant="outline" onClick={() => jumpDate(7)}><FastForward className="w-4 h-4 mr-1" /> +7 Days (Notice)</Button>
                        <Button variant="outline" onClick={() => jumpDate(30)}><FastForward className="w-4 h-4 mr-1 text-accent-warm" /> +30 Days</Button>
                        <Button variant="outline" onClick={() => jumpDate(90)}><AlertTriangle className="w-4 h-4 mr-1 text-accent-danger" /> +90 Days (Overdue)</Button>
                        <Button variant="outline" className="text-accent-danger" onClick={() => resetCases()}><RefreshCw className="w-4 h-4 mr-1" /> Factory Reset</Button>
                    </div>
                </div>
            </section>

            {/* CASE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map(c => {
                    const idx = STAGE_ORDER.indexOf(c.stage);
                    const isOverdue = Object.values(c.deadlineStatus).includes('OVERDUE');

                    return (
                        <div key={c.id} className={`bg-bg-secondary p-5 rounded-2xl border ${isOverdue ? 'border-accent-danger/50 shadow-lg' : 'border-border-default shadow-sm'} flex flex-col`}>
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-mono text-sm font-bold text-text-primary">{c.id}</span>
                                {isOverdue && <span className="text-[10px] bg-accent-danger rounded px-2 py-0.5 text-white font-bold uppercase animate-pulse">Overdue</span>}
                            </div>

                            <p className="text-xs text-text-muted uppercase tracking-wider mb-1 font-bold">Current Stage</p>
                            <p className="text-sm font-bold text-accent-primary mb-4 bg-bg-surface p-2 rounded truncate">{c.stage.replace(/_/g, ' ')}</p>

                            <div className="mt-auto grid grid-cols-2 gap-2">
                                <Button variant="outline" className="h-8 text-xs font-bold px-2" disabled={idx === 0} onClick={() => handleRewindStr(c.id, c.stage)}>← Rewind</Button>
                                <Button variant="secondary" className="h-8 text-xs font-bold px-2" disabled={idx === STAGE_ORDER.length - 1} onClick={() => handleAdvanceStr(c.id, c.stage)}>Advance →</Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
