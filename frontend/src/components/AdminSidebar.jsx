import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, History, FileText, LogOut, Shield } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab }) {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'stats', label: 'Platform Stats', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { id: 'monitor', label: 'Claims Monitor', icon: <FileText size={20} />, path: '/admin/claims-monitor' },
        { id: 'workers', label: 'Workers DB', icon: <Users size={20} />, path: '/admin?tab=workers' },
    ];

    const handleNavClick = (item) => {
        navigate(item.path);
    };

    const isItemActive = (item) => {
        if (item.id === 'monitor' && location.pathname === '/admin/claims-monitor') return true;
        if (item.id === 'stats' && location.pathname === '/admin' && activeTab === 'stats') return true;
        if (item.id === 'workers' && location.pathname === '/admin' && activeTab === 'workers') return true;
        return false;
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="w-full md:w-72 bg-slate-900 text-white flex-col hidden md:flex sticky top-0 h-screen border-r border-slate-800">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Shield className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/admin')}>GigShield<span className="text-cyan-500 italic">.</span></span>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${isItemActive(item)
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

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-900/95 backdrop-blur-lg border border-slate-800/50 rounded-3xl px-2 py-3 z-50 flex justify-around items-center animate-slide-up shadow-2xl">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item)}
                        className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-2xl transition-all duration-300 ${isItemActive(item) 
                            ? 'text-cyan-500' 
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                    >
                        <div className={`p-1 rounded-xl ${isItemActive(item) ? 'bg-cyan-500/10 text-cyan-500' : ''}`}>
                            {item.icon}
                        </div>
                        <span className={`text-[10px] font-black tracking-wide ${isItemActive(item) ? 'text-cyan-500' : 'text-slate-500'}`}>
                            {item.label.split(' ')[0]}
                        </span>
                    </button>
                ))}
            </div>
            <div className="md:hidden h-24"></div>
        </>
    );
}
