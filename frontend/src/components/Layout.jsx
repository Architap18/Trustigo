import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Fraud Users', path: '/fraud', icon: <Users size={20} /> },
        { name: 'Alerts', path: '/alerts', icon: <AlertTriangle size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/20 dark:via-transparent dark:to-transparent pointer-events-none z-0"></div>

            {/* Sidebar */}
            <aside className="w-64 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col sticky top-0 h-screen transition-all duration-300 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                        Trustigo
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI Returns Fraud Engine</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group ${isActive
                                    ? 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm dark:shadow-none'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-1'
                                    }`}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"></div>}
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto relative z-10">
                <Outlet />
            </main>

            <ThemeToggle />
        </div>
    );
}
