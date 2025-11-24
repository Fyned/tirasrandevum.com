
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Scissors, CalendarDays, LayoutDashboard, Briefcase, Settings, Store } from 'lucide-react';
import BarberList from '@/components/admin/BarberList.jsx';
import CustomerList from '@/components/admin/CustomerList.jsx';
import AppointmentList from '@/components/admin/AppointmentList.jsx';
import AdminSettings from '@/components/admin/AdminSettings.jsx';
import ShopList from '@/components/admin/ShopList.jsx';
import { useToast } from '@/components/ui/use-toast.js';

const AdminDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const tabs = [
    { id: 'overview', label: 'Genel Durum', icon: LayoutDashboard },
    { id: 'shops', label: 'İşletmeler', icon: Store },
    { id: 'barbers', label: 'Berberler', icon: Briefcase },
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { id: 'appointments', label: 'Randevular', icon: CalendarDays },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('v_admin_dashboard_stats')
          .select('total_barbers, total_customers, active_customers, total_appointments')
          .single();

        if (error) throw error;
        setStats(data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("İstatistikler yüklenirken bir hata oluştu.");
      } finally {
        setLoadingStats(false);
      }
    };

    if (profile?.role === 'admin') {
      fetchStats();
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-[color:var(--tr-bg)]">
        <div className="text-xl text-[color:var(--tr-text-muted)]">Yükleniyor...</div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/giris" replace />;
  }

  const statCards = [
    { title: "Toplam Berber", value: stats?.total_barbers, emoji: "✂️" },
    { title: "Toplam Müşteri", value: stats?.total_customers, emoji: "👥" },
    { title: "Aktif Müşteri", value: stats?.active_customers, emoji: "✅" },
    { title: "Toplam Randevu", value: stats?.total_appointments, emoji: "🗓️" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {error && <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">{error}</div>}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {statCards.map((card) => (
                <motion.div
                  key={card.title}
                  className="panel-surface rounded-2xl p-6 flex items-center justify-between transition-all hover:border-[color:var(--tr-border-strong)] hover:-translate-y-1"
                  variants={itemVariants}
                >
                  <div>
                    <p className="text-sm font-medium text-[color:var(--tr-text-muted)] mb-1">{card.title}</p>
                    <span className="text-4xl font-bold text-[color:var(--tr-text)]">
                      {loadingStats ? '—' : card.value ?? '0'}
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[color:var(--tr-accent-soft)] flex items-center justify-center text-4xl">
                    {card.emoji}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        );
      case 'shops':
        return <ShopList />;
      case 'barbers':
        return <BarberList />;
      case 'customers':
        return <CustomerList />;
      case 'appointments':
        return <AppointmentList />;
      case 'settings':
        return <AdminSettings />;
      default:
        return null;
    }
  };


  return (
    <>
      <Helmet>
        <title>Yönetici Paneli - Tıraş Randevum</title>
        <meta name="description" content="Yönetici paneli - İstatistikleri ve genel durumu görüntüleyin." />
      </Helmet>
      <div className="bg-[color:var(--tr-bg)] min-h-[calc(100vh-65px)]">
        {activeTab !== 'settings' ? (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold text-[color:var(--tr-text)] mb-2">Yönetici Paneli</h1>
                <p className="text-lg text-[color:var(--tr-text-muted)]">Hoş geldiniz, {profile.full_name || 'Admin'}. İşte işletmenizin genel durumu.</p>
              </motion.div>
              <div className="mt-8 mb-8 overflow-x-auto">
                  <div className="relative flex items-center gap-2 p-1 rounded-full bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-subtle)] w-full max-w-max">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tr-accent)] focus-visible:ring-offset-[color:var(--tr-bg-soft)]"
                        style={{ color: activeTab === tab.id ? 'white' : 'var(--tr-text-muted)' }}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="whitespace-nowrap">{tab.label}</span>
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="admin-active-tab-highlight"
                            className="absolute inset-0 bg-[color:var(--tr-accent)] rounded-full -z-10"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={activeTab !== 'settings' ? 'max-w-7xl mx-auto px-4 sm:px-6 md:px-8' : ''}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminDashboard;
