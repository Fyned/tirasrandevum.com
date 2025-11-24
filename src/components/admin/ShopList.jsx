
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit, Copy, Store, MapPin, Phone, CheckCircle, XCircle, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ShopForm from './ShopForm';
import ShopServices from './ShopServices';

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const { toast } = useToast();

  const loadShops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setShops(data);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('İşletmeler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const handleCreate = () => {
    setSelectedShop(null);
    setIsModalOpen(true);
  };

  const handleEdit = (shop) => {
    setSelectedShop(shop);
    setIsModalOpen(true);
  };

  const handleManageServices = (shop) => {
    setSelectedShop(shop);
    setIsServicesModalOpen(true);
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast({
      title: "Kopyalandı",
      description: "İşletme kodu panoya kopyalandı.",
      duration: 2000,
    });
  };

  return (
    <div className="space-y-6">
      <ShopForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadShops}
        shop={selectedShop}
      />

      <Dialog open={isServicesModalOpen} onOpenChange={setIsServicesModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[color:var(--tr-bg)] border-[color:var(--tr-border-strong)] text-[color:var(--tr-text)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Store className="w-5 h-5 text-[color:var(--tr-accent)]" />
              {selectedShop?.name} - Hizmet Yönetimi
            </DialogTitle>
          </DialogHeader>
          {selectedShop && <ShopServices shopId={selectedShop.id} />}
        </DialogContent>
      </Dialog>

      <div className="panel-surface rounded-lg border border-[color:var(--tr-border-strong)] bg-[color:var(--tr-bg-soft)]">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-[color:var(--tr-text)]">İşletmeler</h3>
            <p className="text-xs text-[color:var(--tr-text-muted)]">
              {loading ? 'Yükleniyor...' : `${shops.length} işletme bulundu`}
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[color:var(--tr-accent)] text-white hover:bg-[color:var(--tr-accent)]/90 h-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni İşletme
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="panel-surface rounded-2xl border border-[color:var(--tr-border-subtle)] bg-[color:var(--tr-bg-surface)] overflow-hidden"
      >
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

        {!loading && !error && shops.length === 0 && (
          <div className="p-12 text-center text-[color:var(--tr-text-muted)]">
            <Store className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Henüz kayıtlı işletme bulunmuyor.</p>
          </div>
        )}

        {!loading && !error && shops.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[color:var(--tr-text-muted)] uppercase bg-[color:var(--tr-bg-elevated)] border-b border-[color:var(--tr-border-subtle)]">
                <tr>
                  <th className="px-6 py-3">İşletme Adı</th>
                  <th className="px-6 py-3">İletişim</th>
                  <th className="px-6 py-3">Konum</th>
                  <th className="px-6 py-3">İşletme Kodu</th>
                  <th className="px-6 py-3 text-center">Durum</th>
                  <th className="px-6 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {shops.map((shop, index) => (
                    <motion.tr
                      key={shop.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[color:var(--tr-border-subtle)] hover:bg-[color:var(--tr-bg-elevated)] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-[color:var(--tr-text)]">
                        {shop.name}
                      </td>
                      <td className="px-6 py-4 text-[color:var(--tr-text-muted)]">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {shop.phone || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[color:var(--tr-text-muted)]">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {shop.city || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {shop.public_code ? (
                          <div className="flex items-center gap-2">
                            <code className="bg-[color:var(--tr-bg-elevated)] px-2 py-1 rounded text-xs font-mono border border-[color:var(--tr-border)]">
                              {shop.public_code}
                            </code>
                            <button 
                              onClick={() => handleCopyCode(shop.public_code)}
                              className="text-[color:var(--tr-text-muted)] hover:text-white transition-colors"
                              title="Kodu Kopyala"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[color:var(--tr-text-muted)] text-xs italic">Kod Yok</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {shop.is_active ? (
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
                            onClick={() => handleManageServices(shop)}
                            className="h-8 w-8 p-0 hover:bg-[color:var(--tr-accent)]/20 hover:text-[color:var(--tr-accent)]"
                            title="Hizmetleri Yönet"
                          >
                            <Settings size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(shop)}
                            className="h-8 w-8 p-0 hover:bg-[color:var(--tr-accent)]/20 hover:text-[color:var(--tr-accent)]"
                            title="Düzenle"
                          >
                            <Edit size={16} />
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
      </motion.div>
    </div>
  );
};

export default ShopList;
