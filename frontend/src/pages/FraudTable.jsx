import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, UserCircle2 } from 'lucide-react';

export default function FraudTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/fraud-users');
                setUsers(res.data);
            } catch (e) {
                console.error("Failed to fetch users", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleExport = () => {
        if (!users || users.length === 0) return;

        // Create CSV Header
        let csvContent = "data:text/csv;charset=utf-8,User ID,Name,Email,Risk Score,Status,90D Return Rate,Fast Returns,High-Value Returns\n";

        // Loop through users array
        users.forEach(u => {
            const status = u.overall_risk_score >= 60 ? 'Critical' : u.overall_risk_score >= 30 ? 'Investigating' : 'Safe/Monitored';
            const rate = (u.return_rate_90d * 100).toFixed(0) + '%';

            // Note: If fast_return_count/high_value_return_count aren't returned by the current endpoint, they'll print as undefined/blank. 
            // In the UI they are present, so we map them exactly as the table displays them.
            csvContent += `${u.user_id},"${u.name}","${u.email}",${u.overall_risk_score.toFixed(1)},${status},${rate},${u.fast_return_count || 0},${u.high_value_return_count || 0}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Trustigo_Fraud_Users_Export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 space-y-4 animate-pulse-glow">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="font-medium tracking-wide">Querying database...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in opacity-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 mt-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Fraud Analytics Directory</h1>
                    <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">Extensive log of user risk assessments and anomalous behavioral patterns tracked by the ML engine over time.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary text-sm">
                        <Filter size={16} /> Filters
                    </button>
                    <button onClick={handleExport} className="btn-secondary text-sm hover:text-white hover:bg-white/10 transition-all">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden animate-slide-up opacity-0 shadow-2xl border-white/10" style={{ animationDelay: '0.1s' }}>
                <div className="p-4 border-b border-white/5 bg-gradient-to-r from-card to-dashboard flex justify-between items-center z-10 relative">
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search identities or IDs..."
                            className="w-full bg-[#0B1220] border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600 shadow-inner group"
                        />
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        Showing {users.length} identity records
                    </div>
                </div>
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0B1220]/50 border-b border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Identity / Hash</th>
                                <th className="px-6 py-4">Risk Coefficient</th>
                                <th className="px-6 py-4">Return Velocity (90d)</th>
                                <th className="px-6 py-4">Fast Cycle Count</th>
                                <th className="px-6 py-4">AI Judgement</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.sort((a, b) => b.overall_risk_score - a.overall_risk_score).map((u, index) => {
                                let badgeClass = 'badge-safe';
                                let statusText = 'Normal Profile';

                                if (u.overall_risk_score >= 60) {
                                    badgeClass = 'badge-high';
                                    statusText = 'Critical Risk';
                                } else if (u.overall_risk_score >= 30) {
                                    badgeClass = 'badge-medium';
                                    statusText = 'Elevated Risk';
                                }

                                return (
                                    <tr key={u.user_id} className={`group transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'} hover:bg-white/[0.03] cursor-pointer`}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-dashboard border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/30 transition-all duration-300">
                                                    <UserCircle2 size={24} />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors block">
                                                        User #{u.user_id}
                                                    </span>
                                                    <div className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">ID-{u.user_id}TXX</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${u.overall_risk_score >= 60 ? 'bg-danger shadow-danger/50' : u.overall_risk_score >= 30 ? 'bg-warning shadow-warning/50' : 'bg-safe shadow-safe/50'}`}></div>
                                                <span className={`text-sm font-bold ${u.overall_risk_score >= 60 ? 'text-danger' : u.overall_risk_score >= 30 ? 'text-warning' : 'text-safe'}`}>
                                                    {u.overall_risk_score.toFixed(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-400 font-mono">{(u.return_rate_90d * 100).toFixed(0)}%</td>
                                        <td className="px-6 py-5 text-sm text-slate-400 font-mono">{u.fast_return_count}</td>
                                        <td className="px-6 py-5"><span className={badgeClass}>{statusText}</span></td>
                                        <td className="px-6 py-5 text-right">
                                            <Link
                                                to={`/user/${u.user_id}`}
                                                className="inline-flex items-center justify-center text-slate-400 font-medium text-xs border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-all duration-300 group-hover:border-primary/30 group-hover:text-primary group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                            >
                                                Inspect
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-white/5 bg-dashboard/30 backdrop-blur-sm flex justify-center items-center relative z-10">
                    <div className="flex gap-2">
                        <button className="px-4 py-1.5 border border-white/10 rounded-lg text-xs font-semibold text-slate-500 hover:text-white hover:bg-white/5 transition-colors">Prev</button>
                        <button className="px-4 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded-lg text-xs font-semibold shadow-[0_0_10px_rgba(99,102,241,0.2)]">1</button>
                        <button className="px-4 py-1.5 border border-white/10 rounded-lg text-xs font-semibold text-slate-500 hover:text-white hover:bg-white/5 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
