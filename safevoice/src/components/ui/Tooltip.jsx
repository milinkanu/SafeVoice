export function Tooltip({ children, content, className = '' }) {
    return (
        <div className={`group relative inline-flex items-center ${className}`}>
            {children}
            <div className="absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-text-primary text-bg-primary text-xs font-medium rounded shadow-lg border border-border-default w-max max-w-[200px] text-center pointer-events-none">
                {content}
                <svg className="absolute text-text-primary h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                </svg>
            </div>
        </div>
    );
}
