import React, { useEffect, useState } from 'react';
import { Lightbulb, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Run on mount to initialize theme
        const savedTheme = localStorage.getItem('trustigo-theme');
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                setTheme('dark');
                document.documentElement.classList.add('dark');
                localStorage.setItem('trustigo-theme', 'dark');
            } else {
                setTheme('light');
                localStorage.setItem('trustigo-theme', 'light');
            }
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('trustigo-theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 left-6 z-50 p-3 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Lightbulb size={20} className="text-yellow-400" />
            ) : (
                <Moon size={20} className="text-slate-600" />
            )}
        </button>
    );
}
