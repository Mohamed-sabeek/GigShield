import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <AdminSidebar />
            <main className="flex-1 w-full overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
}
