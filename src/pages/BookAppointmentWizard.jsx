
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  MapPin
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const steps = [
  { id: 1, title: 'Hizmet', icon: Scissors },
  { id: 2, title: 'Berber', icon: User },
  { id: 3, title: 'Tarih', icon: Calendar },
  { id: 4, title: 'Saat & Onay', icon: Clock },
];

const BookAppointmentWizard = () => {
  const { shopCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data State
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initial Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // 1. Get Shop
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('public_code', shopCode)
          .single();

        if (shopError) throw shopError;
        if (!shopData) throw new Error('Salon bulunamadı');
        setShop(shopData);

        // 2. Get Services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('shop_id', shopData.id)
          .eq('is_active', true)
          .order('sort_order');

        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        // 3. Get Barbers
        const { data: barbersData, error: barbersError } = await supabase
          .from('barbers')
          .select('*')
          .eq('shop_id', shopData.id)
          .eq('is_active', true);

        if (barbersError) throw barbersError;
        setBarbers(barbersData || []);

      } catch (err) {
        console.error('Error fetching wizard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (shopCode) {
      fetchInitialData();
    }
  }, [shopCode]);

  // Fetch Slots when entering Step 4
  useEffect(() => {
    const fetchSlots = async () => {
      if (currentStep === 4 && selectedBarber && selectedDate && selectedService && shop) {
        setSlotsLoading(true);
        setAvailableSlots([]);
        setSelectedSlot(null); // Reset selection when fetching new slots
        
        try {
          // Format date as YYYY-MM-DD
          const dateStr = selectedDate.dateString;
          
          // Call RPC
          const { data, error } = await supabase.rpc('get_available_slots', {
            p_barber_id: selectedBarber.id, // RPC expects p_barber_id first based on definition, but named params are safer
            p_date: dateStr,
            p_duration_minutes: selectedService.duration_minutes,
          });

          if (error) throw error;
          
          // Format slots for display (HH:MM)
          const formattedSlots = (data || []).map(slot => {
            // slot.slot_time comes as "HH:MM:SS" usually from Postgres time type
            const timeParts = slot.slot_time.split(':');
            const displayTime = `${timeParts[0]}:${timeParts[1]}`;
            return {
              ...slot,
              displayTime
            };
          });
          
          setAvailableSlots(formattedSlots);
        } catch (err) {
          console.error('Error fetching slots:', err);
          toast({
            variant: "destructive",
            title: "Hata",
            description: "Uygun saatler getirilemedi: " + err.message,
          });
        } finally {
          setSlotsLoading(false);
        }
      }
    };

    fetchSlots();
  }, [currentStep, selectedBarber, selectedDate, selectedService, shop, toast]);

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    handleNextStep();
  };

  const handleBarberSelect = (barber) => {
    setSelectedBarber(barber);
    handleNextStep();
  };

  const handleDateSelect = (dateObj) => {
    setSelectedDate(dateObj);
    handleNextStep();
  };

  const handleSlotSelect = (slot) => {
    if (slot.is_available) {
      setSelectedSlot(slot);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) {
      toast({
        variant: "destructive",
        title: "Saat Seçimi",
        description: "Lütfen bir randevu saati seçiniz.",
      });
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Eksik Bilgi",
        description: "Lütfen adınızı ve telefon numaranızı giriniz.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Construct ISO timestamps
      // selectedDate.dateString is YYYY-MM-DD
      // selectedSlot.slot_time is HH:MM:SS
      const startsAt = `${selectedDate.dateString}T${selectedSlot.slot_time}`;
      
      // Calculate ends_at
      const startDate = new Date(startsAt);
      const endDate = new Date(startDate.getTime() + selectedService.duration_minutes * 60000);
      
      // Adjust for timezone offset if necessary, but usually ISO string is safe if we treat input as local time
      // For simplicity in this context, we'll send the ISO string directly. 
      // Ideally, handle timezones robustly. Here we assume shop local time matches server expectation or use UTC.
      // Let's use the constructed string directly for starts_at to preserve the selected "wall clock" time
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          shop_id: shop.id,
          barber_id: selectedBarber.id,
          service_id: selectedService.id,
          starts_at: startsAt, // Postgres will interpret this based on server timezone or as provided
          ends_at: endDate.toISOString().split('.')[0], // Simple ISO format without ms
          status: 'pending',
          customer_name: customerName,
          customer_phone: customerPhone,
          service_type: selectedService.name // Optional: store service name for easier display
        });

      if (error) throw error;

      toast({
        title: "Randevu Oluşturuldu!",
        description: "Randevunuz başarıyla alındı.",
        className: "bg-green-600 text-white border-none"
      });

      // Redirect to shop page after short delay
      setTimeout(() => {
        navigate(`/salon/${shopCode}`);
      }, 1500);

    } catch (err) {
      console.error('Booking error:', err);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        dateString: d.toISOString().split('T')[0],
        dayName: new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(d),
        dayNumber: d.getDate(),
        monthName: new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(d),
        fullDate: d
      });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--tr-bg)]">
        <Loader2 className="h-10 w-10 animate-spin text-[color:var(--tr-accent)]" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--tr-bg)] p-4">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-500">Hata</h1>
          <p className="text-[color:var(--tr-text-muted)] mt-2">{error || 'Salon bulunamadı'}</p>
          <Button onClick={() => navigate(-1)} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Randevu Al - {shop.name}</title>
      </Helmet>
      
      <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--tr-bg)] text-[color:var(--tr-text)] pb-20">
        {/* Header / Stepper */}
        <div className="sticky top-0 z-10 bg-[color:var(--tr-bg)]/95 backdrop-blur-sm border-b border-[color:var(--tr-border-subtle)] pt-4 pb-4 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              {currentStep > 1 ? (
                <Button variant="ghost" size="sm" onClick={handlePrevStep} className="text-[color:var(--tr-text-muted)] hover:text-[color:var(--tr-text)]">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Geri
                </Button>
              ) : (
                <div className="w-16"></div> // Spacer
              )}
              <h1 className="font-semibold text-lg">{shop.name}</h1>
              <div className="w-16"></div> // Spacer
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between items-center relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[color:var(--tr-border-strong)] -z-10" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[color:var(--tr-accent)] -z-10 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
              
              {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 bg-[color:var(--tr-bg)] px-2">
                    <div 
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isActive || isCompleted 
                          ? 'bg-[color:var(--tr-accent)] border-[color:var(--tr-accent)] text-white' 
                          : 'bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border-strong)] text-[color:var(--tr-text-muted)]'}
                      `}
                    >
                      {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-[color:var(--tr-accent)]' : 'text-[color:var(--tr-text-muted)]'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-3xl mx-auto p-4 mt-4">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SERVICES */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold mb-4">Hizmet Seçin</h2>
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="w-full text-left p-4 rounded-xl bg-[color:var(--tr-bg-surface)] border border-[color:var(--tr-border-subtle)] hover:border-[color:var(--tr-accent)] hover:bg-[color:var(--tr-bg-elevated)] transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-[color:var(--tr-accent)] transition-colors">{service.name}</h3>
                          <p className="text-sm text-[color:var(--tr-text-muted)]">{service.duration_minutes} dakika</p>
                        </div>
                        <span className="font-bold text-[color:var(--tr-accent)]">{service.price ? `${service.price} TL` : ''}</span>
                      </div>
                    </button>
                  ))}
                  {services.length === 0 && (
                    <div className="text-center p-8 text-[color:var(--tr-text-muted)]">
                      Bu salon için tanımlı hizmet bulunamadı.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: BARBERS */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold mb-4">Berber Seçin</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {barbers.map((barber) => (
                    <button
                      key={barber.id}
                      onClick={() => handleBarberSelect(barber)}
                      className="flex flex-col items-center p-6 rounded-xl bg-[color:var(--tr-bg-surface)] border border-[color:var(--tr-border-subtle)] hover:border-[color:var(--tr-accent)] hover:bg-[color:var(--tr-bg-elevated)] transition-all text-center group"
                    >
                      <div className="w-20 h-20 rounded-full bg-[color:var(--tr-bg-elevated)] mb-4 overflow-hidden border-2 border-[color:var(--tr-border-strong)] group-hover:border-[color:var(--tr-accent)]">
                        {barber.avatar_url ? (
                          <img src={barber.avatar_url} alt={barber.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[color:var(--tr-text-muted)]">
                            <User size={32} />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold group-hover:text-[color:var(--tr-accent)] transition-colors">
                        {barber.display_name || 'İsimsiz Berber'}
                      </h3>
                    </button>
                  ))}
                  {barbers.length === 0 && (
                    <div className="col-span-full text-center p-8 text-[color:var(--tr-text-muted)]">
                      Bu salon için aktif berber bulunamadı.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: DATE */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold mb-4">Tarih Seçin</h2>
                <div className="grid gap-3">
                  {getNext7Days().map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day)}
                      className="w-full flex items-center p-4 rounded-xl bg-[color:var(--tr-bg-surface)] border border-[color:var(--tr-border-subtle)] hover:border-[color:var(--tr-accent)] hover:bg-[color:var(--tr-bg-elevated)] transition-all group"
                    >
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[color:var(--tr-bg-elevated)] border border-[color:var(--tr-border-strong)] mr-4 group-hover:border-[color:var(--tr-accent)] group-hover:text-[color:var(--tr-accent)]">
                        <span className="text-xs font-medium uppercase">{day.monthName}</span>
                        <span className="text-lg font-bold leading-none">{day.dayNumber}</span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">{day.dayName}</h3>
                        <p className="text-sm text-[color:var(--tr-text-muted)]">Müsaitlik durumunu gör</p>
                      </div>
                      <ChevronLeft className="ml-auto rotate-180 text-[color:var(--tr-text-muted)] group-hover:text-[color:var(--tr-accent)]" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: SLOTS & CONFIRM */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Summary Card */}
                <div className="p-4 rounded-xl bg-[color:var(--tr-bg-elevated)] border border-[color:var(--tr-border-strong)] flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Scissors size={16} className="text-[color:var(--tr-accent)]" />
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[color:var(--tr-accent)]" />
                    <span className="font-medium">{selectedBarber?.display_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[color:var(--tr-accent)]" />
                    <span className="font-medium">{selectedDate?.dayName}, {selectedDate?.dayNumber} {selectedDate?.monthName}</span>
                  </div>
                </div>

                {/* Slots Grid */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock size={18} /> Saat Seçin
                  </h3>
                  {slotsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-[color:var(--tr-accent)]" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          disabled={!slot.is_available}
                          onClick={() => handleSlotSelect(slot)}
                          className={`
                            py-3 px-2 rounded-lg text-sm font-bold border transition-all shadow-sm
                            ${!slot.is_available 
                              ? 'bg-red-500/10 border-red-500/20 text-red-400 opacity-60 cursor-not-allowed' 
                              : selectedSlot?.slot_time === slot.slot_time
                                ? 'bg-green-600 border-green-600 text-white shadow-lg scale-105 ring-2 ring-green-400 ring-offset-2 ring-offset-[color:var(--tr-bg)]'
                                : 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white hover:border-green-500'}
                          `}
                        >
                          {slot.displayTime}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[color:var(--tr-text-muted)] bg-[color:var(--tr-bg-surface)] rounded-xl border border-[color:var(--tr-border-subtle)]">
                      Seçilen tarih için uygun saat bulunamadı.
                    </div>
                  )}
                </div>

                {/* Customer Info Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t border-[color:var(--tr-border-subtle)]"
                >
                  <h3 className="font-semibold mb-3">İletişim Bilgileri</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Ad Soyad <span className="text-red-500">*</span></Label>
                      <Input 
                        id="name" 
                        placeholder="Adınız Soyadınız" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="bg-[color:var(--tr-bg-surface)] border-[color:var(--tr-border-strong)]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon Numarası <span className="text-red-500">*</span></Label>
                      <Input 
                        id="phone" 
                        placeholder="05XX XXX XX XX" 
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="bg-[color:var(--tr-bg-surface)] border-[color:var(--tr-border-strong)]"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitting || !selectedSlot}
                    className={`w-full h-12 text-lg mt-4 transition-all ${
                      selectedSlot 
                        ? 'bg-[color:var(--tr-accent)] hover:bg-[color:var(--tr-accent)]/90 text-white' 
                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> İşleniyor...
                      </>
                    ) : (
                      'Randevuyu Onayla'
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default BookAppointmentWizard;
