
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertTriangle, XCircle, Store } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const FindShopByCode = () => {
    const [shopCode, setShopCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [notActive, setNotActive] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setNotFound(false);
        setNotActive(false);

        if (!shopCode.trim()) {
            setError('Lütfen bir salon kodu girin.');
            setLoading(false);
            return;
        }

        const normalizedCode = shopCode.trim().toUpperCase();

        try {
            const { data, error: queryError } = await supabase
                .from('shops')
                .select(`
                    id,
                    public_code,
                    name,
                    phone,
                    address,
                    city,
                    is_active
                `)
                .eq('public_code', normalizedCode)
                .single();

            if (queryError) {
                if (queryError.code === 'PGRST116') {
                    setNotFound(true);
                } else {
                    throw queryError;
                }
            } else if (!data) {
                setNotFound(true);
            } else if (!data.is_active) {
                setNotActive(true);
            } else {
                navigate(`/salon/${data.public_code}`);
            }
        } catch (err) {
            console.error('Shop search error:', err);
            setError('Salon aranırken beklenmedik bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Salon Bul - Tıraş Randevum</title>
                <meta name="description" content="Salonu koduyla bulun ve randevu alın." />
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
                            <div className="mx-auto w-12 h-12 bg-[color:var(--tr-accent-soft)] rounded-full flex items-center justify-center mb-4">
                                <Store className="w-6 h-6 text-[color:var(--tr-accent)]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[color:var(--tr-text)]">
                                Salonu Bul
                            </h1>
                            <p className="text-[color:var(--tr-text-muted)] mt-2 text-sm">
                                Salonun size verdiği kodu girerek sayfasına ulaşın.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <Label htmlFor="shopCode" className="sr-only">
                                    Salon Kodu
                                </Label>
                                <Input
                                    id="shopCode"
                                    type="text"
                                    placeholder="TR-SALON-XXX"
                                    value={shopCode}
                                    onChange={(e) => setShopCode(e.target.value.toUpperCase())}
                                    className="text-center tracking-widest h-12 text-lg bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)]"
                                    required
                                />
                            </div>

                            {notFound && (
                                <div className="flex items-center gap-2 text-sm text-yellow-300 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20">
                                    <XCircle size={16} /> Bu koda sahip bir salon bulunamadı.
                                </div>
                            )}

                            {notActive && (
                                <div className="flex items-center gap-2 text-sm text-orange-300 bg-orange-500/10 p-3 rounded-md border border-orange-500/20">
                                    <AlertTriangle size={16} /> Bu salon şu anda pasif.
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 p-3 rounded-md border border-red-500/20">
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

export default FindShopByCode;
