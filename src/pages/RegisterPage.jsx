
import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label.jsx';
import { useAuth } from '@/context/AuthContext';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Şifreler eşleşmiyor.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone: formData.phone.trim(),
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
            setError("Bu e-posta adresi zaten kayıtlı.");
        } else if (signUpError.code === 'validation_failed' || signUpError.message.includes('check constraint "users_email_valid"')) {
            setError("Lütfen geçerli bir e-posta adresi girin.");
        } else {
            setError(signUpError.message || 'Kayıt başarısız oldu. Lütfen tekrar deneyin.');
        }
        return;
      }

      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu. Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.",
      });
      navigate('/giris'); // Redirect to login page to wait for email confirmation

    } catch (error) {
      setError(error.message || "Beklenmedik bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Kayıt Ol - Tıraş Randevum</title>
        <meta name="description" content="Tıraş Randevum'a kaydolun ve randevu sistemini kullanmaya başlayın." />
      </Helmet>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-[color:var(--tr-bg)]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="panel-surface rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[color:var(--tr-text)]">Hesap Oluştur</h1>
              <p className="text-[color:var(--tr-text-muted)] mt-2">Hemen aramıza katılın.</p>
            </div>

            <form id="signup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && <p id="signup-error" className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-md">{error}</p>}
              
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[color:var(--tr-text-muted)]">Ad Soyad</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Adınız Soyadınız"
                  {...register("fullName", { required: "Ad soyad zorunludur." })}
                  className={`bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)] focus:ring-[color:var(--tr-accent)] ${errors.fullName ? 'border-red-500' : ''}`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[color:var(--tr-text-muted)]">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  {...register("email", { required: "E-posta adresi zorunludur." })}
                   className={`bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)] focus:ring-[color:var(--tr-accent)] ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[color:var(--tr-text-muted)]">Telefon Numarası (Opsiyonel)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="555 123 4567"
                  {...register("phone")}
                  className={`bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)] focus:ring-[color:var(--tr-accent)]`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[color:var(--tr-text-muted)]">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Şifre zorunludur.", minLength: { value: 6, message: "Şifre en az 6 karakter olmalıdır." } })}
                  className={`bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)] focus:ring-[color:var(--tr-accent)] ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[color:var(--tr-text-muted)]">Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword", { required: "Şifre tekrarı zorunludur." })}
                  className={`bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)] focus:ring-[color:var(--tr-accent)] ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-[color:var(--tr-accent)] hover:brightness-110 text-white flex items-center gap-2" disabled={loading}>
                <UserPlus className="w-4 h-4"/>
                {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[color:var(--tr-text-muted)]">
                Zaten bir hesabın var mı?{' '}
                <Link to="/giris" className="font-medium text-[color:var(--tr-accent)] hover:underline">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
