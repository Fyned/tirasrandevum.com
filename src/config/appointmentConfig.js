export const appointmentConfig = {
  services: [
    { name: 'Saç Kesimi', duration: 30, price: 150 },
    { name: 'Sakal Tıraşı', duration: 30, price: 100 },
    { name: 'Cilt Bakımı', duration: 45, price: 200 },
    { name: 'Kombo (Saç + Sakal)', duration: 60, price: 300 },
  ],
  slotDuration: 30, // minutes
  appointmentStatuses: [
    'pending', // Beklemede
    'confirmed', // Onaylandı
    'completed', // Tamamlandı
    'cancelled', // İptal Edildi
  ],
};