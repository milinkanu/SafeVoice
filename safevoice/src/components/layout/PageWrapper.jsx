import { Navbar } from './Navbar';

export function PageWrapper({ children, className = '' }) {
    return (
        <div className="min-h-screen flex flex-col w-full">
            <Navbar />
            <main className={`flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 py-8 md:py-12 ${className}`}>
                {children}
            </main>
        </div>
    );
}
