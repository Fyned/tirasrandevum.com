
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, MapPin, Phone, Clock, Scissors, AlertCircle, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ShopPublicPage = () => {
    const { shopCode } = useParams();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [notActive, setNotActive] = useState(false);
    const { toast } = useToast();

    const fetchShopData = useCallback(async () => {
        if (!shopCode) {
            setLoading(false);
            setError("Salon kodu belirtilmemiş.");
            return;
        }
        
        setLoading(true);
        setError(null);
        setNotFound(false);
        setNotActive(false);

        try {
            const { data, error: shopError } = await supabase
                .from('shops')
                .select('*')
                .eq('public_code', shopCode)
                .single();

            if (shopError) {
                if (shopError.code === 'PGRST116') {
                    setNotFound(true);
                } else {
                    console.error("Supabase error:", shopError);
                    throw shopError;
                }
                return;
            } 
            
            if (!data) {
                setNotFound(true);
                return;
            }

            if (!data.is_active) {
                setNotActive(true);
                return;
            }

            setShop(data);

        } catch (err) {
            console.error("Error fetching shop profile:", err);
            setError("Salon bilgileri yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, [shopCode]);

    useEffect(() => {
        fetchShopData();
    }, [fetchShopData]);

    const handleBookAppointment = (serviceName) => {
        toast({
            title: "Yakında!",
            description: `${serviceName} için randevu özelliği henüz aktif değil.`,
        });
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)]">
                <Loader2 className="h-10 w-10 animate-spin text-[color:var(--tr-accent)]" />
            </div>
        );
    }
    
    // Not Found State
    if (notFound) {
        return (
             <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] text-center p-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl max-w-md w-full flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
                    <h1 className="text-xl font-bold text-yellow-500">Salon Bulunamadı</h1>
                    <p className="text-[color:var(--tr-text-muted)] mt-2">Aradığınız koda sahip bir salon bulunamadı.</p>
                </div>
            </div>
        );
    }

    // Not Active State
    if (notActive) {
        return (
             <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] text-center p-4">
                <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-xl max-w-md w-full flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
                    <h1 className="text-xl font-bold text-orange-500">Salon Pasif</h1>
                    <p className="text-[color:var(--tr-text-muted)] mt-2">Bu salon şu anda hizmet vermemektedir.</p>
                </div>
            </div>
        );
    }

    // Generic Error State
    if (error) {
        return (
             <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] text-center p-4">
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl max-w-md w-full flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h1 className="text-xl font-bold text-red-500">Bir Hata Oluştu</h1>
                    <p className="text-[color:var(--tr-text-muted)] mt-2">{error}</p>
                </div>
            </div>
        );
    }

    if (!shop) {
        return <Navigate to="/salon-koduyla-bul" replace />;
    }

    const services = [
        { id: 1, name: "Saç Kesimi", price: "150 TL" },
        { id: 2, name: "Sakal Tıraşı", price: "80 TL" },
        { id: 3, name: "Saç & Sakal", price: "200 TL" },
        { id: 4, name: "Çocuk Tıraşı", price: "100 TL" },
        { id: 5, name: "Cilt Bakımı", price: "120 TL" },
    ];

    return (
        <>
            <Helmet>
                <title>{shop.name} - Tıraş Randevum</title>
                <meta name="description" content={`${shop.name} salonundan randevu alın.`} />
            </Helmet>
            <div className="p-4 sm:p-6 md:p-8 bg-[color:var(--tr-bg)] text-[color:var(--tr-text)] min-h-[calc(100vh-4rem)]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Shop Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-1 space-y-6"
                    >
                         <header className="flex flex-col items-center text-center p-8 rounded-2xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-strong)]">
                            <div className="w-24 h-24 bg-[color:var(--tr-bg-elevated)] rounded-full flex items-center justify-center mb-4 border-4 border-[color:var(--tr-accent-soft)]">
                                <Store className="w-10 h-10 text-[color:var(--tr-accent)]" />
                            </div>
                            <h1 className="text-3xl font-bold mt-2">{shop.name}</h1>
                            <div className="flex items-center gap-2 text-[color:var(--tr-text-muted)] mt-4">
                                <MapPin size={16} />
                                <p>{shop.city || 'Şehir bilgisi yok'}</p>
                            </div>
                            <p className="text-sm text-[color:var(--tr-text-muted)] mt-1">{shop.address || 'Adres bilgisi yok'}</p>
                            
                            <div className="flex items-center gap-2 text-[color:var(--tr-text-muted)] mt-4">
                                <Phone size={16} />
                                <p>{shop.phone || 'Telefon bilgisi yok'}</p>
                            </div>
                        </header>

                        <div className="p-6 rounded-2xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-strong)]">
                            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <Clock size={20} className="text-[color:var(--tr-accent)]"/> 
                                Çalışma Saatleri
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b border-[color:var(--tr-border-subtle)]">
                                    <span className="text-[color:var(--tr-text-muted)]">Hafta İçi</span>
                                    <span className="font-medium">09:00 - 21:00</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-[color:var(--tr-border-subtle)]">
                                    <span className="text-[color:var(--tr-text-muted)]">Cumartesi</span>
                                    <span className="font-medium">09:00 - 21:00</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-[color:var(--tr-text-muted)]">Pazar</span>
                                    <span className="font-medium text-red-400">Kapalı</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Services */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <div className="p-6 rounded-2xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-strong)]">
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                                <Scissors size={24} className="text-[color:var(--tr-accent)]"/> 
                                Hizmetlerimiz
                            </h2>
                            
                            <div className="grid gap-4">
                                {services.map((service) => (
                                    <div 
                                        key={service.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--tr-bg-elevated)] border border-[color:var(--tr-border-subtle)] hover:border-[color:var(--tr-accent)] transition-colors"
                                    >
                                        <div>
                                            <h3 className="font-medium text-lg">{service.name}</h3>
                                            <p className="text-[color:var(--tr-accent)] font-semibold">{service.price}</p>
                                        </div>
                                        <Button 
                                            onClick={() => handleBookAppointment(service.name)}
                                            className="bg-[color:var(--tr-accent)] hover:bg-[color:var(--tr-accent)]/90 text-white"
                                        >
                                            Randevu Al
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default ShopPublicPage;
