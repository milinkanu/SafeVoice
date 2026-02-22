import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileUp, Shield, Lock, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useReportStore } from '../../store/reportStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { FileUpload } from '../ui/FileUpload';
import { generateIdentity, exportPublicKey } from '../../lib/crypto';

export function ReportWizard() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        incidentDetails, setIncidentDetails,
        accusedDetails, setAccusedDetails,
        evidenceFiles, setEvidenceFiles,
        contactDetails, setContactDetails,
        clearReportDraft,
        compassResult
    } = useReportStore();

    const steps = ["Incident", "Details", "Evidence", "Contact"];

    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handleBack = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 1. Generate identity locally
            console.log('Generating local crypto identity...');
            const identity = await generateIdentity();

            // 2. Export public key to send to server
            const publicKeySPKI = await exportPublicKey(identity.publicKey);

            const payload = {
                incidentDetails: {
                    ...incidentDetails,
                    poshType: compassResult?.poshType || [],
                    timeBarredDelayReason: incidentDetails.delayReason || null,
                },
                accusedDetails,
                contactPhone: contactDetails.phone || null,
                publicKey: publicKeySPKI,
                routeTo: compassResult?.routeTo || 'ICC',
            };

            // 4. Send API request
            const response = await axios.post('http://localhost:5000/api/complaints', payload);
            const caseId = response.data.caseId;
            console.log('Payload secure:', payload);

            // 5. Upload evidence files sequentially
            for (const item of evidenceFiles) {
                if (item.file) {
                    const formData = new FormData();
                    formData.append('file', item.file);
                    formData.append('hash', item.hash);
                    await axios.post(`http://localhost:5000/api/evidence/${caseId}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            // 6. Store passphrase temporarily for Success screen ONLY
            sessionStorage.setItem('tempPassphrase', identity.mnemonic);
            sessionStorage.setItem('tempCaseId', caseId);

            // 7. Clear draught
            clearReportDraft();

            // Navigate to success
            navigate('/report/success');

        } catch (error) {
            console.error('Submission failed', error);
            alert(`Submission Error: ${error.response?.data?.message || error.message || 'Failed to submit'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-bg-secondary border border-border-default rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
            {/* Tracker */}
            <div className="bg-bg-surface px-6 py-4 border-b border-white/5">
                <ProgressBar steps={steps} currentStep={currentStep} />
            </div>

            <div className="p-6 sm:p-10 flex-1 flex flex-col">
                {currentStep === 0 && (
                    <SectionIncident
                        data={incidentDetails}
                        update={setIncidentDetails}
                    />
                )}
                {currentStep === 1 && (
                    <SectionAccused
                        data={accusedDetails}
                        update={setAccusedDetails}
                    />
                )}
                {currentStep === 2 && (
                    <SectionEvidence
                        update={setEvidenceFiles}
                    />
                )}
                {currentStep === 3 && (
                    <SectionContact
                        data={contactDetails}
                        update={setContactDetails}
                    />
                )}

                {/* Footer Actions */}
                <div className="pt-8 mt-auto flex justify-between items-center bg-bg-secondary relative">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0 || isSubmitting}
                        className={`opacity-100 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {currentStep < steps.length - 1 ? (
                        <Button onClick={handleNext} disabled={
                            (currentStep === 0 && !incidentDetails.description) ||
                            (currentStep === 0 && compassResult?.outcome === 'TIME_BARRED' && !incidentDetails.delayReason) ||
                            (currentStep === 0 && incidentDetails.date && new Date(incidentDetails.date).getFullYear() < 1980)
                        }>
                            Next step <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-accent-primary text-bg-primary hover:bg-emerald-500 font-semibold"
                        >
                            {isSubmitting ? (
                                <>
                                    <Lock className="w-4 h-4 mr-2 animate-pulse" />
                                    Encrypting payload...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4 mr-2" />
                                    Submit Securely
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function SectionIncident({ data, update }) {
    const { compassResult } = useReportStore();
    const isTimeBarred = compassResult?.outcome === 'TIME_BARRED';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-2">
                <h2 className="text-2xl font-display text-text-primary">Incident Details</h2>
                <p className="text-text-muted">Describe what happened. Your description is encrypted on your device before submission.</p>
            </div>

            {compassResult?.poshType?.length > 0 && (
                <div className="bg-bg-surface p-4 rounded-xl border border-white/5 mb-4">
                    <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Automated POSH Classifications Applied:</p>
                    <div className="flex flex-wrap gap-2">
                        {compassResult.poshType.map(t => (
                            <span key={t} className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-md text-xs font-semibold">{t.replace('_', ' ')}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    type="date"
                    label="Date of incident (Approximate)"
                    max={new Date().toISOString().split("T")[0]}
                    min="1980-01-01"
                    value={data.date || ''}
                    error={data.date && new Date(data.date).getFullYear() < 1980 ? "Please enter a realistic year." : undefined}
                    onChange={(e) => {
                        let val = e.target.value;
                        const maxDate = new Date().toISOString().split("T")[0];
                        if (val > maxDate) val = maxDate;
                        update({ date: val });
                    }}
                />
                <Input
                    type="text"
                    placeholder="e.g. Sales Dept, Delhi Office"
                    label="Location or Department (Optional)"
                    value={data.location || ''}
                    onChange={(e) => update({ location: e.target.value })}
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Description (Required)</label>
                <textarea
                    className="w-full h-32 rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary resize-y"
                    placeholder="Provide as much detail as you feel comfortable sharing. This field uses end-to-end encryption."
                    value={data.description || ''}
                    onChange={(e) => update({ description: e.target.value })}
                    required
                />
                <p className="text-xs text-text-muted flex items-center justify-end">
                    {data.description?.length || 0} characters
                </p>
            </div>

            {isTimeBarred && (
                <div className="space-y-1.5 p-4 bg-accent-warm/10 border border-accent-warm/20 rounded-xl">
                    <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-accent-warm" />
                        Reason for Delay (Required by Law)
                    </label>
                    <p className="text-xs text-text-muted mb-2">Because this incident occurred over 3 months ago, the ICC requires a valid reason for the delay to grant an extension (e.g., fear of retaliation, trauma).</p>
                    <textarea
                        className="w-full h-24 rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary resize-y"
                        placeholder="Explain why you could not file this complaint sooner..."
                        value={data.delayReason || ''}
                        onChange={(e) => update({ delayReason: e.target.value })}
                        required
                    />
                </div>
            )}

            <div className="p-4 bg-bg-surface border border-white/5 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                <p className="text-sm text-text-muted">
                    <strong className="text-text-primary">End-to-End Encrypted.</strong> We use AES-GCM 256-bit encryption. Neither SafeVoice developers nor unauthorized ICC members can read this description.
                </p>
            </div>
        </div>
    );
}

function SectionAccused({ data, update }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-2">
                <h2 className="text-2xl font-display text-text-primary">About the Accused</h2>
                <p className="text-text-muted flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent-warm" />
                    Do not include their name here if you wish to remain 100% anonymous initially.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-text-primary mb-2 block">Their Designation Level</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {['Senior to me', 'Same level', 'Junior to me', 'External (Client)'].map(level => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => update({ designation: level })}
                                className={`py-2 px-3 text-sm rounded-lg border transition-colors ${data.designation === level ? 'bg-accent-primary/10 border-accent-primary text-accent-primary font-medium' : 'bg-bg-surface border-border-default hover:border-text-muted'}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        type="text"
                        placeholder="e.g. Male, Female, Other"
                        label="Gender (Optional)"
                        value={data.gender || ''}
                        onChange={(e) => update({ gender: e.target.value })}
                    />
                    <Input
                        type="text"
                        placeholder="e.g. Marketing"
                        label="Their Department (Optional)"
                        value={data.department || ''}
                        onChange={(e) => update({ department: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}

function SectionEvidence({ update }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-2">
                <h2 className="text-2xl font-display text-text-primary">Evidence Locker</h2>
                <p className="text-text-muted">Upload screenshots, emails, or audio. Files are hashed locally before upload to prove they have not been tampered with.</p>
            </div>

            <FileUpload onUploadChange={update} />

            <div className="p-4 bg-bg-surface/50 border border-white/5 rounded-xl shadow-inner">
                <h4 className="font-semibold text-text-primary text-sm flex items-center gap-2 mb-2">
                    <FileUp className="w-4 h-4 text-text-muted" /> How we protect evidence
                </h4>
                <ul className="text-xs text-text-muted space-y-2 list-disc pl-4">
                    <li>Your browser generates a unique digital fingerprint (SHA-256) for each file.</li>
                    <li>We anchor this fingerprint to today's date so it can be legally verified later.</li>
                    <li>Files are stored securely in an encrypted vault.</li>
                </ul>
            </div>
        </div>
    );
}

function SectionContact({ data, update }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-2">
                <h2 className="text-2xl font-display text-text-primary">Contact (Optional)</h2>
                <p className="text-text-muted">Provide a phone number if you wish to receive WhatsApp stage updates. Your number is encrypted and hidden from the organization.</p>
            </div>

            <div className="max-w-md space-y-4">
                {/* 'sensitive' prop makes it blur on unfocus for shoulder-surfing protection */}
                <Input
                    type="tel"
                    placeholder="+91 "
                    label="WhatsApp Number (Optional)"
                    sensitive={true}
                    value={data.phone || ''}
                    onChange={(e) => update({ phone: e.target.value })}
                />

                <Input
                    type="text"
                    placeholder="e.g. English, Hindi"
                    label="Preferred Language (Optional)"
                    value={data.language || ''}
                    onChange={(e) => update({ language: e.target.value })}
                />
            </div>
        </div>
    );
}
