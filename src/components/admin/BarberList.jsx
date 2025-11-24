
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, CheckCircle, XCircle, PlusCircle, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateBarberModal from './CreateBarberModal.jsx';
import { useToast } from "@/components/ui/use-toast";

const BarberList = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const loadBarbers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('barbers')
        .select(`
          id, 
          is_active, 
          is_public,
          created_at, 
          public_code, 
          user_profile:user_profiles!barbers_user_id_fkey (
            id, 
            full_name, 
            email, 
            phone, 
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }
      setBarbers(data);
    } catch (err) {
      console.error("Error fetching barbers:", err);
      setError("Berberler yüklenirken bir hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBarbers();
  }, [loadBarbers]);

  const handleToggleBarberActive = async (barberId, currentIsActive) => {
    setErrorMessage(null);
    setUpdatingId(barberId);
    
    try {
      const { error: updateError } = await supabase
        .from('barbers')
        .update({
          is_active: !currentIsActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', barberId);

      if (updateError) {
        throw updateError;
      }

      setBarbers(currentBarbers =>
        currentBarbers.map(b =>
          b.id === barberId ? { ...b, is_active: !b.is_active } : b
        )
      );
    } catch (err) {
      console.error("Error toggling barber status:", err);
      setErrorMessage('Durum güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const StatusChip = ({ barber }) => {
    const isUpdating = updatingId === barber.id;
    const baseClasses = "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors cursor-pointer";
    const activeClasses = "bg-green-500/15 text-green-300 hover:bg-green-500/25";
    const inactiveClasses = "bg-gray-500/15 text-gray-300 hover:bg-gray-500/25";
    const updatingClasses = "opacity-60 cursor-not-allowed";

    return (
      <button
        onClick={() => handleToggleBarberActive(barber.id, barber.is_active)}
        disabled={isUpdating}
        className={`${baseClasses} ${barber.is_active ? activeClasses : inactiveClasses} ${isUpdating ? updatingClasses : ''}`}
      >
        {isUpdating ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Güncelleniyor...
          </>
        ) : (
          <>
            {barber.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {barber.is_active ? 'Aktif' : 'Pasif'}
          </>
        )}
      </button>
    );
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

  const BarberAvatar = ({ barber }) => {
    const avatarUrl = barber.user_profile?.avatar_url;
    const displayName = barber.user_profile?.full_name || barber.user_profile?.email || 'Berber';
    const initial = displayName?.charAt(0)?.toUpperCase() || '?';

    if (avatarUrl) {
      return <img src={avatarUrl} alt={displayName} className="h-9 w-9 rounded-full object-cover border border-[color:var(--tr-border-soft)]" />;
    }
    return (
      <div className="h-9 w-9 rounded-full bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text-muted)] flex items-center justify-center text-sm font-semibold">
        {initial}
      </div>
    );
  };
  
  const BarberCodeChip = ({ code }) => {
    if (!code) return null;
    
    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        toast({
            title: "Kopyalandı!",
            description: "Berber kodu panoya kopyalandı.",
        });
    };

    return (
      <div className="inline-flex items-center gap-2 rounded-md bg-[color:var(--tr-bg-elevated)] px-2 py-0.5 text-xs font-mono text-[color:var(--tr-text-muted)] border border-[color:var(--tr-border-subtle)]">
        <span>{code}</span>
        <button onClick={handleCopy} className="text-[color:var(--tr-text-muted)] hover:text-white transition-colors">
            <Copy size={12} />
        </button>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <CreateBarberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBarberCreated={loadBarbers}
      />
       <div className="panel-surface rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)]">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-[color:var(--tr-text)]">Berberler</h3>
            <p className="text-xs text-[color:var(--tr-text-muted)]">
                {loading ? 'Yükleniyor...' : `${barbers.length} berber bulundu`}
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[color:var(--tr-accent)] text-white hover:bg-[color:var(--tr-accent)]/90 h-auto flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni Berber Ekle
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="panel-surface rounded-2xl"
      >
        <div className="p-6 border-b border-[color:var(--tr-border-subtle)]">
          <h2 className="text-xl font-semibold text-[color:var(--tr-text)]">Kayıtlı Berberler Listesi</h2>
        </div>
        
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="m-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <div className="text-center p-8 text-[color:var(--tr-text-muted)]">Yükleniyor…</div>}
        {error && <div className="m-4 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">{error}</div>}

        {!loading && !error && barbers.length === 0 ? (
          <p className="p-8 text-center text-[color:var(--tr-text-muted)]">Henüz kayıtlı berber bulunmuyor.</p>
        ) : !loading && !error && (
          <div>
            {/* Desktop View */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[auto_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)] gap-4 px-6 py-3 font-medium text-[color:var(--tr-text-muted)] text-sm border-b border-[color:var(--tr-border-subtle)]">
                <div className="col-span-1"></div>
                <div className="">Berber Adı</div>
                <div className="">E-posta</div>
                <div className="">Telefon</div>
                <div className="">Berber Kodu</div>
                <div className="text-center">Durum</div>
                <div className="text-right">Kayıt Tarihi</div>
              </div>
              <AnimatePresence>
                {barbers.map((barber, index) => (
                  <motion.div
                    key={barber.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-[auto_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)] gap-4 px-6 py-4 items-center border-b border-[color:var(--tr-border-subtle)] last:border-b-0 hover:bg-[color:var(--tr-bg-elevated)] transition-colors"
                  >
                    <div className="col-span-1">
                      <BarberAvatar barber={barber} />
                    </div>
                    <div className="font-medium text-[color:var(--tr-text)]">{barber.user_profile?.full_name || 'N/A'}</div>
                    <div className="text-[color:var(--tr-text-muted)]">{barber.user_profile?.email || 'N/A'}</div>
                    <div className="text-sm">
                      <PhoneLink phone={barber.user_profile?.phone} />
                    </div>
                    <div>
                      <BarberCodeChip code={barber.public_code} />
                    </div>
                    <div className="flex justify-center">
                      <StatusChip barber={barber} />
                    </div>
                    <div className="text-right text-[color:var(--tr-text-muted)] text-sm">{formatDate(barber.created_at)}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Mobile View */}
            <div className="md:hidden p-4 space-y-4">
              <AnimatePresence>
                {barbers.map((barber, index) => (
                  <motion.div
                    key={barber.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[color:var(--tr-bg-elevated)] rounded-xl p-4 space-y-4 border border-[color:var(--tr-border-strong)]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <BarberAvatar barber={barber} />
                        <div>
                          <span className="font-bold text-lg text-[color:var(--tr-text)]">{barber.user_profile?.full_name || 'N/A'}</span>
                          {barber.public_code && <BarberCodeChip code={barber.public_code} />}
                        </div>
                      </div>
                      <StatusChip barber={barber} />
                    </div>
                    <div className="space-y-2 text-sm pl-12">
                      <div className="flex items-center gap-2 text-[color:var(--tr-text-muted)]"><Mail className="w-4 h-4 text-[color:var(--tr-accent)]" /> {barber.user_profile?.email || 'N/A'}</div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[color:var(--tr-accent)]" />
                        <PhoneLink phone={barber.user_profile?.phone} />
                      </div>
                      <div className="flex items-center gap-2 text-[color:var(--tr-text-muted)]"><Calendar className="w-4 h-4 text-[color:var(--tr-accent)]" /> {formatDate(barber.created_at)}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BarberList;
