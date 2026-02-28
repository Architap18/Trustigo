import React from 'react';
import { Settings as SettingsIcon, Shield, Database, Bell, Lock, User, Key, Globe, LayoutDashboard } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-6 animate-fade-in opacity-0 max-w-5xl mt-2 pb-10">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Platform Configuration</h1>
                <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">Manage system parameters, access control, risk thresholds, and API ingestion tokens for your machine learning engine.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                {/* Settings Navigation */}
                <div className="md:col-span-1 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 shadow-inner font-medium text-sm transition-all">
                        <Shield size={18} className="text-primary" /> Risk Parameters
                    </button>
                </div>

                {/* Settings Content Area */}
                <div className="md:col-span-3 space-y-6">
                    {/* section 1 */}
                    <div className="card shadow-xl border-white/5 space-y-5">
                        <div className="border-b border-white/5 pb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <LayoutDashboard size={18} className="text-primary" /> Engine Sensitivity
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Adjust the core operational thresholds corresponding to autonomous risk identification.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-[#0B1220] p-4 rounded-xl border border-white/5 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-white">Base Risk Threshold</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">The index value required before a user profile is automatically flagged for review.</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <input type="range" min="0" max="100" defaultValue="50" className="w-full md:w-32 accent-primary" />
                                    <span className="text-sm font-mono text-warning font-bold bg-warning/10 px-2.5 py-1 rounded border border-warning/20">50</span>
                                </div>
                            </div>

                            <div className="bg-[#0B1220] p-4 rounded-xl border border-white/5 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-white">Critical Strike Threshold</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">The threshold resulting in an automated transaction halt and system block.</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <input type="range" min="0" max="100" defaultValue="85" className="w-full md:w-32 accent-primary" />
                                    <span className="text-sm font-mono text-danger font-bold bg-danger/10 px-2.5 py-1 rounded border border-danger/20">85</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* section 2 */}
                    <div className="card shadow-xl border-white/5 space-y-5">
                        <div className="border-b border-white/5 pb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Bell size={18} className="text-primary" /> Incident Routing
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Configure external webhook triggers for critical fraud events.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-[#0B1220] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                                <div>
                                    <div className="text-sm font-semibold text-white">Slack Notifications</div>
                                    <div className="text-xs text-slate-500">Push high-risk flagged profiles directly to a Slack channel.</div>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 bg-[#0B1220] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                                <div>
                                    <div className="text-sm font-semibold text-white">Email Daily Digest</div>
                                    <div className="text-xs text-slate-500">Send an aggregated report of medium and high risk activity to admins.</div>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                </div>
                            </label>
                        </div>

                        <div className="flex justify-end pt-4 gap-3 border-t border-white/5">
                            <button className="btn-secondary">Discard Changes</button>
                            <button className="btn-primary">Save Configuration</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
