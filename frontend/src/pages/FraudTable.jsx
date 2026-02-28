import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

    if (loading) return <div className="text-center mt-20 text-slate-400">Loading users...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold">Fraud Evaluation Logs</h1>

            <div className="card overflow-hidden !p-0 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 rounded-tl-xl border-b border-slate-200 dark:border-slate-700">User ID</th>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Risk Score</th>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Return Rate (90d)</th>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Fast Returns</th>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700">Status</th>
                                <th className="p-4 rounded-tr-xl border-b border-slate-200 dark:border-slate-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {users.filter(u => u.overall_risk_score >= 30).map(u => {
                                let badgeClass = 'badge-safe';
                                let statusText = 'Safe';

                                if (u.overall_risk_score >= 60) {
                                    badgeClass = 'badge-high';
                                    statusText = 'High Risk';
                                } else if (u.overall_risk_score >= 30) {
                                    badgeClass = 'badge-medium';
                                    statusText = 'Medium';
                                }

                                return (
                                    <tr key={u.user_id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors group">
                                        <td className="p-4 text-slate-700 dark:text-slate-300 group-hover:text-indigo-900 dark:group-hover:text-indigo-100 transition-colors">#{u.user_id}</td>
                                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${u.overall_risk_score >= 60 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`}></div>
                                                {u.overall_risk_score.toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">{(u.return_rate_90d * 100).toFixed(0)}%</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">{u.fast_return_count}</td>
                                        <td className="p-4"><span className={badgeClass}>{statusText}</span></td>
                                        <td className="p-4">
                                            <Link
                                                to={`/user/${u.user_id}`}
                                                className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm border border-indigo-500/20 px-3 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors inline-block transform hover:-translate-y-0.5"
                                            >
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
