import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Shield, Users, FileText, CheckCircle, Search, LogOut, TrendingUp, History, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [workers, setWorkers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('earnings');
    const [testMode, setTestMode] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, workersRes, configRes] = await Promise.all([
                api.get(`/api/admin/dashboard`),
                api.get(`/api/admin/workers`),
                api.get(`/api/config`)
            ]);
            setStats(statsRes.data);
            setWorkers(workersRes.data);
            setTestMode(configRes.data.testMode);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleMode = async () => {
        try {
            const res = await api.post(`/api/config/toggle`);
            setTestMode(res.data.testMode);
        } catch (err) {
            console.error("Mode toggle failed:", err);
            alert("Administrative override failed. Verify network connectivity.");
        }
    };

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [activeTab, setActiveTab] = useState(queryParams.get('tab') || 'stats');

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab) {
            setActiveTab(tab);
        } else {
            setActiveTab('stats');
        }
    }, [location.search]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium italic animate-pulse">Synchronizing Network State...</div>;
    if (!stats) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-medium">Failed to load admin context. Verify credentials.</div>;

    const filteredWorkers = workers
        .filter(w => {
            const matchesSearch = w.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                w.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                w.platform?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'All' || 
                                (statusFilter === 'Frozen' && w.isFrozen) ||
                                (statusFilter === 'Suspicious' && w.fraudStatus === 'suspicious') ||
                                (statusFilter === 'High Risk' && w.fraudStatus === 'high_risk');

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'fraud') return (b.fraudScore || 0) - (a.fraudScore || 0);
            return (b.claimStats?.totalEarnings || 0) - (a.claimStats?.totalEarnings || 0);
        });

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 md:p-10 w-full max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Platform Stats</h1>
                    <p className="text-slate-500 font-medium">Real-time telemetry and network participation metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={toggleMode}
                        className={`px-4 py-2 rounded-2xl border flex items-center gap-2 transition-all font-black uppercase tracking-widest text-[10px] shadow-sm active:scale-95 ${
                            testMode 
                            ? 'bg-amber-50 border-amber-200 text-amber-600' 
                            : 'bg-green-50 border-green-200 text-green-600'
                        }`}
                    >
                        <Shield size={14} className={testMode ? 'animate-pulse' : ''} />
                        {testMode ? '🟡 Test Mode Active' : '🟢 Production Mode'}
                    </button>
                    <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autonomous Sync: OK</span>
                    </div>
                </div>
            </div>

            {activeTab === 'stats' && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                            </div>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Workers</h3>
                            <div className="text-3xl font-black text-slate-900">{stats.totalWorkers}</div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Shield size={24} />
                                </div>
                            </div>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Active Policies</h3>
                            <div className="text-3xl font-black text-slate-900">{stats.activePolicies}</div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Payouts</h3>
                            <div className="text-3xl font-black text-slate-900">₹{stats.totalPayoutAmount?.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <TrendingUp size={240} />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl font-black tracking-tight mb-4 uppercase italic text-primary">Parametric Intelligence</h2>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed font-bold italic">Platform activity is currently being monitored in real-time. Automated payout triggers are active and executing with decentralized transparency across all protected districts.</p>
                            <div className="flex gap-4">
                                <button onClick={() => navigate('/admin/claims-monitor')} className="bg-primary hover:bg-white text-slate-900 font-black py-4 px-10 rounded-2xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
                                     Monitor Claims <History size={18} />
                                </button>
                            </div>
                        </div>
                   </div>
                </div>
            )}

            {activeTab === 'workers' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Frozen', 'Suspicious', 'High Risk'].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        statusFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white border border-slate-100 rounded-2xl px-4 py-3 text-[10px] font-black uppercase outline-none focus:border-primary"
                            >
                                <option value="earnings">Sort by Earnings</option>
                                <option value="fraud">Sort by Fraud Score</option>
                            </select>
                            
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 focus:border-primary outline-none text-xs font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Worker Instance</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Claims (T/A/R)</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fraud Risk</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cumulative Earnings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredWorkers.map(worker => (
                                        <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-slate-900 transition-all">
                                                        {worker.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                                                            {worker.name}
                                                            <span className={`text-[8px] px-1.5 py-0.5 rounded border ${worker.platform === 'Swiggy' ? 'text-orange-500 border-orange-100' : 'text-blue-500 border-blue-100'}`}>
                                                                {worker.platform}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">{worker.city}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="text-center">
                                                        <div className="text-xs font-black text-slate-900">{worker.claimStats?.total || 0}</div>
                                                        <div className="text-[8px] font-bold text-slate-400 uppercase">Total</div>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-slate-100"></div>
                                                    <div className="text-center">
                                                        <div className="text-xs font-black text-green-600">{worker.claimStats?.approved || 0}</div>
                                                        <div className="text-[8px] font-bold text-slate-400 uppercase">Apprv</div>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-slate-100"></div>
                                                    <div className="text-center">
                                                        <div className="text-xs font-black text-red-500">{worker.claimStats?.rejected || 0}</div>
                                                        <div className="text-[8px] font-bold text-slate-400 uppercase">Rej</div>
                                                    </div>
                                                </div>
                                            </td>
                                             <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${
                                                        worker.fraudStatus === 'high_risk' ? 'bg-red-50 text-red-600' :
                                                        worker.fraudStatus === 'suspicious' ? 'bg-orange-50 text-orange-600' :
                                                        'bg-green-50 text-green-600'
                                                    }`}>
                                                        {worker.fraudStatus === 'high_risk' || worker.isFrozen ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider">
                                                            Score: <span className={
                                                                worker.fraudScore >= 80 ? 'text-red-500' :
                                                                worker.fraudScore >= 50 ? 'text-orange-500' :
                                                                'text-green-600'
                                                            }>{worker.fraudScore || 0}</span>
                                                            {worker.isFrozen && <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded ml-1">FROZEN</span>}
                                                        </div>
                                                        <div className={`text-[9px] font-bold uppercase ${
                                                            worker.fraudStatus === 'high_risk' || worker.isFrozen ? 'text-red-600 animate-pulse' :
                                                            worker.fraudStatus === 'suspicious' ? 'text-orange-600' :
                                                            'text-slate-400'
                                                        }`}>
                                                            {worker.isFrozen ? 'Frozen until ' + new Date(worker.freezeUntil).toLocaleDateString() : worker.fraudStatus?.replace('_', ' ')}
                                                        </div>
                                                    </div>
                                                </div>
                                             </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="text-sm font-black text-slate-900 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">
                                                    ₹{(worker.claimStats?.totalEarnings || 0).toLocaleString()}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Paid Out</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
