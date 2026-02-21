export function ProgressBar({ steps = [], currentStep = 0, className = '' }) {
    // Linear progress bar, or a multi-step indicator
    if (steps.length > 0) {
        return (
            <div className={`w-full ${className}`}>
                <div className="flex justify-between mb-2">
                    {steps.map((step, idx) => (
                        <div
                            key={idx}
                            className={`text-xs font-medium transition-colors ${idx <= currentStep ? 'text-accent-primary' : 'text-text-muted'}`}
                        >
                            {step}
                        </div>
                    ))}
                </div>
                <div className="flex h-1.5 w-full bg-bg-surface rounded-full overflow-hidden">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-full flex-1 transition-all duration-300 ${idx === steps.length - 1 ? '' : 'border-r border-bg-primary'} ${idx <= currentStep ? 'bg-accent-primary' : 'bg-transparent'}`}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Linear standard progress bar
    const progress = Math.min(Math.max(currentStep, 0), 100);
    return (
        <div className={`w-full h-1.5 bg-bg-surface rounded-full overflow-hidden ${className}`}>
            <div
                className="h-full bg-accent-primary transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
