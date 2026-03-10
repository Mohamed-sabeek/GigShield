import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Users, FileText, CheckCircle, MapPin, AlertTriangle, IndianRupee, CloudRain, ShieldAlert, LayoutDashboard, Shield, History } from 'lucide-react';

export default function AdminDashboard() {
    const { logout } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [verifiedClaims, setVerifiedClaims] = useState({});
    const [workers, setWorkers] = useState([]);
    const [history, setHistory] = useState([]);

    const fetchData = async () => {
        try {
            const [statsRes, claimsRes, workersRes, historyRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/dashboard'),
                axios.get('http://localhost:5000/api/admin/claims'),
                axios.get('http://localhost:5000/api/admin/workers'),
                axios.get('http://localhost:5000/api/admin/claims/history')
            ]);
            setStats(statsRes.data);
            setClaims(claimsRes.data);
            setWorkers(workersRes.data);
            setHistory(historyRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (claimId, action) => {
        if (action === 'simulate') {
            setActionLoading(`sim-${claimId}`);
            // Fake 2-second simulation delay
            setTimeout(() => {
                setVerifiedClaims(prev => ({ ...prev, [claimId]: true }));
                setActionLoading(null);
            }, 2000);
            return;
        }

        setActionLoading(claimId);
        try {
            await axios.post(`http://localhost:5000/api/admin/claim/${action}/${claimId}`);
            fetchData(); // Refresh list and stats
        } catch (err) {
            console.error('Action failed', err);
            alert('Failed to process claim.');
        } finally {
            setActionLoading(null);
        }
    };

    const [activeTab, setActiveTab] = useState('stats');

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Admin Panel...</div>;
    if (!stats) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-medium">Failed to load admin stats. Verify your admin role.</div>;

    const navItems = [
        { id: 'stats', label: 'Platform Stats', icon: <LayoutDashboard size={20} /> },
        { id: 'workers', label: 'Workers DB', icon: <Users size={20} /> },
        { id: 'history', label: 'Approved History', icon: <History size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <div className="w-full md:w-72 bg-slate-900 text-white flex-col hidden md:flex sticky top-0 h-screen border-r border-slate-800">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Shield className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter">GigShield<span className="text-cyan-500 italic">.</span></span>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === item.id
                                    ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/30 translate-x-2'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-800 bg-slate-900/50">
                    <div className="bg-slate-800/50 rounded-3xl p-5 mb-4 border border-slate-700/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-black text-white p-[2px]">
                                <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-xs">
                                    AD
                                </div>
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-sm font-black truncate text-cyan-400">Admin Control</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">Root Access</div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 md:p-10 w-full max-w-7xl mx-auto">
                {/* Mobile Header */}
                <div className="md:hidden flex justify-between items-center mb-8 bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm sticky top-4 z-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Shield className="text-white" size={16} />
                        </div>
                        <span className="font-black text-slate-900 tracking-tighter">GigShield<span className="text-cyan-500">.</span></span>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden flex gap-3 mb-10 p-1 bg-slate-100 rounded-[20px]">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === item.id
                                ? 'bg-white text-cyan-500 shadow-md'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {item.icon}
                            {item.id === 'stats' ? 'Stats' : item.id === 'workers' ? 'Workers' : 'History'}
                        </button>
                    ))}
                </div>

                {activeTab === 'stats' && (
                    <>
                        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Platform Overview</h2>
                                <p className="text-slate-500 font-medium">Macro view of parametic insurance platform</p>
                            </div>
                            <span className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                System Online
                            </span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <div className="card p-6 bg-white hover:shadow-md transition-shadow duration-300 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <Users size={24} />
                                    </div>
                                </div>
                                <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">Total Workers</h3>
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalWorkers}</div>
                            </div>

                            <div className="card p-6 bg-white hover:shadow-md transition-shadow duration-300 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
                                        <FileText size={24} />
                                    </div>
                                </div>
                                <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">Active Policies</h3>
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{stats.activePolicies}</div>
                            </div>

                            <div className="card p-6 bg-white hover:shadow-md transition-shadow duration-300 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <CheckCircle size={24} />
                                    </div>
                                </div>
                                <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">Parametric Claims</h3>
                                <div className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalClaims}</div>
                            </div>

                            <div className="card p-6 bg-white hover:shadow-md transition-shadow duration-300 rounded-2xl border-2 border-green-100 bg-green-50/30">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                                        <IndianRupee size={24} />
                                    </div>
                                </div>
                                <h3 className="text-green-800 text-xs font-bold mb-1 uppercase tracking-wider">Total Payouts</h3>
                                <div className="text-3xl font-black text-green-700 flex items-center tracking-tight">
                                    ₹{stats.totalPayoutAmount.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Pending Claims Section */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Pending Claim Requests</h2>
                            <p className="text-slate-500 mb-6 font-medium">Verify and approve parametric claims requested by workers.</p>

                            {claims.length === 0 ? (
                                <div className="card bg-slate-50 border-dashed border-2 border-slate-200 p-12 text-center text-slate-500 font-medium rounded-2xl">
                                    No pending claims to review. Team is caught up!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {claims.map((claim) => {
                                        const isVerified = verifiedClaims[claim._id];
                                        const isSimulating = actionLoading === `sim-${claim._id}`;
                                        const isApproving = actionLoading === claim._id;

                                        return (
                                            <div key={claim._id} className="card p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-bold text-xl text-slate-800">{claim.userId?.name || 'Unknown Worker'}</h3>
                                                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide">{claim.userId?.city || 'Unknown City'}</span>
                                                    </div>
                                                    <p className="text-slate-600 text-sm font-medium"><span className="text-slate-400">Disruption:</span> <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">{claim.disruptionType}</span></p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <p className="text-xs text-slate-400 font-medium">Requested: {new Date(claim.createdAt).toLocaleDateString()}</p>
                                                        <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${isVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {isVerified ? <><CheckCircle size={12} /> Verified</> : 'Status: Not Verified'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto p-4 lg:p-0 bg-slate-50 lg:bg-transparent rounded-xl">
                                                    <button
                                                        onClick={() => handleAction(claim._id, 'simulate')}
                                                        disabled={isSimulating || isVerified}
                                                        className={`px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold shadow-sm transition min-w-[140px] flex justify-center items-center ${isVerified ? 'text-green-600 bg-green-50' : 'text-slate-700'}`}
                                                    >
                                                        {isSimulating ? (
                                                            <span className="animate-pulse">Running...</span>
                                                        ) : isVerified ? (
                                                            <>✔ Verified</>
                                                        ) : (
                                                            'Run Simulation'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(claim._id, 'approve')}
                                                        disabled={isApproving || !isVerified}
                                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20 rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isApproving ? 'Processing...' : 'Approve ₹500'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(claim._id, 'reject')}
                                                        disabled={actionLoading && !isSimulating}
                                                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-bold transition disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="text-amber-500" /> AI High-Risk Hotspots (Tamil Nadu)
                                </h3>
                                <div className="card overflow-hidden bg-white shadow-sm border border-slate-100 rounded-2xl p-2">
                                    <div className="space-y-2 p-2">
                                        {stats.highRiskZones.map((zone, idx) => {
                                            // Assign logic to colored risk badges based on risk type string
                                            let badgeColor = 'bg-slate-100 text-slate-600';
                                            if (zone.risk.includes('Flood')) badgeColor = 'bg-red-100 text-red-700';
                                            else if (zone.risk.includes('Heat')) badgeColor = 'bg-orange-100 text-orange-700';
                                            else if (zone.risk.includes('Rain')) badgeColor = 'bg-blue-100 text-blue-700';
                                            else if (zone.risk.includes('Low Risk')) badgeColor = 'bg-green-100 text-green-700';

                                            return (
                                                <div key={idx} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition p-4 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="text-slate-400" size={18} />
                                                        <p className="font-bold text-slate-800 text-lg">{zone.city}</p>
                                                    </div>
                                                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm uppercase tracking-wider ${badgeColor}`}>
                                                        {zone.risk}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 shadow-xl shadow-slate-900/10 rounded-3xl relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>
                                    <h3 className="font-bold text-xl mb-6 text-cyan-400 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                        System Intelligence
                                    </h3>
                                    <ul className="space-y-5 text-sm font-medium text-slate-300 relative z-10">
                                        <li className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                                            <span className="flex items-center gap-2"><CloudRain size={16} className="text-blue-400" /> Weather APIs</span>
                                            <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">Online</span>
                                        </li>
                                        <li className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                                            <span className="flex items-center gap-2"><IndianRupee size={16} className="text-emerald-400" /> Payout Gateway</span>
                                            <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">Stable</span>
                                        </li>
                                        <li className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                                            <span className="flex items-center gap-2"><ShieldAlert size={16} className="text-amber-400" /> Fraud Detection</span>
                                            <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">Active</span>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> System Status</span>
                                            <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">Healthy</span>
                                        </li>
                                    </ul>
                                    <div className="mt-8 pt-5 border-t border-slate-700/50 relative z-10">
                                        <p className="text-xs text-slate-400 font-medium text-center tracking-wide">GigShield AI v2.0 • Operational</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'workers' && (
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Workers Database</h2>
                        <p className="text-slate-500 mb-8 font-medium">Manage all enrolled gig workers and view their policy states.</p>

                        <div className="card overflow-hidden bg-white shadow-sm border border-slate-100 rounded-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {workers.map(w => (
                                            <tr key={w.id} className="hover:bg-slate-50 transition">
                                                <td className="py-4 px-6 font-bold text-slate-800">{w.name}</td>
                                                <td className="py-4 px-6 text-slate-600 font-medium">{w.city}</td>
                                                <td className="py-4 px-6 text-slate-600 font-medium">{w.platform}</td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${w.status === 'Active Policy' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Claim History</h2>
                        <p className="text-slate-500 mb-8 font-medium">Review all previously processed insurance claims.</p>

                        <div className="card overflow-hidden bg-white shadow-sm border border-slate-100 rounded-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Worker</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Disruption</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Payout</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">No processed claims found.</td>
                                            </tr>
                                        ) : (
                                            history.map(h => (
                                                <tr key={h._id} className="hover:bg-slate-50 transition">
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-slate-800">{h.userId?.name}</div>
                                                        <div className="text-xs text-slate-400">{h.userId?.city}</div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded text-sm">{h.disruptionType}</span>
                                                    </td>
                                                    <td className="py-4 px-6 font-bold text-slate-800">₹{h.payoutAmount || 0}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${h.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {h.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-500 text-sm">{new Date(h.updatedAt || h.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}



            </div>
        </div>
    );
}
