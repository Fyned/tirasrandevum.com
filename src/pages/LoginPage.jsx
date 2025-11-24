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
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user, signIn, loading } = useAuth();
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async ({ email, password }) => {
    setError(null);
    const { error: signInError } = await signIn({ email, password });

    if (signInError) {
      if (signInError.code === 'auth/email-not-confirmed') {
        setError('E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin veya destek ile iletişime geçin.');
        toast({
          title: "E-posta Onayı Bekleniyor",
          description: "Giriş yapmadan önce e-posta adresinizi doğrulamanız gerekmektedir. Lütfen gelen kutunuzu kontrol edin.",
          variant: "default",
          duration: 10000,
        });
      } else {
        setError('Giriş bilgileri hatalı. Lütfen kontrol edip tekrar deneyin.');
      }
    } else {
      toast({
        title: "Giriş Başarılı",
        description: "Hoş geldiniz!",
      });
      // The AuthProvider will handle navigation on user state change.
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Giriş Yap - Tıraş Randevum</title>
        <meta name="description" content="Tıraş Randevum hesabınıza giriş yapın ve randevularınızı yönetmeye başlayın." />
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
              <h1 className="text-3xl font-bold text-[color:var(--tr-text)]">Giriş Yap</h1>
              <p className="text-[color:var(--tr-text-muted)] mt-2">Hesabınıza erişim sağlayın.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-md">{error}</p>}
              
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
                <Label htmlFor="password" className="text-[color:var(--tr-text-muted)]">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Şifre zorunludur." })}
                  className={`bg-[color:var(--tr-bg-elevated)] text-[color:var(--tr-text)] border-[color:var(--tr-border-strong)] focus:ring-[color:var(--tr-accent)] ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-[color:var(--tr-accent)] hover:brightness-110 text-white flex items-center gap-2" disabled={loading}>
                <LogIn className="w-4 h-4" />
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[color:var(--tr-text-muted)]">
                Hesabın yok mu?{' '}
                <Link to="/kayit" className="font-medium text-[color:var(--tr-accent)] hover:underline">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;