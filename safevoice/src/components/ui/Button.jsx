export function Button({ children, variant = 'primary', className = '', ...props }) {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-accent-primary text-white hover:bg-emerald-600 focus:ring-accent-primary",
        danger: "bg-accent-danger text-white hover:bg-red-600 focus:ring-accent-danger",
        ghost: "hover:bg-bg-surface text-text-primary focus:ring-border-default",
        outline: "border border-border-default text-text-primary hover:bg-bg-surface focus:ring-border-default",
    };

    const spacing = "px-4 py-2 text-sm";

    const styling = `${baseStyles} ${variants[variant]} ${spacing} ${className}`;

    return (
        <button className={styling} {...props}>
            {children}
        </button>
    );
}
