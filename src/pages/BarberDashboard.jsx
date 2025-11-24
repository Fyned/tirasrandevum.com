import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, User, Calendar, Image as ImageIcon, Users, Instagram } from 'lucide-react';

const BarberDashboard = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const location = useLocation();

    // Determine active tab from URL
    const getActiveTabFromPath = (path) => {
        if (path.includes('/berber/appointments')) return 'appointments';
        if (path.includes('/berber/instagram-profile')) return 'instagram-profile';
        if (path.includes('/berber/followers')) return 'followers';
        if (path.includes('/berber/profil')) return 'profile';
        return 'dashboard'; // Default
    };

    const [activeTab, setActiveTab] = useState(getActiveTabFromPath(location.pathname));

    useEffect(() => {
        setActiveTab(getActiveTabFromPath(location.pathname));
    }, [location.pathname]);

    const tabs = [
        { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard, path: '/berber' },
        { id: 'appointments', label: 'Randevular', icon: Calendar, path: '/berber/appointments' },
        { id: 'instagram-profile', label: 'Portföyüm', icon: Instagram, path: '/berber/instagram-profile' },
        { id: 'followers', label: 'Takipçiler', icon: Users, path: '/berber/followers' },
        { id: 'profile', label: 'Profilim', icon: User, path: '/berber/profil' },
    ];
    
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[color:var(--tr-bg)]">
                <p className="text-xl text-[color:var(--tr-text-muted)]">Yükleniyor...</p>
            </div>
        );
    }

    if (!user || profile?.role !== 'barber') {
        return <Navigate to="/giris" replace />;
    }

    return (
        <>
            <Helmet>
                <title>Berber Paneli - Tıraş Randevum</title>
                <meta name="description" content="Berber paneli - Randevularınızı, portföyünüzü ve profilinizi yönetin." />
            </Helmet>
            <div className="bg-[color:var(--tr-bg)] min-h-[calc(100vh-65px)]">
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <h1 className="text-3xl font-bold text-[color:var(--tr-text)] mb-2">Berber Paneli</h1>
                            <p className="text-lg text-[color:var(--tr-text-muted)]">Hoş geldiniz, {profile.full_name || profile.email}.</p>
                        </motion.div>
                        
                        <div className="mt-8 mb-8 overflow-x-auto">
                            <div className="relative flex items-center gap-2 p-1 rounded-full bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-subtle)] w-full max-w-max">
                                {tabs.map((tab) => (
                                    <Link
                                        key={tab.id}
                                        to={tab.path}
                                        onClick={() => setActiveTab(tab.id)}
                                        className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tr-accent)] focus-visible:ring-offset-[color:var(--tr-bg-soft)]"
                                        style={{ color: activeTab === tab.id ? 'white' : 'var(--tr-text-muted)' }}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        <span className="whitespace-nowrap">{tab.label}</span>
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="barber-active-tab-highlight"
                                                className="absolute inset-0 bg-[color:var(--tr-accent)] rounded-full -z-10"
                                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        
                         {location.pathname === '/berber' && (
                             <AnimatePresence mode="wait">
                                <motion.div
                                    key="dashboard-overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                     <div className="text-center p-8 rounded-2xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-subtle)]">
                                        <h2 className="text-2xl font-bold text-[color:var(--tr-text)]">Genel Bakış</h2>
                                        <p className="text-[color:var(--tr-text-muted)] mt-2">
                                            Bu alanda yakında önemli istatistikler ve hızlı eylemler yer alacak.
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                         )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BarberDashboard;