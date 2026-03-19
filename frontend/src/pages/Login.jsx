import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const user = await login(formData.email, formData.password);
            if (user.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 overflow-hidden relative">
            <Navbar />

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-cyan-100/50 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10"></div>

            <div className="flex items-center justify-center min-h-screen pt-20 px-6">
                <div className="w-full max-w-md animate-fade-in">
                    <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[32px] p-10 shadow-2xl shadow-slate-200/50">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck size={32} className="text-primary" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
                            <p className="text-slate-500 font-medium">Continue protecting your gig income</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100 font-bold flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-800"
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-800"
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Checking...' : (
                                    <>
                                        Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-500 font-medium">
                                New to GigShield? <Link to="/signup" className="text-primary font-bold hover:underline underline-offset-4">Sign up as Worker</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
