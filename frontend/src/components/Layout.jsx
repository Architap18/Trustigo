import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, BarChart3, Settings, Search, Bell, UserCircle } from 'lucide-react';

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Fraud Users', path: '/fraud', icon: <Users size={20} /> },
        { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-dashboard text-slate-300 font-sans selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-white/[0.05] flex flex-col sticky top-0 h-screen z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
                <div className="p-6 mb-2 flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#4f46e5] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/10">
                        <AlertTriangle size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Trustigo</h2>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mt-0.5">AI Fraud Engine</p>
                    </div>
                </div>

                <div className="px-4 mt-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-3">Menu</p>
                    <nav className="flex-1 space-y-1.5">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                        ? 'bg-primary/10 text-primary font-medium border border-primary/20 shadow-inner'
                                        : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent'
                                        }`}
                                >
                                    <span className={`${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Navbar */}
                <header className="h-20 bg-dashboard/80 backdrop-blur-xl border-b border-white/[0.05] sticky top-0 z-30 px-8 flex items-center justify-between">
                    <div className="relative w-[28rem]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search users, transactions, or alerts..."
                            className="w-full bg-[#111827] border border-white/10 rounded-full pl-12 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-500 shadow-inner group"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                            <Bell size={22} />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] border border-dashboard"></span>
                        </button>
                        <div className="h-8 w-px bg-white/10"></div>
                        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-white">Security Admin</p>
                                <p className="text-xs text-slate-400 font-medium">Risk Operations</p>
                            </div>
                            <UserCircle size={36} className="text-slate-300" />
                        </button>
                    </div>
                </header>

                {/* Page Content Wrapper */}
                <main className="flex-1 p-8 overflow-y-auto relative scroll-smooth">
                    {/* Ambient Background Glow */}
                    <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-screen"></div>
                    <div className="absolute bottom-0 right-0 w-1/3 h-96 bg-safe/5 blur-[100px] rounded-full pointer-events-none z-0 mix-blend-screen"></div>

                    {/* All content renders on top of glow rendering correctly */}
                    <div className="relative z-10 w-full max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
