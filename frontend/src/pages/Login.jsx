import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const user = await login(formData.email, formData.password);
            if (user.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 items-center justify-center p-4">
            <div className="w-full max-w-md card p-8">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShieldCheck size={48} className="text-primary" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
                <p className="text-center text-slate-500 mb-8">Sign in to your GigShield account</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" name="email" required className="input-field" onChange={handleChange} placeholder="johndoe@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input type="password" name="password" required className="input-field" onChange={handleChange} placeholder="••••••••" />
                    </div>
                    <button type="submit" className="w-full btn-primary mt-2">Sign In</button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up as Worker</Link>
                </div>
            </div>
        </div>
    );
}
