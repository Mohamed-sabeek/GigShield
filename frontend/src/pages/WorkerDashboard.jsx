import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, History, Shield, LogOut, ShieldAlert, CheckCircle, 
    IndianRupee, ShieldCheck, AlertCircle, CloudLightning, User, MapPin, 
    Wind, Waves, CloudRain, Zap, Calendar, ArrowRight, XCircle, Sun, Cloud
} from 'lucide-react';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function WorkerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [recommendedPolicy, setRecommendedPolicy] = useState(null);
    const [activePolicy, setActivePolicy] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [geoError, setGeoError] = useState(null);
    const [eligibility, setEligibility] = useState({ status: 'checking', message: '', canClaim: false });

    const fetchWeatherData = async (lat, lon) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/weather/current?lat=${lat}&lon=${lon}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = res.data;
            setWeather(data);
            setWeatherLoading(false);
            setGeoError(null);

            // Toast for HIGH risk
            if (data.risk === 'HIGH' || data.risk === 'HEATWAVE') {
                showNotification(data.alertMessage, 'info');
            }
        } catch (err) {
            console.error('Weather sync failed:', err);
            setWeatherLoading(false);
        }
    };

    const initWeatherTracking = (prof) => {
        // PRIORITY 1: Use stored profile location
        if (prof?.location?.lat && prof?.location?.lon) {
            const { lat, lon } = prof.location;
            fetchWeatherData(lat, lon);
            const interval = setInterval(() => fetchWeatherData(lat, lon), 30000);
            return () => clearInterval(interval);
        }

        // PRIORITY 2: Fallback to browser GPS
        if (!navigator.geolocation) {
            setGeoError('Please set your location in profile for accurate monitoring');
            setWeatherLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherData(latitude, longitude);
                const interval = setInterval(() => fetchWeatherData(latitude, longitude), 30000);
                return () => clearInterval(interval);
            },
            (err) => {
                setGeoError('Please set your location in profile or enable GPS');
                setWeatherLoading(false);
            }
        );
    };

    const checkEligibility = (activePol, claimsList) => {
        if (!activePol || new Date(activePol.endDate) < new Date()) {
            setEligibility({ status: 'No active policy', message: 'Purchase a policy to become eligible for claims.', canClaim: false });
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingClaimToday = claimsList.find(c => new Date(c.createdAt) >= today);
        
        if (existingClaimToday) {
            setEligibility({ status: 'Claim Limit Reached', message: `You have already filed a claim today. Please check back tomorrow.`, canClaim: false });
            return;
        }

        setEligibility({ status: 'Eligible for claim today', message: 'Parametric triggers are monitoring your area.', canClaim: true });
    };

    const fetchData = async () => {
        try {
            const [profRes, polRes, claimRes] = await Promise.all([
                axios.get(`${API}/api/worker/profile`),
                axios.get(`${API}/api/policy/active`),
                axios.get(`${API}/api/claim/history`)
            ]);
            const profileData = profRes.data.profile;
            const activePol = polRes.data || null;
            const claimsList = claimRes.data || [];

            setProfile(profileData);
            setRecommendedPolicy(profRes.data.recommendedPolicy);
            setActivePolicy(activePol);
            setClaims(claimsList);
            
            initWeatherTracking(profileData); // Start monitoring with profile data
            checkEligibility(activePol, claimsList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const activatePolicy = async () => {
        try {
            await axios.post(`${API}/api/policy/create`, recommendedPolicy);
            showNotification('Policy activated successfully!', 'success');
            fetchData();
        } catch (err) {
            showNotification('Failed to activate policy', 'error');
        }
    };

    const submitClaimRequest = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/api/claim/trigger`, { disruptionType: selectedDisruption });
            showNotification(res.data.msg, 'success');
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.msg || 'Error triggering claim request';
            showNotification(msg, 'error');
            fetchData();
        }
    };

    const showNotification = (msg, type) => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [activeTab, setActiveTab] = useState(queryParams.get('tab') === 'history' ? 'history' : 'dashboard');

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab === 'history') {
            setActiveTab('history');
        } else {
            setActiveTab('dashboard');
        }
    }, [location.search]);


    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Synchronizing GigShield Node...</p>
            </div>
        );
    }

    const totalProtected = claims.filter(c => c.status === 'Approved').reduce((acc, curr) => acc + curr.payoutAmount, 0);
    const lastClaim = claims[0];
    const recentClaims = claims.slice(0, 3);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-10 max-w-6xl mx-auto w-full pb-24"
        >
            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center mb-8 bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm sticky top-4 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <Shield className="text-white" size={16} />
                    </div>
                    <span className="font-black text-slate-900 tracking-tighter">GigShield<span className="text-primary">.</span></span>
                </div>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                </button>
            </div>

            {notification && (
                <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] p-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 min-w-[320px] transition-all animate-bounce-slow ${notification.type === 'success' ? 'bg-slate-900 text-green-400 border-l-4 border-green-400' : 'bg-slate-900 text-red-400 border-l-4 border-red-400'}`}>
                    {notification.type === 'success' ? <CheckCircle size={24} /> : <ShieldAlert size={24} />}
                    <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-widest">{notification.type === 'success' ? 'System Success' : 'System Alert'}</p>
                        <p className="text-sm">{notification.msg}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div className="flex-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Worker Portal</h1>
                    
                    {!profile?.isVerified && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl mb-6 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-amber-900 uppercase tracking-widest leading-none mb-1">Account Verification Pending</p>
                                    <p className="text-[11px] font-bold text-amber-700 italic">Please verify your email to unlock all features including policy purchases.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/verify-otp?email=${profile.email}`)}
                                className="bg-amber-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition shadow-lg shadow-amber-500/20 whitespace-nowrap"
                            >
                                Verify Now
                            </button>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-slate-500 font-bold flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full text-xs shadow-sm capitalize">
                            <MapPin size={14} className="text-primary" /> {profile?.workingArea || profile?.district}
                        </span>
                        <span className="text-slate-500 font-bold flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full text-xs shadow-sm capitalize">
                            <Zap size={14} className="text-amber-500" /> {profile?.platform || 'Gig'} Network
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 border border-slate-100 italic">
                                {profile?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 truncate max-w-[120px]">{profile?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {profile?.isVerified ? 'Verified Identity' : 'Pending Verification'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'dashboard' && (
                <div className="space-y-8">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <IndianRupee size={120} />
                            </div>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Total Protected</h3>
                            <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">₹{totalProtected.toLocaleString()}</div>
                            <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-wider">
                                <CheckCircle size={12} /> Payouts Disbursed
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Shield size={120} />
                            </div>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Protection State</h3>
                            <div className={`text-2xl font-black tracking-tighter mb-2 ${activePolicy && new Date(activePolicy.endDate) > new Date() ? 'text-primary' : 'text-slate-300'}`}>
                                {activePolicy && new Date(activePolicy.endDate) > new Date() ? 'Network Secured' : 'Unprotected'}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${activePolicy && new Date(activePolicy.endDate) > new Date() ? 'text-cyan-600' : 'text-slate-400'}`}>
                                {activePolicy && new Date(activePolicy.endDate) > new Date() ? (
                                    <><ShieldCheck size={12} /> Policy ACTIVE & READY</>
                                ) : (
                                    <><AlertCircle size={12} /> System Vulnerable / Expired</>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Waves size={120} />
                            </div>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-4">AI Risk Analysis</h3>
                            <div className={`text-2xl font-black tracking-tighter mb-2 ${recommendedPolicy?.riskLevel === 'High Flood Risk' ? 'text-red-500' : recommendedPolicy?.riskLevel === 'Medium Heat Risk' ? 'text-orange-500' : 'text-green-500'}`}>
                                {recommendedPolicy?.riskLevel || 'Monitoring...'}
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                <CloudRain size={12} /> Local Weather Node: Up
                            </div>
                        </div>
                    </div>

                    {/* Claim Hero Section */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                        <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl">
                            <CloudLightning size={240} className="text-primary" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-6 group transition-all hover:bg-white/20">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${eligibility.canClaim ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'}`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{eligibility.status}</span>
                                </div>
                                <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">Experiencing work disruption due to weather?</h2>
                                <p className="text-slate-400 text-lg mb-8 max-w-lg leading-relaxed">{eligibility.message}</p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                    <button 
                                        onClick={() => navigate('/claim')}
                                        disabled={!eligibility.canClaim}
                                        className={`group px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${
                                            eligibility.canClaim 
                                            ? 'bg-primary text-white shadow-xl shadow-primary/40 hover:scale-105 active:scale-95' 
                                            : 'bg-white/5 text-white/30 cursor-not-allowed grayscale'
                                        }`}
                                    >
                                        Claim Protection Payout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    {!eligibility.canClaim && (
                                        <div className="flex items-center gap-2 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold text-white/50 italic">
                                            <Info size={16} /> eligibility restricted until {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Last Claim Status */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col group hover:shadow-xl transition-all">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <History size={16} className="text-primary" /> Last Claim Status
                            </h4>
                            {lastClaim ? (
                                <div className="space-y-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <div className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${lastClaim.status === 'Approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {lastClaim.status}
                                        </div>
                                        <span className="text-xs text-slate-400 font-bold">{new Date(lastClaim.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter">₹{lastClaim.payoutAmount}</div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${lastClaim.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {lastClaim.status === 'Approved' ? <ShieldCheck size={18} /> : <XCircle size={18} />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Reported Trigger</p>
                                            <p className="text-sm font-bold text-slate-700 truncate">{lastClaim.disruptionType}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 grayscale py-10">
                                    <Info size={32} className="mb-2 text-slate-300" />
                                    <p className="text-xs font-bold text-slate-400">No previous claims</p>
                                </div>
                            )}
                        </div>

                        {/* Live Weather Info */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col group hover:shadow-xl transition-all relative overflow-hidden">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <CloudLightning size={16} className="text-amber-500" /> Live Parametric Monitor
                            </h4>
                            
                            {weatherLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-10">
                                    <div className="w-8 h-8 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-3"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Satellite...</p>
                                </div>
                            ) : geoError ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                                    <MapPin size={32} className="text-red-200 mb-3" />
                                    <p className="text-[10px] font-bold text-red-500 uppercase leading-4">{geoError}</p>
                                </div>
                            ) : weather && (
                                <div className="flex-1 space-y-6 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                {weather.rain >= 2 ? <CloudRain size={40} className="text-blue-500" /> : weather.temp >= 35 ? <Sun size={40} className="text-amber-500" /> : <Cloud size={40} className="text-slate-400" />}
                                            </div>
                                            <div>
                                                <div className="text-4xl font-black text-slate-900 tracking-tighter">{Math.round(weather.temp)}°C</div>
                                                <div className="text-xs font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider tabular-nums">
                                                    <MapPin size={10} /> {profile?.workingArea}, {profile?.district}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-current bg-opacity-10 ${
                                            weather.risk === 'HIGH' ? 'bg-red-500 text-red-600 border-red-200' : 
                                            weather.risk === 'HEATWAVE' ? 'bg-orange-500 text-orange-600 border-orange-200' : 
                                            'bg-green-500 text-green-600 border-green-200'
                                        }`}>
                                            Risk: {weather.risk}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-wider mb-1">Precipitation</p>
                                            <p className="text-lg font-black text-blue-700">{weather.rain} <span className="text-xs">mm</span></p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Wind Speed</p>
                                            <p className="text-lg font-black text-slate-700">{Math.round(weather.wind)} <span className="text-xs">km/h</span></p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-50">
                                        <p className="text-[9px] text-slate-400 font-bold text-center uppercase tracking-widest flex items-center justify-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> 
                                            Real-time Network Feed Active
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Policy Details */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col group hover:shadow-xl transition-all">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-green-500" /> Policy Blueprint
                            </h4>
                            {activePolicy ? (
                                <div className="space-y-6 flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black text-white bg-slate-900 px-3 py-1 rounded-lg uppercase italic tracking-widest">Premium Plan</span>
                                        <span className={`text-xs font-bold ${new Date(activePolicy.endDate) > new Date() ? 'text-primary' : 'text-red-500'}`}>
                                            {new Date(activePolicy.endDate) > new Date() ? 'Active' : 'Expired'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-black text-slate-900 tracking-tighter">₹{activePolicy.coverage} <span className="text-base text-slate-400 font-bold lowercase">/event</span></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Plan Type</span>
                                            <span className="text-slate-700">Parametric Weekly</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Days Remaining</span>
                                            <span className="text-primary">{Math.ceil((new Date(activePolicy.endDate) - new Date()) / (1000 * 60 * 60 * 24))} Days</span>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/policies')} className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl transition-colors mt-auto flex items-center justify-center gap-2">
                                        Upgrade Policy <Zap size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                                    <ShieldAlert size={48} className="mb-4 text-slate-200" />
                                    <p className="text-sm font-bold text-slate-500 mb-6 leading-relaxed">System Unprotected.<br/>Workers without coverage cannot claim payouts.</p>
                                    <button onClick={() => navigate('/policies')} className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                        Buy Policy Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="pt-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <History size={20} className="text-primary" /> Recent Claims Activity
                            </h3>
                            <button onClick={() => navigate('/dashboard?tab=history')} className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All Records</button>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            {recentClaims.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center justify-center text-slate-300">
                                    <Zap size={48} className="mb-4 opacity-50" />
                                    <p className="font-bold text-sm">No recent activity on this network node.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Registered</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Disruption</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settlement</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {recentClaims.map(claim => (
                                                <tr key={claim._id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="text-xs font-bold text-slate-700">{new Date(claim.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium">{new Date(claim.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                                                            claim.status === 'Approved' ? 'bg-green-50 text-green-600' : 
                                                            claim.status === 'Rejected' ? 'bg-red-50 text-red-600' : 
                                                            'bg-blue-50 text-blue-600'
                                                        }`}>
                                                            {claim.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="text-xs font-black text-slate-800 italic">{claim.disruptionType}</div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-black text-slate-900">
                                                        ₹{claim.payoutAmount}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-colors">
                            <ArrowRight className="rotate-180" size={20} />
                        </button>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Archives & History</h3>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        {claims.length === 0 ? (
                            <div className="p-32 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                                    <ShieldAlert size={40} />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-2">Network Logs Empty</h4>
                                <p className="text-slate-400 font-medium">Your historical records will synchronize here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {claims.map(claim => (
                                    <div key={claim._id} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-4 rounded-[1.5rem] ${claim.status === 'Approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {claim.status === 'Approved' ? <ShieldCheck size={28} /> : <XCircle size={28} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-black text-lg text-slate-900">{claim.disruptionType}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        claim.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                                        claim.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 
                                                        'bg-blue-100 text-blue-700 border border-blue-200'
                                                    }`}>
                                                        {claim.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                                                    <Calendar size={12} /> {new Date(claim.createdAt).toLocaleDateString()} at {new Date(claim.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                                {claim.status === 'Approved' ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        <CheckCircle size={14} /> Payout Deposited
                                                    </div>
                                                ) : claim.status === 'Rejected' ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        <XCircle size={14} /> Claim Denied by Admin
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 px-4 md:px-0 bg-slate-50 md:bg-transparent py-4 md:py-0 rounded-2xl">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest md:mb-1">Amount Settled</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{claim.payoutAmount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

const Info = ({ size, className }) => <AlertCircle size={size} className={className} />;
