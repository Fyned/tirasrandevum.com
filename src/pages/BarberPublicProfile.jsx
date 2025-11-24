
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient';
import AppointmentCalendar from '@/components/AppointmentCalendar.jsx';
import { Loader2, User, Clock, MapPin, Instagram, XCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BarberPublicProfile = () => {
    const { publicCode } = useParams();
    const [barber, setBarber] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [notActive, setNotActive] = useState(false);

    const fetchBarberData = useCallback(async () => {
        if (!publicCode) {
            setLoading(false);
            setError("Berber kodu belirtilmemiş.");
            return;
        }
        
        setLoading(true);
        setError(null);
        setNotFound(false);
        setNotActive(false);

        try {
            // Fetch Barber with explicit FK syntax
            const { data: barberData, error: barberError } = await supabase
                .from('barbers')
                .select(`
                    *,
                    user_profile:user_profiles!barbers_user_id_fkey(*)
                `)
                .eq('public_code', publicCode)
                .single();

            if (barberError) {
                if (barberError.code === 'PGRST116') { // Not found
                    setNotFound(true);
                } else {
                    console.error("Supabase error:", barberError);
                    throw barberError;
                }
                return;
            } 
            
            if (!barberData) {
                setNotFound(true);
                return;
            }

            // Check Active/Public status
            if (!barberData.is_active || !barberData.is_public) {
                setNotActive(true);
                return;
            }

            // Success - Set Barber
            setBarber(barberData);

            // Fetch Posts (Only if barber is valid)
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*')
                .eq('barber_id', barberData.id)
                .order('created_at', { ascending: false });

            if (postError) {
                console.warn("Couldn't fetch posts:", postError.message);
            } else {
                setPosts(postData || []);
            }

        } catch (err) {
            console.error("Error fetching barber profile:", err);
            setError("Profil yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }, [publicCode]);

    useEffect(() => {
        fetchBarberData();
    }, [fetchBarberData]);

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
                    <XCircle className="h-12 w-12 text-yellow-500 mb-4" />
                    <h1 className="text-xl font-bold text-yellow-500">Berber Bulunamadı</h1>
                    <p className="text-[color:var(--tr-text-muted)] mt-2">Aradığınız koda sahip bir berber bulunamadı.</p>
                    <p className="text-xs text-[color:var(--tr-text-muted)] mt-4">Lütfen kodu kontrol edip tekrar deneyin.</p>
                </div>
            </div>
        );
    }

    // Not Active/Public State
    if (notActive) {
        return (
             <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] text-center p-4">
                <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-xl max-w-md w-full flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
                    <h1 className="text-xl font-bold text-orange-500">Profil Erişilemez</h1>
                    <p className="text-[color:var(--tr-text-muted)] mt-2">Bu berber şu anda müşterilere açık değil.</p>
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

    if (!barber) {
        return <Navigate to="/find-barber-by-code" replace />;
    }

    const { user_profile } = barber;
    const stats = [
        { label: 'Post', value: posts.length },
        { label: 'Takipçi', value: '1.2k' }, // Mock data
        { label: 'Takip', value: 150 }, // Mock data
    ];

    return (
        <>
            <Helmet>
                <title>{user_profile.full_name} - Tıraş Randevum</title>
                <meta name="description" content={`${user_profile.full_name}'in çalışmalarını görün ve randevu alın.`} />
            </Helmet>
            <div className="p-4 sm:p-6 md:p-8 bg-[color:var(--tr-bg)] text-[color:var(--tr-text)]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-1 space-y-8"
                    >
                         <header className="flex flex-col items-center text-center p-6 rounded-2xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-strong)]">
                            <img
                                alt={`${user_profile.full_name} avatar`}
                                className="h-32 w-32 rounded-full object-cover border-4 border-[color:var(--tr-accent-soft)]"
                                src={user_profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user_profile.full_name)}&background=191d26&color=e1e7f2&size=128`}
                            />
                            <h1 className="text-3xl font-bold mt-4">{user_profile.full_name}</h1>
                            <p className="text-base text-[color:var(--tr-text-muted)] mt-2">{user_profile.bio || 'Profesyonel saç kesimi ve sakal tasarımı.'}</p>
                           
                            <div className="grid grid-cols-3 gap-4 text-center p-4 mt-4 w-full">
                                {stats.map(stat => (
                                    <div key={stat.label}>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-[color:var(--tr-text-muted)]">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </header>

                        <div className="p-6 rounded-2xl bg-[color:var(--tr-bg-soft)] border border-[color:var(--tr-border-strong)] space-y-4">
                             <h2 className="text-lg font-semibold flex items-center gap-2"><ImageIcon size={20}/> Portföy</h2>
                             {posts.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {posts.slice(0, 9).map(post => (
                                        <div key={post.id} className="aspect-square bg-[color:var(--tr-bg-elevated)] rounded-md overflow-hidden">
                                           <img src={post.image_url} alt={post.caption || 'Barber post'} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-[color:var(--tr-text-muted)] py-4">Henüz portföyde bir çalışma yok.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column - Appointment Calendar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <AppointmentCalendar
                            barberId={barber.id}
                            shopId={barber.shop_id}
                            barberWorkingHours={{
                                startTime: barber.start_time,
                                endTime: barber.end_time,
                                lunchStart: barber.lunch_start,
                                lunchEnd: barber.lunch_end,
                                daysOff: barber.days_off,
                            }}
                        />
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default BarberPublicProfile;
