import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Close menu on route change
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/giris', { replace: true });
      toast({
        title: "Başarılı",
        description: "Başarıyla çıkış yaptınız."
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const getPanelLink = () => {
    if (!profile) return null;
    switch (profile.role) {
      case 'admin':
        return { path: '/admin', label: 'Yönetici Paneli' };
      case 'barber':
        return { path: '/berber', label: 'Berber Paneli' };
      case 'customer':
        return { path: '/musteri', label: 'Müşteri Paneli' };
      default:
        return null;
    }
  };

  const panelLink = getPanelLink();

  const navLinks = user ? 
    [
      { path: '/', label: 'Ana Sayfa' },
      panelLink
    ].filter(Boolean) 
    : 
    [
      { path: '/', label: 'Ana Sayfa' },
      { path: '/giris', label: 'Giriş' },
      { path: '/kayit', label: 'Kayıt Ol' }
    ];

  const isActive = path => location.pathname === path;

  return (
    <header className="bg-[--tr-bg]/80 backdrop-blur-md border-b border-[--tr-border-subtle] sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="https://horizons-cdn.hostinger.com/130239b7-a408-4bad-9351-bc71881bb377/adegsimsiz-1-n9NXw.png" alt="Tıraş Randevum Logo" className="h-10 sm:h-12 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-1.5 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${isActive(link.path) ? 'text-[--tr-text]' : 'text-[--tr-text-muted] hover:text-[--tr-text]'}`}
              >
                {panelLink && link.path === panelLink.path && <LayoutDashboard className="w-4 h-4" />}
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeTab-header"
                    className="absolute inset-0 bg-[--tr-accent-soft] rounded-md -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
            {user && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[--tr-text-muted] hover:bg-[--tr-danger]/10 hover:text-[--tr-danger]">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm">Çıkış Yap</span>
              </Button>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" className="text-[--tr-text] hover:bg-[--tr-bg-soft] h-11 w-11" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="sr-only">Menüyü aç</span>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-xs h-full bg-[color:var(--tr-bg-soft)] shadow-2xl p-4 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2 group">
                  <img src="https://horizons-cdn.hostinger.com/130239b7-a408-4bad-9351-bc71881bb377/adegsimsiz-1-n9NXw.png" alt="Tıraş Randevum Logo" className="h-10 w-auto" />
                </Link>
                <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(link.path) ? 'bg-[--tr-accent-soft] text-[--tr-text]' : 'text-[--tr-text-muted] hover:bg-[--tr-bg-elevated] hover:text-[--tr-text]'}`}
                  >
                     {panelLink && link.path === panelLink.path && <LayoutDashboard className="w-5 h-5" />}
                    {link.label}
                  </Link>
                ))}
              </div>
              {user && (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start px-4 py-3 text-base font-medium text-[--tr-text-muted] hover:bg-[--tr-danger]/10 hover:text-[--tr-danger]"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Çıkış Yap</span>
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Header;