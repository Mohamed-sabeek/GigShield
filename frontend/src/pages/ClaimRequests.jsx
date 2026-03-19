import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, LogOut, Shield, Info } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

export default function ClaimRequests() {
    const { logout } = useContext(AuthContext);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [verifiedClaims, setVerifiedClaims] = useState({});

    const fetchData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/claims`);
            setClaims(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (claimId, action, coords = {}) => {
        if (action === 'simulate') {
            setActionLoading(`sim-${claimId}`);
            try {
                const claimDate = coords.date ? new Date(coords.date) : new Date();
                if (isNaN(claimDate.getTime())) {
                    alert("Invalid claim date. Please check the claim.");
                    setActionLoading(null);
                    return;
                }
                const formattedDate = claimDate.toISOString().split("T")[0];

                const token = localStorage.getItem('token');
                const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/verify-claim`, {
                    lat: coords.lat,
                    lon: coords.lon,
                    date: formattedDate,
                    claimId: claimId
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                setVerifiedClaims(prev => ({ ...prev, [claimId]: res.data }));
                fetchData(); // Trigger list refresh to update status: 'Verified' in DB view
            } catch (err) {
                console.error('Verification failed', err);
                alert('Weather verification failed. Verify coordinates are present or check API keys.');
            } finally {
                setActionLoading(null);
            }
            return;
        }

        setActionLoading(claimId);
        try {
            await axios.post(`http://localhost:5000/api/admin/claim/${action}/${claimId}`);
            fetchData(); 
        } catch (err) {
            console.error('Action failed', err);
            alert('Failed to process claim.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Claim Requests...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <AdminSidebar activeTab="claims" />

            <div className="flex-1 p-6 md:p-10 w-full max-w-7xl mx-auto">
                {/* Mobile Header */}
                <div className="md:hidden flex justify-between items-center mb-8 bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-100 shadow-sm sticky top-4 z-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Shield className="text-white" size={16} />
                        </div>
                        <span className="font-black text-slate-900 tracking-tighter">GigShield<span className="text-cyan-500">.</span></span>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Pending Claim Requests</h2>
                    <p className="text-slate-500 font-medium">Verify and approve parametric claims requested by workers.</p>
                </div>

                {claims.length === 0 ? (
                    <div className="card bg-slate-50 border-dashed border-2 border-slate-200 p-12 text-center text-slate-500 font-medium rounded-2xl">
                        No pending claims to review. Team is caught up!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim) => {
                            const verification = claim.weatherVerification || verifiedClaims[claim._id];
                            const isVerified = claim.status === 'Verified' || claim.status === 'Approved' || claim.status === 'Rejected' || !!verifiedClaims[claim._id];
                            const isValid = verification?.isValid;
                            const isSimulating = actionLoading === `sim-${claim._id}`;
                            const isApproving = actionLoading === claim._id;

                            // Border Glow for Pending or Verified
                            const cardBorder = claim.status === 'Pending' 
                                ? 'border-amber-200 shadow-amber-200/10' 
                                : claim.status === 'Verified' 
                                ? 'border-blue-200 shadow-blue-200/10' 
                                : 'border-slate-100';

                            return (
                                <div key={claim._id} className={`card p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border bg-white shadow-sm rounded-2xl hover:shadow-md transition-all ${cardBorder}`}>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h3 className="font-bold text-xl text-slate-800">{claim.userId?.name || 'Unknown Worker'}</h3>
                                            <span className="text-xs bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full font-black uppercase tracking-wide">{claim.userId?.platform || 'Gig Worker'}</span>
                                            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                                                {claim.location?.details?.city || claim.userId?.district || claim.userId?.city || 'Unknown District'} 
                                                {claim.location?.details?.region ? ` (${claim.location.details.region})` : claim.userId?.workingArea ? ` (${claim.userId.workingArea})` : ''}
                                            </span>
                                            <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-lg ${claim.status === 'Pending' ? 'bg-amber-100 text-amber-700' : claim.status === 'Verified' ? 'bg-blue-100 text-blue-700' : claim.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {claim.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm font-medium">
                                            <span className="text-slate-400">Disruption:</span> 
                                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold ml-1">{claim.disruptionType}</span>
                                            <span className="text-slate-400 ml-3">Source:</span> <span className="text-slate-600 uppercase text-xs font-bold">{claim.location?.source || 'gps'}</span>
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                                            <p className="text-xs text-slate-400 font-medium">Requested: {new Date(claim.createdAt || claim.incidentDate || Date.now()).toLocaleString([], { dateStyle: 'short', timeStyle: 'short', hour12: true })}</p>
                                            
                                            {isVerified ? (
                                                <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {isValid ? <><CheckCircle size={12} /> {verification.category || 'Heavy Rain Detected'} ✅</> : <>❌ No Rain Detected</>}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold px-2 py-1 rounded flex items-center gap-1 bg-amber-100 text-amber-600">
                                                    Awaiting Weather Verification
                                                </span>
                                            )}

                                            {isVerified && (
                                                <span className="text-xs bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1 border border-cyan-100/30">
                                                     ☁ {verification.condition} ({verification.rainfall}mm)
                                                </span>
                                            )}

                                            {verification?.verifiedAt && (
                                                <span className="text-slate-400 text-[10px] font-medium">
                                                    Verified At: {new Date(verification.verifiedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short', hour12: true })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto p-4 lg:p-0 bg-slate-50 lg:bg-transparent rounded-xl">
                                        <button
                                            onClick={() => {
                                                const lat = claim.location?.lat;
                                                const lon = claim.location?.lon;
                                                
                                                if (!lat || !lon) {
                                                    const manualLat = window.prompt("No coordinates found in claim. Enter Latitude (e.g. 10.37):");
                                                    const manualLon = window.prompt("Enter Longitude (e.g. 78.82):");
                                                    
                                                    if (manualLat && manualLon) {
                                                        handleAction(claim._id, 'simulate', { 
                                                            lat: parseFloat(manualLat), 
                                                            lon: parseFloat(manualLon), 
                                                            date: claim.createdAt 
                                                        });
                                                    }
                                                    return;
                                                }
                                                
                                                handleAction(claim._id, 'simulate', { lat, lon, date: claim.createdAt });
                                            }}
                                            disabled={isSimulating || isVerified}
                                            className={`px-4 py-2 border rounded-lg text-sm font-semibold shadow-sm transition min-w-[140px] flex justify-center items-center ${isVerified ? 'text-green-600 bg-green-50 border-green-100' : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            {isSimulating ? (
                                                <span className="animate-pulse">Verifying...</span>
                                            ) : isVerified ? (
                                                <>✔ Verified</>
                                            ) : (
                                                'Run Verification'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleAction(claim._id, 'approve')}
                                            disabled={isApproving || !isVerified}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition shadow-md ${!isVerified ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20'}`}
                                        >
                                            {isApproving ? 'Processing...' : 'Approve ₹500'}
                                        </button>
                                        <button
                                            onClick={() => handleAction(claim._id, 'reject')}
                                            disabled={actionLoading && !isSimulating}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-bold transition disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
