import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, RefreshCw, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function VerifyOTP() {
    const { verifyOTP, resendOTP } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Persistent Timers using localStorage
    const [timer, setTimer] = useState(300); 
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/signup');
            return;
        }

        // Initialize or Sync Timers
        const now = Date.now();
        let expiryTime = localStorage.getItem(`otp_expiry_${email}`);
        let resendTime = localStorage.getItem(`otp_resend_${email}`);

        if (!expiryTime) {
            expiryTime = now + 300000; // 5 mins
            localStorage.setItem(`otp_expiry_${email}`, expiryTime);
        }
        if (!resendTime) {
            resendTime = now + 30000; // 30 secs
            localStorage.setItem(`otp_resend_${email}`, resendTime);
        }

        const countdown = setInterval(() => {
            const currentTime = Date.now();
            
            const remainingExpiry = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
            const remainingResend = Math.max(0, Math.floor((resendTime - currentTime) / 1000));

            setTimer(remainingExpiry);
            setResendTimer(remainingResend);
            
            if (remainingResend <= 0) {
                setCanResend(true);
            }
        }, 1000);

        return () => clearInterval(countdown);
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await verifyOTP(email, otpCode);
            setSuccess('Account verified successfully! Redirecting...');
            
            // Clear persistent timers on success
            localStorage.removeItem(`otp_expiry_${email}`);
            localStorage.removeItem(`otp_resend_${email}`);
            
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await resendOTP(email);
            setSuccess('A new code has been sent to your email');
            
            // Update persistent resend timer (30 seconds)
            const newResendTime = Date.now() + 30000;
            localStorage.setItem(`otp_resend_${email}`, newResendTime);
            
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-primary/10 overflow-x-hidden relative">
            <Navbar />
            
            <div className="flex items-center justify-center min-h-screen pt-20 px-6">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-2xl shadow-slate-200/50 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={32} className="text-primary" />
                        </div>
                        
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Verify Email</h2>
                        <p className="text-slate-500 font-medium text-sm mb-8">
                            We've sent a 6-digit code to <br />
                            <span className="text-slate-900 font-black">{email}</span>
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100 font-bold">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm mb-6 border border-green-100 font-bold">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-8">
                            <div className="flex justify-between gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center justify-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest">
                                <Clock size={14} />
                                {timer > 0 ? (
                                    <span>Code expires in {formatTime(timer)}</span>
                                ) : (
                                    <span className="text-red-500">Code expired</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.join('').length !== 6 || timer === 0}
                                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Verify OTP <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <p className="text-slate-500 font-medium text-sm mb-4">Didn't receive the code?</p>
                            <button
                                onClick={handleResend}
                                disabled={loading || !canResend}
                                className="text-primary font-black uppercase tracking-widest text-xs hover:underline disabled:opacity-30 disabled:no-underline"
                            >
                                {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
