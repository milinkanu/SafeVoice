import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import {
    Building2, ArrowLeft, Calendar, FileText, CheckCircle2,
    Clock, ShieldAlert, FileQuestion, UploadCloud, MessageSquare
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Extended mock detail data for demo
const MOCK_DETAIL = {
    id: 'SV-2026-XQ3-4921',
    filedDate: '2026-02-13T10:00:00Z',
    status: 'overdue_acknowledge',
    category: 'Hostile Environment',
    incidentDate: '2026-02-10',
    description: 'The senior designer repeatedly made inappropriate jokes during the weekly sync...',

    accused: {
        designation: 'Senior Designer (Level 4)',
        gender: 'Male',
        department: 'Design',
    },

    evidence: [
        { name: 'slack-log-feb10.png', hash: 'e3b0c442...', type: 'image/png' },
        { name: 'witness-email.pdf', hash: '8a9cc233...', type: 'application/pdf' }
    ],

    history: [
        { stage: 'filed', date: '2026-02-13T10:00:00Z' }
        // No acknowledgment yet -> overdue
    ]
};

export default function ComplaintDetail() {
    const { id } = useParams();

    const [caseData, setCaseData] = useState(() => {
        const storedCases = JSON.parse(localStorage.getItem('icc_cases')) || [];
        const foundCase = storedCases.find(c => c.id === id);
        return { ...MOCK_DETAIL, ...foundCase, messages: [] };
    });

    const [isUpdating, setIsUpdating] = useState(false);

    const fetchEvidenceAndCase = async () => {
        try {
            const evRes = await axios.get(`http://localhost:5000/api/evidence/${id}`);
            let fetchedEvidence = caseData.evidence || [];
            if (evRes.data.success && evRes.data.data.length > 0) {
                fetchedEvidence = evRes.data.data.map(e => ({
                    name: e.file_path.split('\\').pop().split('/').pop(),
                    hash: e.file_hash,
                    type: 'unknown'
                }));
            }

            const compRes = await axios.get('http://localhost:5000/api/icc/complaints');
            const c = compRes.data.data.find(comp => comp.case_id === id);

            if (c) {
                let parsedMessages = [];
                if (c.icc_message) {
                    try {
                        const mParsed = typeof c.icc_message === 'string' ? JSON.parse(c.icc_message) : c.icc_message;
                        if (Array.isArray(mParsed)) parsedMessages = mParsed;
                        else if (typeof mParsed === 'string') parsedMessages = [{ sender: 'ICC', text: mParsed, date: c.created_at }];
                    } catch (e) { parsedMessages = [{ sender: 'ICC', text: c.icc_message, date: c.created_at }]; }
                }

                let parsedHistory = [{ stage: 'filed', date: c.created_at }];
                if (c.history) {
                    try {
                        const hParsed = typeof c.history === 'string' ? JSON.parse(c.history) : c.history;
                        if (Array.isArray(hParsed)) parsedHistory = hParsed;
                    } catch (e) { }
                }

                setCaseData(prev => ({
                    ...prev,
                    evidence: fetchedEvidence,
                    status: c.status?.toLowerCase(),
                    messages: parsedMessages,
                    history: parsedHistory
                }));
            }
        } catch (err) {
            console.error("Failed to fetch updates", err);
        }
    };

    useEffect(() => {
        fetchEvidenceAndCase();
        const interval = setInterval(fetchEvidenceAndCase, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const handleAcknowledge = async () => {
        if (confirm("Marking as acknowledged legally confirms receipt by the ICC. Proceed?")) {
            setIsUpdating(true);
            try {
                const safeHistory = Array.isArray(caseData.history) ? caseData.history : [];
                const newHistory = [...safeHistory, { stage: 'acknowledged', date: new Date().toISOString() }];
                await axios.patch(`http://localhost:5000/api/icc/complaints/${caseData.id}`, { status: 'active', history: newHistory });

                setCaseData(prev => ({
                    ...prev,
                    status: 'active',
                    history: newHistory
                }));

                // Update local storage so dashboard sees the change before refreshing
                const currentCases = JSON.parse(localStorage.getItem('icc_cases')) || [];
                const updatedCases = currentCases.map(c =>
                    c.id === caseData.id ? { ...c, status: 'active', history: newHistory } : c
                );
                if (updatedCases.length > 0) {
                    localStorage.setItem('icc_cases', JSON.stringify(updatedCases));
                }
            } catch (err) {
                console.error("Failed to update status:", err);
                alert("Could not update case status on the server.");
            } finally {
                setIsUpdating(false);
            }
        }
    };

    return (
        <div className="flex bg-bg-primary min-h-screen">
            <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">

                {/* Top Header */}
                <header className="sticky top-0 bg-bg-secondary border-b border-border-default px-6 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link to="/icc" className="p-2 rounded-lg hover:bg-bg-surface text-text-muted transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-display leading-tight text-text-primary text-xl flex items-center gap-3">
                                Case <span className="font-mono bg-bg-surface px-2 py-0.5 rounded border border-white/5">{id}</span>
                                <Badge status={caseData.status}>{caseData.status.replace('_', ' ')}</Badge>
                            </h1>
                            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3.5 h-3.5" /> Filed: {new Date(caseData.filedDate).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
                        <Building2 className="w-4 h-4" /> Acme Corp ICC
                    </div>
                </header>

                {/* Split Layout */}
                <div className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8">

                    {/* LEFT PANEL (Case Details - 60%) */}
                    <div className="lg:w-3/5 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">

                        {/* Report Core */}
                        <section className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-sm">
                            <h2 className="text-lg font-semibold border-b border-border-default pb-4 mb-4 text-text-primary">Complainant Report</h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-bg-surface p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Incident Date</p>
                                    <p className="text-text-primary flex items-center gap-2"><Calendar className="w-4 h-4 text-accent-primary" /> {caseData.incidentDate}</p>
                                </div>
                                <div className="bg-bg-surface p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Nature of Complaint</p>
                                    <p className="text-text-primary flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-accent-warm" /> {caseData.category}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5 text-accent-primary" /> Decrypted Description
                                </p>
                                <div className="bg-bg-primary/50 text-text-primary leading-relaxed p-4 rounded-xl border border-dashed border-border-default h-32 overflow-y-auto">
                                    "{caseData.description}"
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-3">Accused Profile (Provided by victim)</p>
                                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {Object.entries(caseData.accused).map(([key, val]) => (
                                        <li key={key} className="bg-bg-surface px-3 py-2 rounded-lg border border-white/5 shadow-inner">
                                            <span className="block text-xs text-text-muted capitalize mb-0.5">{key}</span>
                                            <span className="text-sm font-medium text-text-primary">{val}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Evidence */}
                        <section className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-sm">
                            <h2 className="text-lg font-semibold border-b border-border-default pb-4 mb-4 text-text-primary flex items-center justify-between">
                                <span>Attached Evidence</span>
                                <span className="text-xs font-mono bg-bg-surface px-2 py-0.5 rounded text-text-muted">{caseData.evidence.length} files</span>
                            </h2>

                            <div className="space-y-3">
                                {caseData.evidence.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-bg-surface p-3 rounded-xl border border-white/5 group hover:border-text-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-6 h-6 text-text-muted group-hover:text-accent-primary transition-colors" />
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">{file.name}</p>
                                                <p className="text-xs font-mono text-text-muted flex items-center gap-1.5 mt-0.5">
                                                    <CheckCircle2 className="w-3 h-3 text-accent-primary" /> Hash verified: {file.hash.substring(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-xs" onClick={() => alert(`Starting download for ${file.name}...`)}>Download File</Button>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* RIGHT PANEL (Actions & Timeline - 40%) */}
                    <div className="lg:w-2/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

                        {/* Action Board */}
                        <section className="bg-bg-secondary p-6 rounded-2xl border-2 border-border-default shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary opacity-5 rounded-full blur-2xl"></div>

                            <h2 className="text-lg font-bold mb-6 text-text-primary flex items-center gap-2">
                                <Clock className="w-5 h-5 text-accent-primary" /> Required ICC Actions
                            </h2>

                            <div className="space-y-4">
                                {/* Contextual Action */}
                                {['pending', 'submitted', 'overdue_acknowledge'].includes((caseData.status || '').toLowerCase()) ? (
                                    <div className="bg-accent-danger/10 border border-accent-danger/20 p-4 rounded-xl">
                                        <p className="text-sm font-semibold text-accent-danger mb-2">Acknowledgment Required</p>
                                        <p className="text-xs text-text-primary/80 mb-4 leading-relaxed">You must formally acknowledge receipt to remain compliant with POSH timelines.</p>
                                        <Button variant="danger" className="w-full text-sm font-semibold shadow-lg shadow-accent-danger/20" onClick={handleAcknowledge} disabled={isUpdating}>
                                            {isUpdating ? 'Recording...' : 'Mark as Acknowledged'}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button variant="outline" className="w-full h-12 text-accent-primary border-accent-primary hover:bg-accent-primary/10" onClick={() => alert("Formal inquiry process initialized.")}>
                                        Start Formal Inquiry (Day 30 limit)
                                    </Button>
                                )}

                                <div className="h-px w-full bg-border-default my-2"></div>

                                {/* Standard Actions */}
                                <Button variant="ghost" className="w-full justify-start hover:bg-bg-surface text-text-muted hover:text-text-primary" onClick={() => alert('Upload modal will open here.')}>
                                    <UploadCloud className="w-4 h-4 mr-3" /> Upload Final Resolution / Findings
                                </Button>
                                <Button variant="ghost" className="w-full justify-start hover:bg-bg-surface text-text-muted hover:text-text-primary" onClick={() => alert('Request sent to the complainant.')}>
                                    <FileQuestion className="w-4 h-4 mr-3" /> Request More Information
                                </Button>
                                <Button variant="ghost" className="w-full justify-start hover:bg-bg-surface text-text-muted hover:text-text-primary" onClick={async () => {
                                    const msgText = prompt('Enter anonymous message for the victim:');
                                    if (msgText) {
                                        const newMsg = { sender: 'ICC', text: msgText, date: new Date().toISOString() };
                                        const newMessages = [...(caseData.messages || []), newMsg];
                                        try {
                                            await axios.patch(`http://localhost:5000/api/icc/complaints/${caseData.id}`, { iccMessage: JSON.stringify(newMessages) });
                                            setCaseData(prev => ({ ...prev, messages: newMessages }));
                                            alert('Message sent to the victim securely.');
                                        } catch (e) {
                                            alert('Failed to send message. Is your backend running?');
                                        }
                                    }
                                }}>
                                    <MessageSquare className="w-4 h-4 mr-3" /> Send Anonymous Message to Victim
                                </Button>
                            </div>
                        </section>

                        {/* Internal Notes */}
                        <section className="bg-bg-surface p-6 rounded-2xl border border-white/5 border-dashed">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Internal ICC Notes</h3>
                            <textarea
                                className="w-full h-32 bg-bg-primary border border-border-default rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent-primary focus:outline-none resize-none"
                                placeholder="Record your initial thoughts, team assignments, or conflict of interest declarations here. Invisible to complainant."
                            />
                            <div className="flex justify-end mt-3">
                                <Button variant="ghost" className="text-xs px-3 py-1 text-text-muted">Save Note</Button>
                            </div>
                        </section>

                        {/* Direct Messages */}
                        <section className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-sm max-h-[400px] overflow-y-auto flex flex-col mt-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Direct Messages</h3>
                            {caseData.messages && caseData.messages.length > 0 ? (
                                <div className="space-y-4 flex-1">
                                    {caseData.messages.map((msg, idx) => (
                                        <div key={idx} className={`p-3 rounded-xl border ${msg.sender === 'ICC' ? 'bg-bg-surface border-border-default ml-8' : 'bg-bg-primary border-accent-primary/20 mr-8'}`}>
                                            <p className="text-[10px] text-text-muted mb-1 font-semibold flex justify-between">
                                                <span>{msg.sender}</span>
                                                <span>{new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString()}</span>
                                            </p>
                                            <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-text-muted italic">No messages sent.</p>
                            )}
                        </section>

                    </div>

                </div>
            </main>
        </div>
    );
}

// Ensure Lock icon is imported
import { Lock } from 'lucide-react';
