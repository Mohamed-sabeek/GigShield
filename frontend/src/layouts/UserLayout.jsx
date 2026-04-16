import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function UserLayout({ profile }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Sidebar profile={profile} />
            <main className="flex-1 w-full overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
}
