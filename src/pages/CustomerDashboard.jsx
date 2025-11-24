import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, User, Phone, Info, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomerDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (profile && profile.role !== 'customer')) {
      navigate('/giris', { replace: true });
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    const userId = profile?.id || user?.id;
    if (userId) {
      const fetchCustomerData = async () => {
        setCustomerLoading(true);
        setCustomerError(null);
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('id, created_at, notes, user_profiles(full_name, phone)')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) {
            throw error;
          }
          
          setCustomer(data);
        } catch (err) {
          console.error("Error fetching customer data:", err);
          setCustomerError("Müşteri bilgileri yüklenirken bir hata oluştu.");
        } finally {
          setCustomerLoading(false);
        }
      };
      fetchCustomerData();
    } else if (!authLoading) {
      setCustomerLoading(false);
    }
  }, [profile, user, authLoading]);
  
  useEffect(() => {
    if (customer?.id) {
      const fetchAppointments = async () => {
        setAppointmentsLoading(true);
        setAppointmentsError(null);
        const today = new Date().toISOString().split('T')[0];
        try {
          const { data, error } = await supabase
            .from('appointments')
            .select(`
              id,
              starts_at,
              ends_at,
              status,
              notes,
              barbers (
                id,
                user_profiles ( full_name, phone )
              )
            `)
            .eq('customer_id', customer.id)
            .gte('starts_at', `${today}T00:00:00.000Z`)
            .order('starts_at', { ascending: true });

          if (error) throw error;
          setAppointments(data);
        } catch (err) {
          console.error("Error fetching appointments:", err);
          setAppointmentsError("Randevular yüklenirken bir hata oluştu.");
        } finally {
          setAppointmentsLoading(false);
        }
      };
      fetchAppointments();
    } else if (!customerLoading) {
      // If there's no customer profile, there are no appointments to load.
      setAppointmentsLoading(false);
    }
  }, [customer, customerLoading]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'pending': return { label: 'Beklemede', color: 'bg-yellow-500/20 text-yellow-300' };
      case 'confirmed': return { label: 'Onaylandı', color: 'bg-blue-500/20 text-blue-300' };
      case 'completed': return { label: 'Tamamlandı', color: 'bg-green-500/20 text-green-300' };
      case 'cancelled': return { label: 'İptal', color: 'bg-red-500/20 text-red-300' };
      default: return { label: 'Bilinmiyor', color: 'bg-gray-500/20 text-gray-300' };
    }
  };

  const PhoneLink = ({ phone }) => {
    if (phone) {
      return (
        <a href={`tel:${phone}`} className="hover:underline text-[color:var(--tr-accent)]">
          {phone}
        </a>
      );
    }
    return <span className="text-[color:var(--tr-text-muted)]">—</span>;
  };

  if (authLoading || customerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] text-[color:var(--tr-text)]">
        <p className="text-xl">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Müşteri Paneli - Tıraş Randevum</title>
        <meta name="description" content="Müşteri paneli - Yaklaşan randevularınızı görüntüleyin ve yönetin." />
      </Helmet>
      <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] text-[color:var(--tr-text)]">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="panel-surface p-6 rounded-2xl"
          >
            <p className="text-sm font-medium text-[color:var(--tr-text-muted)] mb-1">Müşteri Paneli</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[color:var(--tr-text)]">{customer?.user_profiles?.full_name || profile?.email}</h1>
                {customer?.user_profiles?.phone && (
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Phone className="w-4 h-4" />
                    <PhoneLink phone={customer.user_profiles.phone} />
                  </div>
                )}
              </div>
               <Button asChild className="bg-[color:var(--tr-accent)] text-white hover:bg-[color:var(--tr-accent)]/90 w-full sm:w-auto">
                <Link to="/find-barber-by-code">
                  <Search className="mr-2 h-4 w-4" />
                  Berber Kodu ile Bağlan
                </Link>
              </Button>
            </div>
            {customerError && <p className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg">{customerError}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="panel-surface rounded-2xl"
          >
            <div className="p-6 border-b border-[color:var(--tr-border-subtle)]">
                <h2 className="text-xl font-semibold text-[color:var(--tr-text)]">Yaklaşan Randevular</h2>
                <p className="text-[color:var(--tr-text-muted)] mt-1">
                  {appointmentsLoading ? 'Yükleniyor...' : `${appointments.length} randevu bulundu`}
                </p>
            </div>

            {appointmentsLoading ? (
              <p className="p-8 text-center text-[color:var(--tr-text-muted)]">Randevular yükleniyor…</p>
            ) : appointmentsError ? (
              <div className="p-6">
                 <p className="text-red-400 bg-red-500/10 p-3 rounded-lg">{appointmentsError}</p>
              </div>
            ) : appointments.length === 0 ? (
              <p className="p-8 text-center text-[color:var(--tr-text-muted)]">Yaklaşan randevu bulunmuyor.</p>
            ) : (
              <div>
                {/* Desktop View */}
                <div className="hidden md:block">
                   <div className="grid grid-cols-12 gap-4 px-6 py-3 font-medium text-[color:var(--tr-text-muted)] text-sm border-b border-[color:var(--tr-border-subtle)]">
                      <div className="col-span-3">Tarih & Saat</div>
                      <div className="col-span-3">Berber</div>
                      <div className="col-span-2">Berber Telefonu</div>
                      <div className="col-span-2 text-center">Durum</div>
                      <div className="col-span-2">Hizmet</div>
                  </div>
                  <AnimatePresence>
                    {appointments.map((appt, index) => {
                      const statusInfo = formatStatus(appt.status);
                      const barberPhone = appt.barbers?.user_profiles?.phone;
                      return (
                         <motion.div
                          key={appt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-[color:var(--tr-border-subtle)] last:border-b-0 hover:bg-[color:var(--tr-bg-elevated)] transition-colors"
                        >
                          <div className="col-span-3 font-medium text-[color:var(--tr-text)]">{formatDateTime(appt.starts_at)}</div>
                          <div className="col-span-3 text-[color:var(--tr-text-muted)] truncate">{appt.barbers?.user_profiles?.full_name || 'N/A'}</div>
                          <div className="col-span-2 text-sm">
                            <PhoneLink phone={barberPhone} />
                          </div>
                          <div className="col-span-2 flex justify-center">
                              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                          </div>
                          <div className="col-span-2 text-[color:var(--tr-text-muted)] text-sm truncate">{appt.notes || '—'}</div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Mobile View */}
                <div className="md:hidden p-4 space-y-4">
                  <AnimatePresence>
                  {appointments.map((appt, index) => {
                    const statusInfo = formatStatus(appt.status);
                    const barberPhone = appt.barbers?.user_profiles?.phone;
                    return (
                       <motion.div
                        key={appt.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[color:var(--tr-bg-elevated)] rounded-xl p-4 space-y-3 border border-[color:var(--tr-border-strong)] relative"
                      >
                         <div className="absolute top-4 right-4">
                            <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                        </div>
                        <div className="font-bold text-lg text-[color:var(--tr-text)] flex items-center gap-2 pr-20">
                           <Calendar className="w-5 h-5 text-[color:var(--tr-accent)]" /> 
                           {formatDateTime(appt.starts_at)}
                        </div>
                        <div className="space-y-2 text-sm pt-2 border-t border-[color:var(--tr-border-subtle)]">
                          <div className="flex items-center gap-2 text-[color:var(--tr-text-muted)]"><User className="w-4 h-4 text-[color:var(--tr-accent)]" /> {appt.barbers?.user_profiles?.full_name || 'N/A'}</div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[color:var(--tr-accent)]" />
                            <PhoneLink phone={barberPhone} />
                          </div>
                          <div className="flex items-start gap-2 text-[color:var(--tr-text-muted)] pt-1">
                              <Info className="w-4 h-4 text-[color:var(--tr-accent)] mt-0.5 shrink-0" />
                              <span>{appt.notes || '—'}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;