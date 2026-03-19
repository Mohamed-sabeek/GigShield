import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { token, user } = useContext(AuthContext);
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    const dashboardLink = user?.role === 'admin' ? '/admin' : '/dashboard';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Shield className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">GigShield<span className="text-primary italic">.</span></span>
                </Link>

                {!isAuthPage && (
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary transition">Features</a>
                        <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-primary transition">How it Works</a>
                        <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-primary transition">Pricing</a>
                    </nav>
                )}

                <div className="flex items-center gap-4">
                    {!token ? (
                        <>
                            {location.pathname !== '/login' && (
                                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition">Log In</Link>
                            )}
                            {location.pathname !== '/signup' && (
                                <Link to="/signup" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition active:scale-95 shadow-xl shadow-slate-900/10">Register</Link>
                            )}
                        </>
                    ) : (
                        <Link to={dashboardLink} className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-full hover:bg-blue-700 transition active:scale-95 shadow-xl shadow-primary/10">Go to Dashboard</Link>
                    )}
                </div>
            </div>
        </header>
    );
}
