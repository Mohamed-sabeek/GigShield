import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Signup() {
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();
    const tnCities = {
        'Coimbatore': ['Gandhipuram', 'RS Puram', 'Peelamedu', 'Saravanampatti'],
        'Chennai': ['T Nagar', 'Velachery', 'Anna Nagar', 'Adyar'],
        'Madurai': ['Mattuthavani', 'KK Nagar', 'Thirunagar', 'Goripalayam'],
        'Pudukkottai': ['Thirukokarnam', 'Machuvadi', 'Pudukkottai Town', 'Gandhinagar']
    };

    const cities = Object.keys(tnCities);

    // Default setting the first city, area, and income so the form starts valid
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'worker',
        platform: 'Zomato', city: cities[0], workingArea: tnCities[cities[0]][0], averageDailyIncome: '300'
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        if (e.target.name === 'city') {
            setFormData({
                ...formData,
                city: e.target.value,
                workingArea: tnCities[e.target.value][0] // Reset area when city changes
            });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await signup({ ...formData, averageDailyIncome: Number(formData.averageDailyIncome) });
            navigate('/dashboard');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4 py-12">
            <div className="w-full max-w-lg card p-8">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShieldCheck size={40} className="text-primary" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Join GigShield</h2>
                <p className="text-center text-slate-500 mb-6">Protect your income against disruptions</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input type="text" name="name" required className="input-field" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" name="email" required className="input-field" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input type="password" name="password" required className="input-field" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                            <select name="platform" className="input-field" onChange={handleChange} value={formData.platform}>
                                <option value="Zomato">Zomato</option>
                                <option value="Swiggy">Swiggy</option>
                                <option value="Amazon">Amazon</option>
                                <option value="Blinkit">Blinkit</option>
                                <option value="Zepto">Zepto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                            <select name="city" className="input-field" onChange={handleChange} value={formData.city}>
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Working Area</label>
                            <select name="workingArea" className="input-field" onChange={handleChange} value={formData.workingArea}>
                                {tnCities[formData.city].map(area => <option key={area} value={area}>{area}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Average Daily Income (₹)</label>
                        <select name="averageDailyIncome" className="input-field" onChange={handleChange} value={formData.averageDailyIncome}>
                            <option value="300">₹300 / day</option>
                            <option value="500">₹500 / day</option>
                            <option value="700">₹700 / day</option>
                            <option value="1000">₹1000 / day</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full btn-primary mt-4 py-3">Create Worker Account</button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    Already registered? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
