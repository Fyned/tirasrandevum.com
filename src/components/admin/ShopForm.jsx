
import React, { useState, useEffect } from 'react';
import { X, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateShopCode } from '@/utils/shopHelpers';

const ShopForm = ({ isOpen, onClose, onSuccess, shop = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    public_code: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (shop) {
        setFormData({
          name: shop.name || '',
          phone: shop.phone || '',
          city: shop.city || '',
          address: shop.address || '',
          public_code: shop.public_code || '',
          is_active: shop.is_active
        });
      } else {
        // Reset form for new shop
        setFormData({
          name: '',
          phone: '',
          city: '',
          address: '',
          public_code: '',
          is_active: true
        });
        // Auto-generate code for new shop
        handleGenerateCode();
      }
      setError(null);
    }
  }, [isOpen, shop]);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      let unique = false;
      let code = '';
      let attempts = 0;
      
      while (!unique && attempts < 5) {
        code = generateShopCode();
        const { data, error } = await supabase
          .from('shops')
          .select('id')
          .eq('public_code', code)
          .maybeSingle();
          
        if (!data && !error) {
          unique = true;
        }
        attempts++;
      }

      if (unique) {
        setFormData(prev => ({ ...prev, public_code: code }));
      } else {
        setError('Benzersiz kod oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('Code generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate public_code uniqueness if changed
      if (formData.public_code) {
        const { data: existingShop } = await supabase
          .from('shops')
          .select('id')
          .eq('public_code', formData.public_code)
          .neq('id', shop?.id || '00000000-0000-0000-0000-000000000000') // Exclude current shop if editing
          .maybeSingle();

        if (existingShop) {
          throw new Error('Bu işletme kodu başka bir işletme tarafından kullanılıyor.');
        }
      }

      const payload = {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        public_code: formData.public_code,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      let result;
      if (shop) {
        // Update
        result = await supabase
          .from('shops')
          .update(payload)
          .eq('id', shop.id)
          .select()
          .single();
      } else {
        // Create
        result = await supabase
          .from('shops')
          .insert([{ ...payload, created_at: new Date().toISOString() }])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving shop:', err);
      setError(err.message || 'İşletme kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-[color:var(--tr-bg-surface)] border border-[color:var(--tr-border-strong)] shadow-2xl bg-[#1a1f2e] text-white">
        <div className="flex items-center justify-between border-b border-[color:var(--tr-border-subtle)] p-4">
          <h2 className="text-lg font-semibold">
            {shop ? 'İşletmeyi Düzenle' : 'Yeni İşletme Ekle'}
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
            <Label htmlFor="name">İşletme Adı</Label>
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
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="public_code" className="flex items-center gap-2">
              İşletme Kodu (Public Code)
              <span className="text-xs text-gray-400 font-normal">(Müşterilerle paylaşılır)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="public_code"
                name="public_code"
                value={formData.public_code}
                onChange={handleChange}
                placeholder="TR-XXXXXX"
                className="bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border)] font-mono tracking-wider uppercase"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGenerateCode}
                disabled={generating}
                className="shrink-0 border-[color:var(--tr-border)] hover:bg-[color:var(--tr-bg-elevated)]"
                title="Yeni kod oluştur"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Bu kod benzersiz olmalıdır. Otomatik oluşturmak için butonu kullanabilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-accent)] focus:ring-[color:var(--tr-accent)]"
            />
            <Label htmlFor="is_active" className="cursor-pointer">Aktif İşletme</Label>
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
                shop ? 'Güncelle' : 'Oluştur'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopForm;
