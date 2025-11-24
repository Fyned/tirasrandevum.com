
import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const ServiceForm = ({ isOpen, onClose, onSuccess, shopId, service = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    duration_minutes: 30,
    price: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (service) {
        setFormData({
          name: service.name || '',
          duration_minutes: service.duration_minutes || 30,
          price: service.price || '',
          is_active: service.is_active
        });
      } else {
        setFormData({
          name: '',
          duration_minutes: 30,
          price: '',
          is_active: true
        });
      }
      setError(null);
    }
  }, [isOpen, service]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!shopId) throw new Error('Shop ID is missing');

      let payload = {
        shop_id: shopId,
        name: formData.name,
        duration_minutes: formData.duration_minutes,
        price: formData.price === '' ? null : formData.price,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      let result;
      if (service) {
        // Update
        result = await supabase
          .from('services')
          .update(payload)
          .eq('id', service.id)
          .select()
          .single();
      } else {
        // Create - Calculate sort_order
        const { data: maxOrderData } = await supabase
          .from('services')
          .select('sort_order')
          .eq('shop_id', shopId)
          .order('sort_order', { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextSortOrder = (maxOrderData?.sort_order || 0) + 1;
        
        payload = {
          ...payload,
          sort_order: nextSortOrder,
          created_at: new Date().toISOString()
        };

        result = await supabase
          .from('services')
          .insert([payload])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.message || 'Hizmet kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-[color:var(--tr-bg-surface)] border border-[color:var(--tr-border-strong)] shadow-2xl bg-[#1a1f2e] text-white">
        <div className="flex items-center justify-between border-b border-[color:var(--tr-border-subtle)] p-4">
          <h2 className="text-lg font-semibold">
            {service ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Hizmet Adı</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Süre (Dakika)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="5"
                step="5"
                value={formData.duration_minutes}
                onChange={handleChange}
                required
                className="bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Fiyat (TL)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="is_active" className="cursor-pointer">Aktif Hizmet</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[color:var(--tr-border-subtle)] mt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="bg-[color:var(--tr-accent)] hover:bg-[color:var(--tr-accent)]/90 text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor
                </>
              ) : (
                service ? 'Güncelle' : 'Oluştur'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
