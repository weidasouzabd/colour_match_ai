import { Store } from '../types/database';

type Props = {
  store: Store;
};

export function SettingsPage({ store }: Props) {
  const baseUrl = import.meta.env.VITE_N8N_BASE_URL as string;
  const campaignWebhook = import.meta.env.VITE_N8N_DISPATCH_WEBHOOK as string;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="pill">Operação</span>
          <h1>Configurações</h1>
          <p>Resumo das integrações e dos dados-base da sua operação.</p>
        </div>
      </div>

      <div className="grid split-2">
        <div className="card">
          <div className="section-title">
            <h2>Loja</h2>
          </div>
          <div className="settings-list">
            <div><span>Nome</span><strong>{store.name}</strong></div>
            <div><span>WhatsApp</span><strong>{store.whatsapp_number || '—'}</strong></div>
            <div><span>Nicho</span><strong>{store.niche || '—'}</strong></div>
            <div><span>Tom de marca</span><strong>{store.brand_tone || 'premium'}</strong></div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Webhooks</h2>
          </div>
          <div className="settings-list mono-list">
            <div><span>Selfie analysis</span><strong>{baseUrl}/webhook/selfie-analysis</strong></div>
            <div><span>Campanha</span><strong>{baseUrl}/webhook/{campaignWebhook}</strong></div>
            <div><span>Cadastro de produto</span><strong>{baseUrl}/webhook/product-intake</strong></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <h2>Checklist de go-live</h2>
          <p>Use esta lista antes da implantação em produção.</p>
        </div>
        <ul className="check-list">
          <li>Supabase com schema aplicado e bucket criado</li>
          <li>OpenAI configurada no ambiente do n8n</li>
          <li>Provider de WhatsApp configurado e validado</li>
          <li>n8n com HTTPS e webhooks públicos em produção</li>
          <li>Painel conectado à anon key correta do Supabase</li>
        </ul>
      </div>
    </div>
  );
}
