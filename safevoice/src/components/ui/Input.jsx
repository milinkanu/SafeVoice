import { useState } from 'react';

export function Input({ label, error, sensitive, className = '', ...props }) {
    const [isBlurred, setIsBlurred] = useState(sensitive);

    return (
        <div className={`flex flex-col space-y-1.5 ${className}`}>
            {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
            <div className="relative">
                <input
                    onFocus={() => sensitive && setIsBlurred(false)}
                    onBlur={() => sensitive && setIsBlurred(true)}
                    className={`w-full rounded-md border bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${isBlurred ? 'blur-sm select-none' : ''} ${error ? 'border-accent-danger focus:ring-accent-danger' : 'border-border-default focus:ring-accent-primary'}`}
                    {...props}
                />
            </div>
            {error && <span className="text-xs text-accent-danger mt-1">{error}</span>}
        </div>
    );
}
