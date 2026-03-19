import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, History, Shield, LogOut, ShieldAlert, CheckCircle, IndianRupee, ShieldCheck, AlertCircle, CloudLightning, User, MapPin, Wind, Waves, CloudRain } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function WorkerDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [recommendedPolicy, setRecommendedPolicy] = useState(null);
    const [activePolicy, setActivePolicy] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [selectedDisruption, setSelectedDisruption] = useState('Heavy Rain');

    const fetchData = async () => {
        try {
            const [profRes, polRes, claimRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/worker/profile`),
                axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/policy/active`),
                axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/claim/history`)
            ]);
            setProfile(profRes.data.profile);
            setRecommendedPolicy(profRes.data.recommendedPolicy);
            setActivePolicy(polRes.data || null);
            setClaims(claimRes.data || []);
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
            await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/policy/create`, recommendedPolicy);
            showNotification('Policy activated successfully!', 'success');
            fetchData();
        } catch (err) {
            showNotification('Failed to activate policy', 'error');
        }
    };

    const submitClaimRequest = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/claim/trigger`, { disruptionType: selectedDisruption });
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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Dashboard...</div>;

    const totalProtected = claims.filter(c => c.status === 'Approved').reduce((acc, curr) => acc + curr.payoutAmount, 0);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'policies', label: 'Policies', icon: <Shield size={20} /> },
        { id: 'claim', label: 'Claim Policy', icon: <CloudLightning size={20} /> },
        { id: 'history', label: 'Claims History', icon: <History size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />

            <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full">
                {/* Mobile Header */}
                <div className="md:hidden flex justify-between items-center mb-8 bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm sticky top-4 z-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <Shield className="text-white" size={16} />
                        </div>
                        <span className="font-black text-slate-900 tracking-tighter">GigShield<span className="text-primary">.</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-200">
                            {profile?.name?.charAt(0)}
                        </div>
                        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>


                {notification && (
                    <div className={`mb-6 p-4 rounded-lg shadow-sm font-semibold flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'} animate-pulse`}>
                        {notification.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
                        {notification.msg}
                    </div>
                )}

                <h2 className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">Welcome back, {profile?.name}</h2>
                <p className="text-slate-500 mb-8 font-medium bg-slate-100 inline-block px-3 py-1 rounded-full text-sm">{profile?.city} • {profile?.platform} Partner</p>

                {activeTab === 'dashboard' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="card p-6 bg-white hover:shadow-md transition-shadow duration-300 border-t-4 border-t-green-500 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <IndianRupee size={100} />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                        <IndianRupee size={24} />
                                    </div>
                                </div>
                                <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">Total Protected Income</h3>
                                <div className="text-4xl font-black text-slate-800 flex items-center tracking-tight">
                                    ₹{totalProtected.toLocaleString()}
                                </div>
                            </div>

                            <div className="card p-6 bg-white hover:shadow-md transition-shadow duration-300 border-t-4 border-t-primary rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <ShieldCheck size={100} />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${activePolicy ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                        <ShieldAlert size={24} />
                                    </div>
                                </div>
                                <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">Active Policy</h3>
                                <div className={`text-xl font-bold mt-1 ${activePolicy ? 'text-primary' : 'text-slate-400'}`}>
                                    {activePolicy ? `Active until ${new Date(activePolicy.endDate).toLocaleDateString()}` : 'No Active Plan'}
                                </div>
                            </div>

                            <div className="card p-6 bg-white hover:shadow-md transition-shadow duration-300 border-t-4 border-t-amber-500 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Wind size={100} />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${recommendedPolicy?.riskLevel === 'High Flood Risk' ? 'bg-red-50 text-red-600' : recommendedPolicy?.riskLevel === 'Medium Heat Risk' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                        {recommendedPolicy?.riskLevel === 'High Flood Risk' ? <Waves size={24} /> : recommendedPolicy?.riskLevel === 'Medium Heat Risk' ? <CloudRain size={24} /> : <CheckCircle size={24} />}
                                    </div>
                                </div>
                                <h3 className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">AI Risk Zone</h3>
                                <div className={`text-xl font-bold mt-1 ${recommendedPolicy?.riskLevel === 'High Flood Risk' ? 'text-red-500' : recommendedPolicy?.riskLevel === 'Medium Heat Risk' ? 'text-orange-500' : 'text-green-500'}`}>
                                    {recommendedPolicy?.riskLevel || 'Unknown'}
                                </div>
                            </div>
                        </div>

                        {/* Claim trigger moved to Claim Policy page */}
                    </>
                )}

                {activeTab === 'history' && (
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Claims History</h3>
                        <div className="card overflow-hidden bg-white shadow-sm border border-slate-100 rounded-2xl">
                            {claims.length === 0 ? (
                                <div className="p-12 text-center text-slate-500 font-medium bg-slate-50 border-2 border-dashed border-slate-200 m-6 rounded-2xl">No claims filed yet. Your history will appear here.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {claims.map(claim => (
                                        <div key={claim._id} className="p-6 hover:bg-slate-50 transition border-l-4 border-l-transparent hover:border-l-primary group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="font-bold text-lg text-slate-800 flex items-center gap-2 group-hover:text-primary transition">
                                                    {claim.disruptionType}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${claim.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' : claim.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                    {claim.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium">{new Date(claim.updatedAt || claim.createdAt).toLocaleString()}</span>
                                                <span className="font-black text-slate-800 text-lg">Payout: ₹{claim.payoutAmount}</span>
                                            </div>
                                            {claim.status === 'Approved' && (
                                                <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700 font-semibold flex items-center gap-2">
                                                    <CheckCircle size={16} /> Payout Processed Successfully via UPI to connected bank account
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
