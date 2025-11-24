import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Scissors, Clock } from 'lucide-react';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [barberMap, setBarberMap] = useState({});
  const [customerMap, setCustomerMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, barber_id, customer_id, starts_at, ends_at, status, created_at, notes')
          .order('starts_at', { ascending: false })
          .limit(200);

        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData);

        const barberIds = [...new Set(appointmentsData.map(a => a.barber_id).filter(Boolean))];
        const customerIds = [...new Set(appointmentsData.map(a => a.customer_id).filter(Boolean))];

        const [barberResponse, customerResponse] = await Promise.all([
          barberIds.length > 0
            ? supabase.from('barbers').select('id, user_profiles(full_name, email)').in('id', barberIds)
            : Promise.resolve({ data: [] }),
          customerIds.length > 0
            ? supabase.from('customers').select('id, full_name, email, phone, user_profiles(full_name)').in('id', customerIds)
            : Promise.resolve({ data: [] }),
        ]);
        
        if (barberResponse.error) throw barberResponse.error;
        if (customerResponse.error) throw customerResponse.error;

        const newBarberMap = (barberResponse.data || []).reduce((acc, barber) => {
          acc[barber.id] = barber;
          return acc;
        }, {});
        
        const newCustomerMap = (customerResponse.data || []).reduce((acc, customer) => {
          acc[customer.id] = customer;
          return acc;
        }, {});
        
        setBarberMap(newBarberMap);
        setCustomerMap(newCustomerMap);

      } catch (err) {
        console.error("Error loading appointment data:", err);
        setError("Randevu listesi yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    return new Date(dateTimeStr).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    return new Date(dateTimeStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      default: return '—';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-200';
      case 'confirmed': return 'bg-blue-500/10 text-blue-200';
      case 'completed': return 'bg-green-500/10 text-green-200';
      case 'cancelled': return 'bg-red-500/10 text-red-200';
      default: return 'bg-gray-500/10 text-gray-200';
    }
  };

  const getBarberName = (id) => barberMap[id]?.user_profiles?.full_name || '—';
  const getCustomerName = (id) => {
      const customer = customerMap[id];
      if (!customer) return '—';
      return customer.user_profiles?.full_name || customer.full_name;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12 text-sm text-[color:var(--tr-text-muted)]">
          Yükleniyor…
        </div>
      );
    }

    if (error) {
      return (
        <div className="m-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {error}
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-4 py-16 text-center">
            <p className="font-semibold text-[color:var(--tr-text)]">Henüz kayıtlı randevu bulunmuyor.</p>
            <p className="text-sm text-[color:var(--tr-text-muted)] mt-1">Sistemde randevular oluştuğunda burada listelenecektir.</p>
        </div>
      );
    }

    return (
      <>
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] gap-4 mb-4 pb-4 border-b border-[color:var(--tr-border-strong)] px-3">
             <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">Berber</div>
             <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">Müşteri</div>
             <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">Tarih / Saat</div>
             <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">Durum</div>
             <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">Oluşturulma</div>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {appointments.map((appt, index) => (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)] gap-4 items-center rounded-lg bg-[color:var(--tr-bg-elevated)] p-3"
                >
                  <div className="text-sm font-medium text-[color:var(--tr-text)] truncate">{getBarberName(appt.barber_id)}</div>
                  <div className="text-sm text-[color:var(--tr-text-muted)] truncate">{getCustomerName(appt.customer_id)}</div>
                  <div className="text-sm text-[color:var(--tr-text-muted)]">{formatDateTime(appt.starts_at)}</div>
                  <div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(appt.status)}`}>{formatStatus(appt.status)}</span>
                  </div>
                  <div className="text-sm text-[color:var(--tr-text-muted)]">{formatDateOnly(appt.created_at)}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-3">
          <AnimatePresence>
            {appointments.map((appt, index) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-lg bg-[color:var(--tr-bg-elevated)] p-4 space-y-3"
              >
                 <div className="flex justify-between items-start">
                    <div className="font-semibold text-[color:var(--tr-text)]">{getCustomerName(appt.customer_id)}</div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(appt.status)}`}>{formatStatus(appt.status)}</span>
                 </div>
                 <div className="space-y-2 text-sm border-t border-[color:var(--tr-border-strong)] pt-3">
                    <div className="flex items-center gap-2"><Scissors className="w-4 h-4 text-[color:var(--tr-accent)]" /> <span className="text-[color:var(--tr-text-muted)]">{getBarberName(appt.barber_id)}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[color:var(--tr-accent)]" /> <span className="text-[color:var(--tr-text-muted)]">{formatDateTime(appt.starts_at)}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[color:var(--tr-accent)]" /> <span className="text-[color:var(--tr-text-muted)]">Kayıt: {formatDateOnly(appt.created_at)}</span></div>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </>
    );
  };

  return (
    <div className="panel-surface rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)] p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--tr-text)]">Randevular</h2>
          <p className="text-xs text-[color:var(--tr-text-muted)]">Sistemdeki tüm randevuları merkezî olarak görüntülersin.</p>
        </div>
        {!loading && (
          <div className="text-xs font-medium text-[color:var(--tr-text-muted)] bg-[color:var(--tr-bg-elevated)] px-2 py-1 rounded-md">
            {appointments.length} randevu
          </div>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default AppointmentList;