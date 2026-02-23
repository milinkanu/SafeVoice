import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportWizard } from '../components/features/ReportWizard';
import { PenTool, ShieldAlert } from 'lucide-react';
import { useReportStore } from '../store/reportStore';

export default function Report() {
    const navigate = useNavigate();
    const { compassResult } = useReportStore();

    const isLcc = compassResult?.outcome === 'LCC_ROUTE';

    return (
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-surface border border-border-default shadow-lg text-accent-primary mb-6">
                    <PenTool className="w-8 h-8" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-display text-text-primary mb-4">
                    {isLcc ? 'File LCC Complaint' : 'File Anonymous Complaint'}
                </h1>
                <p className="text-lg text-text-muted max-w-2xl mx-auto">
                    {isLcc
                        ? "Your identity will be protected cryptographically. Your complaint will be routed directly to the Local Complaints Committee (LCC) for external adjudication."
                        : "Your identity will be protected cryptographically. Your organization's ICC will receive the compliant and evidence but will not know who you are unless you choose to reveal yourself."}
                </p>
            </div>

            <div className="w-full">
                <ReportWizard />
            </div>
        </div>
    );
}
