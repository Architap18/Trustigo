import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, User as UserIcon, AlertTriangle, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement);

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${API_URL}/user/${id}`);
                setUser(res.data);
            } catch (e) {
                console.error("Failed to fetch user details", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 space-y-4 animate-pulse-glow">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="font-medium tracking-wide">Retrieving deep analytics profile...</p>
        </div>
    );
    if (!user || (!user.behavior_score && !user.fraud_alerts.length)) return <div className="text-center mt-20 text-danger bg-danger/10 p-6 rounded-2xl border border-danger/20 font-medium max-w-lg mx-auto">No behavioral telemetry detected for this identity.</div>;

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
            backgroundColor: [color, 'rgba(255,255,255,0.05)'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            cutout: '80%',
        }]
    };

    const primaryAlert = user.fraud_alerts && user.fraud_alerts.length > 0
        ? user.fraud_alerts[0].primary_reason
        : "Automated analysis vectors appear within healthy thresholds.";

    return (
        <div className="space-y-6 animate-fade-in opacity-0 pb-10 mt-2">
            <header className="flex flex-col gap-4 mb-4">
                <Link to="/fraud" className="text-slate-400 hover:text-white flex items-center gap-2 text-xs font-semibold uppercase tracking-wider w-max transition-colors">
                    <ArrowLeft size={14} /> Database Return
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-8 card bg-gradient-to-r from-card to-[#0d1425] border-l-4 border-l-primary shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>
                    <div className="flex gap-6 items-center z-10">
                        <div className="w-20 h-20 rounded-2xl bg-[#0B1220] border border-white/10 flex items-center justify-center shadow-inner relative group-hover:border-primary/30 transition-colors">
                            <UserIcon className="text-primary/80 group-hover:text-primary transition-colors" size={40} />
                            <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full border-[3px] border-card flex items-center justify-center ${isHighRisk ? 'bg-danger' : 'bg-safe'} shadow-lg`}>
                                {isHighRisk ? <AlertTriangle size={14} className="text-white" /> : <ShieldCheck size={14} className="text-white" />}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-3">
                                {user.name}
                                <span className="text-primary text-sm font-mono tracking-widest bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                                    ID-{user.user_id}TXX
                                </span>
                            </h1>
                            <p className="text-slate-400 mt-2 font-medium flex items-center gap-3">
                                {user.email}
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                Lifecycle Phase: Day {user.account_age}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                <div className="lg:col-span-2 space-y-6">
                    <div className={`card overflow-hidden border border-white/5 ${isHighRisk ? 'bg-danger/[0.03] border-danger/20' : 'bg-safe/[0.03] border-safe/20'}`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${isHighRisk ? 'bg-danger' : 'bg-safe'} shadow-[0_0_15px_currentColor]`}></div>
                        <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-xl ${isHighRisk ? 'bg-danger/10 text-danger' : 'bg-safe/10 text-safe'}`}>
                                <BrainCircuit size={28} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-white mb-2">Automated Telemetry Inference</h3>
                                <p className={`text-xl ${isHighRisk ? 'text-danger flex items-center gap-2' : 'text-slate-300'} font-medium tracking-tight leading-snug`}>
                                    {isHighRisk ? (
                                        <>
                                            <AlertTriangle size={20} className="shrink-0" />
                                            Telemetry Flagged: {primaryAlert}
                                        </>
                                    ) : "No anomalous vectors detected. Profile adheres to standard distribution curves."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-xl border-white/5">
                        <div className="flex justify-between items-center mb-6 pb-5 border-b border-white/5">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Activity size={18} className="text-primary" /> Multi-Layer Risk Engine
                            </h3>
                            <span className="text-[10px] font-mono uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 shadow-inner">{bs.engine_used}</span>
                        </div>

                        {bs.engine_used === "Engine 2: First-Order" ? (
                            <div className="grid grid-cols-2 gap-4">
                                <MetricBox label="Payment & Shipping Velocity" value={`${bs.payment_risk_score.toFixed(0)} / 100`} />
                                <MetricBox label="Value Extraction Ratio" value={`${(bs.refund_value_ratio * 100).toFixed(1)}%`} />
                                <MetricBox label="High-Threshold Orders" value={bs.high_value_return_count} />
                                <MetricBox label="Rapid Reversals" value={bs.fast_return_count} />
                                <div className="p-5 bg-[#0B1220] rounded-xl border border-white/5 col-span-2 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 md:gap-0 group hover:border-white/10 transition-colors shadow-inner">
                                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-amber-400 transition-colors">
                                        Isolation Forest Absolute Distance <span className="opacity-50 ml-1 font-sans lowercase">(0-1.0)</span>
                                    </div>
                                    <div className="text-3xl font-bold font-mono text-amber-400 drop-shadow-md">{bs.anomaly_score.toFixed(3)}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <MetricBox label="Historical Reversal Rate" value={`${(bs.return_rate_90d * 100).toFixed(1)}%`} />
                                <MetricBox label="Category Targeting Risk" value={`${bs.category_risk_score.toFixed(0)} / 100`} />
                                <MetricBox label="Sub-48H Reversals" value={bs.fast_return_count} />
                                <MetricBox label="High-Threshold Reversals" value={bs.high_value_return_count} />
                                <div className="p-5 bg-[#0B1220] rounded-xl border border-white/5 col-span-2 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 md:gap-0 group hover:border-white/10 transition-colors shadow-inner">
                                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-amber-400 transition-colors">
                                        Isolation Forest Absolute Distance <span className="opacity-50 ml-1 font-sans lowercase">(0-1.0)</span>
                                    </div>
                                    <div className="text-3xl font-bold font-mono text-amber-400 drop-shadow-md">{bs.anomaly_score.toFixed(3)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card flex flex-col items-center justify-center relative shadow-xl border-white/5 group overflow-visible">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 w-full text-center border-b border-white/5 pb-4">Composite Risk Vector</h3>
                        <div className="relative w-64 h-32 mt-4 mb-8">
                            <Doughnut data={gaugeData} options={{ maintainAspectRatio: false, plugins: { tooltip: { enabled: false } }, elements: { arc: { borderJoinStyle: 'round' } }, layout: { padding: { bottom: 0 } } }} />
                            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center translate-y-1/2">
                                <span className={`text-6xl font-black ${isHighRisk ? 'text-danger' : score >= 30 ? 'text-warning' : 'text-safe'} tracking-tighter drop-shadow-[0_0_15px_currentColor] leading-none`}>{score.toFixed(0)}</span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-2 bg-white/10 px-2 py-1 rounded">/ 100 Index</span>
                            </div>
                        </div>
                    </div>

                    {user.fraud_alerts.length > 0 && (
                        <div className="card shadow-xl border-white/5">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 border-b border-white/5 pb-4">Incident Trajectory</h3>
                            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-danger before:via-danger/20 before:to-transparent">
                                {user.fraud_alerts.map((a, i) => (
                                    <div key={a.alert_id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-8 last:pb-2">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-[#111827] bg-danger shadow-[0_0_15px_rgba(239,68,68,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                                            <AlertTriangle size={12} className="text-white" />
                                        </div>
                                        <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-odd:pr-8 md:group-even:pl-8">
                                            <div className="p-4 bg-[#0B1220] border border-white/5 rounded-xl group-hover:border-danger/30 transition-colors shadow-inner">
                                                <div className="text-white font-medium text-sm">Index Spiked to {a.risk_score.toFixed(0)}</div>
                                                <div className="text-xs text-danger mt-1.5 font-mono bg-danger/10 px-2 py-0.5 rounded-md inline-block">{format(new Date(a.date), 'MMM dd, yyyy HH:mm')}</div>
                                            </div>
                                        </div>
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

function MetricBox({ label, value }) {
    return (
        <div className="p-5 bg-[#0B1220] rounded-xl border border-white/5 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-300 group shadow-inner">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2 group-hover:text-primary transition-colors">{label}</p>
            <p className="text-2xl font-bold font-mono text-white tracking-tight">{value}</p>
        </div>
    );
}
