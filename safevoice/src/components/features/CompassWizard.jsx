import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Info, CheckCircle2, ShieldAlert, AlertTriangle, ScrollText, AlertCircle, CalendarClock, Hand } from 'lucide-react';
import { compassLayers } from '../../lib/compassConfig';
import { generateResult } from '../../lib/compassEngine';
import { useReportStore } from '../../store/reportStore';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';

export function CompassWizard() {
    const allQuestions = compassLayers.flatMap(l => l.questions.map(q => ({ ...q, layerTitle: l.title, layerId: l.id })));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [outcome, setOutcome] = useState(null);
    const [direction, setDirection] = useState(1);

    const setCompassResult = useReportStore(state => state.setCompassResult);
    const navigate = useNavigate();

    const question = allQuestions[currentIndex];
    const isLastQuestion = currentIndex === allQuestions.length - 1;
    const progressPercent = ((currentIndex) / allQuestions.length) * 100;

    const handleOptionToggle = (optionId) => {
        if (question.type === 'multi') {
            const currentSelections = answers[question.id] || [];

            // if selecting none_of_above, clear others
            const opt = question.options.find(o => o.id === optionId);
            if (opt?.none_of_above) {
                setAnswers(prev => ({ ...prev, [question.id]: [optionId] }));
                return;
            }

            // if selecting normal options, remove none_of_above
            const withoutNone = currentSelections.filter(id => !question.options.find(o => o.id === id)?.none_of_above);
            const isSelected = withoutNone.includes(optionId);
            const newSelections = isSelected
                ? withoutNone.filter(id => id !== optionId)
                : [...withoutNone, optionId];

            setAnswers(prev => ({ ...prev, [question.id]: newSelections }));
        } else {
            setAnswers(prev => ({ ...prev, [question.id]: optionId }));
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            const result = generateResult(answers);
            setCompassResult(result);
            setOutcome(result);
        } else {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (outcome) {
            setOutcome(null);
        } else if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const currentSelection = answers[question?.id] || (question?.type === 'multi' ? [] : null);
    const isNextDisabled = question?.type === 'multi' ? currentSelection.length === 0 : !currentSelection;

    const variants = {
        enter: (d) => ({ x: d > 0 ? 30 : -30, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (d) => ({ zIndex: 0, x: d < 0 ? 30 : -30, opacity: 0 })
    };

    if (outcome) {
        return <OutcomeScreen outcome={outcome} onBack={handleBack} navigate={navigate} />;
    }

    // Determine current layer index to display in Progress
    const currentLayerIndex = compassLayers.findIndex(l => l.id === question.layerId) + 1;

    return (
        <div className="max-w-3xl mx-auto w-full">
            {/* Progress Header */}
            <div className="mb-8">
                <button onClick={handleBack} disabled={currentIndex === 0}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors mb-6 ${currentIndex === 0 ? 'text-text-muted/50 cursor-not-allowed' : 'text-text-muted hover:text-text-primary'}`}>
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <p className="text-xs text-accent-primary font-bold uppercase tracking-wider mb-1">
                            Phase {currentLayerIndex} of 3: {question.layerTitle}
                        </p>
                        <p className="text-sm font-medium text-text-muted">Question {currentIndex + 1} of {allQuestions.length}</p>
                    </div>
                    <span className="text-sm font-bold text-text-muted">{Math.round(progressPercent)}%</span>
                </div>
                <ProgressBar currentStep={progressPercent} />
            </div>

            {/* Question Area */}
            <div className="bg-bg-secondary border border-border-default rounded-3xl p-6 sm:p-10 min-h-[400px] flex flex-col relative overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div key={currentIndex} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3 }} className="flex-1 flex flex-col">

                        <h2 className="text-2xl sm:text-3xl font-display text-text-primary leading-tight mb-8">
                            {question.text}
                        </h2>

                        {question.layerId === 'classification' && (
                            <p className="text-sm text-text-muted mb-4 uppercase tracking-wider font-semibold">Select all that apply</p>
                        )}

                        <div className={`flex-1 overflow-y-auto pb-6 ${question.layerId === 'classification' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}`}>
                            {question.options.map((option) => {
                                const isSelected = question.type === 'multi' ? currentSelection.includes(option.id) : currentSelection === option.id;

                                return (
                                    <button key={option.id} onClick={() => handleOptionToggle(option.id)}
                                        className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-center group relative overflow-hidden ${isSelected ? 'border-accent-primary bg-accent-primary/10 shadow-inner' : 'border-border-default hover:border-text-muted/50 bg-bg-surface hover:bg-bg-surface/80'
                                            } ${question.layerId === 'classification' ? 'h-full min-h-[100px]' : 'w-full flex-row items-center justify-between'}`}>

                                        {question.layerId === 'classification' && (
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">{option.category}</span>
                                        )}

                                        <span className={`text-base sm:text-lg ${isSelected ? 'text-accent-primary font-medium' : 'text-text-primary'}`}>
                                            {option.label}
                                        </span>

                                        <div className={`mt-auto pt-3 ${question.layerId === 'classification' ? '' : 'absolute right-4'}`}>
                                            <div className={`w-5 h-5 flex items-center justify-center border transition-colors ${isSelected ? 'bg-accent-primary border-accent-primary text-bg-primary' : 'border-text-muted group-hover:border-text-primary'
                                                } ${question.type !== 'multi' ? 'rounded-full' : 'rounded'}`}>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 fill-current text-white" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="pt-6 mt-auto border-t border-border-default flex justify-end relative z-10 bg-bg-secondary">
                    <Button onClick={handleNext} disabled={isNextDisabled} className="w-full sm:w-auto min-w-[140px] text-sm sm:text-base">
                        {isLastQuestion ? 'Generate Legal Analysis' : 'Continue'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function OutcomeScreen({ outcome, onBack, navigate }) {
    const isStrong = outcome.outcome === 'STRONG_POSH';
    const isValidDocs = outcome.outcome === 'VALID_NEEDS_DOCS';
    const isLcc = outcome.outcome === 'LCC_ROUTE';
    const isTimeBarred = outcome.outcome === 'TIME_BARRED';
    const isNotPosh = outcome.outcome === 'NOT_POSH';
    const isInsufficient = outcome.outcome === 'INSUFFICIENT';

    const renderHeader = () => {
        if (isStrong) return {
            title: "Strong POSH Case Established", icon: <ShieldAlert className="w-10 h-10" />, color: "accent-primary",
            desc: "Your experience clearly qualifies under POSH Act Section 2(n). The ICC has 90 days to resolve this once filed. You have legal protection against retaliation."
        };
        if (isValidDocs) return {
            title: "Valid Case, Documentation Recommended", icon: <ScrollText className="w-10 h-10" />, color: "accent-warm",
            desc: "Your experience qualifies as a hostile environment. Filing is your right, but providing detailed documentation of a pattern will make your case significantly stronger."
        };
        if (isLcc) return {
            title: "Valid POSH Case (LCC Route)", icon: <ShieldAlert className="w-10 h-10" />, color: "accent-primary",
            desc: "Your case is valid. However, because your employer is involved or you are at a small organization, this complaint must be routed directly to the Local Complaints Committee (LCC), not your internal HR."
        };
        if (isTimeBarred) return {
            title: "POSH Time Window Expired", icon: <CalendarClock className="w-10 h-10" />, color: "accent-warm",
            desc: "The standard 3-month window to file a formal complaint has passed. However, you can still apply to the ICC with a written explanation for the delay. The ICC has the power to extend the timeline for 'sufficient cause'."
        };
        if (isNotPosh) return {
            title: "Alternative Legal Route Required", icon: <AlertCircle className="w-10 h-10" />, color: "accent-danger",
            desc: "This does not qualify as sexual harassment under the specific definitions of POSH, but you still have legal and workplace options depending on the nature of the issue."
        };
        if (isInsufficient) return {
            title: "Insufficient Threshold Established", icon: <Hand className="w-10 h-10" />, color: "accent-danger",
            desc: "A single incident of this specific nature is legally difficult to prove as a core POSH violation without a pattern. We recommend starting an offline Incident Log."
        };

        return { title: "Analysis Complete", icon: <CheckCircle2 className="w-10 h-10" />, color: "text-primary", desc: "" };
    };

    const h = renderHeader();

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto w-full">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> Edit Answers
            </button>

            <div className={`rounded-3xl border p-8 sm:p-12 text-center shadow-2xl bg-bg-secondary overflow-hidden relative`}>

                {/* Glow Background */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-${h.color}/20 blur-[100px] rounded-full pointer-events-none`} />

                <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/10 bg-bg-surface text-${h.color}`}>
                    {h.icon}
                </div>

                <h2 className="text-3xl sm:text-4xl font-display text-text-primary mb-4 leading-tight">{h.title}</h2>
                <p className="text-lg text-text-muted mb-10 max-w-xl mx-auto leading-relaxed">{h.desc}</p>

                {isNotPosh && (
                    <div className="bg-bg-primary/50 text-left p-6 rounded-2xl border border-border-default mb-8 shadow-inner max-w-lg mx-auto">
                        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-text-muted" /> Recommended Steps
                        </h3>
                        <p className="text-sm text-text-muted mb-4">You may want to explore these alternatives based on your situation:</p>
                        <ul className="text-sm text-text-primary space-y-3 p-4 bg-bg-surface rounded-xl">
                            <li>• Workplace bullying → File a formal HR Grievance</li>
                            <li>• Cyber harassment → Section 66E/67 of IT Act</li>
                            <li>• Persistent stalking → Section 354D of Indian Penal Code</li>
                        </ul>
                    </div>
                )}

                {isInsufficient && (
                    <div className="bg-bg-primary/50 text-left p-6 rounded-2xl border border-border-default mb-8 shadow-inner max-w-lg mx-auto">
                        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-text-muted" /> Recommended Steps
                        </h3>
                        <p className="text-sm text-text-muted mb-4">Start documenting everything. Maintain a private log detailing dates, times, witnesses, and how the incidents made you feel. If this happens again, a logged pattern creates a very strong POSH case.</p>
                    </div>
                )}

                {outcome.poshType?.length > 0 && !isNotPosh && !isInsufficient && (
                    <div className="bg-bg-surface p-4 rounded-xl border border-border-default mb-8 flex flex-col items-center justify-center mx-auto max-w-md">
                        <span className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">POSH Act Categorization</span>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {outcome.poshType.map(t => (
                                <span key={t} className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-semibold">{t.replace('_', ' ')}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    {!isNotPosh && !isInsufficient ? (
                        <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base" onClick={() => navigate('/report')}>
                            <ShieldAlert className="w-5 h-5 mr-3" />
                            {isLcc ? 'File Complaint to LCC' : 'File Anonymous Complaint'}
                        </Button>
                    ) : isInsufficient ? (
                        <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base" onClick={() => navigate('/log')}>
                            Start Private Incident Log
                        </Button>
                    ) : (
                        <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base" variant="outline" onClick={() => navigate('/')}>
                            Return to Home
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
