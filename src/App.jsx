
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import FindBarberByCode from '@/pages/FindBarberByCode.jsx';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

// Lazy load components
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard.jsx'));
const BarberDashboard = React.lazy(() => import('@/pages/BarberDashboard.jsx'));
const BarberProfile = React.lazy(() => import('@/pages/BarberProfile.jsx'));
const BarberPublicProfile = React.lazy(() => import('@/pages/BarberPublicProfile.jsx'));
const CustomerDashboard = React.lazy(() => import('@/pages/CustomerDashboard.jsx'));
const BarberAppointmentSystem = React.lazy(() => import('@/pages/BarberAppointmentSystem.jsx'));
const BarberPortfolio = React.lazy(() => import('@/pages/BarberPortfolio.jsx'));
const BarberFollowers = React.lazy(() => import('@/pages/BarberFollowers.jsx'));
const BarberInstagramProfile = React.lazy(() => import('@/pages/BarberInstagramProfile.jsx'));
const FindShopByCode = React.lazy(() => import('@/pages/FindShopByCode.jsx'));
const ShopPublicPage = React.lazy(() => import('@/pages/ShopPublicPage.jsx'));
const BookAppointmentWizard = React.lazy(() => import('@/pages/BookAppointmentWizard.jsx'));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-[color:var(--tr-bg)]">
    <Loader2 className="h-8 w-8 animate-spin text-[color:var(--tr-accent)]" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Helmet>
            <title>Tıraş Randevum - Berberler için Akıllı Randevu Yönetimi</title>
            <meta name="description" content="Tıraş Randevum ile berber randevularınızı kolayca yönetin. Akıllı randevu sistemi ile müşterilerinize daha iyi hizmet verin." />
          </Helmet>
          <div className="min-h-screen flex flex-col transition-colors duration-300">
            <Header />
            <main className="flex-1 flex flex-col">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/giris" element={<LoginPage />} />
                  <Route path="/kayit" element={<RegisterPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/berber" element={<BarberDashboard />} />
                  <Route path="/berber/profil" element={<BarberProfile />} />
                  <Route path="/berber/appointments" element={<BarberAppointmentSystem />} />
                  <Route path="/berber/portfolio" element={<BarberPortfolio />} />
                  <Route path="/berber/followers" element={<BarberFollowers />} />
                  <Route path="/berber/instagram-profile" element={<BarberInstagramProfile />} />
                  <Route path="/barber/:publicCode" element={<BarberPublicProfile />} />
                  <Route path="/musteri" element={<CustomerDashboard />} />
                  <Route path="/find-barber-by-code" element={<FindBarberByCode />} />
                  <Route path="/salon-koduyla-bul" element={<FindShopByCode />} />
                  <Route path="/salon/:shopCode" element={<ShopPublicPage />} />
                  <Route path="/randevu-al/:shopCode" element={<BookAppointmentWizard />} />
                </Routes>
              </Suspense>
            </main>
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
