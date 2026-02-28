import { useThemeStore } from '../../store/themeStore';
import { Sun, Moon } from 'lucide-react';
import { Button } from './Button';

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-10 h-10 p-0 rounded-full flex items-center justify-center -ml-2 sm:ml-0"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-text-muted hover:text-accent-warm transition-colors" />
            ) : (
                <Moon className="w-5 h-5 text-text-muted hover:text-accent-primary transition-colors" />
            )}
        </Button>
    );
}
