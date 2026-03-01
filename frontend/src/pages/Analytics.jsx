import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Download, Filter, TrendingUp, DollarSign, ShieldAlert, Activity } from 'lucide-react';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${API_URL}/analytics-summary`);
                setData(res.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleExport = () => {
        if (!data) return;

        // Create CSV Header
        let csvContent = "data:text/csv;charset=utf-8,Month,Gross Volume,Expected Earnings,Capital Saved (Prevented Loss),Unrecognized Leakage,Blocked Transactions,Manual Reviews\n";

        // Loop through the 7 periods and create rows
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        labels.forEach((month, index) => {
            // Because Gross Volume is a single total right now, we can just distribute it or leave it blank per month. We'll leave it blank for monthly and put the sums at the bottom.
            const expected = data.revenue_timeseries.expected_earnings[index];
            const prevented = data.revenue_timeseries.prevented[index];
            const leakage = data.revenue_timeseries.leakage[index];
            const blocked = data.block_timeseries.blocked[index];
            const manual = data.block_timeseries.manual[index];

            csvContent += `${month},,${expected},${prevented},${leakage},${blocked},${manual}\n`;
        });

        // Add TOTALS row at the bottom
        csvContent += `\nTOTALS,${data.gross_volume},${data.expected_earnings},${data.capital_saved},${data.gross_volume - data.expected_earnings},,`;

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Trustigo_Financial_Impact_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 space-y-4 animate-pulse-glow">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="font-medium tracking-wide">Compiling financial algorithms...</p>
        </div>
    );

    if (!data) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 space-y-4">
            <ShieldAlert size={48} className="text-danger/50" />
            <p className="font-medium tracking-wide">Failed to load analytics data.</p>
            <p className="text-sm">Please ensure the backend server is running on port 8000.</p>
        </div>
    );

    const revenueLossData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Expected Earnings ($)',
                data: data.revenue_timeseries.expected_earnings,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366F1',
                pointBorderColor: '#0B1220',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
            {
                label: 'Prevented Fraud Loss ($) (Capital Saved)',
                data: data.revenue_timeseries.prevented,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#0B1220',
                pointBorderWidth: 2,
                pointRadius: 3,
            }
        ],
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, usePointStyle: true, boxWidth: 8 },
                position: 'top',
                align: 'end'
            },
            tooltip: {
                backgroundColor: '#0B1220', titleColor: '#ffffff', bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12,
                boxPadding: 6, usePointStyle: true,
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }
            }
        },
        interaction: { mode: 'index', intersect: false }
    };

    return (
        <div className="space-y-6 animate-fade-in opacity-0 max-w-7xl mt-2 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Financial Impact Analytics</h1>
                    <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">Algorithmically tracking net revenue against prevented fraud loss using predictive models.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary text-sm">
                        <Filter size={16} /> Last 90 Days
                    </button>
                    <button onClick={handleExport} className="btn-secondary text-sm hover:text-white hover:bg-white/10 transition-all">
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                <div className="card shadow-xl border-white/5 flex items-center justify-between group">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Gross Volume</p>
                        <h3 className="text-2xl font-bold text-white font-mono">${data.gross_volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1">Pre-Returns API Data</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-dashboard border border-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                    </div>
                </div>

                <div className="card shadow-xl border-white/5 flex items-center justify-between group">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Expected Earnings</p>
                        <h3 className="text-2xl font-bold text-white font-mono">${data.expected_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1"><TrendingUp size={14} /> Net revenue post-leakage</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="card shadow-xl border-white/5 flex items-center justify-between group">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Capital Saved</p>
                        <h3 className="text-2xl font-bold text-white font-mono">${data.capital_saved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        <p className="text-xs text-safe font-medium mt-2 flex items-center gap-1"><ShieldAlert size={14} /> Blocked Fraudulent Returns</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-safe/10 flex items-center justify-center text-safe shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                        <ShieldAlert size={24} />
                    </div>
                </div>
            </div>

            <div className="card shadow-xl border-white/5 flex flex-col animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-white">Expected Earnings vs Prevented Loss Forecast</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Time-series comparison of protected capital and verified earnings distributions.</p>
                    </div>
                    <button className="text-xs text-primary hover:text-white transition-colors font-medium">Full Analysis</button>
                </div>
                <div className="flex-1 min-h-[400px] relative w-full">
                    <Line data={revenueLossData} options={commonOptions} />
                </div>
            </div>
        </div>
    );
}
