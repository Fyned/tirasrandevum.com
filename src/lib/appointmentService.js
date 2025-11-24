import { supabase } from '@/lib/supabaseClient';
import { generateTimeSlots } from '@/utils/appointmentHelpers';

/**
 * Creates a new appointment.
 * @param {object} appointmentData - The appointment data.
 * @returns {Promise<object>} - The created appointment data.
 */
export const createAppointment = async (appointmentData) => {
    const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

    if (error) {
        console.error('Error creating appointment:', error);
        throw new Error(error.message);
    }
    return data;
};

/**
 * Fetches all appointments for a given barber from a specific date onwards.
 * @param {string} barber_id - The UUID of the barber.
 * @param {Date} fromDate - The starting date to fetch appointments from.
 * @returns {Promise<Array>} - An array of appointment objects.
 */
export const getBarberAppointments = async (barber_id, fromDate) => {
    const fromDateString = fromDate.toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barber_id)
        .gte('starts_at', `${fromDateString}T00:00:00Z`);

    if (error) {
        console.error('Error fetching barber appointments:', error);
        throw new Error(error.message);
    }
    return data;
};

/**
 * Checks if a specific time slot conflicts with existing appointments.
 * @param {string} barber_id - The UUID of the barber.
 * @param {string} starts_at - The ISO string of the start time.
 * @param {string} ends_at - The ISO string of the end time.
 * @returns {Promise<boolean>} - True if there is a conflict, false otherwise.
 */
export const checkSlotConflict = async (barber_id, starts_at, ends_at) => {
    const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('barber_id', barber_id)
        .or(`status.eq.confirmed,status.eq.pending`)
        .lt('starts_at', ends_at)
        .gt('ends_at', starts_at);

    if (error) {
        console.error('Error checking slot conflict:', error);
        throw error;
    }
    return data.length > 0;
};

/**
 * Gets available time slots for a barber on a specific date.
 * @param {string} barber_id - The UUID of the barber.
 * @param {Date} date - The date to check for available slots.
 * @returns {Promise<Array>} - An array of available time slot strings.
 */
export const getAvailableSlots = async (barber_id, date) => {
    // 1. Fetch barber's schedule and existing appointments for the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const { data: barber, error: barberError } = await supabase
        .from('barbers')
        .select('start_time, end_time, lunch_start, lunch_end, days_off')
        .eq('id', barber_id)
        .single();

    if (barberError) throw new Error("Berberin çalışma programı alınamadı.");

    const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('starts_at, ends_at')
        .eq('barber_id', barber_id)
        .or(`status.eq.confirmed,status.eq.pending`)
        .gte('starts_at', dayStart.toISOString())
        .lte('starts_at', dayEnd.toISOString());

    if (appointmentsError) throw new Error("Randevular alınamadı.");

    // 2. Check if it's a day off
    const weekdays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayOfWeek = weekdays[date.getDay()];
    if (barber.days_off?.includes(dayOfWeek)) {
        return []; // It's a day off
    }

    // 3. Generate all possible slots for the working hours
    const allSlots = generateTimeSlots(barber.start_time.substring(0, 5), barber.end_time.substring(0, 5), 30);

    // 4. Filter out lunch break
    const lunchStart = barber.lunch_start.substring(0, 5);
    const lunchEnd = barber.lunch_end.substring(0, 5);
    const availableSlots = allSlots.filter(slot => slot < lunchStart || slot >= lunchEnd);

    // 5. Filter out booked slots
    const bookedSlots = new Set();
    appointments.forEach(appt => {
        const startTime = new Date(appt.starts_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        bookedSlots.add(startTime);
    });

    const finalSlots = availableSlots.filter(slot => !bookedSlots.has(slot));

    return finalSlots;
};

/**
 * Updates the status of an appointment.
 * @param {string} appointment_id - The UUID of the appointment.
 * @param {string} status - The new status.
 * @returns {Promise<object>} - The updated appointment data.
 */
export const updateAppointmentStatus = async (appointment_id, status) => {
    const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointment_id)
        .select()
        .single();

    if (error) {
        console.error('Error updating appointment status:', error);
        throw new Error(error.message);
    }
    return data;
};