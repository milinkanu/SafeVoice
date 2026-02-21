import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lock, FileUp, ShieldCheck, Download, CheckCircle2, FileText, Upload } from 'lucide-react';
import { FileUpload } from '../components/ui/FileUpload';
import { Button } from '../components/ui/Button';
import { generateEvidenceCertificate } from '../lib/pdfgen';

export default function Evidence() {
    const { caseToken } = useParams();
    const [existingFiles] = useState([
        {
            id: 'mock-abc',
            name: 'HR-Email-Thread.pdf',
            hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'mock-xyz',
            name: 'Slack-Screenshot.png',
            hash: '8a9cc233dca5e98ebf5fc7e3f81e8eb8754c602a83ad9e75eb2cb859ff7b61f3',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        }
    ]);

    const [newFiles, setNewFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadSubmit = async () => {
        setIsUploading(true);
        // Mock upload delay
        setTimeout(() => {
            alert(`Successfully uploaded ${newFiles.length} files securely.`);
            setNewFiles([]);
            setIsUploading(false);
            // in real app, update existingFiles state
        }, 1500);
    };

    const handleDownloadCert = (file) => {
        generateEvidenceCertificate(file.hash, file.name, caseToken || "SV-000-0000", file.date);
    };

    return (
        <div className="max-w-4xl mx-auto w-full animate-in fade-in">
            <div className="mb-8">
                <Link to="/track" className="text-text-muted hover:text-text-primary text-sm font-medium transition-colors mb-4 inline-block">&larr; Back to Dashboard</Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display text-text-primary flex items-center gap-2">
                            <Lock className="w-8 h-8 text-accent-primary" />
                            Evidence Locker
                        </h1>
                        <p className="text-text-muted mt-2">Append new evidence securely. All files are locally hashed.</p>
                    </div>
                    <div className="bg-bg-surface px-4 py-2 rounded-lg border border-border-default font-mono text-sm shadow-inner text-accent-primary">
                        ID: {caseToken || "Demo-Mode"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Upload Panel */}
                <div className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-xl flex flex-col">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-accent-primary" /> Add Evidence
                    </h3>
                    <p className="text-sm text-text-muted mb-6">Drag and drop screenshots, audio, or emails.</p>

                    <div className="flex-1 mb-6">
                        <FileUpload onUploadChange={setNewFiles} maxFiles={3} />
                    </div>

                    <Button
                        className="w-full h-12"
                        disabled={newFiles.length === 0 || isUploading}
                        onClick={handleUploadSubmit}
                    >
                        {isUploading ? 'Hashing and Uploading...' : `Securely Submit ${newFiles.length} File(s)`}
                    </Button>
                </div>

                {/* Existing Evidence */}
                <div className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-accent-primary" /> Secured Records
                    </h3>

                    <div className="space-y-4">
                        {existingFiles.map((f, i) => (
                            <div key={i} className="bg-bg-surface border border-border-default rounded-xl p-4 transition-all hover:border-text-muted">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                                        <FileText className="w-8 h-8 text-text-muted shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-text-primary truncate" title={f.name}>{f.name}</p>
                                            <p className="text-xs text-text-muted">{new Date(f.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-bg-primary/50 text-xs px-3 py-1.5 rounded border border-white/5 mb-3">
                                    <p className="font-mono text-text-muted break-all flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                                        {f.hash}
                                    </p>
                                </div>

                                <Button variant="outline" className="w-full text-xs" onClick={() => handleDownloadCert(f)}>
                                    <Download className="w-4 h-4 mr-2" /> Download Hash Certificate
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
