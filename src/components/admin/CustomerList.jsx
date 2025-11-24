import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, Briefcase, PlusCircle } from 'lucide-react';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createForm, setCreateForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    barberId: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const customerPromise = supabase
        .from('customers')
        .select('id, full_name, phone, email, barber_id, created_at, user_profiles(full_name, email, phone)')
        .order('created_at', { ascending: false });

      const barberPromise = supabase
        .from('barbers')
        .select('id, is_active, user_profiles(full_name, email)')
        .order('created_at', { ascending: false });

      const [customerResponse, barberResponse] = await Promise.all([customerPromise, barberPromise]);

      if (customerResponse.error) throw customerResponse.error;
      if (barberResponse.error) throw barberResponse.error;

      setCustomers(customerResponse.data);
      setBarbers(barberResponse.data);
    } catch (err) {
      console.error("Error loading customer data:", err);
      setError("Müşteri listesi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!createForm.fullName.trim()) {
      setCreateError("Ad Soyad alanı zorunludur.");
      return;
    }
    if (!createForm.barberId) {
      setCreateError("Lütfen bir berber seçin.");
      return;
    }

    setCreateLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('customers')
        .insert({
          full_name: createForm.fullName.trim(),
          phone: createForm.phone.trim() || null,
          email: createForm.email.trim() || null,
          barber_id: createForm.barberId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (insertError) throw insertError;

      setCreateSuccess("Müşteri başarıyla eklendi.");
      setCreateForm({ fullName: '', phone: '', email: '', barberId: '' });
      loadData(); // Re-fetch customers to show the new one
      
    } catch (err) {
      console.error("Error creating customer:", err);
      setCreateError("Müşteri kaydı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setCreateLoading(false);
    }
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return 'N/A';
    return new Date(createdAt).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBarberName = (barberId) => {
    if (!barberId) return "—";
    const barber = barbers.find(b => b.id === barberId);
    return barber?.user_profiles?.full_name || "Bilinmeyen Berber";
  };
  
  const inputStyles = "w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] shadow-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--tr-accent)]";

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

    if (customers.length === 0 && !showCreateForm) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-4 py-16 text-center">
            <p className="font-semibold text-[color:var(--tr-text)]">Henüz kayıtlı müşteri bulunmuyor.</p>
            <p className="text-sm text-[color:var(--tr-text-muted)] mt-1">Sisteme yeni müşteriler eklendiğinde burada görünecektir.</p>
        </div>
      );
    }

    return (
      <>
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.5fr)] gap-4 mb-4 pb-4 border-b border-[color:var(--tr-border-strong)] px-3">
            <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">Müşteri Adı</div>
            <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">Telefon</div>
            <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">E-posta</div>
            <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">Bağlı Berber</div>
            <div className="text-xs font-medium text-[color:var(--tr-text-muted)]">Kayıt Tarihi</div>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {customers.map((customer, index) => {
                const phone = customer.user_profiles?.phone || customer.phone;
                return (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.5fr)] gap-4 items-center rounded-lg bg-[color:var(--tr-bg-elevated)] p-3"
                  >
                    <div className="text-sm font-medium text-[color:var(--tr-text)] truncate">{customer.user_profiles?.full_name || customer.full_name || 'N/A'}</div>
                    <div className="text-sm truncate">
                      <PhoneLink phone={phone} />
                    </div>
                    <div className="text-sm text-[color:var(--tr-text-muted)] truncate">{customer.user_profiles?.email || customer.email || '—'}</div>
                    <div className="text-sm text-[color:var(--tr-text-muted)] truncate">{getBarberName(customer.barber_id)}</div>
                    <div className="text-sm text-[color:var(--tr-text-muted)]">{formatDate(customer.created_at)}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-3">
          <AnimatePresence>
            {customers.map((customer, index) => {
              const phone = customer.user_profiles?.phone || customer.phone;
              return (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-lg bg-[color:var(--tr-bg-elevated)] p-4 space-y-3"
                >
                  <div className="font-semibold text-[color:var(--tr-text)]">{customer.user_profiles?.full_name || customer.full_name || 'N/A'}</div>
                  <div className="space-y-2 text-sm border-t border-[color:var(--tr-border-strong)] pt-3">
                      <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-[color:var(--tr-accent)]" /> <span className="text-[color:var(--tr-text-muted)]">{getBarberName(customer.barber_id)}</span></div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[color:var(--tr-accent)]" />
                        <PhoneLink phone={phone} />
                      </div>
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[color:var(--tr-accent)]" /> <span className="text-[color:var(--tr-text-muted)]">{customer.user_profiles?.email || customer.email || '—'}</span></div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[color:var(--tr-accent)]" /> <span className="text-[color:var(--tr-text-muted)]">{formatDate(customer.created_at)}</span></div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </>
    );
  };

  return (
    <div className="panel-surface rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)] p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--tr-text)]">Müşteriler</h2>
          <p className="text-xs text-[color:var(--tr-text-muted)]">Sistemdeki tüm müşteri kayıtlarını görürsün.</p>
        </div>
        <div className="flex items-center gap-2">
            {!loading && (
              <div className="text-xs font-medium text-[color:var(--tr-text-muted)] bg-[color:var(--tr-bg-elevated)] px-2 py-1 rounded-md">
                {customers.length} müşteri
              </div>
            )}
             <button onClick={() => setShowCreateForm(!showCreateForm)} className="p-2 rounded-full bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text-muted)] hover:bg-[color:var(--tr-accent)] hover:text-white transition-all">
                <PlusCircle className="w-4 h-4" />
             </button>
        </div>
      </div>
      
      <AnimatePresence>
        {showCreateForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <form onSubmit={handleCreateCustomer} className="panel-surface mt-3 mb-6 rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)] p-4 space-y-3">
                 <div className="space-y-1">
                    <label htmlFor="fullName" className="text-xs font-medium text-[color:var(--tr-text-muted)]">Ad Soyad (Zorunlu)</label>
                    <input id="fullName" name="fullName" type="text" placeholder="Müşteri adı" value={createForm.fullName} onChange={handleInputChange} className={inputStyles} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label htmlFor="phone" className="text-xs font-medium text-[color:var(--tr-text-muted)]">Telefon</label>
                        <input id="phone" name="phone" type="tel" placeholder="05xx..." value={createForm.phone} onChange={handleInputChange} className={inputStyles} />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-xs font-medium text-[color:var(--tr-text-muted)]">E-posta</label>
                        <input id="email" name="email" type="email" placeholder="musteri@ornek.com" value={createForm.email} onChange={handleInputChange} className={inputStyles} />
                    </div>
                </div>
                 <div className="space-y-1">
                    <label htmlFor="barberId" className="text-xs font-medium text-[color:var(--tr-text-muted)]">Bağlı Berber (Zorunlu)</label>
                    <select id="barberId" name="barberId" value={createForm.barberId} onChange={handleInputChange} className={inputStyles}>
                        <option value="" disabled>Berber seçin</option>
                        {barbers.filter(b => b.is_active).map(barber => (
                            <option key={barber.id} value={barber.id}>{barber.user_profiles?.full_name || "İsimsiz berber"}</option>
                        ))}
                    </select>
                </div>

                <AnimatePresence>
                    {createError && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                        {createError}
                      </motion.div>
                    )}
                    {createSuccess && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-200">
                        {createSuccess}
                      </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between items-center pt-2">
                    <p className="text-[11px] text-[color:var(--tr-text-muted)] max-w-xs">Not: Müşteri kaydı, seçtiğin berberin müşteri listesine eklenecektir.</p>
                    <button type="submit" disabled={createLoading || !createForm.fullName.trim() || !createForm.barberId} className="inline-flex items-center justify-center rounded-lg bg-[color:var(--tr-accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--tr-accent)]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                      {createLoading ? "Kaydediliyor…" : "Kaydet"}
                    </button>
                </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {renderContent()}
    </div>
  );
};

export default CustomerList;