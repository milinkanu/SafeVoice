import { CompassWizard } from '../components/features/CompassWizard';
import { Compass as CompassIcon } from 'lucide-react';

export default function Compass() {
    return (
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            <div className="text-center mb-10 sm:mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-surface border border-border-default shadow-lg text-accent-primary mb-6">
                    <CompassIcon className="w-8 h-8" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-display text-text-primary mb-4">
                    Know Your Rights
                </h1>
                <p className="text-lg text-text-muted max-w-2xl mx-auto">
                    Not sure if your experience legally qualifies under workplace sexual harassment?
                    Take this fast, fully anonymous assessment to understand your POSH eligibility and available legal paths.
                </p>
            </div>

            <div className="w-full">
                <CompassWizard />
            </div>
        </div>
    );
}
