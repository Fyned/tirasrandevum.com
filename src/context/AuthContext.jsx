import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

const AuthRedirectHandler = ({ user, profile, loading }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      const publicRoutes = ['/giris', '/kayit', '/', '/find-barber-by-code'];
      const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/barber/');
      const isAdminRoute = location.pathname.startsWith('/admin');
      const isBarberRoute = location.pathname.startsWith('/berber');

      if (!user && !isPublicRoute) {
        navigate('/giris', { replace: true });
      } else if (user) {
        if (profile?.role === 'admin' && (location.pathname === '/giris' || location.pathname === '/kayit')) {
           navigate('/admin', { replace: true });
        } else if (profile?.role === 'barber' && (location.pathname === '/giris' || location.pathname === '/kayit')) {
           navigate('/berber', { replace: true });
        } else if (profile?.role === 'customer' && (location.pathname === '/giris' || location.pathname === '/kayit')) {
            navigate('/', { replace: true });
        }
        
        if (isAdminRoute && profile?.role !== 'admin') {
            navigate('/', { replace: true });
        }
        if (isBarberRoute && profile?.role !== 'barber') {
            navigate('/', { replace: true });
        }
      }
    }
  }, [user, profile, loading, location.pathname, navigate]);

  return null; // This component does not render anything
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (user) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      setProfile(null);
    }
  };

  const signIn = async ({ email, password }) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    // Redirection will be handled by AuthRedirectHandler
  };

  const value = {
    user,
    profile,
    signIn,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      <AuthRedirectHandler user={user} profile={profile} loading={loading} />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};