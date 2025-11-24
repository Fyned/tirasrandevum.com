import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { Calendar, Clock, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  const getRedirectPath = () => {
    if (!profile) return '/giris';
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'barber':
        return '/berber';
      case 'customer':
        return '/musteri';
      default:
        return '/'; 
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-[color:var(--tr-bg)]">
        <div className="text-xl text-[color:var(--tr-text-muted)]">
          Yükleniyor...
        </div>
      </div>
    );
  }

  if (user && profile) {
    const target = getRedirectPath();
    if (target !== '/') {
        return <Navigate to={target} replace />;
    }
  }
  
  if (user && !profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-[color:var(--tr-bg)]">
        <div className="text-xl text-[color:var(--tr-text-muted)]">
          Panelinize yönlendiriliyorsunuz...
        </div>
      </div>
    );
  }

  const advantages = [
    {
      icon: Calendar,
      title: 'Kolay Randevu Yönetimi',
      description: 'Müşterilerinizin randevularını tek bir yerden kolayca yönetin ve takip edin.'
    },
    {
      icon: Clock,
      title: 'Zaman Tasarrufu',
      description: 'Otomatik hatırlatmalar ve akıllı planlama ile zamanınızı verimli kullanın.'
    },
    {
      icon: Users,
      title: 'Müşteri Memnuniyeti',
      description: 'Müşterilerinize 7/24 online randevu alma imkanı sunarak memnuniyeti artırın.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <>
      <Helmet>
        <title>Tıraş Randevum - Berberler için Akıllı Randevu Yönetimi</title>
        <meta name="description" content="Tıraş Randevum ile berber randevularınızı kolayca yönetin. Akıllı randevu sistemi ile müşterilerinize daha iyi hizmet verin." />
      </Helmet>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-[color:var(--tr-bg)]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl w-full"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[--tr-accent-soft] border border-[--tr-border-subtle] rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-[color:var(--tr-accent)]" />
              <span className="text-sm text-[color:var(--tr-accent)]">Berberler için özel tasarlandı</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[color:var(--tr-text)] leading-tight">
              Tıraş Randevum
            </h1>
            
            <p className="text-xl md:text-2xl text-[color:var(--tr-text-muted)] mb-4">
              Berberler için akıllı randevu yönetimi
            </p>
            
            <p className="text-lg text-[color:var(--tr-text-muted)] max-w-2xl mx-auto mb-8">
              İşletmenizi dijitalleştirin, randevularınızı kolayca yönetin ve müşteri memnuniyetini artırın.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/giris')}
                className="bg-[color:var(--tr-accent)] hover:brightness-110 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[color:var(--tr-accent)]/20 hover:shadow-[color:var(--tr-accent)]/30 transition-all hover:scale-105"
              >
                Giriş Yap
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/kayit')}
                className="border-2 border-[color:var(--tr-border-strong)] text-[color:var(--tr-text)] hover:bg-[--tr-accent-soft] hover:border-[color:var(--tr-accent)]/80 px-8 py-6 text-lg rounded-xl hover:scale-105 transition-all"
              >
                Kayıt Ol
              </Button>
            </div>
          </motion.div>

          {/* Advantages Section */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-6"
          >
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="panel-surface backdrop-blur-sm rounded-2xl p-6 hover:border-[color:var(--tr-border-strong)] transition-all"
              >
                <div className="bg-[color:var(--tr-accent)] w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <advantage.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[color:var(--tr-text)] mb-2">
                  {advantage.title}
                </h3>
                <p className="text-[color:var(--tr-text-muted)]">
                  {advantage.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default HomePage;