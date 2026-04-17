import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    User, Mail, Phone, MapPin, Shield, Calendar, 
    Edit2, Edit3, Save, X, Navigation, LogOut, Trash2, 
    CheckCircle, AlertCircle, ShieldCheck, Search, Globe, Map, IndianRupee,
    Activity, Lock
} from 'lucide-react';
import { tnDistricts } from '../utils/districts';

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
        averageDailyIncome: '',
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
            averageDailyIncome: profile.averageDailyIncome || '',
            lat: profile.location?.lat || '',
            lon: profile.location?.lon || ''
        };
        return JSON.stringify(formData) !== JSON.stringify(currentData);
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/api/users/profile`);
            const profileData = res.data.profile;
            if (!profileData) throw new Error("No profile data found");

            setProfile(profileData);
            setFormData({
                name: profileData.name || '',
                phone: profileData.phone || '',
                district: profileData.district || '',
                workingArea: profileData.workingArea || '',
                averageDailyIncome: profileData.averageDailyIncome || '',
                lat: profileData.lat || '',
                lon: profileData.lon || ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await api.put(`/api/users/profile`, formData);
            
            setUser(prev => ({ 
                ...prev, 
                name: formData.name, 
                district: formData.district,
                workingArea: formData.workingArea,
                location: { lat: formData.lat, lon: formData.lon }
            }));
            
            showNotification(`Profile updated successfully!`, 'success');
            setEditMode(false);
            setDetectedLoc(null);
            await fetchData();
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
            const res = await api.get(`/api/location/geocode?q=${query}`);
            const { city, lat, lon, state } = res.data;
            setFormData({ ...formData, lat, lon });
            setDetectedLoc(`${city}, ${state || ''} (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
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
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const updatedCoords = { lat: latitude, lon: longitude };
            
            setFormData(prev => ({ ...prev, ...updatedCoords }));
            setDetectedLoc(`Precision GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            
            if (!editMode) {
                try {
                    const token = localStorage.getItem('token');
                    await api.put(`/api/users/profile`, updatedCoords);
                    showNotification('GPS Synchronized!', 'success');
                    const profRes = await api.get(`/api/users/profile`);
                    setProfile(profRes.data.profile);
                } catch (err) {
                    showNotification('GPS sync failed', 'error');
                }
            } else {
                showNotification('Coordinates updated!', 'success');
            }
        });
    };

    const showNotification = (msg, type) => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading || !profile) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium italic">Loading your profile...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-10 max-w-5xl mx-auto w-full pb-24"
        >
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Worker Profile</h1>
                <button 
                    onClick={() => {
                        if (editMode) setFormData({
                            name: profile.name,
                            phone: profile.phone || '',
                            district: profile.district || '',
                            workingArea: profile.workingArea || '',
                            averageDailyIncome: profile.averageDailyIncome || '',
                            lat: profile.lat,
                            lon: profile.lon
                        });
                        setEditMode(!editMode);
                    }}
                    className={`px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
                        editMode ? 'bg-slate-200 text-slate-600' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95'
                    }`}
                >
                    {editMode ? 'Cancel' : <><Edit3 size={16} /> Edit Profile</>}
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
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] text-slate-400 font-black uppercase">Email Address</p>
                                        <p className="text-sm font-bold text-slate-700 truncate">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-primary/30">
                                    <MapPin className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase">Home District / Area</p>
                                        <p className="text-sm font-bold text-slate-700">{profile.district || 'Not set'} {profile.workingArea && `/ ${profile.workingArea}`}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-green-400/30">
                                    <IndianRupee className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase">Daily Income</p>
                                        <p className="text-sm font-black text-slate-900">₹{profile.averageDailyIncome || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl uppercase font-black text-[10px] tracking-tighter flex items-center gap-2">
                                <Activity size={14} /> Precision Telemetry
                            </div>
                            {profile.lat && profile.lon && (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                        </div>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">
                            Required for weather-triggered payouts. Synchronize your current coordinates with your insured region.
                        </p>
                        <button 
                            onClick={useCurrentLocation}
                            className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95"
                        >
                            <Navigation size={16} /> Sync GPS Now
                        </button>
                        {detectedLoc && (
                            <p className="mt-4 text-[10px] text-center font-bold text-green-600 bg-green-50 py-2 rounded-xl border border-green-100 px-2 animate-in fade-in slide-in-from-top-1">
                                {detectedLoc}
                            </p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-8">
                    {profile.policyActive && (
                         <div className="bg-green-50 border border-green-100 p-6 rounded-[2.5rem] flex items-center gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-full bg-green-500/5 -skew-x-12 translate-x-12"></div>
                             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-green-500 shadow-sm transition-transform group-hover:scale-110">
                                 <Shield size={32} />
                             </div>
                             <div className="flex-1">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-100/50 px-2 py-0.5 rounded-full">Income Protected</span>
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">₹{profile.activePolicy?.coverage} coverage active</span>
                                 </div>
                                 <h3 className="text-2xl font-black text-slate-900 leading-tight">{profile.activePolicy?.planName} Plan</h3>
                                 <div className="flex items-center gap-4 mt-2">
                                     <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 italic">
                                         <Calendar size={14} className="text-slate-400" />
                                         Valid until {new Date(profile.activePolicy?.endDate).toLocaleDateString()}
                                     </div>
                                 </div>
                             </div>
                         </div>
                    )}

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                                <User size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Details</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                                    <input 
                                        type="text"
                                        name="name"
                                        disabled={!editMode}
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
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-primary italic">Est. Daily Income (₹)</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="number"
                                            name="averageDailyIncome"
                                            disabled={!editMode}
                                            value={formData.averageDailyIncome}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-3.5 font-bold text-slate-700 outline-none focus:border-primary disabled:opacity-70 transition-all font-sans"
                                        />
                                    </div>
                                </div>
                                <div className="hidden sm:block"></div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-3 mb-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Coverage Region</label>
                                    {profile.policyActive && (
                                        <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-wider animate-pulse">
                                            <Lock size={10} /> Region Locked
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary District</label>
                                        <select 
                                            name="district"
                                            disabled={!editMode || profile.policyActive}
                                            value={formData.district}
                                            onChange={(e) => setFormData({...formData, district: e.target.value, workingArea: ''})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none focus:border-primary disabled:opacity-40 disabled:grayscale transition-all font-sans"
                                        >
                                            <option value="">Select District</option>
                                            {Object.keys(tnDistricts).map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Working Area</label>
                                        <select 
                                            name="workingArea"
                                            disabled={!editMode || !formData.district || profile.policyActive}
                                            value={formData.workingArea}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-slate-700 outline-none focus:border-primary disabled:opacity-40 disabled:grayscale transition-all font-sans"
                                        >
                                            <option value="">Working Area</option>
                                            {formData.district && tnDistricts[formData.district] && tnDistricts[formData.district].map(area => (
                                                <option key={area} value={area}>{area}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {editMode && (
                                <div className="pt-8">
                                    <button 
                                        type="submit"
                                        disabled={saving || !hasChanged()}
                                        className={`w-full font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
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
