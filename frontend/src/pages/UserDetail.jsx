import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, User as UserIcon, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement);

export default function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/user/${id}`);
                setUser(res.data);
            } catch (e) {
                console.error("Failed to fetch user details", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return <div className="text-center mt-20 text-slate-400">Loading user profile...</div>;
    if (!user || (!user.behavior_score && !user.fraud_alerts.length)) return <div className="text-center mt-20 text-rose-400">No behavioral data found.</div>;

    const bs = user.behavior_score || {
        overall_risk_score: 0, return_rate_90d: 0, fast_return_count: 0, avg_return_time_days: 0,
        high_value_return_count: 0, anomaly_score: 0, engine_used: "Engine 1: Behavioral",
        category_risk_score: 0, payment_risk_score: 0, refund_value_ratio: 0
    };
    const score = bs.overall_risk_score;
    const isHighRisk = score >= 60;

    let color = '#10b981';
    if (score >= 60) color = '#ef4444';
    else if (score >= 30) color = '#f59e0b';

    const gaugeData = {
        labels: ['Score', 'Remaining'],
        datasets: [{
            data: [score, 100 - score],
            backgroundColor: [color, '#1e293b'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270
        }]
    };

    // Explanation logic fallback
    const primaryAlert = user.fraud_alerts && user.fraud_alerts.length > 0
        ? user.fraud_alerts[0].primary_reason
        : "Pattern appears normal.";

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <header className="flex flex-col gap-2">
                <Link to="/fraud" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-2 text-sm w-max transition-colors">
                    <ArrowLeft size={16} /> Back to Users
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <UserIcon className="text-slate-500 dark:text-slate-400" size={32} />
                            {user.name} <span className="text-slate-500 text-lg font-normal">#{user.user_id}</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{user.email} &bull; Account Age: {user.account_age} Days</p>
                    </div>
                    <div className={isHighRisk ? 'badge-high text-sm px-4 py-2' : 'badge-safe text-sm px-4 py-2'}>
                        {isHighRisk ? 'High Risk Account' : 'Clean Account'}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Metrics */}
                <div className="lg:col-span-2 space-y-6">

                    {/* AI Explanation Card */}
                    <div className={`card border-l-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden ${isHighRisk ? 'border-l-rose-500 bg-rose-50/80 dark:bg-rose-500/10 dark:border-rose-900/50' : 'border-l-emerald-500 bg-emerald-50/80 dark:bg-emerald-500/10 dark:border-emerald-900/50'}`}>
                        {isHighRisk && <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>}
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200 relative z-10">
                            <AlertTriangle className={isHighRisk ? 'text-rose-500' : 'text-emerald-500'} size={20} />
                            AI Automated Explanation
                        </h3>
                        <p className="mt-2 text-lg text-slate-700 dark:text-slate-200">
                            {isHighRisk ? `User flagged due to: ${primaryAlert}` : "No fraud indicators detected. Normal behavior."}
                        </p>
                    </div>

                    <div className="card hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 relative z-10">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Risk Engine Metrics</h3>
                            <span className="text-xs font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-500/20">{bs.engine_used}</span>
                        </div>

                        {bs.engine_used === "Engine 2: First-Order" ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Payment & Shipping Risk</p>
                                    <p className="text-2xl font-bold">{bs.payment_risk_score.toFixed(0)} / 100</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Refund / Value Ratio</p>
                                    <p className="text-2xl font-bold">{(bs.refund_value_ratio * 100).toFixed(1)}%</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">High-Value First Orders</p>
                                    <p className="text-2xl font-bold">{bs.high_value_return_count}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Fast Returns</p>
                                    <p className="text-2xl font-bold">{bs.fast_return_count}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10 col-span-2 flex justify-between items-center">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Isolation Forest Anomaly Coefficient <span className="text-xs ml-2">(0.0 to 1.0)</span></div>
                                    <div className="text-2xl font-bold text-amber-400">{bs.anomaly_score.toFixed(3)}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Return Rate (Historical)</p>
                                    <p className="text-2xl font-bold">{(bs.return_rate_90d * 100).toFixed(1)}%</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Category Abuse Risk</p>
                                    <p className="text-2xl font-bold">{bs.category_risk_score.toFixed(0)} / 100</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Fast Returns (&lt; 48h)</p>
                                    <p className="text-2xl font-bold">{bs.fast_return_count}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">High-Value Abuse</p>
                                    <p className="text-2xl font-bold">{bs.high_value_return_count}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 shadow-sm hover:shadow relative z-10 col-span-2 flex justify-between items-center">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Isolation Forest Anomaly Coefficient <span className="text-xs ml-2">(0.0 to 1.0)</span></div>
                                    <div className="text-2xl font-bold text-amber-400">{bs.anomaly_score.toFixed(3)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Score & Timeline */}
                <div className="space-y-6">
                    {/* Gauge Chart */}
                    <div className="card flex flex-col items-center justify-center hover:shadow-md transition-all duration-300 relative overflow-hidden group border-teal-50 dark:border-teal-900/30">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.03)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.05)_0%,transparent_70%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 className="text-lg font-semibold mb-2 relative z-10 text-slate-800 dark:text-slate-200">Final Risk Score</h3>
                        <div className="relative w-48 h-48 mt-4 z-10">
                            <Doughnut data={gaugeData} options={{ maintainAspectRatio: false, plugins: { tooltip: { enabled: false } } }} />
                            <div className="absolute inset-0 flex items-end justify-center pb-8">
                                <span className="text-4xl font-black text-slate-900 dark:text-white drop-shadow-sm">{score.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Simple Timeline Stub */}
                    {user.fraud_alerts.length > 0 && (
                        <div className="card">
                            <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-4">Alert History</h3>
                            <div className="space-y-4">
                                {user.fraud_alerts.map(a => (
                                    <div key={a.alert_id} className="border-l-2 border-rose-500 pl-4 py-1">
                                        <p className="text-xs text-slate-500">{format(new Date(a.date), 'MMM dd, yyyy')}</p>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Score spiked to {a.risk_score.toFixed(0)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
