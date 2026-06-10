import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Analysis, Profile, Store } from './types/database';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AppLayout } from './layouts/AppLayout';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile((profileData as Profile | null) ?? null);

    if (profileData?.store_id) {
      const { data: storeData } = await supabase.from('stores').select('*').eq('id', profileData.store_id).single();
      setStore((storeData as Store | null) ?? null);
    } else {
      setStore(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user.id) {
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user.id) {
        await loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
        setStore(null);
      }
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="loading-screen">Carregando painel...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  if (!profile || !store) {
    return <OnboardingPage userId={session.user.id} onDone={() => loadProfile(session.user.id)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout profile={profile} store={store} onLogout={logout} />}>
          <Route path="/" element={<DashboardPage store={store} />} />
          <Route path="/clientes" element={<CustomersPage />} />
          <Route path="/produtos" element={<ProductsPage store={store} />} />
          <Route path="/campanhas" element={<CampaignsPage store={store} />} />
          <Route path="/configuracoes" element={<SettingsPage store={store} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
