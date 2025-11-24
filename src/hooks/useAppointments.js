import { useState, useCallback } from 'react';
import {
    createAppointment as apiCreateAppointment,
    getAvailableSlots as apiGetAvailableSlots,
    getBarberAppointments as apiGetBarberAppointments,
    updateAppointmentStatus as apiUpdateAppointmentStatus,
    checkSlotConflict as apiCheckSlotConflict,
} from '@/lib/appointmentService';
import { useToast } from "@/components/ui/use-toast";

export const useAppointments = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    const createAppointment = useCallback(async (appointmentData) => {
        setLoading(true);
        setError(null);
        try {
            // Conflict check before attempting to create
            const conflict = await apiCheckSlotConflict(appointmentData.barber_id, appointmentData.starts_at, appointmentData.ends_at);
            if (conflict) {
                throw new Error("Bu zaman dilimi artık uygun değil. Lütfen başka bir zaman seçin.");
            }
            const data = await apiCreateAppointment(appointmentData);
            toast({
                title: "Randevu Oluşturuldu!",
                description: "Randevunuz başarıyla oluşturuldu.",
            });
            return data;
        } catch (err) {
            setError(err.message);
            toast({
                variant: "destructive",
                title: "Hata",
                description: err.message || "Randevu oluşturulurken bir hata oluştu.",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const getAvailableSlots = useCallback(async (barberId, date) => {
        setLoading(true);
        setError(null);
        try {
            const slots = await apiGetAvailableSlots(barberId, date);
            return slots;
        } catch (err) {
            setError(err.message);
            toast({
                variant: "destructive",
                title: "Hata",
                description: err.message || "Uygun saatler alınamadı.",
            });
            return [];
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const getBarberAppointments = useCallback(async (barberId, fromDate) => {
        setLoading(true);
        setError(null);
        try {
            const appointments = await apiGetBarberAppointments(barberId, fromDate);
            return appointments;
        } catch (err) {
            setError(err.message);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Randevular getirilirken bir hata oluştu.",
            });
            return [];
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const updateStatus = useCallback(async (appointmentId, status) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiUpdateAppointmentStatus(appointmentId, status);
            toast({
                title: "Durum Güncellendi",
                description: `Randevu durumu başarıyla "${status}" olarak değiştirildi.`,
            });
            return data;
        } catch (err) {
            setError(err.message);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Randevu durumu güncellenirken bir hata oluştu.",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    return {
        createAppointment,
        getAvailableSlots,
        getBarberAppointments,
        updateStatus,
        loading,
        error,
    };
};