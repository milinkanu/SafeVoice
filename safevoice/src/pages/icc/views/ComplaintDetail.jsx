import { useState } from 'react';
import { useIccStore } from '../../../store/iccStore';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, Clock, Save, FileText, CheckCircle2, AlertTriangle, MessageSquare, Scale, Download, DownloadCloud, Eye, EyeOff } from 'lucide-react';
import jsPDF from 'jspdf';

const TABS = ['Details', 'Hearings', 'Evidence', 'Respondent', 'Report'];

const STAGE_ORDER = [
    "FILED", "RESPONDENT_NOTIFIED", "REPLY_RECEIVED", "INQUIRY_STARTED",
    "HEARINGS_IN_PROGRESS", "INQUIRY_COMPLETE", "REPORT_SUBMITTED",
    "EMPLOYER_ACTION_PENDING"
];

const COMPLETED_STAGES = ["CLOSED_PROVEN", "CLOSED_NOT_PROVEN", "CLOSED_MALICIOUS", "ESCALATED_LCC"];

export default function ComplaintDetail({ caseId, onBack }) {
    const { getComputedCases, simulatedToday, advanceStage, updateCase } = useIccStore();
    const cases = getComputedCases();
    const caseData = cases.find(c => c.id === caseId);

    const [activeTab, setActiveTab] = useState('Details');
    const [blurDescription, setBlurDescription] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal/Form states
    const [showHearingModal, setShowHearingModal] = useState(false);
    const [hearingForm, setHearingForm] = useState({ date: simulatedToday, type: 'COMPLAINANT_STATEMENT', attendees: '', evidence: '', notes: '' });

    const [reportForm, setReportForm] = useState({ findings: '', facts: '', credibility: '', recommendation: 'Warning Letter', conditions: [] });

    if (!caseData) return null;

    const currentStageIndex = STAGE_ORDER.indexOf(caseData.stage);
    const isClosed = COMPLETED_STAGES.includes(caseData.stage);

    const handleAdvance = (nextStage, note) => {
        if (confirm(`Advance this case to ${nextStage.replace(/_/g, ' ')}?`)) {
            advanceStage(caseId, nextStage, note);
            alert(`✅ Stage advanced to ${nextStage.replace(/_/g, ' ')}`);
        }
    };

    const handleSaveHearing = () => {
        const newHearing = {
            id: 'H' + Date.now(),
            date: hearingForm.date,
            type: hearingForm.type,
            attendees: hearingForm.attendees.split(',').map(s => s.trim()),
            evidenceSubmitted: hearingForm.evidence ? hearingForm.evidence.split(',').map(s => s.trim()) : [],
            notes: hearingForm.notes
        };
        updateCase(caseId, { hearings: [...caseData.hearings, newHearing] });
        setShowHearingModal(false);
        setHearingForm({ date: simulatedToday, type: 'COMPLAINANT_STATEMENT', attendees: '', evidence: '', notes: '' });
        alert('✅ Hearing logged successfully.');
    };

    const generateReportPDF = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const doc = new jsPDF();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("INTERNAL COMPLAINTS COMMITTEE — INQUIRY REPORT", 105, 20, null, null, "center");
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Under the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013", 105, 26, null, null, "center");

            doc.setDrawColor(200);
            doc.line(20, 32, 190, 32);

            let y = 45;
            doc.setFont("helvetica", "bold"); doc.text(`1. Case Reference: ${caseData.id}`, 20, y); y += 6;
            doc.setFont("helvetica", "normal"); doc.text(`Date of Filing: ${caseData.filedDate}`, 25, y); y += 6;
            doc.text(`Inquiry Completion Date: ${simulatedToday}`, 25, y); y += 12;

            doc.setFont("helvetica", "bold"); doc.text("2. Findings of the Committee", 20, y); y += 6;
            doc.setFont("helvetica", "normal");
            const splitFindings = doc.splitTextToSize(reportForm.findings || caseData.report.findings || "Findings logged.", 160);
            doc.text(splitFindings, 25, y); y += (splitFindings.length * 6) + 6;

            doc.setFont("helvetica", "bold"); doc.text("3. Recommendation", 20, y); y += 6;
            doc.setFont("helvetica", "normal"); doc.text(reportForm.recommendation || caseData.report.recommendation, 25, y); y += 20;

            doc.setFont("helvetica", "bold"); doc.text("Confidential — Not for circulation — POSH Act 2013 Section 13", 105, 280, null, null, "center");

            doc.save(`ICC-Report-${caseData.id}.pdf`);

            if (!caseData.report.generated) {
                updateCase(caseId, {
                    report: { generated: true, generatedDate: simulatedToday, findings: reportForm.findings, recommendation: reportForm.recommendation, actionTaken: false, actionDate: null }
                });
                advanceStage(caseId, "REPORT_SUBMITTED", "Official ICC report generated and signed");
            }
            setIsGenerating(false);
        }, 1000);
    };

    const generateLCCForm = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("COMPLAINT TO LOCAL COMPLAINTS COMMITTEE", 105, 20, null, null, "center");
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Under Section 6 of the POSH Act 2013", 105, 26, null, null, "center");

        doc.setDrawColor(200);
        doc.line(20, 32, 190, 32);

        let y = 45;
        doc.setFont("helvetica", "bold"); doc.text(`Case Reference: ${caseData.id}`, 20, y); y += 6;
        doc.setFont("helvetica", "normal"); doc.text(`The ICC has failed to comply with statutory deadlines.`, 20, y); y += 6;
        doc.text(`This case was filed on ${caseData.filedDate}. Overdue status has been flagged.`, 20, y); y += 20;

        doc.save(`LCC-Escalation-${caseData.id}.pdf`);
    };

    // Calculate elapsed timeline
    const isOverdueOverall = Object.values(caseData.deadlineStatus).includes('OVERDUE');

    return (
        <div className="animate-in fade-in duration-300 h-[calc(100vh-8rem)] flex flex-col">
            {/* Minimal Header */}
            <div className="flex items-center justify-between mb-4 border-b border-border-default pb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack} className="p-2 -ml-2 text-text-muted hover:text-text-primary">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-mono font-bold tracking-tight text-text-primary">{caseData.id}</h1>
                            {isOverdueOverall && <span className="px-2 py-0.5 bg-accent-danger border border-accent-danger/50 text-white rounded text-xs font-bold uppercase animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">Critically Overdue</span>}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Badge status="active">{caseData.category}</Badge>
                            <span className="text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> Filed {caseData.filedDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Panel Layout */}
            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">

                {/* LEFT PANEL: Dynamic Content (60%) */}
                <div className="flex-1 lg:w-3/5 bg-bg-secondary border border-border-default rounded-2xl shadow-xl flex flex-col overflow-hidden">
                    <div className="flex overflow-x-auto border-b border-border-default shrink-0">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-accent-primary text-accent-primary bg-accent-primary/5' : 'border-transparent text-text-muted hover:text-text-primary hover:bg-bg-surface/50'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        {/* TAB: DETAILS */}
                        {activeView(activeTab) === 'Details' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-bg-surface p-4 rounded-xl border border-border-default">
                                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1 font-bold">Category</p>
                                        <p className="text-sm text-text-primary flex flex-wrap gap-1">
                                            {caseData.poshTypes.map(t => <span key={t} className="px-2 py-0.5 bg-text-primary/10 rounded">{t}</span>)}
                                        </p>
                                    </div>
                                    <div className="bg-bg-surface p-4 rounded-xl border border-border-default">
                                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1 font-bold">Accused Details</p>
                                        <p className="text-sm font-medium text-text-primary">{caseData.accusedDesignation}</p>
                                        <p className="text-sm text-text-muted">{caseData.accusedDepartment} Dept</p>
                                    </div>
                                </div>

                                <div className="bg-bg-surface p-4 rounded-xl border border-border-default relative overflow-hidden group">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Incident Description</p>
                                        <button onClick={() => setBlurDescription(!blurDescription)} className="text-text-muted hover:text-accent-primary transition-colors">
                                            {blurDescription ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className={`text-sm text-text-primary transition-all duration-300 ${blurDescription ? 'blur-sm select-none' : ''}`}>
                                        {caseData.description}
                                    </p>
                                    {blurDescription && (
                                        <div className="absolute inset-0 bg-bg-surface/10 flex items-center justify-center pointer-events-none cursor-pointer">
                                            <span className="bg-bg-primary px-3 py-1.5 rounded-lg border border-border-default text-xs font-medium text-text-muted shadow-lg">Click eye icon to reveal</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border border-border-default rounded-xl bg-bg-primary/50">
                                    <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-accent-primary" /> Interim Relief Granted (Sec 12)
                                    </h3>
                                    {caseData.interimRelief.granted ? (
                                        <ul className="list-disc list-inside text-sm text-text-muted space-y-1">
                                            {caseData.interimRelief.measures.map((m, i) => <li key={i}>{m}</li>)}
                                        </ul>
                                    ) : (
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 text-sm text-text-primary"><input type="checkbox" className="w-4 h-4 rounded border-border-default bg-bg-surface checked:bg-accent-primary" /> Transfer complainant to another dept</label>
                                            <label className="flex items-center gap-3 text-sm text-text-primary"><input type="checkbox" className="w-4 h-4 rounded border-border-default bg-bg-surface checked:bg-accent-primary" /> Restrict accused from supervising complainant</label>
                                            <label className="flex items-center gap-3 text-sm text-text-primary"><input type="checkbox" className="w-4 h-4 rounded border-border-default bg-bg-surface checked:bg-accent-primary" /> Grant special paid leave (3 months)</label>
                                            <Button variant="outline" className="mt-2 text-xs h-8" onClick={() => {
                                                updateCase(caseId, { interimRelief: { granted: true, measures: ["Restrict accused from supervising complainant"], grantedDate: simulatedToday } });
                                                alert('Interim relief logged.');
                                            }}>Log Interim Relief</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: HEARINGS */}
                        {activeView(activeTab) === 'Hearings' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-border-default pb-4">
                                    <h3 className="font-semibold text-text-primary">Formal Hearing Logs</h3>
                                    <Button onClick={() => setShowHearingModal(true)} disabled={currentStageIndex < 3} className="h-9">
                                        + Log New Hearing
                                    </Button>
                                </div>
                                {currentStageIndex < 3 && <p className="text-xs text-accent-warm bg-accent-warm/10 p-3 rounded-lg border border-accent-warm/20">Stage must be INQUIRY_STARTED to log formal hearings.</p>}

                                {showHearingModal && (
                                    <div className="bg-bg-surface border border-accent-primary/50 p-6 rounded-xl space-y-4 shadow-lg mb-6">
                                        <h4 className="font-bold text-text-primary">New Hearing Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-xs text-text-muted">Date</label><input type="date" value={hearingForm.date} onChange={e => setHearingForm({ ...hearingForm, date: e.target.value })} className="w-full bg-bg-primary text-text-primary border p-2 rounded text-sm" /></div>
                                            <div><label className="text-xs text-text-muted">Type</label>
                                                <select value={hearingForm.type} onChange={e => setHearingForm({ ...hearingForm, type: e.target.value })} className="w-full bg-bg-primary text-text-primary border p-2 rounded text-sm">
                                                    <option value="COMPLAINANT_STATEMENT">Complainant Statement</option><option value="RESPONDENT_STATEMENT">Respondent Statement</option><option value="CROSS_EXAMINATION">Cross Examination</option><option value="FINAL_ARGUMENTS">Final Arguments</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div><label className="text-xs text-text-muted">Attendees (comma separated)</label><input type="text" value={hearingForm.attendees} onChange={e => setHearingForm({ ...hearingForm, attendees: e.target.value })} className="w-full bg-bg-primary text-text-primary border p-2 rounded text-sm" /></div>
                                        <div><label className="text-xs text-text-muted">Evidence Introduced (comma separated files)</label><input type="text" value={hearingForm.evidence} onChange={e => setHearingForm({ ...hearingForm, evidence: e.target.value })} className="w-full bg-bg-primary text-text-primary border p-2 rounded text-sm" /></div>
                                        <div><label className="text-xs text-text-muted">Official Minutes / Notes</label><textarea value={hearingForm.notes} onChange={e => setHearingForm({ ...hearingForm, notes: e.target.value })} className="w-full bg-bg-primary text-text-primary border p-2 rounded text-sm h-24" /></div>
                                        <div className="flex gap-2 justify-end"><Button variant="ghost" className="h-8" onClick={() => setShowHearingModal(false)}>Cancel</Button><Button className="h-8" onClick={handleSaveHearing}>Save Log</Button></div>
                                    </div>
                                )}

                                {caseData.hearings.length === 0 && !showHearingModal ? (
                                    <div className="text-center py-10 border border-dashed border-border-default rounded-xl">
                                        <p className="text-text-muted text-sm">No formal hearings logged yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-default">
                                        {caseData.hearings.map((h, i) => (
                                            <div key={h.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg-secondary bg-text-muted/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm">
                                                    <Scale className="w-4 h-4 text-text-primary" />
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded bg-bg-surface border border-border-default shadow">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-text-primary text-sm">{typeof h.type === 'string' ? h.type.replace('_', ' ') : 'HEARING'}</span>
                                                        <time className="font-mono text-xs text-text-muted">{h.date}</time>
                                                    </div>
                                                    <p className="text-sm text-text-muted mb-2">{h.notes}</p>
                                                    <div className="text-xs text-text-muted"><span className="font-semibold">Attendees:</span> {h.attendees.join(', ')}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: EVIDENCE */}
                        {activeView(activeTab) === 'Evidence' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-border-default pb-4">
                                    <h3 className="font-semibold text-text-primary">Repository (Immutable)</h3>
                                </div>
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead><tr className="border-b border-border-default text-text-muted"><th className="pb-2">File</th><th className="pb-2">Hash Signature</th><th className="pb-2 text-right">Certificate</th></tr></thead>
                                    <tbody className="divide-y divide-border-default">
                                        {caseData.evidence.map(e => (
                                            <tr key={e.id} className="hover:bg-bg-surface/30">
                                                <td className="py-4 font-medium text-text-primary">{e.name}</td>
                                                <td className="py-4 font-mono text-xs text-text-muted bg-bg-surface/50 rounded px-2">{e.hash.substring(0, 16)}...</td>
                                                <td className="py-4 text-right">
                                                    <Button variant="outline" className="h-8 text-[10px]"><DownloadCloud className="w-3 h-3 mr-1" /> PDF</Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {caseData.evidence.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-text-muted">No evidence submitted.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB: RESPONDENT */}
                        {activeView(activeTab) === 'Respondent' && (
                            <div className="space-y-6">
                                <div className="bg-bg-surface p-5 rounded-xl border border-border-default">
                                    <h3 className="font-semibold text-text-primary mb-4">Notification Status</h3>
                                    <div className="flex items-center gap-4 text-sm mb-4">
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${caseData.respondent.notified ? 'bg-accent-primary' : 'bg-text-muted/30'} text-bg-primary`}>
                                            {caseData.respondent.notified && <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                        <span className="text-text-primary">Formal notice sent to Respondent (Within 7 days)</span>
                                    </div>
                                    {!caseData.respondent.notified && <Button className="h-8" onClick={() => {
                                        updateCase(caseId, { respondent: { ...caseData.respondent, notified: true } });
                                        handleAdvance("RESPONDENT_NOTIFIED", "Sent formal notification to respondent.");
                                    }}>Mark as Notified Today</Button>}
                                </div>

                                <div className="bg-bg-surface p-5 rounded-xl border border-border-default">
                                    <h3 className="font-semibold text-text-primary mb-4">Reply Status</h3>
                                    <div className="flex items-center gap-4 text-sm mb-4">
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${caseData.respondent.replyReceived ? 'bg-accent-primary' : 'bg-text-muted/30'} text-bg-primary`}>
                                            {caseData.respondent.replyReceived && <CheckCircle2 className="w-4 h-4" />}
                                        </div>
                                        <span className="text-text-primary">Written reply received with list of documents/witnesses (Within 10 days of notice)</span>
                                    </div>
                                    {caseData.respondent.replyReceived ? (
                                        <div className="p-4 bg-bg-primary/50 text-sm italic text-text-muted rounded border border-border-default">"{caseData.respondent.replyText}"</div>
                                    ) : (
                                        caseData.respondent.notified && <Button className="h-8" onClick={() => {
                                            const reply = prompt("Enter summary of respondent's reply:");
                                            if (reply) {
                                                updateCase(caseId, { respondent: { ...caseData.respondent, replyReceived: true, replyDate: simulatedToday, replyText: reply } });
                                                handleAdvance("REPLY_RECEIVED", "Received reply from respondent.");
                                            }
                                        }}>Record Reply Received</Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: REPORT */}
                        {activeView(activeTab) === 'Report' && (
                            <div className="space-y-6">
                                {currentStageIndex < 5 ? (
                                    <div className="text-center py-12 px-6 bg-accent-danger/5 border border-accent-danger/20 rounded-xl">
                                        <AlertTriangle className="w-10 h-10 text-accent-danger/50 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-text-primary mb-2">Stage Gating Enforced</h3>
                                        <p className="text-sm text-text-muted text-center">You cannot generate an official ICC Report until Formal Inquiry proceedings are marked as complete. Current stage is <strong className="text-text-primary">{caseData.stage.replace(/_/g, ' ')}</strong>.</p>
                                    </div>
                                ) : caseData.report.generated ? (
                                    <div className="text-center py-10 bg-accent-primary/5 border border-accent-primary/20 rounded-xl shadow-inner">
                                        <CheckCircle2 className="w-12 h-12 text-accent-primary mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-text-primary mb-2">Official Report Generated</h3>
                                        <p className="text-sm text-text-muted mb-6">Generated on {caseData.report.generatedDate}. Signed by the presiding officer cryptographically.</p>
                                        <Button variant="primary" onClick={generateReportPDF}><Download className="w-4 h-4 mr-2" /> Re-Download Report PDF</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-5 bg-bg-surface p-6 rounded-xl border border-border-default shadow-sm">
                                        <h3 className="text-lg font-bold text-text-primary mb-2">Generate ICC Final Report</h3>

                                        <div>
                                            <label className="text-xs font-bold uppercase text-text-muted tracking-wide mb-1 block">Final Findings of the Committee</label>
                                            <textarea className="w-full bg-bg-primary border border-border-default rounded p-3 text-sm text-text-primary h-24" placeholder="Based on the preponderance of probability, the committee concludes that..." value={reportForm.findings} onChange={e => setReportForm({ ...reportForm, findings: e.target.value })} />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold uppercase text-text-muted tracking-wide mb-1 block">Recommendation (Select under POSH Rules)</label>
                                            <select className="w-full bg-bg-primary border border-border-default rounded p-3 text-sm text-text-primary outline-none focus:border-accent-primary" value={reportForm.recommendation} onChange={e => setReportForm({ ...reportForm, recommendation: e.target.value })}>
                                                <option>Written Apology</option>
                                                <option>Warning Letter</option>
                                                <option>Withhold Promotion/Increment</option>
                                                <option>Counseling</option>
                                                <option>Suspension</option>
                                                <option>TERMINATION</option>
                                                <option>Complaint Not Proven — No Action</option>
                                            </select>
                                        </div>

                                        <div className="pt-4 border-t border-border-default">
                                            <Button className="w-full" disabled={isGenerating || !reportForm.findings} onClick={generateReportPDF}>
                                                {isGenerating ? "Generating Secure Document..." : "Sign & Generate Official PDF"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: Timeline & Actions (40%) */}
                <div className="flex-1 lg:w-2/5 flex flex-col gap-6 min-h-0">

                    {/* TIMELINE */}
                    <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 shadow-xl flex-1 overflow-y-auto">
                        <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-accent-primary" /> Compliance Timeline
                        </h2>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-accent-primary before:via-border-default before:to-border-default">
                            {STAGE_ORDER.map((stageName, idx) => {
                                const isDone = currentStageIndex > idx || isClosed;
                                const isCurrent = currentStageIndex === idx && !isClosed;
                                const isFuture = currentStageIndex < idx && !isClosed;

                                // Map stage to specific deadline field conceptually (simplified mapping)
                                let deadlineStr = null;
                                let isStageOverdue = false;
                                if (stageName === "RESPONDENT_NOTIFIED") { deadlineStr = caseData.dates.respondentNotifyDeadline; isStageOverdue = caseData.deadlineStatus.respondentNotify === 'OVERDUE'; }
                                if (stageName === "INQUIRY_STARTED") { deadlineStr = caseData.dates.inquiryStartDeadline; isStageOverdue = caseData.deadlineStatus.inquiryStart === 'OVERDUE'; }
                                if (stageName === "INQUIRY_COMPLETE") { deadlineStr = caseData.dates.inquiryCompleteDeadline; isStageOverdue = caseData.deadlineStatus.inquiryComplete === 'OVERDUE'; }
                                if (stageName === "REPORT_SUBMITTED") { deadlineStr = caseData.dates.reportDeadline; isStageOverdue = caseData.deadlineStatus.reportSubmit === 'OVERDUE'; }
                                if (stageName === "EMPLOYER_ACTION_PENDING") { deadlineStr = caseData.dates.employerActionDeadline; isStageOverdue = caseData.deadlineStatus.employerAction === 'OVERDUE'; }

                                return (
                                    <div key={stageName} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group opacity-${isFuture ? '50' : '100'} transition-opacity`}>
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-bg-secondary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${isDone ? 'bg-accent-primary' : isCurrent ? 'bg-bg-primary border-accent-primary' : 'bg-bg-surface border-border-default'}`}>
                                            {isDone && <CheckCircle2 className="w-4 h-4 text-bg-secondary" />}
                                            {isCurrent && <div className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />}
                                        </div>
                                        <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-lg ${isCurrent ? 'bg-accent-primary/10 border border-accent-primary/30 shadow-md' : 'bg-transparent'} ${isStageOverdue && !isDone ? 'border-accent-danger/50 bg-accent-danger/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}>
                                            <p className={`text-sm font-bold ${isDone ? 'text-text-primary' : isCurrent ? 'text-accent-primary' : 'text-text-muted'} ${isStageOverdue && !isDone ? 'text-accent-danger' : ''}`}>{stageName.replace(/_/g, ' ')}</p>

                                            {isDone && (() => {
                                                const log = caseData.timelineLog.find(l => l.stage === stageName);
                                                return log ? <p className="text-[10px] text-text-muted mt-1 font-mono">{log.date}</p> : null;
                                            })()}

                                            {(!isDone && deadlineStr) && (
                                                <p className={`text-[10px] mt-1 font-mono ${isStageOverdue ? 'text-accent-danger font-bold' : 'text-text-muted'}`}>
                                                    Deadline: {deadlineStr}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 shadow-xl shrink-0">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Required Actions</h2>

                        <div className="flex flex-col gap-3">
                            {caseData.stage === 'FILED' && (
                                <Button className="w-full justify-start" onClick={() => handleAdvance("RESPONDENT_NOTIFIED", "Formal notification dispatched")}>
                                    <MessageSquare className="w-4 h-4 mr-2" /> Notify Respondent (7 Days limit)
                                </Button>
                            )}
                            {caseData.stage === 'RESPONDENT_NOTIFIED' && (
                                <>
                                    <Button className="w-full justify-start bg-bg-surface text-text-primary border border-border-default hover:bg-bg-surface/80" onClick={() => { setActiveTab('Respondent'); }}>
                                        <Save className="w-4 h-4 mr-2" /> Mark Reply Received
                                    </Button>
                                    <Button className="w-full justify-start bg-accent-warm/10 text-accent-warm hover:bg-accent-warm/20" onClick={() => handleAdvance("INQUIRY_STARTED", "Proceeding ex-parte due to non response")}>
                                        <Scale className="w-4 h-4 mr-2" /> Proceed Ex-Parte
                                    </Button>
                                </>
                            )}
                            {caseData.stage === 'REPLY_RECEIVED' && (
                                <Button className="w-full justify-start" onClick={() => handleAdvance("INQUIRY_STARTED", "Inquiry initiated formal notices sent")}>
                                    <Scale className="w-4 h-4 mr-2" /> Start Formal Inquiry
                                </Button>
                            )}
                            {(caseData.stage === 'INQUIRY_STARTED' || caseData.stage === 'HEARINGS_IN_PROGRESS') && (
                                <>
                                    <Button className="w-full justify-start" onClick={() => handleAdvance("INQUIRY_COMPLETE", "Inquiry marked closed and resolved")}>
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Inquiry Complete
                                    </Button>
                                    {caseData.stage === 'INQUIRY_STARTED' && (
                                        <Button className="w-full justify-start bg-bg-surface text-text-primary border border-border-default" onClick={() => handleAdvance("HEARINGS_IN_PROGRESS", "Hearings commenced")}>
                                            <MessageSquare className="w-4 h-4 mr-2" /> Begin Hearings State
                                        </Button>
                                    )}
                                </>
                            )}
                            {caseData.stage === 'INQUIRY_COMPLETE' && (
                                <Button className="w-full justify-start bg-accent-primary" onClick={() => setActiveTab('Report')}>
                                    <FileText className="w-4 h-4 mr-2 text-bg-primary" /> Generate Report
                                </Button>
                            )}
                            {caseData.stage === 'REPORT_SUBMITTED' && (
                                <Button className="w-full justify-start" onClick={() => handleAdvance("CLOSED_PROVEN", "Action taken by employer")}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Employer Action Executed
                                </Button>
                            )}

                            {isOverdueOverall && !isClosed && (
                                <Button className="w-full justify-start bg-accent-danger/20 text-accent-danger hover:bg-accent-danger/30 mt-2" onClick={generateLCCForm}>
                                    <Download className="w-4 h-4 mr-2" /> Escape to LCC Format (PDF)
                                </Button>
                            )}

                            {isClosed && (
                                <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-xl text-center">
                                    <p className="font-bold text-text-primary text-sm uppercase">Case Resoluted</p>
                                    <p className="text-xs text-text-muted mt-1">This formal inquiry lifecycle is exhausted and archived.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function activeView(tab) {
    return tab;
}
