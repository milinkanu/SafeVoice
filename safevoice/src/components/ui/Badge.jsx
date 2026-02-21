export function Badge({ status = 'pending', children, className = '', ...props }) {
    const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border";

    const variants = {
        pending: "bg-accent-warm/10 text-accent-warm border-accent-warm/20",
        active: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
        overdue: "bg-accent-danger/10 text-accent-danger border-accent-danger/20",
        closed: "bg-bg-surface text-text-muted border-border-default",
    };

    const styling = `${base} ${variants[status]} ${className}`;

    return (
        <span className={styling} {...props}>
            {children}
        </span>
    );
}
