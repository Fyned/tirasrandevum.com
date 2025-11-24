import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, User } from 'lucide-react';

const AdminSettings = () => {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatar_url || '',
      });
      setProfileLoading(false);
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.fullName.trim()) {
      setError("Ad Soyad alanı boş bırakılamaz.");
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: form.fullName.trim(),
          phone: form.phone.trim() || null,
          avatar_url: form.avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setSuccess("Profil başarıyla güncellendi.");
      await refreshProfile(); // Refresh profile data in context
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Profil güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const inputStyles = "w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm text-[color:var(--tr-text)] shadow-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--tr-accent)]";
  const readOnlyInputStyles = `${inputStyles} cursor-not-allowed bg-[color:var(--tr-bg-soft)] text-[color:var(--tr-text-muted)]`;

  const AvatarPreview = () => {
    if (profileLoading) {
      return <div className="h-12 w-12 rounded-full bg-[color:var(--tr-bg-elevated)] animate-pulse" />;
    }
    
    const displayName = profile?.full_name || profile?.email;
    const initial = displayName?.charAt(0)?.toUpperCase() || '?';

    return (
      <div className="flex items-center gap-4">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={displayName} className="h-12 w-12 rounded-full object-cover border border-[color:var(--tr-border-soft)]" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text-muted)] flex items-center justify-center text-xl font-semibold">
            {initial}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--tr-text)] sm:text-3xl">{displayName}</h1>
          <p className="text-sm text-[color:var(--tr-text-muted)]">Yönetici</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] text-[color:var(--tr-text)]">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <header className="space-y-2">
          <AvatarPreview />
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--tr-text-muted)]">
            E-posta adresin, kullanıcı bilgilerin ve temel sistem ayarlarını buradan yönetebilirsin.
          </p>
        </header>

        <form onSubmit={handleSave} className="panel-surface rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)] p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[color:var(--tr-text)]">Yönetici Profili</h2>

          {profileLoading ? (
             <div className="text-center py-8 text-sm text-[color:var(--tr-text-muted)]">Profil bilgileri yükleniyor...</div>
          ) : (
            <>
                <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-medium text-[color:var(--tr-text-muted)]">E-posta</label>
                    <input id="email" type="email" value={profile.email || ''} readOnly className={readOnlyInputStyles} />
                </div>
                <div className="space-y-1">
                    <label htmlFor="fullName" className="text-xs font-medium text-[color:var(--tr-text-muted)]">Ad Soyad</label>
                    <input id="fullName" name="fullName" type="text" placeholder="Ad Soyad" value={form.fullName} onChange={handleInputChange} className={inputStyles} />
                </div>
                <div className="space-y-1">
                    <label htmlFor="phone" className="text-xs font-medium text-[color:var(--tr-text-muted)]">Telefon</label>
                    <input id="phone" name="phone" type="tel" placeholder="Telefon (isteğe bağlı)" value={form.phone} onChange={handleInputChange} className={inputStyles} />
                </div>
                <div className="space-y-1">
                    <label htmlFor="avatarUrl" className="text-xs font-medium text-[color:var(--tr-text-muted)]">Profil fotoğrafı (URL)</label>
                    <input id="avatarUrl" name="avatarUrl" type="url" placeholder="https://..." value={form.avatarUrl} onChange={handleInputChange} className={inputStyles} />
                </div>
            </>
          )}

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-200">
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center pt-2">
            <p className="text-[11px] text-[color:var(--tr-text-muted)]">Bu bilgiler sadece yönetici hesabın için geçerlidir.</p>
            <button type="submit" disabled={saving || profileLoading} className="inline-flex items-center justify-center rounded-lg bg-[color:var(--tr-accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--tr-accent)]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>

        <div className="panel-surface rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)] p-4 space-y-4">
            <h2 className="text-sm font-semibold text-[color:var(--tr-text)]">Sistem Ayarları</h2>
             <p className="text-sm text-[color:var(--tr-text-muted)]">Abonelikler, şube yönetimi ve bildirim ayarları ilerleyen sürümlerde burada yönetilecek.</p>
            <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-[color:var(--tr-accent)]/20">
                        <Sparkles className="w-5 h-5 text-[color:var(--tr-accent)]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-[color:var(--tr-text)]">Abonelik durumu</h3>
                        <p className="text-xs text-[color:var(--tr-text-muted)] mt-1">Şu anda lisans ve abonelik yönetimi yönetici paneli üzerinden manuel olarak takip edilmektedir.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-[color:var(--tr-accent)]/20">
                        <ShieldCheck className="w-5 h-5 text-[color:var(--tr-accent)]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-[color:var(--tr-text)]">Veri güvenliği</h3>
                        <p className="text-xs text-[color:var(--tr-text-muted)] mt-1">Tıraş Randevum, randevu ve müşteri verilerini merkezi bir veritabanında tutar. Yedekleme ve arşivleme politikaları bu bölümde konumlandırılacaktır.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;