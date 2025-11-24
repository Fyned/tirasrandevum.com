import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, Phone, FileText, Loader2, Check, X, Trash2 } from 'lucide-react';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import { appointmentConfig } from '@/config/appointmentConfig';
import { useAppointments } from '@/hooks/useAppointments';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';

const BarberAppointmentSystem = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const { createAppointment, getBarberAppointments, updateStatus, loading: appointmentsLoading } = useAppointments();
    
    const [selectedDate, setSelectedDate] = useState(new Date('2025-11-18'));
    const [appointments, setAppointments] = useState([]);
    const [barberId, setBarberId] = useState(null);

    const fetchAppointments = useCallback(async () => {
        if (!barberId) return;
        try {
            const data = await getBarberAppointments(barberId, selectedDate);
            const filteredData = data.filter(a => {
                const apptDate = new Date(a.starts_at);
                // Adjust for timezone offset to compare dates correctly
                const apptDateLocal = new Date(apptDate.valueOf() + apptDate.getTimezoneOffset() * 60 * 1000);
                return apptDateLocal.toDateString() === selectedDate.toDateString();
            });
            setAppointments(filteredData);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Randevular yüklenemedi",
                description: error.message,
            });
        }
    }, [barberId, selectedDate, getBarberAppointments, toast]);

    useEffect(() => {
        const getBarberId = async () => {
            if (user) {
                const { data, error } = await supabase.from('barbers').select('id').eq('user_id', user.id).maybeSingle();
                if (error) {
                    console.error("Error fetching barber ID:", error);
                    toast({
                        variant: "destructive",
                        title: "Berber bilgisi alınamadı",
                        description: error.message,
                    });
                    return;
                }
                if (data) setBarberId(data.id);
            }
        };
        getBarberId();
    }, [user, toast]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const result = await updateStatus(id, newStatus);
            if (result) {
                toast({ title: "Başarılı", description: `Randevu durumu '${newStatus}' olarak güncellendi.` });
                fetchAppointments();
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Durum güncellenemedi",
                description: error.message,
            });
        }
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-full"><p className="text-[color:var(--tr-text-muted)]">Yükleniyor...</p></div>;
    }
    
    if (!profile || profile.role !== 'barber') {
        return <Navigate to="/giris" replace />;
    }

    return (
        <>
            <Helmet>
                <title>Randevu Sistemi - Tıraş Randevum</title>
                <meta name="description" content="Randevularınızı yönetin, yeni randevular oluşturun." />
            </Helmet>
            <div className="p-4 sm:p-6 md:p-8 bg-[color:var(--tr-bg)] min-h-full text-[color:var(--tr-text)]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <AppointmentCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                        
                        <Card className="bg-[color:var(--tr-bg-soft)] border-[color:var(--tr-border-strong)]">
                            <CardHeader>
                                <CardTitle className="text-xl md:text-2xl">Randevular - {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {appointmentsLoading ? <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div> :
                                appointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {appointments.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)).map(appt => (
                                            <AppointmentItem key={appt.id} appointment={appt} onStatusUpdate={handleStatusUpdate} />
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-center text-[color:var(--tr-text-muted)] py-8">Bu tarih için randevu bulunmuyor.</p>}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <ManualAppointmentForm barberId={barberId} onAppointmentCreated={fetchAppointments} />
                    </div>
                </div>
            </div>
        </>
    );
};

const AppointmentItem = ({ appointment, onStatusUpdate }) => {
    const formatTime = (iso) => new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    const statusStyles = {
        pending: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
        confirmed: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
        completed: 'border-green-500/50 bg-green-500/10 text-green-300',
        cancelled: 'border-red-500/50 bg-red-500/10 text-red-300',
    };

    return (
        <div className={`p-4 rounded-lg border ${statusStyles[appointment.status] || 'border-gray-500/50'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                    <p className="font-bold text-base md:text-lg">{appointment.customer_name || 'Kayıtlı Müşteri'}</p>
                    <p className="text-sm text-[color:var(--tr-text-muted)]">{appointment.customer_phone || 'Telefon yok'}</p>
                    <p className="text-sm mt-1">{appointment.service_type}</p>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="font-semibold text-lg md:text-xl">{formatTime(appointment.starts_at)}</p>
                    <p className="text-xs capitalize px-2 py-0.5 rounded-full inline-block mt-1" style={{backgroundColor: statusStyles[appointment.status].split(' ')[1], color: statusStyles[appointment.status].split(' ')[2]}}>{appointment.status}</p>
                </div>
            </div>
            {appointment.status === 'pending' && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-current/20">
                    <Button size="sm" className="flex-1 min-h-11 bg-green-500/20 text-green-300 hover:bg-green-500/30" onClick={() => onStatusUpdate(appointment.id, 'confirmed')}><Check size={16} className="mr-1"/> Onayla</Button>
                    <Button size="sm" variant="destructive" className="flex-1 min-h-11" onClick={() => onStatusUpdate(appointment.id, 'cancelled')}><X size={16} className="mr-1"/> Reddet</Button>
                </div>
            )}
             {appointment.status === 'confirmed' && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-current/20">
                    <Button size="sm" className="flex-1 min-h-11 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" onClick={() => onStatusUpdate(appointment.id, 'completed')}><Check size={16} className="mr-1"/> Tamamlandı</Button>
                    <Button size="sm" variant="destructive" className="flex-1 min-h-11" onClick={() => onStatusUpdate(appointment.id, 'cancelled')}><Trash2 size={16} className="mr-1"/> İptal Et</Button>
                </div>
            )}
        </div>
    );
};

const ManualAppointmentForm = ({ barberId, onAppointmentCreated }) => {
    const { createAppointment, loading } = useAppointments();
    const { toast } = useToast();
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [date, setDate] = useState(new Date('2025-11-18').toISOString().split('T')[0]);
    const [time, setTime] = useState('09:00');
    const [service, setService] = useState(appointmentConfig.services[0].name);
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!barberId) {
            toast({ variant: "destructive", title: "Hata", description: "Berber ID bulunamadı." });
            return;
        }

        const serviceDetails = appointmentConfig.services.find(s => s.name === service);
        if (!serviceDetails) {
            toast({ variant: "destructive", title: "Hata", description: "Geçersiz hizmet türü seçildi." });
            return;
        }

        const startsAt = new Date(`${date}T${time}:00`);
        const endsAt = new Date(startsAt.getTime() + serviceDetails.duration * 60000);

        try {
            const result = await createAppointment({
                barber_id: barberId,
                customer_name: customerName,
                customer_phone: customerPhone,
                starts_at: startsAt.toISOString(),
                ends_at: endsAt.toISOString(),
                status: 'confirmed', // Manual entries are auto-confirmed
                service_type: service,
                notes,
            });
    
            if (result) {
                toast({ title: "Başarılı", description: "Randevu manuel olarak oluşturuldu." });
                onAppointmentCreated();
                setCustomerName('');
                setCustomerPhone('');
                setNotes('');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Randevu oluşturulamadı",
                description: error.message,
            });
        }
    };

    return (
        <Card className="bg-[color:var(--tr-bg-soft)] border-[color:var(--tr-border-strong)]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl"><Plus size={20} /> Manuel Randevu</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><Label htmlFor="customerName" className="flex items-center gap-2"><User size={14}/> Ad Soyad</Label><Input id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1" autoComplete="name"/></div>
                    <div><Label htmlFor="customerPhone" className="flex items-center gap-2"><Phone size={14}/> Telefon</Label><Input id="customerPhone" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required className="mt-1" autoComplete="tel"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="date">Tarih</Label><Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1"/></div>
                        <div><Label htmlFor="time">Saat</Label><Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1"/></div>
                    </div>
                    <div>
                        <Label htmlFor="manual-service">Hizmet</Label>
                        <select id="manual-service" value={service} onChange={e => setService(e.target.value)} className="mt-1 h-12 w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] px-3 py-2 text-sm">
                            {appointmentConfig.services.map(s => <option key={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div><Label htmlFor="notes" className="flex items-center gap-2"><FileText size={14}/> Notlar</Label><textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows="2" className="mt-1 w-full rounded-md border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-elevated)] p-2 text-sm"></textarea></div>
                    <Button type="submit" disabled={loading} className="w-full min-h-11 bg-[color:var(--tr-accent)] hover:bg-[color:var(--tr-accent)]/90 text-white">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Randevu Oluştur
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default BarberAppointmentSystem;