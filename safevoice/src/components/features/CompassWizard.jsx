import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Info, Search, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';
import { COMPASS_QUESTIONS, evaluateCompassAnswers } from '../../lib/compass';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { ProgressBar } from '../ui/ProgressBar';

export function CompassWizard() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [outcome, setOutcome] = useState(null);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    const question = COMPASS_QUESTIONS[currentIndex];
    const isLastQuestion = currentIndex === COMPASS_QUESTIONS.length - 1;
    const progressPercent = ((currentIndex) / COMPASS_QUESTIONS.length) * 100;

    const handleOptionToggle = (optionId) => {
        if (question.type === 'multiselect') {
            const currentSelections = answers[question.id] || [];
            const isSelected = currentSelections.includes(optionId);

            const newSelections = isSelected
                ? currentSelections.filter(id => id !== optionId)
                : [...currentSelections, optionId];

            setAnswers(prev => ({ ...prev, [question.id]: newSelections }));
        } else {
            setAnswers(prev => ({ ...prev, [question.id]: optionId }));
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            const result = evaluateCompassAnswers(answers);
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

    const currentSelection = answers[question?.id] || (question?.type === 'multiselect' ? [] : null);
    const isNextDisabled = question?.type === 'multiselect' ? currentSelection.length === 0 : !currentSelection;

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    if (outcome) {
        return <OutcomeScreen outcome={outcome} onBack={handleBack} />;
    }

    return (
        <div className="max-w-2xl mx-auto w-full">
            {/* Header & Progress */}
            <div className="mb-8">
                <button
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors mb-6 ${currentIndex === 0 ? 'text-text-muted/50 cursor-not-allowed' : 'text-text-muted hover:text-text-primary'}`}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex justify-between text-sm font-medium text-text-muted mb-3">
                    <span>Question {currentIndex + 1} of {COMPASS_QUESTIONS.length}</span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <ProgressBar currentStep={progressPercent} />
            </div>

            {/* Question Card */}
            <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 sm:p-10 min-h-[400px] flex flex-col relative overflow-hidden shadow-xl">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex items-start justify-between gap-4 mb-8">
                            <h2 className="text-2xl sm:text-3xl font-display text-text-primary leading-tight">
                                {question.text}
                            </h2>
                            {question.tooltip && (
                                <Tooltip content={question.tooltip}>
                                    <div className="p-2 bg-bg-surface rounded-full text-text-muted hover:text-accent-primary transition-colors cursor-help">
                                        <Info className="w-5 h-5" />
                                    </div>
                                </Tooltip>
                            )}
                        </div>

                        {question.type === 'multiselect' && (
                            <p className="text-sm text-text-muted mb-4 uppercase tracking-wider font-semibold">Select all that apply</p>
                        )}

                        <div className="space-y-3 flex-1 overflow-y-auto pb-6">
                            {question.options.map((option) => {
                                const isSelected = question.type === 'multiselect'
                                    ? currentSelection.includes(option.id)
                                    : currentSelection === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionToggle(option.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${isSelected
                                                ? 'border-accent-primary bg-accent-primary/10'
                                                : 'border-border-default hover:border-text-muted/50 bg-bg-surface hover:bg-bg-surface/80'
                                            }`}
                                    >
                                        <span className={`text-base sm:text-lg ${isSelected ? 'text-accent-primary font-medium' : 'text-text-primary'}`}>
                                            {option.label}
                                        </span>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected
                                                ? 'bg-accent-primary border-accent-primary text-bg-primary'
                                                : 'border-text-muted group-hover:border-text-primary'
                                            } ${question.type !== 'multiselect' && 'rounded-full'}`}>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 fill-current text-white" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Footer Actions */}
                <div className="pt-6 mt-auto border-t border-border-default flex justify-end relative z-10 bg-bg-secondary">
                    <Button
                        onClick={handleNext}
                        disabled={isNextDisabled}
                        className="w-full sm:w-auto min-w-[140px]"
                    >
                        {isLastQuestion ? 'See Analysis' : 'Next'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Internal Outcome Screen Component
function OutcomeScreen({ outcome, onBack }) {
    const isPosh = outcome.type.startsWith('POSH');
    const isPartial = outcome.type === 'PARTIAL';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto w-full"
        >
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Questions
            </button>

            <div className={`rounded-2xl border p-8 sm:p-10 text-center shadow-xl ${isPosh ? 'border-accent-primary/50 bg-accent-primary/5' :
                    isPartial ? 'border-accent-warm/50 bg-accent-warm/5' :
                        'border-border-default bg-bg-secondary'
                }`}>
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${isPosh ? 'bg-accent-primary/20 text-accent-primary' :
                        isPartial ? 'bg-accent-warm/20 text-accent-warm' :
                            'bg-bg-surface text-text-primary'
                    }`}>
                    {isPosh ? <ShieldAlert className="w-10 h-10" /> :
                        isPartial ? <Search className="w-10 h-10" /> :
                            <Scale className="w-10 h-10" />}
                </div>

                <h2 className="text-3xl font-display text-text-primary mb-4 leading-tight">
                    {outcome.title}
                </h2>
                <p className="text-lg text-text-muted mb-8 max-w-lg mx-auto leading-relaxed">
                    {outcome.description}
                </p>

                {outcome.laws && (
                    <div className="bg-bg-primary/50 text-left p-6 rounded-xl border border-border-default mb-8 shadow-inner">
                        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-text-muted" /> Available Protections
                        </h3>
                        <div className="space-y-4">
                            {outcome.laws.map((law, idx) => (
                                <div key={idx}>
                                    <p className="font-medium text-accent-primary">{law.name}</p>
                                    <p className="text-sm text-text-muted">{law.logic}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-bg-surface p-6 rounded-xl border border-white/5 mb-8 text-left">
                    <p className="text-sm font-medium text-text-primary flex items-start gap-3">
                        <span className="shrink-0 pt-0.5"><Info className="w-4 h-4 text-accent-primary" /></span>
                        {outcome.recommendation}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/report" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                            File Anonymous Complaint
                        </Button>
                    </Link>
                    {!isPosh && (
                        <Button variant="outline" className="w-full sm:w-auto h-12">
                            Speak to a Counselor
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
