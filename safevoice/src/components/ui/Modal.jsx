import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="fixed inset-0 cursor-default"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative w-full max-w-lg bg-bg-secondary rounded-xl shadow-2xl border border-border-default overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
                    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
