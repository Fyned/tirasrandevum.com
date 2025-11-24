
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertTriangle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const FindBarberByCode = () => {
    const [barberCode, setBarberCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const navigate = useNavigate();
    const { profile, loading: authLoading } = useAuth();

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setNotFound(false);

        if (!barberCode.trim()) {
            setError('Lütfen bir berber kodu girin.');
            setLoading(false);
            return;
        }

        const normalizedCode = barberCode.trim().toUpperCase();

        try {
            const { data, error: queryError } = await supabase
                .from('barbers')
                .select('public_code,is_public,is_active')
                .eq('public_code', normalizedCode)
                .single();

            if (queryError) {
                if (queryError.code === 'PGRST116') {
                    setNotFound(true);
                } else {
                    throw queryError;
                }
            } else if (!data || !data.is_public || !data.is_active) {
                setNotFound(true);
            } else {
                navigate(`/barber/${data.public_code}`);
            }
        } catch (err) {
            console.error('Barber search error:', err);
            setError('Berber aranırken beklenmedik bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] flex items-center justify-center">
                <p className="text-sm text-[color:var(--tr-text-muted)]">Yükleniyor...</p>
            </div>
        );
    }

    if (!profile) {
        return <Navigate to="/giris" replace />;
    }

    if (profile.role !== 'customer') {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] flex items-center justify-center">
                <p className="text-sm text-[color:var(--tr-text-muted)]">
                    Bu sayfaya sadece müşteri hesapları erişebilir.
                </p>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Berber Bul - Tıraş Randevum</title>
                <meta name="description" content="Berberinizi koduyla bulun ve randevu alın." />
            </Helmet>
            <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="p-8 rounded-2xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-strong)] space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-[color:var(--tr-text)]">
                                Berberini Bul
                            </h1>
                            <p className="text-[color:var(--tr-text-muted)] mt-2 text-sm">
                                Berberinizin size verdiği kodu girerek profiline ulaşın.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <Label htmlFor="barberCode" className="sr-only">
                                    Berber Kodu
                                </Label>
                                <Input
                                    id="barberCode"
                                    type="text"
                                    placeholder="TR-XXXX-YYYY"
                                    value={barberCode}
                                    onChange={(e) => setBarberCode(e.target.value.toUpperCase())}
                                    className="text-center tracking-widest h-12 text-lg bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)]"
                                    required
                                />
                            </div>

                            {notFound && (
                                <div className="flex items-center gap-2 text-sm text-yellow-300 bg-yellow-500/10 p-3 rounded-md">
                                    <XCircle size={16} /> Bu koda sahip aktif bir berber bulunamadı.
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 p-3 rounded-md">
                                    <AlertTriangle size={16} /> {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-base bg-[color:var(--tr-accent)] text-white hover:bg-[color:var(--tr-accent)]/90 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Aranıyor...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-5 w-5" /> Bul
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default FindBarberByCode;
