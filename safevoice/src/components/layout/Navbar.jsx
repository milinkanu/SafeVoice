import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { useReportStore } from '../../store/reportStore';

export function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const clearReportDraft = useReportStore(state => state.clearReportDraft);
    const isIccRoute = location.pathname.startsWith('/icc');

    // Do not show public navbar on ICC dashboard pages
    if (isIccRoute && location.pathname !== '/icc/login') {
        return null;
    }

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-bg-primary/80 border-b border-white/5">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-xl font-display text-text-primary hover:opacity-80 transition-opacity">
                    <Shield className="w-6 h-6 text-accent-primary" />
                    <span>SafeVoice</span>
                </Link>
                <nav className="flex items-center gap-3 sm:gap-4">
                    <Link to="/compass" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors hidden md:block">
                        POSH Compass
                    </Link>
                    <Link to="/track">
                        <Button variant="ghost" className="hidden sm:inline-flex text-text-muted hover:text-text-primary">
                            Track Case
                        </Button>
                    </Link>
                    <Button variant="primary" onClick={() => {
                        clearReportDraft();
                        navigate('/report');
                    }}>
                        Report Incident
                    </Button>
                </nav>
            </div>
        </header>
    );
}
