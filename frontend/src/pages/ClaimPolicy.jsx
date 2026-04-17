import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, AlertCircle, Clock, MapPin, 
    CheckCircle2, History, CloudRain, Waves, 
    ShieldQuestion, ThermometerSun, Wind, ArrowRight,
    Zap, ExternalLink
} from 'lucide-react';

export default function ClaimPolicy() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [activePolicy, setActivePolicy] = useState(null);
    const [selectedDisruption, setSelectedDisruption] = useState('Rain Disruption');
    const [profile, setProfile] = useState(null);
    const [testMode, setTestMode] = useState(false);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const [claimsRes, policyRes, profileRes, configRes] = await Promise.all([
                api.get(`/api/claims/history`, { headers: { 'Authorization': `Bearer ${token}` } }),
                api.get(`/api/policy/active`, { headers: { 'Authorization': `Bearer ${token}` } }),
                api.get(`/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
                api.get(`/api/config`)
            ]);
            setClaims(claimsRes.data || []);
            setActivePolicy(policyRes.data && policyRes.data._id ? policyRes.data : null);
            setProfile(profileRes.data.profile);
            setTestMode(configRes.data.testMode);
        } catch (err) {
            console.error("Parametric sync failed:", err);
            setClaims([]); // Fail gracefully
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleClaim = async () => {
        if (!profile?.locationSynced) {
            navigate('/dashboard?sync_highlight=true');
            return;
        }
        setSubmitting(true);
        setResult(null);
        try {
            const token = localStorage.getItem('token');
            const res = await api.post(`/api/claims/trigger`, { 
                disruptionType: selectedDisruption 
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setResult({
                status: res.data.status,
                message: res.data.message,
                amount: res.data.amount,
                weather: res.data.weather,
                warning: res.data.warning
            });
            fetchHistory(); 
        } catch (err) {
            setResult({
                status: 'Error',
                message: err.response?.data?.message || err.response?.data?.msg || 'Verification failed. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium italic animate-pulse">Synchronizing Parametric Payout Records...</div>;

    const todayClaim = claims.find(c => new Date(c.createdAt).toDateString() === new Date().toDateString());
    const savedLocation = user?.workingArea && user?.district ? `${user.workingArea}, ${user.district}` : null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 md:p-10 max-w-7xl mx-auto w-full pb-32"
        >
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black mb-3 uppercase tracking-[0.3em] text-[10px]">
                        <Zap size={14} className="fill-primary" /> Instant Parametric Protection
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Claim Dashboard</h1>
                        {testMode && (
                            <div className="px-3 py-1 bg-amber-50 text-amber-500 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse mb-1">
                                <ShieldCheck size={12} /> Test Mode Active
                            </div>
                        )}
                    </div>
                    <p className="text-slate-500 font-medium mt-1">Automatic weather-triggered payouts for gig workers.</p>
                </div>

                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <MapPin size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Monitoring</p>
                        <p className="text-sm font-black text-slate-900 leading-none italic">
                            {savedLocation || "Location Not Set"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* 🔹 Automated Control Center */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black tracking-tight flex items-center gap-4">
                                    <ShieldCheck size={36} className="text-primary" /> Request Payout
                                </h2>
                                {testMode && (
                                    <div className="px-4 py-1.5 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-400 text-[10px] font-black uppercase tracking-widest">
                                        ⚠️ Test Mode Active
                                    </div>
                                )}
                            </div>

                            <div className="space-y-8 max-w-xl">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 italic">Select Disruption Type</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'Rain Disruption', icon: CloudRain, color: 'text-blue-400' },
                                            { id: 'Heatwave', icon: ThermometerSun, color: 'text-orange-400' },
                                            { id: 'Flood Disruption', icon: Waves, color: 'text-cyan-400' }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelectedDisruption(item.id)}
                                                className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                                                    selectedDisruption === item.id 
                                                    ? 'bg-white/10 border-primary shadow-lg scale-105' 
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}
                                            >
                                                <item.icon className={`w-8 h-8 ${item.color}`} />
                                                <span className="text-xs font-black uppercase tracking-tight">{item.id.split(' ')[0]}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-6 ml-1">
                                        <MapPin size={14} className="text-primary" />
                                        Using saved location: <span className="text-white italic">{savedLocation || 'Please update profile'}</span>
                                    </p>

                                    {!savedLocation ? (
                                        <div className="bg-amber-400/10 border border-amber-400/20 p-6 rounded-[2rem] text-amber-300 font-bold text-center">
                                            Please set your location in profile to claim
                                        </div>
                                    ) : !activePolicy ? (
                                        <div className="bg-slate-800 p-8 rounded-[2rem] border border-white/10 text-center">
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Active Protection Protocol</p>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={handleClaim}
                                            disabled={submitting || (todayClaim && !testMode) || !user?.isVerified || profile?.isFrozen}
                                            className={`group w-full py-8 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all flex flex-col items-center justify-center gap-2 ${
                                                submitting ? 'bg-slate-800 cursor-not-allowed opacity-70' :
                                                profile?.isFrozen ? 'bg-red-500/20 text-red-400 border-2 border-red-500/20 cursor-not-allowed' :
                                                (todayClaim && !testMode) ? 'bg-green-500/20 text-green-400 border-2 border-green-500/20 shadow-none' :
                                                !user?.isVerified ? 'bg-slate-800 text-slate-500' :
                                                'bg-white text-slate-900 hover:scale-[0.98] active:scale-95'
                                            }`}
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="w-8 h-8 border-4 border-slate-500 border-t-white rounded-full animate-spin"></div>
                                                    <span className="text-xs font-bold uppercase tracking-widest mt-2">Analyzing weather conditions...</span>
                                                </>
                                            ) : (todayClaim && !testMode) ? (
                                                <>
                                                    <CheckCircle2 size={32} />
                                                    <span className="text-xs">You have already claimed today</span>
                                                </>
                                            ) : profile?.isFrozen ? (
                                                <>
                                                    <AlertCircle size={32} />
                                                    <span className="text-xs">Account Restricted - Fraud Risk</span>
                                                </>
                                            ) : !user?.isVerified ? (
                                                <span className="text-xs">Verify Account to Claim</span>
                                            ) : !profile?.locationSynced ? (
                                                <>
                                                    <MapPin size={32} />
                                                    <span className="text-xs">GPS Sync Required from Dashboard</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <span>Claim Insurance Payout</span>
                                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Instant Automated Verification</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Result Component */}
                    <AnimatePresence>
                        {result && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-10 md:p-14 rounded-[3.5rem] border shadow-2xl relative overflow-hidden ${
                                    result.status === 'Approved' ? 'bg-green-50 border-green-100 text-green-900' : 
                                    'bg-white border-slate-100 text-slate-800'
                                }`}
                            >
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl ${
                                        result.status === 'Approved' ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        {result.status === 'Approved' ? <ShieldCheck size={48} /> : <AlertCircle size={48} />}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-4xl font-black mb-3 tracking-tight">
                                            {result.status === 'Approved' ? 'Claim Approved ✅' : 'Conditions Not Met ❌'}
                                        </h3>
                                        <p className="font-bold text-xl opacity-80 mb-8 max-w-xl">
                                            {result.message}
                                        </p>
                                        
                                        {result.weather && (
                                            <div className="grid grid-cols-3 gap-4 max-w-sm">
                                                <div className="bg-white/60 p-4 rounded-2xl border border-white/50 text-center">
                                                    <CloudRain size={16} className="mx-auto mb-2 text-primary" />
                                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Rain</p>
                                                    <p className="font-black text-slate-900">{result.weather.rain}mm</p>
                                                </div>
                                                <div className="bg-white/60 p-4 rounded-2xl border border-white/50 text-center">
                                                    <ThermometerSun size={16} className="mx-auto mb-2 text-orange-500" />
                                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Temp</p>
                                                    <p className="font-black text-slate-900">{result.weather.temp}°C</p>
                                                </div>
                                                <div className="bg-white/60 p-4 rounded-2xl border border-white/50 text-center">
                                                    <Wind size={16} className="mx-auto mb-2 text-cyan-500" />
                                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Wind</p>
                                                    <p className="font-black text-slate-900">{result.weather.wind.toFixed(1)}k/h</p>
                                                </div>
                                            </div>
                                        )}
                                        {result.warning && (
                                            <div className="mt-8 bg-amber-400/10 border border-amber-400/20 p-5 rounded-3xl flex items-start gap-4 text-amber-900">
                                                <AlertCircle size={20} className="shrink-0 text-amber-500 mt-0.5" />
                                                <p className="text-xs font-black uppercase tracking-tight leading-relaxed">
                                                    {result.warning}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {result.status === 'Approved' && (
                                        <div className="bg-white px-10 py-8 rounded-[3rem] shadow-sm border border-green-100 text-center">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Credited</p>
                                            <p className="text-5xl font-black text-green-600">₹{result.amount}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 🔹 Sidebar */}
                <div className="space-y-8">
                    {/* Recent Payouts */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
                            <History size={22} className="text-primary" /> Recent payouts
                        </h3>
                        
                        <div className="space-y-10">
                            {claims.length === 0 ? (
                                <div className="text-center py-10 opacity-30">
                                    <ShieldQuestion className="mx-auto mb-4" size={48} />
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting history...</p>
                                </div>
                            ) : (
                                claims.slice(0, 4).map((claim, i) => (
                                    <div key={i} className="flex gap-5 group">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3.5 h-3.5 rounded-full mt-2 outline outline-4 ${
                                                claim.status === 'Approved' ? 'bg-green-500 outline-green-50' : 'bg-slate-200 outline-slate-50'
                                            }`}></div>
                                            {i !== Math.min(claims.length - 1, 3) && <div className="w-px h-16 bg-slate-100 my-1"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm font-black uppercase tracking-tight ${claim.status === 'Approved' ? 'text-green-600' : 'text-slate-400'}`}>
                                                    {claim.status === 'Approved' ? `₹${claim.payoutAmount} payout` : 'Process rejected'}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-300">{new Date(claim.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <p className="text-xs font-bold text-slate-800 italic uppercase opacity-60">
                                                {claim.disruptionType || 'WEATHER'} TRIGGER
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Protocol Rules */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 italic">Protocol rules</h4>
                        <div className="space-y-6">
                            {[
                                { l: 'Rain Disruption Threshold', v: '≥ 2mm' },
                                { l: 'Heatwave Threshold', v: '≥ 40°C' },
                                { l: 'Flood Protection', v: '≥ 10mm' },
                                { l: 'Daily Cap', v: testMode ? 'Unlimited (Test)' : '1 Claim' }
                            ].map((rule, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <p className="text-xs font-bold text-slate-300 group-hover:text-primary transition-colors">{rule.l}</p>
                                    <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full">{rule.v}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-8 text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                            Claims are processed automatically using parametric rules synced with OpenWeather global mesh.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
