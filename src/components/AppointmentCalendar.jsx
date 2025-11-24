import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppointmentCalendar = ({ selectedDate, setSelectedDate }) => {

    // Simple placeholder logic for calendar grid
    const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const today = new Date('2025-11-18');
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const startingDay = (firstDayOfMonth.getDay() + 6) % 7; // 0=Pzt, 6=Paz

    const calendarDays = Array.from({ length: startingDay }, () => null)
        .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
        
    const getDayClass = (day) => {
        if (!day) return '';
        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        const isToday = day === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear();
        const isSelected = day === selectedDate.getDate();
        
        return cn(
            "w-full aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors",
            isSelected ? 'bg-[color:var(--tr-accent)] text-white' : 'hover:bg-[color:var(--tr-bg-elevated)]',
            isToday && !isSelected ? 'border border-[color:var(--tr-accent-soft)]' : ''
        );
    }
    
    const changeMonth = (offset) => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1));
    };

    return (
        <div className="p-6 bg-[color:var(--tr-bg-soft)] rounded-xl border border-[color:var(--tr-border-strong)]">
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold capitalize">
                    {selectedDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} className="h-8 w-8 bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border-strong)]"><ChevronLeft size={16} /></Button>
                    <Button variant="outline" size="icon" onClick={() => changeMonth(1)} className="h-8 w-8 bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border-strong)]"><ChevronRight size={16} /></Button>
                </div>
            </header>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-[color:var(--tr-text-muted)]">
                {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
                {calendarDays.map((day, i) => (
                    <div key={i} onClick={() => day && setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))} className={getDayClass(day)}>
                        {day && (
                            <>
                                <span className="text-sm">{day}</span>
                                <div className="flex gap-0.5 mt-1">
                                    {Math.random() > 0.3 && <div className="w-1 h-1 rounded-full bg-green-500" title="Uygun"></div>}
                                    {Math.random() > 0.7 && <div className="w-1 h-1 rounded-full bg-red-500" title="Dolu"></div>}
                                    {Math.random() > 0.9 && <div className="w-1 h-1 rounded-full bg-gray-500" title="Mola"></div>}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppointmentCalendar;