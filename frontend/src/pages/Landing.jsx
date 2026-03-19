import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, Zap, BarChart3, Clock, ArrowRight, CheckCircle2, Globe, Sparkles, ShieldCheck, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Landing() {
    const { token, user } = useContext(AuthContext);
    const dashboardLink = user?.role === 'admin' ? '/admin' : '/dashboard';

    if (token && user) {
        return <Navigate to={dashboardLink} replace />;
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden">
            <Navbar />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative px-6 py-24 md:py-40 overflow-hidden">
                    {/* Advanced Background Decorations */}
                    <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-cyan-100/40 to-blue-100/40 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/40 to-purple-100/40 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

                    {/* Floating Decorative Icons */}
                    <div className="absolute top-1/4 left-10 md:left-20 animate-bounce hidden lg:block" style={{ animationDuration: '6s' }}>
                        <div className="p-4 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl shadow-blue-200/50 rotate-12">
                            <Zap className="text-amber-500" size={32} />
                        </div>
                    </div>
                    <div className="absolute bottom-1/3 right-10 md:right-20 animate-bounce hidden lg:block" style={{ animationDuration: '8s', animationDelay: '1s' }}>
                        <div className="p-4 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl shadow-cyan-200/50 -rotate-12">
                            <ShieldCheck className="text-primary" size={32} />
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto text-center relative">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 mb-10 animate-fade-in shadow-sm">
                            <div className="p-1 bg-white rounded-full shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 block animate-pulse"></span>
                            </div>
                            <span className="text-[10px] md:text-xs font-black text-green-700 uppercase tracking-[0.2em]">Tamil Nadu Live Protection Beta</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-10">
                            Protect Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-cyan-500 relative">
                                Daily Wages
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-cyan-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 25 0 50 5 T 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                                </svg>
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg md:text-2xl text-slate-500 font-medium leading-relaxed mb-16 px-4">
                            Shielding Chennai & Coimbatore gig workers from
                            <span className="text-slate-900 font-bold italic"> Monsoon floods & Heat waves. </span>
                            No claims, just instant payouts to your UPI.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 px-4">
                            <Link to={token ? dashboardLink : "/signup"} className="group w-full sm:w-auto px-10 py-5 bg-primary text-white text-xl font-black rounded-[24px] hover:bg-blue-700 hover:scale-105 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 active:scale-95">
                                {token ? 'Go to Dashboard' : 'Shield Your Earnings Now'} <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <div className="flex -space-x-3 items-center">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                                        <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="pl-6 text-slate-500 font-black text-sm">
                                    <span className="text-slate-900">8.5k+</span> TN Workers Shielded
                                </div>
                            </div>
                        </div>

                        {/* Visual Separator / Stats Card */}
                        <div className="mt-32 relative text-left">
                            <div className="absolute inset-0 bg-slate-900/5 blur-[80px] -z-10"></div>
                            <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[48px] p-10 md:p-12 shadow-2xl overflow-hidden grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                {[
                                    { label: 'TN Districts Active', value: '12+', icon: <Globe size={20} className="text-cyan-500" /> },
                                    { label: 'Avg Payout Time', value: '45 Mins', icon: <Zap size={20} className="text-amber-500" /> },
                                    { label: 'Weather Nodes', value: '150+', icon: <Cpu size={20} className="text-green-500" /> },
                                    { label: 'Shielded Payouts', value: '₹2.8M+', icon: <Wallet size={20} className="text-primary" /> }
                                ].map((stat, i) => (
                                    <div key={i} className="relative z-10 flex flex-col items-center group-hover:scale-105 transition-transform duration-500">
                                        <div className="mb-4 p-3 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">
                                            {stat.icon}
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Problem Section */}
                <section id="problem" className="py-24 bg-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="max-w-3xl mb-16 px-4">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-none">
                                The Problem Gig Workers Face
                            </h2>
                            <div className="space-y-6 text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
                                <p>
                                    Tamil Nadu has a rapidly growing gig economy with several lakh workers in cities like
                                    <span className="text-slate-900 font-bold"> Chennai, Coimbatore, and Madurai. </span>
                                    Most delivery partners rely entirely on task-based earnings.
                                </p>
                                <p>
                                    When environmental disruptions such as
                                    <span className="text-primary font-bold italic"> heavy rain, floods, or extreme heat </span>
                                    occur, gig workers are unable to work and lose their daily income.
                                </p>
                                <p>
                                    Since gig workers are not classified as traditional employees, they
                                    <span className="text-slate-900 font-bold underline decoration-primary/30 underline-offset-4"> lack financial protection </span>
                                    during these disruptions.
                                </p>
                                <p className="text-slate-900 font-bold bg-slate-50 p-4 rounded-2xl border-l-4 border-primary">
                                    GigShield aims to solve this problem by offering affordable weekly insurance that protects workers from income loss caused by environmental disruptions.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                            {[
                                {
                                    title: "Gig Workforce",
                                    value: "5+ Lakh Workers",
                                    desc: "Estimated gig workers across Tamil Nadu rely on platform work.",
                                    icon: <Globe className="text-blue-500" size={28} />
                                },
                                {
                                    title: "Income Model",
                                    value: "Task-Based Earnings",
                                    desc: "Paid per delivery or ride with no guaranteed monthly salary.",
                                    icon: <TrendingUp className="text-amber-500" size={28} />
                                },
                                {
                                    title: "Disruption Risk",
                                    value: "Weather & Heat",
                                    desc: "Floods, monsoons, and heatwaves frequently disrupt delivery work.",
                                    icon: <ShieldAlert className="text-red-500" size={28} />
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-white group-hover:shadow-md transition-all">
                                        {item.icon}
                                    </div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{item.title}</div>
                                    <div className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{item.value}</div>
                                    <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid - Localized for TN */}
                <section id="features" className="py-32 bg-slate-50/50 scroll-mt-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20 px-4">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">TN-Specific Protection</h2>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed">Tailored for the unique challenges of working in Tamil Nadu. We shield you where others don't.</p>
                            </div>
                            <div className="flex items-center gap-4 py-4 px-8 bg-white rounded-full border border-slate-100 shadow-sm">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-black text-slate-900">150+ Weather Nodes in TN</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <ShieldAlert className="text-blue-600" size={32} />,
                                    title: 'Monsoon Flooding Shield',
                                    color: 'bg-blue-50',
                                    desc: 'Chennai rains can be unpredictable. When rainfall exceeds 50mm in your working zone, your daily wage shield triggers automatically.'
                                },
                                {
                                    icon: <Zap className="text-amber-500" size={32} />,
                                    title: 'Agni Nakshatram Heat Shield',
                                    color: 'bg-amber-50',
                                    desc: 'Protecting you from extreme heat waves. Payouts are initiated when temperatures cross 42°C, ensuring your health comes first.'
                                },
                                {
                                    icon: <ShieldCheck className="text-green-600" size={32} />,
                                    title: 'TNGWWB Complement',
                                    color: 'bg-green-50',
                                    desc: 'GigShield works alongside the Tamil Nadu Gig Workers Welfare Board benefits, providing an extra layer of instant financial security.'
                                }
                            ].map((feat, i) => (
                                <div key={i} className="p-12 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                                    <div className={`mb-10 p-5 ${feat.color} rounded-3xl w-fit group-hover:scale-110 transition-transform`}>
                                        {feat.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{feat.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-6">{feat.desc}</p>
                                    <div className="w-12 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works - Immersive UI */}
                <section id="how-it-works" className="py-32 scroll-mt-20 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-32">
                            <div className="flex-1">
                                <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-8">
                                    <Sparkles size={24} className="text-primary" />
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-10 tracking-tighter leading-none">Simplicity <br />In 3 Steps</h2>
                                <div className="space-y-12">
                                    {[
                                        { step: '01', title: 'Connect Your Profile', desc: 'Securely link your delivery or ride-sharing profile using your Aadhar or Registered Worker ID.' },
                                        { step: '02', title: 'Activate TN Shield', desc: 'Choose your protection window. Premiums are adjusted based on real-time TN weather forecasts.' },
                                        { step: '03', title: 'Instant UPI Payout', desc: 'If our sensors detect a monsoon or heat trigger, your payout lands in your UPI wallet in minutes.' }
                                    ].map((s, i) => (
                                        <div key={i} className="flex gap-8 group">
                                            <div className="text-5xl font-black text-slate-100 group-hover:text-primary/20 transition-colors duration-500 leading-none">{s.step}</div>
                                            <div>
                                                <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{s.title}</h4>
                                                <p className="text-lg text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 relative order-first lg:order-last">
                                <div className="relative group">
                                    {/* Glassmorphic Card Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-cyan-500 rounded-[56px] rotate-6 transform group-hover:rotate-3 transition-transform duration-500 -z-10 blur-2xl opacity-20"></div>
                                    <div className="bg-slate-900 rounded-[56px] p-12 aspect-square flex flex-col justify-center items-center text-center text-white shadow-3xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 relative z-10">
                                        <div className="p-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-[32px] mb-10 animate-pulse shadow-3xl shadow-cyan-400/40 transform -rotate-12">
                                            <ShieldCheck size={72} className="text-white" />
                                        </div>
                                        <h3 className="text-4xl font-black mb-6 tracking-tighter">AI Parametric <br />TN Node</h3>
                                        <p className="text-slate-400 font-bold max-w-xs uppercase tracking-[0.2em] text-[10px] leading-widest">Tamil Nadu Real-Time Monitoring: Chennai Core</p>

                                        {/* Dynamic UI Pulse */}
                                        <div className="absolute top-10 right-10 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
                                            <span className="text-[10px] font-black tracking-widest">LIVE</span>
                                        </div>
                                    </div>

                                    {/* Achievement Badge */}
                                    <div className="absolute -bottom-10 -left-10 lg:block animate-fade-in z-20">
                                        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[36px] shadow-2xl border border-white flex flex-col items-center gap-3">
                                            <div className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/30">
                                                <ShieldAlert size={28} />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                                                <div className="text-xl font-black text-slate-900 tracking-tight">Active TN Shield</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section - High Impact */}
                <section id="pricing" className="py-24 px-6 scroll-mt-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-primary rounded-[80px] py-28 px-10 relative overflow-hidden flex flex-col items-center text-center shadow-3xl shadow-primary/40">
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                            <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none relative z-10">Shield Your <br /> Daily Wages</h2>
                            <p className="text-blue-100 text-xl md:text-2xl font-medium max-w-2xl mb-16 relative z-10 opacity-90 leading-relaxed">
                                Don't let the Chennai heat or monsoons steal your wages. Join 8,500+ TN workers today.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full justify-center px-4">
                                <Link to="/signup" className="w-full sm:w-auto px-12 py-6 bg-white text-primary font-black rounded-[32px] hover:bg-slate-50 transition transform hover:scale-105 shadow-2xl active:scale-95 text-xl flex items-center justify-center gap-3">
                                    Start Your TN Shield <ArrowRight size={24} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-24 px-6 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
                        <div className="max-w-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                                    <Shield className="text-white" size={24} />
                                </div>
                                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">GigShield<span className="text-primary">.</span>TN</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Protecting the backbone of Tamil Nadu's cities. AI-powered parametric coverage for delivery partners, ride-hailing drivers, and more.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                            <div>
                                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Product</h5>
                                <ul className="space-y-4 text-slate-500 font-bold text-sm">
                                    <li><a href="#features" className="hover:text-primary transition">TN Features</a></li>
                                    <li><a href="#how-it-works" className="hover:text-primary transition">How it works</a></li>
                                    <li><a href="#pricing" className="hover:text-primary transition">Pricing</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Support</h5>
                                <ul className="space-y-4 text-slate-500 font-bold text-sm">
                                    <li><a href="#" className="hover:text-primary transition">TN Help Center</a></li>
                                    <li><a href="#" className="hover:text-primary transition">Contact Us</a></li>
                                    <li><a href="#" className="hover:text-primary transition">TNGWWB Info</a></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Coverage</h5>
                                <div className="flex items-center gap-2 group cursor-default">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-black text-slate-900 group-hover:text-primary transition">Tamil Nadu Live</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">© 2026 GigShield TN - Parametric Insurance Prototype</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Custom Wallet icon if needed
function Wallet({ size, className }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </svg>
    );
}
