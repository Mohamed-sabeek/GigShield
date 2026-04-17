import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

export default function Policies() {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [recommendedPolicy, setRecommendedPolicy] = useState(null);
    const [activePolicy, setActivePolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const fetchData = async () => {
        try {
            const [profRes, polRes] = await Promise.all([
                api.get(`/api/worker/profile`),
                api.get(`/api/policy/active`)
            ]);
            setProfile(profRes.data.profile);
            setRecommendedPolicy(profRes.data.recommendedPolicy);
            const activePol = polRes.data && polRes.data._id ? polRes.data : null;
            setActivePolicy(activePol);
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
            await api.post(`/api/policy/create`, recommendedPolicy);
            setNotification({ msg: 'Policy activated successfully!', type: 'success' });
            fetchData();
        } catch (err) {
            setNotification({ msg: 'Failed to activate policy', type: 'error' });
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Policies...</div>;

    const daysRemaining = activePolicy 
        ? Math.ceil((new Date(activePolicy.endDate) - new Date()) / (1000 * 60 * 60 * 24)) 
        : 0;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 md:p-10 max-w-5xl mx-auto w-full"
        >
            <h1 className="text-3xl font-black text-slate-800 mb-8">Insurance Policies</h1>

            {notification && (
                <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {notification.msg}
                </div>
            )}

            <div className="space-y-8">
                {/* Section 2: Active Policy (Conditional) */}
                {activePolicy && (
                    <div className="bg-white p-6 rounded-3xl border border-green-200 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle className="text-green-500" /> Currently Active
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Status: <span className="text-green-600 font-bold">Active ✅</span></p>
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                                {activePolicy.planName || 'GigShield Basic'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                            <div className="text-sm">
                                <span className="text-slate-500 font-semibold block">Start Date</span>
                                <span className="font-bold text-slate-800">{new Date(activePolicy.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-slate-500 font-semibold block">Expiry Date</span>
                                <span className="font-bold text-slate-800">{new Date(activePolicy.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-slate-500 font-semibold block">Days Remaining</span>
                                <span className="font-black text-green-700">{daysRemaining > 0 ? `${daysRemaining} days` : 'Expires today'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Section 1: Available Plan */}
                <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-cyan-500 p-8 text-white flex justify-between items-start">
                        <div>
                            <h2 className="font-bold text-3xl tracking-tight mb-2">GigShield Basic</h2>
                            <p className="text-blue-100 text-sm font-medium opacity-90 leading-relaxed max-w-sm">
                                AI dynamically calculated based on {profile?.city || 'your location'} weather API networks.
                            </p>
                        </div>
                        <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <ShieldCheck size={14} /> Recommended
                        </span>
                    </div>

                    <div className="p-8">
                        <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                <span className="text-slate-500 font-medium">Weekly Premium</span>
                                <span className="font-black text-2xl text-slate-800">₹20</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                <span className="text-slate-500 font-medium">Daily Coverage</span>
                                <span className="font-bold text-xl text-green-600">₹500</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                <span className="text-slate-500 font-medium">Duration</span>
                                <span className="font-bold text-slate-800">7 days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Claim Limit</span>
                                <span className="font-bold text-slate-800">1 claim per week</span>
                            </div>
                        </div>

                        {activePolicy ? (
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center text-orange-700 font-bold mb-4 text-sm flex items-center justify-center gap-2">
                                <AlertCircle size={18} /> You already have an active policy
                            </div>
                        ) : !profile?.isVerified ? (
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center text-amber-700 font-bold mb-4 text-sm flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={18} /> Email Verification Required
                                </div>
                                <p className="text-[10px] text-amber-600 font-medium uppercase tracking-widest leading-relaxed">
                                    Please verify your account from the dashboard to purchase this policy.
                                </p>
                            </div>
                        ) : (
                            <button onClick={activatePolicy} className="w-full bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 text-lg font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                                <ShieldCheck size={22} /> Activate Plan
                            </button>
                        )}
                    </div>
                </div>

                {/* Section 3: Policy Rules */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Shield className="text-primary" /> Policy Rules & Guidelines
                    </h3>
                    <ul className="space-y-3">
                        {[
                            "Only 1 claim per policy",
                            "Claim requires GPS verification",
                            "Weather API validation required",
                            "Policy valid for 7 days only"
                        ].map((rule, id) => (
                            <li key={id} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-primary text-xs font-black flex-shrink-0 mt-0.5">
                                    {id + 1}
                                </div>
                                {rule}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
}
