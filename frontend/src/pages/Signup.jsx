import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Building, MapPin, Wallet, ArrowRight, Smartphone, Briefcase } from 'lucide-react';
import Navbar from '../components/Navbar';
import { tnDistricts } from '../utils/districts';

export default function Signup() {
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // full Tamil Nadu district-based system with sample areas
    // Using shared tnDistricts from utils

    const districts = Object.keys(tnDistricts);

    const [formData, setFormData] = useState({
        name: '', 
        phone: '', 
        email: '', 
        password: '', 
        role: 'worker',
        platform: 'Zomato', 
        district: '', 
        workingArea: '', 
        averageDailyIncome: 500 // Slider default
    });

    const [districtSearch, setDistrictSearch] = useState('');
    const [showDistrictList, setShowDistrictList] = useState(false);

    const [locationCaptured, setLocationCaptured] = useState(false);
    const [error, setError] = useState(null);

    const filteredDistricts = districts.filter(d => 
        d.toLowerCase().includes(districtSearch.toLowerCase())
    );

    const handleDistrictSelect = (d) => {
        setDistrictSearch(d);
        setFormData(prev => ({
            ...prev,
            district: d,
            workingArea: ''
        }));
        setShowDistrictList(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'district') {
            setFormData({
                ...formData,
                district: value,
                workingArea: ''
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };



    const isFormValid = () => {
        const { name, email, password, phone, district, workingArea } = formData;
        return (
            name && 
            email && 
            password.length >= 8 && 
            phone.length === 10 &&
            district &&
            workingArea
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password.length < 8) {
             setError("Password must be at least 8 characters long.");
             return;
        }

        if (formData.phone.length !== 10) {
            setError("Phone number must be exactly 10 digits.");
            return;
        }

        setLoading(true);
        try {
            await signup({ ...formData, averageDailyIncome: Number(formData.averageDailyIncome) });
            navigate('/dashboard');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden relative">
            <Navbar />

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-cyan-100/50 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10 rotate-12"></div>

            <div className="flex items-center justify-center min-h-screen pt-28 pb-12 px-6">
                <div className="w-full max-w-lg animate-fade-in">
                    <div className="bg-white/70 backdrop-blur-xl border border-slate-100 rounded-[40px] p-6 md:p-8 shadow-2xl shadow-slate-200/50">
                        <div className="flex flex-col items-center mb-8 text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                <ShieldCheck size={24} className="text-primary" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create Account</h2>
                            <p className="text-slate-500 font-medium max-w-sm text-sm">Protect your income with AI insurance.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-8 border border-red-100 font-bold flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Basic Info */}
                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Personal Information</h3>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-800"
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="phone"
                                            required
                                            maxLength={10}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-800"
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, ''); // digit only
                                                handleChange({ target: { name: 'phone', value: val } });
                                            }}
                                            value={formData.phone}
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
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

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password (Min 8 Characters)</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-800"
                                            onChange={handleChange}
                                            placeholder="Minimum 8 characters"
                                        />
                                    </div>
                                </div>

                                {/* Gig Profile */}
                                <div className="space-y-4 md:col-span-2 pt-4">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Gig Profile & Location</h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Platform</label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <select
                                            name="platform"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-800 appearance-none cursor-pointer"
                                            onChange={handleChange}
                                            value={formData.platform}
                                        >
                                            <option value="Zomato">Zomato</option>
                                            <option value="Swiggy">Swiggy</option>
                                            <option value="Amazon">Amazon</option>
                                            <option value="Blinkit">Blinkit</option>
                                            <option value="Zepto">Zepto</option>
                                        </select>
                                    </div>
                                </div>



                                <div className="space-y-2 relative">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="district"
                                            value={districtSearch}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setDistrictSearch(val);
                                                setShowDistrictList(true);
                                                if (districts.includes(val)) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        district: val,
                                                        workingArea: ''
                                                    }));
                                                }
                                            }}
                                            onFocus={() => setShowDistrictList(true)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-800"
                                            placeholder="Search District"
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Suggestion Dropdown */}
                                    {showDistrictList && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowDistrictList(false)}></div>
                                            <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-50 animate-fade-in">
                                                {filteredDistricts.length > 0 ? (
                                                    filteredDistricts.map(d => (
                                                        <li 
                                                            key={d} 
                                                            onClick={() => handleDistrictSelect(d)}
                                                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 transition"
                                                        >
                                                            {d}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="px-4 py-3 text-sm text-slate-400 font-medium">No districts found</li>
                                                )}
                                            </ul>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Working Area</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <select
                                            name="workingArea"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-800 appearance-none cursor-pointer"
                                            onChange={handleChange}
                                            value={formData.workingArea}
                                        >
                                            <option value="">Working Area</option>
                                            {formData.district && tnDistricts[formData.district] && tnDistricts[formData.district].map(area => (
                                                <option key={area} value={area}>{area}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Daily Income</label>
                                        <span className="text-sm font-black text-primary">₹{formData.averageDailyIncome} / day</span>
                                    </div>
                                    <div className="relative group pt-2">
                                        <input
                                            type="range"
                                            name="averageDailyIncome"
                                            min="300"
                                            max="1500"
                                            step="50"
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                            onChange={handleChange}
                                            value={formData.averageDailyIncome}
                                        />
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 ml-1">Used to calculate your insurance coverage</p>
                                    </div>
                                </div>


                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isFormValid()}
                                className="w-full group py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? 'Creating Account...' : (
                                    <>
                                        Register <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-500 font-medium">
                                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
