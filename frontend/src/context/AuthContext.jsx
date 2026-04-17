import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            checkUser();
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const checkUser = async () => {
        try {
            if (token) {
                // First decode to get basic info immediately
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload && payload.user) {
                    setUser({ id: payload.user.id, role: payload.user.role, isVerified: payload.user.isVerified });
                }

                // Then fetch FULL profile including location
                const res = await axios.get(`${API}/api/users/profile`);
                if (res.data.profile) {
                    setUser(res.data.profile);
                }
            }
            setLoading(false);
        } catch (err) {
            console.error("Auth check failed:", err.message);
            logout();
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API}/api/auth/login`, { email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data.user;
        } catch (error) {
            throw error.response?.data?.msg || 'Login failed';
        }
    };

    const signup = async (userData) => {
        try {
            const res = await axios.post(`${API}/api/auth/signup`, userData);
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data.user;
        } catch (error) {
            throw error.response?.data?.msg || 'Signup failed';
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const res = await axios.post(`${API}/api/auth/verify-otp`, { email, otp });
            setUser(prev => prev ? { ...prev, isVerified: true } : null);
            return res.data;
        } catch (error) {
            throw error.response?.data?.msg || 'Verification failed';
        }
    };

    const resendOTP = async (email) => {
        try {
            const res = await axios.post(`${API}/api/auth/resend-otp`, { email });
            return res.data;
        } catch (error) {
            throw error.response?.data?.msg || 'Failed to resend code';
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, signup, verifyOTP, resendOTP, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
