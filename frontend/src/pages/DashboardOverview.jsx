import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Upload, Play, ArrowRight, ShieldAlert, Activity, Users, Bell } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = 'Inter';

export default function DashboardOverview() {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ total: 0, fraud: 0, avg: 0 });
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/fraud-users');
            setData(res.data);
            const total = res.data.length;
            const fraud = res.data.filter(u => u.overall_risk_score >= 60).length;
            const avg = res.data.reduce((acc, curr) => acc + curr.overall_risk_score, 0) / (total || 1);
            setStats({ total, fraud, avg: avg.toFixed(1) });
        } catch (e) {
            console.error("Failed to fetch dashboard data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRunAnalysis = async () => {
        setEvaluating(true);
        try {
            await axios.post('http://127.0.0.1:8000/run-fraud-analysis');
            await fetchUsers();
        } catch (e) {
            console.error('Analysis failed', e);
            alert('Failed to run analysis.');
        } finally {
            setEvaluating(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert("Please upload a valid CSV file.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post('http://127.0.0.1:8000/upload-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`CSV Uploaded! ${res.data.stats.new_users} new users.`);

            try {
                await handleRunAnalysis();
            } catch (authErr) {
                console.error('Analysis failed after upload', authErr);
                alert("CSV uploaded, but ML Analysis failed to run.");
            }
        } catch (e) {
            console.error('Upload failed', e);
            alert("Failed to upload CSV. Ensure backend is running on port 8000.");
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 space-y-4 animate-pulse-glow">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="font-medium tracking-wide">Initializing engine...</p>
            </div>
        );
    }

    const bins = [0, 0, 0, 0, 0];
    data.forEach(u => {
        let idx = Math.floor(u.overall_risk_score / 20);
        if (idx > 4) idx = 4;
        bins[idx]++;
    });

    const barData = {
        labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
        datasets: [{
            label: 'Users',
            data: bins,
            backgroundColor: ['#10b981', '#34d399', '#fbbf24', '#f87171', '#ef4444'],
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    const safe = data.filter(u => u.overall_risk_score < 30).length;
    const med = data.filter(u => u.overall_risk_score >= 30 && u.overall_risk_score < 60).length;
    const high = stats.fraud;

    const doughData = {
        labels: ['Safe', 'Medium', 'High Risk'],
        datasets: [{
            data: [safe, med, high],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)'],
            borderColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 1,
            hoverOffset: 4,
            cutout: '75%',
        }]
    };

    return (
        <div className="space-y-8 animate-fade-in opacity-0">
            <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 mt-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Platform Analytics</h1>
                    <p className="text-slate-400 text-sm max-w-lg leading-relaxed">System-wide monitoring of behavioral scores, model inference outputs, and transaction velocities.</p>
                </div>

                <div className="flex gap-4">
                    <label className="btn-secondary cursor-pointer group">
                        <Upload size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                        {uploading ? 'Processing...' : 'Ingest Data'}
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading || evaluating}
                        />
                    </label>
                    <button
                        onClick={handleRunAnalysis}
                        disabled={evaluating || uploading}
                        className="btn-primary"
                    >
                        {evaluating ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Play size={18} className="fill-current" />
                        )}
                        {evaluating ? 'Running Inference...' : 'Execute Analysis'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                <div className="card group">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">Total Evaluated</h3>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Users size={18} />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white tracking-tight">{stats.total.toLocaleString()}</p>
                    <div className="mt-3 text-xs text-slate-500 font-medium flex items-center gap-1">
                        <span className="text-safe">+12.5%</span> vs last period
                    </div>
                </div>

                <div className="card border-danger/20 hover:border-danger/40 group relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-danger/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-danger">High Risk Entities</h3>
                        <div className="p-2 bg-danger/10 rounded-lg text-danger">
                            <ShieldAlert size={18} />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white tracking-tight relative z-10">{stats.fraud.toLocaleString()}</p>
                    <div className="mt-3 text-xs text-danger/80 font-medium flex items-center gap-1 relative z-10">
                        Critical attention required
                    </div>
                </div>

                <div className="card group">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-warning transition-colors">Average Risk Index</h3>
                        <div className="p-2 bg-warning/10 rounded-lg text-warning">
                            <Activity size={18} />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white tracking-tight">{stats.avg}</p>
                    <div className="w-full bg-dashboard rounded-full h-1.5 mt-4 overflow-hidden border border-white/5">
                        <div className="bg-warning h-1.5 rounded-full" style={{ width: `${Math.min(100, (stats.avg / 100) * 100)}%` }}></div>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
                <div className="card md:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-white">Risk Distribution Index</h3>
                        <button className="text-xs text-primary hover:text-white transition-colors font-medium">Export Vector</button>
                    </div>
                    <div className="flex-1 min-h-[250px] relative w-full">
                        <Bar
                            data={barData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
                                        ticks: { color: '#64748b', font: { family: 'Inter' } }
                                    },
                                    x: {
                                        grid: { display: false, drawBorder: false },
                                        ticks: { color: '#64748b', font: { family: 'Inter' } }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="card flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-6">Status Composition</h3>
                        <div className="relative h-48 flex items-center justify-center">
                            <Doughnut
                                data={doughData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    elements: { arc: { borderJoinStyle: 'round' } }
                                }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs text-slate-500 font-medium">Total</span>
                                <span className="text-2xl font-bold text-white">{stats.total}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-center gap-6 text-xs font-medium">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-safe shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Safe</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> Med</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span> High</div>
                    </div>
                </div>
            </div>

            {data.filter(u => u.overall_risk_score >= 30).length > 0 && (
                <div className="card p-0 overflow-hidden animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-card">
                        <div>
                            <h3 className="text-sm font-semibold text-white">Elevated Risk Entities</h3>
                            <p className="text-xs text-slate-400 mt-1">Users scoring over 30 requiring secondary review</p>
                        </div>
                        <Link to="/fraud" className="btn-secondary text-xs px-3 py-1.5 h-auto">
                            View Database <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-dashboard/40 border-b border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">User Identity</th>
                                    <th className="px-6 py-4">Risk Coefficient</th>
                                    <th className="px-6 py-4">Status Vector</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data
                                    .filter(u => u.overall_risk_score >= 30)
                                    .sort((a, b) => b.overall_risk_score - a.overall_risk_score)
                                    .slice(0, 5)
                                    .map((u) => (
                                        <tr key={u.user_id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-dashboard border border-white/5 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-primary transition-colors group-focus-within:ring-2 group-focus-within:ring-primary">
                                                        U
                                                    </div>
                                                    <div>
                                                        <Link to={`/user/${u.user_id}`} className="text-sm font-medium text-slate-200 group-hover:text-primary transition-colors focus:outline-none">
                                                            User #{u.user_id}
                                                        </Link>
                                                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 tracking-wider">ID-{u.user_id}TXX</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${u.overall_risk_score >= 60 ? 'bg-danger shadow-danger/50' : 'bg-warning shadow-warning/50'}`}></div>
                                                    <span className={`text-sm font-bold ${u.overall_risk_score >= 60 ? 'text-danger' : 'text-warning'}`}>
                                                        {u.overall_risk_score.toFixed(1)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.overall_risk_score >= 60 ? (
                                                    <span className="badge-high">Critical</span>
                                                ) : (
                                                    <span className="badge-medium">Elevated</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/user/${u.user_id}`} className="text-primary hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5">
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
