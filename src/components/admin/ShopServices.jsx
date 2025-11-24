
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit, Trash2, Loader2, CheckCircle, XCircle, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ServiceForm from './ServiceForm';

const ShopServices = ({ shopId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const { toast } = useToast();

  const loadServices = useCallback(async () => {
    if (!shopId) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', shopId)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Hizmetler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleCreate = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceToDelete.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Hizmet başarıyla silindi.",
      });
      loadServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Hizmet silinirken bir hata oluştu.",
      });
    } finally {
      setServiceToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <ServiceForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadServices}
        shopId={shopId}
        service={selectedService}
      />

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <AlertDialogContent className="bg-[color:var(--tr-bg-surface)] border-[color:var(--tr-border-strong)] text-[color:var(--tr-text)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-[color:var(--tr-text-muted)]">
              "{serviceToDelete?.name}" hizmetini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[color:var(--tr-border)] hover:bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)]">İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg text-[color:var(--tr-text)]">Hizmet Listesi</h3>
          <p className="text-xs text-[color:var(--tr-text-muted)]">
            Bu işletme için tanımlanmış hizmetler
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[color:var(--tr-accent)] text-white hover:bg-[color:var(--tr-accent)]/90 h-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Hizmet
        </Button>
      </div>

      <div className="panel-surface rounded-2xl border border-[color:var(--tr-border-subtle)] bg-[color:var(--tr-bg-surface)] overflow-hidden">
        {loading && (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-[color:var(--tr-accent)]" />
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-400 bg-red-500/10 m-4 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="p-12 text-center text-[color:var(--tr-text-muted)]">
            <Scissors className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Henüz tanımlanmış hizmet bulunmuyor.</p>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[color:var(--tr-text-muted)] uppercase bg-[color:var(--tr-bg-elevated)] border-b border-[color:var(--tr-border-subtle)]">
                <tr>
                  <th className="px-6 py-3">Hizmet Adı</th>
                  <th className="px-6 py-3">Süre</th>
                  <th className="px-6 py-3">Fiyat</th>
                  <th className="px-6 py-3 text-center">Durum</th>
                  <th className="px-6 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {services.map((service, index) => (
                    <motion.tr
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[color:var(--tr-border-subtle)] hover:bg-[color:var(--tr-bg-elevated)] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-[color:var(--tr-text)]">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 text-[color:var(--tr-text-muted)]">
                        {service.duration_minutes} dk
                      </td>
                      <td className="px-6 py-4 text-[color:var(--tr-text-muted)]">
                        {service.price ? `${service.price} TL` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {service.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle size={12} /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                            <XCircle size={12} /> Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(service)}
                            className="h-8 w-8 p-0 hover:bg-[color:var(--tr-accent)]/20 hover:text-[color:var(--tr-accent)]"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(service)}
                            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopServices;
