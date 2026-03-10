import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, History, Shield, LogOut, ShieldAlert, CheckCircle, IndianRupee, ShieldCheck, AlertCircle, CloudLightning, User, MapPin, Wind, Waves, CloudRain } from 'lucide-react';

export default function WorkerDashboard() {
    const { user, logout } = useContext(AuthContext);
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
                axios.get('http://localhost:5000/api/worker/profile'),
                axios.get('http://localhost:5000/api/policy/active'),
                axios.get('http://localhost:5000/api/claim/history')
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
            await axios.post('http://localhost:5000/api/policy/create', recommendedPolicy);
            showNotification('Policy activated successfully!', 'success');
            fetchData();
        } catch (err) {
            showNotification('Failed to activate policy', 'error');
        }
    };

    const submitClaimRequest = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/claim/trigger', { disruptionType: selectedDisruption });
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

    const [activeTab, setActiveTab] = useState('dashboard');

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Dashboard...</div>;

    const totalProtected = claims.filter(c => c.status === 'Approved').reduce((acc, curr) => acc + curr.payoutAmount, 0);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'history', label: 'Claims History', icon: <History size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <div className="w-full md:w-72 bg-slate-900 text-white flex-col hidden md:flex sticky top-0 h-screen border-r border-slate-800">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Shield className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter">GigShield<span className="text-primary">.</span></span>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === item.id
                                    ? 'bg-primary text-white shadow-xl shadow-primary/30 translate-x-2'
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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center font-black text-white p-[2px]">
                                <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                                    {profile?.name?.charAt(0)}
                                </div>
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-sm font-black truncate">{profile?.name}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{profile?.city}</div>
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

            <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
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

                {/* Mobile Navigation */}
                <div className="md:hidden flex gap-3 mb-10 p-1 bg-slate-100 rounded-[20px]">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === item.id
                                ? 'bg-white text-primary shadow-md'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {item.icon}
                            {item.id === 'dashboard' ? 'Home' : 'History'}
                        </button>
                    ))}
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                {/* Policy Section */}
                                <div className="card rounded-2xl shadow-sm hover:shadow-md transition-shadow border-slate-100 overflow-hidden">
                                    {!activePolicy ? (
                                        <div>
                                            <div className="bg-gradient-to-r from-primary to-cyan-500 p-6 text-white flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-2xl tracking-tight mb-2">{recommendedPolicy?.planName}</h4>
                                                    <p className="text-blue-100 text-sm font-medium opacity-90 leading-relaxed max-w-sm">
                                                        AI dynamically calculated based on {profile?.city} weather API networks.
                                                    </p>
                                                </div>
                                                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                    <ShieldCheck size={14} /> Recommended
                                                </span>
                                            </div>

                                            <div className="p-6">
                                                <div className="bg-slate-50 p-5 rounded-xl mb-6 border border-slate-100 space-y-4">
                                                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                                        <span className="text-slate-500 font-medium">Weekly Premium</span>
                                                        <span className="font-black text-xl text-slate-800">₹{recommendedPolicy?.premium}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                                        <span className="text-slate-500 font-medium">Daily Coverage</span>
                                                        <span className="font-bold text-lg text-green-600">₹{recommendedPolicy?.coverage}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-500 font-medium">Platform Risk Score</span>
                                                        <span className="font-bold text-slate-800">{recommendedPolicy?.riskScore}/100</span>
                                                    </div>
                                                </div>
                                                <button onClick={activatePolicy} className="w-full bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 text-lg font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                                                    <ShieldCheck size={22} /> Activate Weekly Policy
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-green-200 rounded-full text-green-700"><CheckCircle /></div>
                                                <div>
                                                    <h4 className="font-bold text-green-900">{activePolicy.planName} Active</h4>
                                                    <p className="text-sm text-green-700">Protected until {new Date(activePolicy.endDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm mb-2 text-green-800">
                                                <span>Coverage</span>
                                                <span className="font-bold">₹{activePolicy.coverage} / day</span>
                                            </div>
                                            <div className="text-xs text-green-600 mt-4">* Claim is automatically triggered in your area via API simulations.</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                {activePolicy && (
                                    <div className="card p-6 border-t-4 border-t-secondary">
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <AlertCircle className="text-secondary" /> Request Insurance Claim
                                        </h3>

                                        {activePolicy.claimUsed ? (
                                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-center">
                                                <p className="text-orange-800 font-bold mb-1">Claim limit reached.</p>
                                                <p className="text-sm text-orange-600">Next claim available after renewal on {new Date(activePolicy.endDate).toLocaleDateString()}.</p>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-slate-500 mb-6 font-medium">Select the disruption type that prevented you from working today.</p>
                                                <form onSubmit={submitClaimRequest} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Disruption Type</label>
                                                        <select
                                                            className="w-full border-slate-200 rounded-lg p-3 outline-none focus:border-secondary transition shadow-sm bg-slate-50 border"
                                                            value={selectedDisruption}
                                                            onChange={(e) => setSelectedDisruption(e.target.value)}
                                                        >
                                                            <option value="Heavy Rain">Heavy Rain</option>
                                                            <option value="Flood">Flood</option>
                                                            <option value="Pollution">Pollution</option>
                                                        </select>
                                                    </div>
                                                    <button type="submit" className="w-full btn-primary bg-secondary hover:bg-cyan-600 transition shadow-md shadow-cyan-500/20 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">
                                                        <CloudLightning size={20} /> Submit Claim Request
                                                    </button>
                                                </form>
                                                <p className="text-xs text-slate-400 mt-4 text-center">Requests are manually verified by an Admin.</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
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
