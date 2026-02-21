import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

export function Timeline({ events = [], className = '' }) {
    return (
        <div className={`relative border-l-2 border-border-default ml-3 space-y-8 ${className}`}>
            {events.map((event, idx) => {
                const isDone = event.status === 'done';
                const isOverdue = event.status === 'overdue';
                const isPending = event.status === 'pending';

                let Icon = Circle;
                let iconColor = "text-text-muted bg-bg-primary";

                if (isDone) {
                    Icon = CheckCircle;
                    iconColor = "text-accent-primary bg-bg-primary";
                } else if (isOverdue) {
                    Icon = AlertCircle;
                    iconColor = "text-accent-danger bg-bg-primary";
                }

                return (
                    <div key={idx} className="relative pl-6">
                        <span className={`absolute -left-[18px] top-0.5 flex items-center justify-center p-1 rounded-full ${iconColor}`}>
                            <Icon className="w-5 h-5 fill-bg-primary" />
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                            <h3 className={`text-sm font-semibold ${isOverdue ? 'text-accent-danger' : isDone ? 'text-text-primary' : 'text-text-muted'}`}>
                                {event.title}
                            </h3>
                            <span className="text-xs text-text-muted mt-1 sm:mt-0 font-mono bg-bg-surface px-2 py-0.5 rounded border border-border-default">
                                {event.date}
                            </span>
                        </div>
                        {event.description && (
                            <p className="text-sm text-text-muted mt-2 bg-bg-secondary p-3 rounded border border-border-default">
                                {event.description}
                            </p>
                        )}
                        {event.action && (
                            <div className="mt-3">
                                {event.action}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
