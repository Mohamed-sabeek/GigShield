import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    User, Mail, Phone, MapPin, Shield, Calendar, 
    Edit2, Save, X, Navigation, LogOut, Trash2, 
    CheckCircle, AlertCircle, ShieldCheck, Search, Globe, Map, IndianRupee
} from 'lucide-react';
import { tnDistricts } from '../utils/districts';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Profile() {
    const { logout, setUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        district: '',
        workingArea: '',
        lat: '',
        lon: ''
    });
    const [saving, setSaving] = useState(false);
    const [searching, setSearching] = useState(false);
    const [notification, setNotification] = useState(null);
    const [detectedLoc, setDetectedLoc] = useState(null);

    const hasChanged = () => {
        if (!profile) return false;
        const currentData = {
            name: profile.name,
            phone: profile.phone || '',
            district: profile.district || '',
            workingArea: profile.workingArea || '',
            lat: profile.location?.lat || '',
            lon: profile.location?.lon || ''
        };
        return JSON.stringify(formData) !== JSON.stringify(currentData);
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProfile(res.data.user);
            setFormData({
                name: res.data.user.name,
                phone: res.data.user.phone || '',
                district: res.data.user.district || '',
                workingArea: res.data.user.workingArea || '',
                lat: res.data.user.location?.lat || '',
                lon: res.data.user.location?.lon || ''
            });
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API}/api/users/profile`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Update global auth context so sidebar/dashboard update immediately
            setUser(prev => ({ 
                ...prev, 
                name: formData.name, 
                district: formData.district,
                workingArea: formData.workingArea,
                location: { lat: formData.lat, lon: formData.lon }
            }));
            
            showNotification(`Profile updated successfully! 📍 Area: ${formData.workingArea || formData.district}`, 'success');
            setEditMode(false);
            setDetectedLoc(null);
            await fetchData(); // Refresh local profile state
        } catch (err) {
            showNotification('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const searchLocation = async () => {
        const query = formData.workingArea ? `${formData.workingArea}, ${formData.district}` : formData.district;
        if (!query) return showNotification('Please select a district or area', 'error');
        setSearching(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/location/geocode?q=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { city, lat, lon, state } = res.data;
            setFormData({ ...formData, lat, lon });
            setDetectedLoc(`${city}, ${state || ''} (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
            showNotification(`📍 Location detected: ${city}`, 'success');
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Location not found', 'error');
        } finally {
            setSearching(false);
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            showNotification('Geolocation is not supported', 'error');
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            setFormData({
                ...formData,
                lat: latitude,
                lon: longitude
            });
            setDetectedLoc(`Current GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
            showNotification('GPS Coordinates updated!', 'success');
        });
    };

    const showNotification = (msg, type) => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium italic">Loading your profile...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-10 max-w-5xl mx-auto w-full pb-24"
        >
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Worker Profile</h1>
                <button 
                    onClick={() => setEditMode(!editMode)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${
                        editMode ? 'bg-slate-100 text-slate-500' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105'
                    }`}
                >
                    {editMode ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
                </button>
            </div>


            {notification && (
                <div className={`fixed top-10 right-10 z-50 p-4 rounded-2xl shadow-2xl border animate-fade-in ${
                    notification.type === 'success' ? 'bg-green-500 text-white border-green-400' : 'bg-red-500 text-white border-red-400'
                }`}>
                    <div className="flex items-center gap-3 font-bold text-sm">
                        {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {notification.msg}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Card */}
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-primary/5"></div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-primary text-white rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl font-black shadow-xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                                {profile.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">{profile.name}</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-1 italic">{profile.role} profile active</p>
                            
                            <div className="mt-8 space-y-4 text-left">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Mail className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase">Email Address</p>
                                        <p className="text-sm font-bold text-slate-700">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Phone className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase">Phone Number</p>
                                        <p className="text-sm font-bold text-slate-700">{profile.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <MapPin className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase">Home District / Area</p>
                                        <p className="text-sm font-bold text-slate-700">{profile.district || 'Not set'} {profile.workingArea && `/ ${profile.workingArea}`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <Shield className="absolute -right-4 -bottom-4 opacity-10" size={100} />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Account Details</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-400">Created On</span>
                                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-400">Status</span>
                                <span className="text-green-400">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings & Policy Section */}
                <div className="md:col-span-2 space-y-8">
                    {/* Policy Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-2 h-full ${profile.policyActive ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${profile.policyActive ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-300'}`}>
                            <Shield size={40} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="mb-1">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${profile.policyActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {profile.policyActive ? 'Income Protected' : 'Not Protected'}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">GigShield Basic Plan</h3>
                            {profile.policyActive ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-500 flex items-center justify-center md:justify-start gap-1">
                                        <Calendar size={14} /> Valid until {new Date(profile.activePolicy?.endDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm font-bold text-green-600 flex items-center justify-center md:justify-start gap-1">
                                        <IndianRupee size={14} /> ₹{profile.activePolicy?.coverage} coverage active
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm font-bold text-slate-400 italic">Your account is currently vulnerable to weather disruptions.</p>
                            )}
                        </div>
                    </div>

                    {/* Editor / Info Form */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                           {editMode ? <Edit2 className="text-primary" /> : <User className="text-primary" />}
                           {editMode ? 'Edit My Information' : 'Personal Details'}
                        </h3>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        disabled={!editMode}
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none focus:border-primary disabled:opacity-70 transition-all font-sans"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Phone</label>
                                    <input 
                                        type="text" 
                                        name="phone"
                                        disabled={!editMode}
                                        placeholder="+91 00000 00000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none focus:border-primary disabled:opacity-70 transition-all font-sans"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary District</label>
                                    <select 
                                        name="district"
                                        disabled={!editMode || (profile?.policyActive && new Date(profile?.activePolicy?.endDate) > new Date())}
                                        value={formData.district}
                                        onChange={(e) => setFormData({...formData, district: e.target.value, workingArea: ''})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none focus:border-primary disabled:opacity-70 transition-all font-sans"
                                    >
                                        <option value="">Select District</option>
                                        {Object.keys(tnDistricts).map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Specific Working Area</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select 
                                                name="workingArea"
                                                disabled={!editMode || !formData.district || (profile?.policyActive && new Date(profile?.activePolicy?.endDate) > new Date())}
                                                value={formData.workingArea}
                                                onChange={handleChange}
                                                onBlur={() => editMode && !detectedLoc && formData.workingArea && searchLocation()}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none focus:border-primary disabled:opacity-50 transition-all font-sans appearance-none"
                                            >
                                                <option value="">Working Area</option>
                                                {formData.district && tnDistricts[formData.district] && tnDistricts[formData.district].map(area => (
                                                    <option key={area} value={area}>{area}</option>
                                                ))}
                                            </select>
                                            {detectedLoc && (
                                                <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    <Globe size={10} /> {detectedLoc}
                                                </div>
                                            )}
                                        </div>
                                        {editMode && (
                                            <button 
                                                type="button"
                                                onClick={searchLocation}
                                                disabled={searching || (profile?.policyActive && new Date(profile?.activePolicy?.endDate) > new Date())}
                                                className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                                title="Check This Area"
                                            >
                                                {searching ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Navigation size={20} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {editMode && (
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={useCurrentLocation}
                                        disabled={profile?.policyActive && new Date(profile?.activePolicy?.endDate) > new Date()}
                                        className="flex-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        <Navigation size={16} /> Use Current Location
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={saving || !hasChanged()}
                                        className={`flex-1 font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                                            saving || !hasChanged() 
                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                            : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
                                        }`}
                                    >
                                        {saving ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                Saving...
                                            </div>
                                        ) : (
                                            <>
                                                <Save size={16} /> Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
