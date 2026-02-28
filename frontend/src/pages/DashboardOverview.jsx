import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
ChartJS.defaults.color = '#94a3b8';

export default function DashboardOverview() {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ total: 0, fraud: 0, avg: 0 });
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);

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

    const [uploading, setUploading] = useState(false);

    const handleRunAnalysis = async () => {
        setEvaluating(true);
        try {
            await axios.post('http://127.0.0.1:8000/run-fraud-analysis');
            await fetchUsers();
        } catch (e) {
            console.error('Analysis failed', e);
            alert('Failed to run analysis. Make sure the backend is running.');
        } finally {
            setEvaluating(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.tsv') && !file.name.toLowerCase().endsWith('.txt')) {
            alert("Please upload a valid CSV/TSV/TXT file.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post('http://127.0.0.1:8000/upload-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert(`CSV Uploaded! ${res.data.stats.new_users} new users, ${res.data.stats.new_transactions} transactions added. Running analysis next...`);
            await handleRunAnalysis(); // automatically run the ML pipeline
        } catch (e) {
            console.error('Upload failed', e);
            alert(e.response?.data?.detail || "Failed to upload CSV.");
        } finally {
            setUploading(false);
            // Reset the input
            event.target.value = null;
        }
    };

    if (loading) return <div className="text-center mt-20 text-slate-400">Loading metrics...</div>;

    // Chart Data preparation
    const bins = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
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
            backgroundColor: ['#10b981', '#10b981', '#f59e0b', '#ef4444', '#ef4444'],
            borderRadius: 4
        }]
    };

    const safe = data.filter(u => u.overall_risk_score < 30).length;
    const med = data.filter(u => u.overall_risk_score >= 30 && u.overall_risk_score < 60).length;
    const high = stats.fraud;

    const doughData = {
        labels: ['Safe', 'Medium', 'High Risk'],
        datasets: [{
            data: [safe, med, high],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
        }]
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <header className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold">Overview </h1>
                <div className="flex gap-4">
                    <label className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 shadow-sm">
                        {uploading ? 'Uploading...' : 'Upload CSV'}
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                        {evaluating ? 'Running Analysis...' : 'Run Fraud Analysis'}
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-sm font-semibold uppercase text-indigo-600/80 dark:text-indigo-400/80 tracking-wider">Total Evaluated</h3>
                    <p className="text-4xl font-bold mt-2 text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="card border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 hover:shadow-md hover:border-rose-300 dark:hover:border-rose-500/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <h3 className="text-sm font-semibold uppercase text-rose-600 dark:text-rose-400 tracking-wider relative z-10">High Risk Users</h3>
                    <p className="text-4xl font-bold text-rose-600 dark:text-rose-500 mt-2 relative z-10">{stats.fraud}</p>
                </div>
                <div className="card border-teal-100 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-900/10 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-500/30 transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-sm font-semibold uppercase text-teal-600/80 dark:text-teal-400/80 tracking-wider">Average Risk Score</h3>
                    <p className="text-4xl font-bold mt-2 text-slate-900 dark:text-white">{stats.avg}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card hover:shadow-md hover:border-violet-200 dark:hover:border-violet-900/50 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-violet-50/50 to-transparent dark:from-violet-900/10 dark:to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 relative z-10">Risk Distribution</h3>
                    <div className="relative z-10">
                        <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
                    </div>
                </div>
                <div className="card flex flex-col items-center hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-900/50 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <h3 className="text-lg font-semibold mb-4 w-full text-left text-slate-800 dark:text-slate-100 relative z-10">Status Breakdown</h3>
                    <div className="w-64 h-64 relative z-10">
                        <Doughnut data={doughData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Elevated Risk Users Table */}
            {data.filter(u => u.overall_risk_score >= 30).length > 0 && (
                <div className="card hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Elevated Risk Users (Preview)</h3>
                        <Link to="/fraud" className="text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium transition-colors flex items-center gap-1 group">
                            View All <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                                    <th className="pb-3 text-sm font-medium">User ID</th>
                                    <th className="pb-3 text-sm font-medium">Risk Score</th>
                                    <th className="pb-3 text-sm font-medium">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {data
                                    .filter(u => u.overall_risk_score >= 30)
                                    .sort((a, b) => b.overall_risk_score - a.overall_risk_score)
                                    .slice(0, 15) // Show top 15 on dashboard
                                    .map((u) => (
                                        <tr key={u.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer">
                                            <td className="py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                                                <Link to={`/user/${u.user_id}`} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {u.user_id}
                                                </Link>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${u.overall_risk_score >= 60 ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-500 shadow-amber-500/50'}`}></div>
                                                    <span className={`font-bold ${u.overall_risk_score >= 60 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                        {u.overall_risk_score.toFixed(1)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm">
                                                {u.overall_risk_score >= 60 ? (
                                                    <span className="px-2 py-1 text-xs font-medium bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">High Risk</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">Medium Risk</span>
                                                )}
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
