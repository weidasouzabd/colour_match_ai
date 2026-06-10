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
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({ name: storeName, whatsapp_number: whatsapp, niche })
        .select('*')
        .single();

      if (storeError) throw storeError;

      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        store_id: store.id,
        full_name: fullName,
        role: 'admin',
      });

      if (profileError) throw profileError;
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar onboarding.');
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
