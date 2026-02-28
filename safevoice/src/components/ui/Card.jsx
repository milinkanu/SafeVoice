export function Card({ children, glass = false, className = '', ...props }) {
    const base = "rounded-xl border overflow-hidden";
    const variants = {
        standard: "bg-bg-secondary border-border-default",
        glass: "bg-bg-secondary/40 backdrop-blur-md border-border-glass shadow-xl",
    };

    const styling = `${base} ${glass ? variants.glass : variants.standard} p-6 ${className}`;
    return (
        <div className={styling} {...props}>
            {children}
        </div>
    );
}
