import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, CloudLightning, CheckCircle, Shield, Calendar, MapPin, Info, Check, Edit2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { tnDistricts } from '../utils/districts';

export default function ClaimPolicy() {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [activePolicy, setActivePolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [selectedDisruption, setSelectedDisruption] = useState('Heavy Rain');
    const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);

    // Location State
    const [locationCaptured, setLocationCaptured] = useState(false);
    const [locationCoords, setLocationCoords] = useState({ lat: null, lon: null, accuracy: null });
    const [locationSource, setLocationSource] = useState('gps'); // 'gps' | 'ip' | 'manual'
    const [locationDetails, setLocationDetails] = useState({ city: '', region: '' });
    const [locationLoading, setLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [locationConfirmed, setLocationConfirmed] = useState(false);

    // Manual Override State
    const [manualOverride, setManualOverride] = useState(false);
    const [manualDistrict, setManualDistrict] = useState('');
    const [manualWorkingArea, setManualWorkingArea] = useState('');

    const [districtSearch, setDistrictSearch] = useState('');
    const [showDistrictList, setShowDistrictList] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [profRes, polRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/worker/profile`),
                axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/policy/active`)
            ]);
            setProfile(profRes.data.profile);
            setActivePolicy(polRes.data || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchIPLocation = async () => {
        setLocationSource('ip');
        setLoadingLocation(true);
        try {
            const res = await axios.get('https://ipapi.co/json/');
            const { latitude, longitude, city, region } = res.data;
            setLocationCoords({ lat: latitude, lon: longitude, accuracy: null });
            setLocationDetails({ city, region });
            setLocationCaptured(true);
            setLocationConfirmed(false);
        } catch (err) {
            setLocationError('Unable to fetch IP location. Please select manually.');
            setManualOverride(true);
            setLocationSource('manual');
        } finally {
            setLoadingLocation(false);
        }
    };

    const handleGetLocation = () => {
        setLoadingLocation(true);
        setLocationError(null);
        setManualOverride(false);
        setLocationConfirmed(false);

        if (!navigator.geolocation) {
            fetchIPLocation();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const roundedAcc = Math.round(accuracy);
                setLocationCoords({ lat: latitude, lon: longitude, accuracy: roundedAcc });
                
                // Reverse Geocode
                axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
                    .then(res => {
                        if (res.data && res.data.address) {
                            const { city, town, village, county, state } = res.data.address;
                            const cityName = city || town || village || county || 'Unknown';
                            setLocationDetails({ city: cityName, region: state || '' });
                        }
                    })
                    .catch(err => console.error('Reverse Geocode Failed', err));

                setLocationSource('manual'); // Or keep 'gps' but with details
                setLocationSource('gps');
                setLocationCaptured(true);

                if (roundedAcc > 500) {
                    fetchIPLocation();
                } else {
                    setLoadingLocation(false);
                }
            },
            (error) => {
                fetchIPLocation();
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    };

    const handleManualConfirm = async () => {
        if (!manualDistrict || !manualWorkingArea) {
            setLocationError('Please select both District and Working Area.');
            return;
        }
        setLocationSource('manual');
        setLocationDetails({ city: manualDistrict, region: manualWorkingArea });
        
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${manualDistrict},Tamil Nadu,India&format=json&limit=1`);
            if (res.data && res.data[0]) {
                const { lat, lon } = res.data[0];
                setLocationCoords({ lat: parseFloat(lat), lon: parseFloat(lon), accuracy: null });
            } else {
                setLocationCoords({ lat: null, lon: null, accuracy: null });
            }
        } catch (err) {
            console.error('Manual Geocoding Failed', err);
            setLocationCoords({ lat: null, lon: null, accuracy: null });
        }

        setLocationConfirmed(true);
        setManualOverride(false);
        setLocationCaptured(true);
        setLocationError(null);
    };

    const submitClaimRequest = async (e) => {
        e.preventDefault();
        if (!locationConfirmed) {
            setNotification({ msg: 'Please CONFIRM your location before submitting.', type: 'error' });
            return;
        }

        setSubmitting(true);
        setNotification(null);

        try {
            const payload = {
                disruptionType: selectedDisruption,
                incidentDate,
                location: {
                    lat: locationCoords.lat,
                    lon: locationCoords.lon,
                    source: locationSource,
                    accuracy: locationCoords.accuracy,
                    details: locationDetails
                },
                userId: user?._id || profile?._id,
                policyId: activePolicy?._id,
                createdAt: new Date().toISOString()
            };

            const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/claim/trigger`, payload);
            setNotification({ msg: res.data.msg || 'Claim submitted successfully', type: 'success' });
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.msg || 'Error triggering claim request';
            setNotification({ msg, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Claim Panel...</div>;

    const daysRemaining = activePolicy 
        ? Math.ceil((new Date(activePolicy.endDate) - new Date()) / (1000 * 60 * 60 * 24)) 
        : 0;

    const maxDate = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Sidebar profile={profile} />

            <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full">
                <h1 className="text-3xl font-black text-slate-800 mb-8">Claim Insurance Policy</h1>

                {notification && (
                    <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {notification.msg}
                    </div>
                )}

                {!activePolicy ? (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center py-12">
                        <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Policy Found</h3>
                        <p className="text-slate-500 text-sm mb-6">You must activate an insurance plan before filing mapping claims.</p>
                        <a href="/policies" className="inline-block bg-primary hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm">
                            View Available Plans
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 🔹 Policy Info Section (Top Card) */}
                        <div className="bg-white p-6 rounded-3xl border border-green-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <Shield className="text-green-500" /> Policy Status: <span className="text-green-600 font-bold">Active ✅</span>
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Plan: {activePolicy.planName || 'GigShield Basic'}</p>
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                                    Protected
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-green-50/30 p-4 rounded-2xl border border-green-100">
                                <div className="text-sm">
                                    <span className="text-slate-500 font-semibold block">Coverage</span>
                                    <span className="font-bold text-slate-800">₹500 / day</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-slate-500 font-semibold block">Start Date</span>
                                    <span className="font-bold text-slate-800">{new Date(activePolicy.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-slate-500 font-semibold block">Expiry Date</span>
                                    <span className="font-bold text-slate-800">{new Date(activePolicy.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-slate-500 font-semibold block">Days Remaining</span>
                                    <span className="font-black text-green-700">{daysRemaining > 0 ? `${daysRemaining} days` : 'Expires today'}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-slate-500 font-semibold block">Claim Used</span>
                                    <span className="font-bold text-slate-800">{activePolicy.claimUsed ? '1/1' : '0/1'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 🔹 Claim Form Card */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-xl animate-fade-in">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <CloudLightning className="text-secondary" /> Request Insurance Claim
                            </h3>

                            {activePolicy.claimUsed ? (
                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
                                    <p className="text-orange-800 font-bold mb-1">Claim limit reached.</p>
                                    <p className="text-sm text-orange-600">Next claim available after renewal on {new Date(activePolicy.endDate).toLocaleDateString()}.</p>
                                </div>
                            ) : (
                                <form onSubmit={submitClaimRequest} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest ml-1 mb-2">Disruption Type</label>
                                        <select
                                            className="w-full border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition shadow-sm bg-slate-50/50 border font-medium text-slate-800 cursor-pointer"
                                            value={selectedDisruption}
                                            onChange={(e) => setSelectedDisruption(e.target.value)}
                                            disabled={submitting}
                                        >
                                            <option value="Heavy Rain">Heavy Rain 🌧</option>
                                            <option value="Flood">Flood 🌊</option>
                                            <option value="Heatwave">Heatwave ☀️</option>
                                            <option value="Pollution">Pollution 🌫</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest ml-1 mb-2 flex items-center gap-1">
                                            <Calendar size={14} /> Incident Date
                                        </label>
                                        <input
                                            type="date"
                                            max={maxDate}
                                            value={incidentDate}
                                            onChange={(e) => setIncidentDate(e.target.value)}
                                            className="w-full border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition shadow-sm bg-slate-50/50 border font-medium text-slate-800"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest ml-1 mb-2 flex items-center justify-between">
                                            <span>Location Verification</span>
                                            {locationCaptured && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                    locationSource === 'gps' ? 'bg-blue-100 text-blue-700' : 
                                                    locationSource === 'ip' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                    Source: {locationSource === 'gps' ? 'GPS' : locationSource === 'ip' ? 'IP-Based' : 'Manual'}
                                                </span>
                                            )}
                                        </label>
                                        
                                        {!locationCaptured && !manualOverride ? (
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={handleGetLocation}
                                                    disabled={locationLoading || submitting}
                                                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all ${locationLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    <MapPin size={18} /> {locationLoading ? 'Detecting Location...' : '📍 Detect Current Location'}
                                                </button>
                                                {locationError && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{locationError}</p>}
                                            </div>
                                        ) : manualOverride ? (
                                            <div className="space-y-3 bg-purple-50/50 border border-purple-100 p-4 rounded-xl">
                                                <p className="text-xs font-black text-purple-800 uppercase tracking-wide flex items-center gap-1"><MapPin size={12} /> Manual Location</p>
                                                
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={districtSearch}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setDistrictSearch(val);
                                                            setShowDistrictList(true);
                                                            if (Object.keys(tnDistricts).includes(val)) {
                                                                setManualDistrict(val);
                                                                setManualWorkingArea('');
                                                            }
                                                        }}
                                                        onFocus={() => setShowDistrictList(true)}
                                                        className="w-full border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-purple-200/50 bg-white border text-sm font-medium text-slate-800"
                                                        placeholder="Search District"
                                                        autoComplete="off"
                                                    />
                                                    {showDistrictList && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={() => setShowDistrictList(false)}></div>
                                                            <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-50 animate-fade-in">
                                                                {Object.keys(tnDistricts).filter(d => d.toLowerCase().includes(districtSearch.toLowerCase())).map(d => (
                                                                    <li 
                                                                        key={d} 
                                                                        onClick={() => { setManualDistrict(d); setDistrictSearch(d); setManualWorkingArea(''); setShowDistrictList(false); }}
                                                                        className="px-4 py-2 hover:bg-purple-50 hover:text-purple-700 cursor-pointer text-sm font-medium text-slate-700 transition"
                                                                    >
                                                                        {d}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                    )}
                                                </div>

                                                {manualDistrict && (
                                                    <div className="animate-fade-in">
                                                        <select
                                                            className="w-full border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-purple-200/50 bg-white border text-sm font-medium text-slate-800 appearance-none cursor-pointer"
                                                            value={manualWorkingArea}
                                                            onChange={(e) => setManualWorkingArea(e.target.value)}
                                                        >
                                                            <option value="">Working Area</option>
                                                            {tnDistricts[manualDistrict].map(a => (
                                                                <option key={a} value={a}>{a}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 mt-4">
                                                    <button type="button" onClick={handleManualConfirm} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-3 rounded-lg text-xs shadow-md shadow-purple-500/20 active:scale-[0.98] transition-all">Confirm</button>
                                                    <button type="button" onClick={() => { setManualOverride(false); if(locationCoords.lat) setLocationSource('gps'); }} className="flex-1 bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-lg text-xs active:scale-[0.98] transition-all">Cancel</button>
                                                </div>
                                                {locationError && <p className="text-red-500 text-[10px] m-1 text-center font-semibold">{locationError}</p>}
                                            </div>
                                        ) : (
                                            <div className={`p-4 rounded-xl space-y-2 border ${
                                                locationSource === 'gps' && locationCoords.accuracy <= 100 ? 'bg-green-50 border-green-200' :
                                                locationSource === 'gps' && locationCoords.accuracy <= 500 ? 'bg-yellow-50 border-yellow-200' :
                                                locationSource === 'ip' ? 'bg-orange-50 border-orange-200' : 'bg-purple-50 border-purple-200'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 font-bold text-sm">
                                                        {locationSource === 'gps' && locationCoords.accuracy <= 100 ? <CheckCircle className="text-green-600" size={16} /> : <Info className="text-slate-500" size={16} />}
                                                        {locationSource === 'ip' ? (
                                                            <span className="text-orange-800">📍 Approx Location ({locationDetails.city}, {locationDetails.region})</span>
                                                        ) : locationSource === 'manual' ? (
                                                            <span className="text-purple-800">📍 Manual ({locationDetails.city}, {locationDetails.region})</span>
                                                        ) : (
                                                            <span className={locationCoords.accuracy <= 100 ? 'text-green-800' : 'text-yellow-800'}>
                                                                {locationCoords.accuracy <= 100 ? 'High Accuracy GPS ✅' : 'Approximate GPS ⚠️'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {locationSource === 'gps' && (
                                                    <div className="text-xs text-slate-600 font-medium space-y-1">
                                                        {locationDetails.city && <p className="font-bold text-slate-800 flex items-center gap-1"><MapPin size={12} className="text-red-500" /> {locationDetails.city}, {locationDetails.region}</p>}
                                                        <p>Coordinates: ({locationCoords.lat?.toFixed(4)}, {locationCoords.lon?.toFixed(4)})</p>
                                                        <p>Accuracy: {locationCoords.accuracy} meters</p>
                                                    </div>
                                                )}

                                                {!locationConfirmed ? (
                                                    <div className="flex gap-2 mt-3 pt-2 border-t border-dotted">
                                                        <button type="button" onClick={() => setLocationConfirmed(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"><Check size={14} /> Confirm Location</button>
                                                        <button type="button" onClick={() => { setManualOverride(true); }} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"><Edit2 size={12} /> Change Location</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between pt-2 border-t border-green-100 mt-2">
                                                        <span className="text-xs text-green-700 font-black flex items-center gap-1"><CheckCircle size={12} /> Location Confirmed</span>
                                                        <button type="button" onClick={() => setLocationConfirmed(false)} className="text-xs text-slate-400 hover:underline">Edit</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={submitting || !locationConfirmed}
                                        className={`w-full bg-secondary hover:bg-cyan-600 transition shadow-lg shadow-cyan-500/20 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 fixed md:relative bottom-20 md:bottom-auto left-4 right-4 md:left-0 md:right-0 max-w-[calc(100%-2rem)] md:max-w-none z-40 ${(!locationConfirmed || submitting) ? 'opacity-70 cursor-not-allowed bg-cyan-600/50 shadow-none' : ''}`}
                                    >
                                        <CloudLightning size={20} /> {submitting ? 'Submitting...' : 'Submit Claim Request'}
                                    </button>
                                    <div className="md:hidden h-24"></div>
                                </form>
                            )}
                            <p className="text-[11px] text-slate-400 mt-4 text-center">🛡️ Location is verifying coordinates accurately verified using weather algorithms mapping triggers.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
