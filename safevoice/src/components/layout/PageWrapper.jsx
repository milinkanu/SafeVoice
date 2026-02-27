import { Navbar } from './Navbar';
import { useLocation } from 'react-router-dom';
export function PageWrapper({ children, className = '' }) {
    const location = useLocation();

    // Check if the current route is the LCC Dashboard
    const isLccDashboard = location.pathname.startsWith('/lcc');

    return (
        <div className="min-h-screen flex flex-col w-full">
            <Navbar />
            {isLccDashboard ? (
                <main className={`flex-1 flex flex-col w-full ${className}`}>
                    {children}
                </main>
            ) : (
                <main className={`flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 py-8 md:py-12 ${className}`}>
                    {children}
                </main>
            )}
        </div>
    );
}
