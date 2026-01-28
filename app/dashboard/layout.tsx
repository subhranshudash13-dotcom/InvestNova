import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            {/* Main content wrapper */}
            <main className="flex-1 md:ml-64 p-8 min-h-screen transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
