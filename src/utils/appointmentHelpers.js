import { appointmentConfig } from '@/config/appointmentConfig';

/**
 * Generates an array of time slots between a start and end time.
 * @param {string} startTime - e.g., "09:00"
 * @param {string} endTime - e.g., "18:00"
 * @param {number} intervalMinutes - e.g., 30
 * @returns {string[]} - Array of time strings.
 */
export function generateTimeSlots(startTime, endTime, intervalMinutes) {
    const slots = [];
    let currentTime = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    while (currentTime < end) {
        slots.push(currentTime.toTimeString().slice(0, 5));
        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }
    return slots;
}

/**
 * Checks if a time slot is available based on the barber's schedule.
 * @param {string} slot - The time slot to check, e.g., "14:30".
 * @param {Date} date - The date of the appointment.
 * @param {object} barberSchedule - The barber's working schedule.
 * @param {string} barberSchedule.start_time - e.g., "09:00:00"
 * @param {string} barberSchedule.end_time - e.g., "18:00:00"
 * @param {string} barberSchedule.lunch_start - e.g., "12:00:00"
 * @param {string} barberSchedule.lunch_end - e.g., "13:00:00"
 * @param {string[]} barberSchedule.days_off - e.g., ["Pazar", "Pazartesi"]
 * @returns {boolean} - True if the slot is available, false otherwise.
 */
export function isTimeSlotAvailable(slot, date, barberSchedule) {
    const weekdays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayOfWeek = weekdays[date.getDay()];
    
    // Check if it's a day off
    if (barberSchedule.days_off?.includes(dayOfWeek)) {
        return false;
    }

    const slotTime = `1970-01-01T${slot}:00`;
    const startTime = `1970-01-01T${barberSchedule.start_time}`;
    const endTime = `1970-01-01T${barberSchedule.end_time}`;
    const lunchStart = `1970-01-01T${barberSchedule.lunch_start}`;
    const lunchEnd = `1970-01-01T${barberSchedule.lunch_end}`;

    // Check if slot is within working hours
    if (slotTime < startTime || slotTime >= endTime) {
        return false;
    }

    // Check if slot is during lunch break
    if (slotTime >= lunchStart && slotTime < lunchEnd) {
        return false;
    }
    
    // Placeholder for checking against existing appointments
    // This logic will need to be implemented where appointments are fetched.
    
    return true;
}


/**
 * Formats a date and time for display.
 * @param {Date|string} date - The date object or string.
 * @param {string} time - The time string, e.g., "14:30"
 * @returns {string} - e.g., "18 Kasım 2025, 14:30"
 */
export function formatAppointmentTime(date, time) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const datePart = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${datePart}, ${time}`;
}

/**
 * Gets the duration for a given service type.
 * @param {string} serviceType - The name of the service.
 * @returns {number} - Duration in minutes.
 */
export function getServiceDuration(serviceType) {
    const service = appointmentConfig.services.find(s => s.name === serviceType);
    return service ? service.duration : 0;
}

/**
 * Gets the price for a given service type.
 * @param {string} serviceType - The name of the service.
 * @returns {number} - Price.
 */
export function getServicePrice(serviceType) {
    const service = appointmentConfig.services.find(s => s.name === serviceType);
    return service ? service.price : 0;
}