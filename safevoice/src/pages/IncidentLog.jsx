import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Calendar, Save, Trash2, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import jsPDF from 'jspdf';

export default function IncidentLog() {
    const [logs, setLogs] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newWitnesses, setNewWitnesses] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('safevoice_incident_log');
        if (stored) setLogs(JSON.parse(stored));
    }, []);

    const saveLogs = (newLogs) => {
        setLogs(newLogs);
        localStorage.setItem('safevoice_incident_log', JSON.stringify(newLogs));
    };

    const handleAdd = () => {
        if (!newDate || !newDesc) return alert("Date and description are required.");

        const newLog = {
            id: Date.now().toString(),
            date: newDate,
            description: newDesc,
            witnesses: newWitnesses,
            createdAt: new Date().toISOString()
        };

        const updated = [...logs, newLog].sort((a, b) => new Date(b.date) - new Date(a.date));
        saveLogs(updated);

        setNewDate(''); setNewDesc(''); setNewWitnesses('');
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        if (confirm("Delete this log permanently?")) {
            saveLogs(logs.filter(l => l.id !== id));
        }
    };

    const handleExport = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("PRIVATE INCIDENT LOG", 20, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("This document is a chronologically recorded memory of incidents. Generated via SafeVoice.", 20, 30, { maxWidth: 170 });

        let yPos = 45;
        logs.forEach(log => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFont("helvetica", "bold");
            doc.text(`Date of Incident: ${new Date(log.date).toLocaleDateString()}`, 20, yPos);
            yPos += 7;

            doc.setFont("helvetica", "normal");
            const splitDesc = doc.splitTextToSize(`Description: ${log.description}`, 170);
            doc.text(splitDesc, 20, yPos);
            yPos += (splitDesc.length * 7) + 5;

            if (log.witnesses) {
                doc.text(`Witnesses: ${log.witnesses}`, 20, yPos);
                yPos += 7;
            }

            doc.setDrawColor(200);
            doc.line(20, yPos, 190, yPos);
            yPos += 10;
        });

        doc.save("Incident-Log.pdf");
    };

    return (
        <div className="max-w-4xl mx-auto w-full px-4 pt-10 pb-20">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-bg-surface border border-white/10 shadow-lg text-accent-primary mb-6">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-display text-text-primary mb-4">Private Incident Log</h1>
                <p className="text-lg text-text-muted max-w-2xl mx-auto">
                    This log is stored completely offline in your browser. Documenting a pattern of behavior is critical for building a strong POSH or HR case.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <Button onClick={() => setIsAdding(true)}><Plus className="w-5 h-5 mr-2" /> Log New Incident</Button>
                    {logs.length > 0 && (
                        <Button variant="outline" onClick={handleExport}><Download className="w-5 h-5 mr-2" /> Export to PDF</Button>
                    )}
                </div>
            </div>

            {isAdding && (
                <div className="bg-bg-secondary border border-accent-primary/50 shadow-2xl rounded-3xl p-6 mb-10">
                    <h3 className="text-lg font-bold text-text-primary mb-4">New Entry</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Date of Incident</label>
                            <input
                                type="date"
                                max={new Date().toISOString().split("T")[0]}
                                min="1980-01-01"
                                value={newDate}
                                onChange={e => {
                                    let val = e.target.value;
                                    const maxDate = new Date().toISOString().split("T")[0];
                                    if (val > maxDate) val = maxDate;
                                    setNewDate(val);
                                }}
                                className={`w-full bg-bg-primary border ${newDate && new Date(newDate).getFullYear() < 1980 ? 'border-accent-danger' : 'border-border-default'} rounded-xl p-3 text-text-primary`}
                            />
                            {newDate && new Date(newDate).getFullYear() < 1980 && (
                                <p className="text-xs text-accent-danger mt-1">Please enter a realistic year.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">What happened? (Be specific)</label>
                            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-bg-primary border border-border-default rounded-xl p-3 text-text-primary min-h-[100px]" placeholder="He said... Then I felt..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Witnesses (Optional)</label>
                            <input type="text" value={newWitnesses} onChange={e => setNewWitnesses(e.target.value)} className="w-full bg-bg-primary border border-border-default rounded-xl p-3 text-text-primary" placeholder="Names of anyone who saw or heard it" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button onClick={handleAdd} disabled={newDate && new Date(newDate).getFullYear() < 1980}><Save className="w-4 h-4 mr-2" /> Save Formally</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative border-l-2 border-border-default/50 pl-6 ml-4 space-y-10">
                {logs.map((log) => (
                    <div key={log.id} className="relative bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-sm group">
                        <div className="absolute w-4 h-4 bg-accent-primary rounded-full -left-[35px] top-6 ring-4 ring-bg-primary" />

                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-text-muted" />
                                {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h4>
                            <button onClick={() => handleDelete(log.id)} className="text-text-muted hover:text-accent-danger opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-base text-text-primary whitespace-pre-wrap leading-relaxed mb-4">{log.description}</p>

                        {log.witnesses && (
                            <div className="bg-bg-primary px-4 py-2 rounded-lg border border-border-default inline-block text-sm">
                                <span className="text-text-muted font-medium mr-2">Witnesses:</span>
                                <span className="text-text-primary">{log.witnesses}</span>
                            </div>
                        )}

                        <p className="text-[10px] text-text-muted/50 mt-4 text-right">Logged on {new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                ))}

                {logs.length === 0 && !isAdding && (
                    <div className="text-center py-10 bg-bg-secondary/50 rounded-2xl border border-dashed border-border-default relative">
                        <div className="absolute w-4 h-4 bg-text-muted/20 rounded-full -left-[35px] top-6" />
                        <p className="text-text-muted italic">Your log is currently empty.</p>
                    </div>
                )}
            </div>

            {logs.length > 0 && (
                <div className="mt-12 bg-accent-primary/5 border border-accent-primary/20 rounded-2xl p-6 text-center shadow-lg">
                    <p className="text-text-primary mb-4 font-semibold">You have logged {logs.length} incident{logs.length > 1 ? 's' : ''}.</p>
                    <p className="text-sm text-text-muted mb-6 max-w-xl mx-auto">Once you have 2-3 logged incidents establishing a pattern of hostile environment, your ability to file a formal POSH or HR complaint becomes significantly stronger.</p>
                    <Button onClick={() => window.location.href = '/report'}>Assess & File Official Complaint</Button>
                </div>
            )}
        </div>
    );
}
