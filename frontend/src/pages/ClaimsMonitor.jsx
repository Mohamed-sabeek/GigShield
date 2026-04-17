import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, ShieldCheck, AlertCircle, 
    Calendar, MapPin, CloudRain, ThermometerSun, 
    Wind, IndianRupee, Cpu, ArrowUpDown, ChevronDown, 
    Clock, User
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ClaimsMonitor() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // latest first

    const fetchClaims = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/admin/claims`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setClaims(res.data);
        } catch (err) {
            console.error('Failed to fetch claims', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const filteredClaims = claims
        .filter(claim => {
            const matchesStatus = filterStatus === 'All' || claim.status === filterStatus;
            const userName = claim.userId?.name?.toLowerCase() || '';
            const district = claim.userId?.district?.toLowerCase() || '';
            const area = claim.userId?.workingArea?.toLowerCase() || '';
            const matchesSearch = userName.includes(searchTerm.toLowerCase()) || 
                                district.includes(searchTerm.toLowerCase()) ||
                                area.includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            if (sortOrder === 'desc') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
        });

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium italic animate-pulse">Accessing Parametric Ledger...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 md:p-10 max-w-7xl mx-auto w-full pb-24"
        >
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Monitor</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time supervision of automated parametric payouts.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
                        <Cpu size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Autonomous Mode Active</span>
                    </div>
                </div>
            </div>

            {/* 🛠 Filters & Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                <div className="lg:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by worker name, district or area..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm outline-none focus:border-primary font-bold text-slate-700 transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    {['All', 'Approved', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                                filterStatus === status 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="bg-white border border-slate-100 rounded-3xl px-6 py-4 flex items-center justify-between font-black text-[10px] uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                    <span className="flex items-center gap-2">
                        <ArrowUpDown size={16} /> 
                        {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${sortOrder === 'desc' ? '' : 'rotate-180'}`} />
                </button>
            </div>

            {/* 📊 Claims Monitoring Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Worker Detail</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Location Context</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Disruption Type</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Weather Snapshot</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status & Payout</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right font-sans">Timestamp</th>
                                <th className="px-4 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredClaims.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-slate-400 font-bold italic">
                                        No automated claim records found matching the current filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredClaims.map((claim) => (
                                    <motion.tr 
                                        layout
                                        key={claim._id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                                                    {claim.userId?.name?.charAt(0) || <User size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm leading-none mb-1">{claim.userId?.name || 'Unknown User'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{claim.userId?.platform || 'Direct'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs italic">
                                                <MapPin size={14} className="text-slate-300" />
                                                {claim.userId?.workingArea}, {claim.userId?.district}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                claim.disruptionType?.includes('Rain') ? 'bg-blue-50 text-blue-600' :
                                                claim.disruptionType?.includes('Heat') ? 'bg-orange-50 text-orange-600' :
                                                'bg-cyan-50 text-cyan-600'
                                            }`}>
                                                {claim.disruptionType || 'Weather'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="text-center group-hover:scale-110 transition-transform">
                                                    <p className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">Rain</p>
                                                    <p className="text-xs font-black text-slate-800">{claim.weatherSnapshot?.rain ? `${claim.weatherSnapshot.rain}mm` : '-'}</p>
                                                </div>
                                                <div className="w-px h-6 bg-slate-100"></div>
                                                <div className="text-center group-hover:scale-110 transition-transform">
                                                    <p className="text-[8px] font-black text-slate-300 uppercase leading-none mb-1">Temp</p>
                                                    <p className="text-xs font-black text-slate-800">{claim.weatherSnapshot?.temp ? `${claim.weatherSnapshot.temp}°C` : '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${claim.status === 'Approved' ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-red-400 shadow-sm shadow-red-200'}`}></div>
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase ${claim.status === 'Approved' ? 'text-green-600' : 'text-red-500'}`}>
                                                        {claim.status}
                                                    </p>
                                                    <p className="text-xs font-black text-slate-900 leading-none">₹{claim.payoutAmount || 0}</p>
                                                </div>
                                            </div>
                                        </td>
                                         <td className="px-6 py-6">
                                             <div className="flex items-center gap-3">
                                                 <div className={`w-2 h-2 rounded-full ${
                                                     claim.fraudScoreAtTime >= 80 ? 'bg-red-500' :
                                                     claim.fraudScoreAtTime >= 50 ? 'bg-orange-500' :
                                                     'bg-green-500'
                                                 }`}></div>
                                                 <div>
                                                     <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Risk at Claim</p>
                                                     <p className="text-xs font-black text-slate-800 tracking-tighter">
                                                         Score: {claim.fraudScoreAtTime || 0}
                                                     </p>
                                                 </div>
                                             </div>
                                         </td>
                                         <td className="px-8 py-6 text-right">
                                             <p className="text-[10px] font-black text-slate-500 font-sans tracking-tight">{new Date(claim.createdAt).toLocaleDateString()}</p>
                                             <p className="text-[10px] font-bold text-slate-300 font-sans tracking-tight">{new Date(claim.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                         </td>
                                        <td className="px-4 py-6">
                                            <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.2em] border ${
                                                claim.autoProcessed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                                {claim.autoProcessed ? 'Auto' : 'Log'}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🤖 Mode Selection Info */}
            <div className="mt-8 flex flex-col md:flex-row items-center gap-4 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                    <ShieldCheck size={28} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">System Override Disabled</h4>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                        The platform is currently operating on 100% parametric automation. Manual overrides are restricted to ensure transparency and smart-contract integrity. Contact system administrator for protocol adjustments.
                    </p>
                </div>
                <button disabled className="px-8 py-3 bg-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                    Override Decision
                </button>
            </div>
        </motion.div>
    );
}
