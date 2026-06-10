import { useState } from 'react';
import { supabase } from '../lib/supabase';

type Props = {
  userId: string;
  onDone: () => Promise<void>;
};

export function OnboardingPage({ userId, onDone }: Props) {
  const [storeName, setStoreName] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [niche, setNiche] = useState('Boutique feminina');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('=== Starting Onboarding ===');
      console.log('User ID:', userId);

      // 1. Insert store
      console.log('Step 1: Inserting store...');
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({ name: storeName, whatsapp_number: whatsapp, niche })
        .select();

      console.log('Store response:', { store, storeError });

      if (storeError) {
        console.error('Store error:', storeError);
        throw storeError;
      }
      if (!store || store.length === 0) {
        throw new Error('Failed to create store - empty response');
      }

      const storeId = store[0].id;
      console.log('Store created with ID:', storeId);

      // 2. Create profile
      console.log('Step 2: Creating profile...');
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        store_id: storeId,
        full_name: fullName,
        role: 'admin',
      });

      console.log('Profile response:', { profileError });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      console.log('Profile created');

      // 3. Create tenant_settings
      console.log('Step 3: Creating tenant_settings...');
      const slug = storeName.toLowerCase().replace(/\s+/g, '-');
      const { error: settingsError } = await supabase.from('tenant_settings').insert({
        store_id: storeId,
        slug: slug,
        brand_name: storeName,
        onboarding_completed: true,
      });

      console.log('Tenant settings response:', { settingsError });

      if (settingsError) {
        console.error('Settings error:', settingsError);
        throw settingsError;
      }

      console.log('Tenant settings created');

      console.log('=== Onboarding completed successfully ===');
      await onDone();
    } catch (err) {
      console.error('=== Onboarding error ===', err);
      const message = err instanceof Error ? err.message : 'Falha ao salvar onboarding.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card wide">
        <div className="auth-header">
          <span className="pill">Primeiro acesso</span>
          <h1>Configure sua loja</h1>
          <p>Isso cria a estrutura inicial da loja e vincula seu usuário administrador.</p>
        </div>

        <form className="grid-form" onSubmit={submit}>
          <label>
            Nome da loja
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
          </label>
          <label>
            Seu nome
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label>
            WhatsApp da loja
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+5511999999999" required />
          </label>
          <label>
            Nicho
            <input value={niche} onChange={(e) => setNiche(e.target.value)} required />
          </label>

          {error ? <div className="alert error span-2">{error}</div> : null}

          <button className="primary-button span-2" disabled={loading} type="submit">
            {loading ? 'Salvando...' : 'Concluir configuração'}
          </button>
        </form>
      </div>
    </div>
  );
}
