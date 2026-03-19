import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Shield, LogOut, CloudLightning } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, profile }) {
    const { logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { id: 'policies', label: 'Policies', icon: <Shield size={20} />, path: '/policies' },
        { id: 'claim', label: 'Claim Policy', icon: <CloudLightning size={20} />, path: '/claim' },
        { id: 'history', label: 'Claims History', icon: <History size={20} />, path: '/dashboard?tab=history' },
    ];

    const handleNavClick = (item) => {
        if (item.id === 'dashboard' || item.id === 'history') {
            if (setActiveTab) {
                setActiveTab(item.id);
            } else {
                navigate(item.path);
            }
        } else {
            navigate(item.path);
        }
    };

    const isItemActive = (item) => {
        if (activeTab) {
            return activeTab === item.id;
        }
        return location.pathname === item.path || (item.id === 'dashboard' && location.pathname === '/dashboard');
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="w-full md:w-72 bg-slate-900 text-white flex-col hidden md:flex sticky top-0 h-screen border-r border-slate-800">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Shield className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/dashboard')}>GigShield<span className="text-primary">.</span></span>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${isItemActive(item)
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
                                <div className="text-sm font-black truncate">{profile?.name || 'Worker'}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{profile?.city || 'User'}</div>
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

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/50 px-2 py-3 z-50 flex justify-around items-center animate-slide-up shadow-2xl">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item)}
                        className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-2xl transition-all duration-300 ${isItemActive(item) 
                            ? 'text-primary' 
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                    >
                        <div className={`p-1 rounded-xl ${isItemActive(item) ? 'bg-primary/10 text-primary' : ''}`}>
                            {item.icon}
                        </div>
                        <span className={`text-[10px] font-black tracking-wide ${isItemActive(item) ? 'text-primary' : 'text-slate-500'}`}>
                            {item.label.split(' ')[0]}
                        </span>
                    </button>
                ))}
            </div>
            <div className="md:hidden h-20"></div>
        </>
    );
}
