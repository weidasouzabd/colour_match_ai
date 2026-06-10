import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dateTime } from '../lib/format';
import { Campaign, Store } from '../types/database';

type Props = {
  store: Store;
};

const seasons = [
  'Primavera Clara',
  'Primavera Quente',
  'Verão Suave',
  'Verão Claro',
  'Outono Quente',
  'Outono Suave',
  'Inverno Profundo',
  'Inverno Frio',
];

export function CampaignsPage({ store }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('Olá {{nome}} ✨ chegaram peças perfeitas para sua cartela {{cartela}}. Quer que eu te mostre as novidades?');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    setCampaigns((data ?? []) as Campaign[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const createCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    const { error } = await supabase.from('campaigns').insert({
      store_id: store.id,
      title,
      message_template: message,
      target_seasons: selectedSeasons,
      status: 'draft',
    });

    if (!error) {
      setTitle('');
      setSelectedSeasons([]);
      await load();
      setFeedback('Campanha criada com sucesso.');
    }

    setSaving(false);
  };

  const dispatchCampaign = async (campaignId: string) => {
    setDispatchingId(campaignId);
    setFeedback(null);

    try {
      const baseUrl = import.meta.env.VITE_N8N_BASE_URL as string;
      const webhookPath = import.meta.env.VITE_N8N_DISPATCH_WEBHOOK as string;
      const response = await fetch(`${baseUrl}/webhook/${webhookPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId }),
      });

      if (!response.ok) throw new Error('Falha ao disparar campanha no n8n.');
      setFeedback('Campanha enviada ao n8n para disparo.');
      await load();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erro no disparo.');
    } finally {
      setDispatchingId(null);
    }
  };

  const toggleSeason = (season: string) => {
    setSelectedSeasons((current) =>
      current.includes(season) ? current.filter((item) => item !== season) : [...current, season],
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="pill">Automação comercial</span>
          <h1>Campanhas</h1>
          <p>Crie campanhas por cartela e dispare pelo webhook do n8n.</p>
        </div>
      </div>

      <form className="card campaign-form" onSubmit={createCampaign}>
        <label>
          Título da campanha
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          Mensagem
          <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
        </label>

        <div>
          <span className="input-label">Cartelas alvo</span>
          <div className="tag-selector">
            {seasons.map((season) => (
              <button
                key={season}
                type="button"
                className={selectedSeasons.includes(season) ? 'tag-button active' : 'tag-button'}
                onClick={() => toggleSeason(season)}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        <button className="primary-button" disabled={saving} type="submit">
          {saving ? 'Salvando...' : 'Criar campanha'}
        </button>

        {feedback ? <div className="alert success">{feedback}</div> : null}
      </form>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Cartelas</th>
                <th>Status</th>
                <th>Criada em</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <strong>{campaign.title}</strong>
                    <div className="muted line-clamp">{campaign.message_template}</div>
                  </td>
                  <td>
                    <div className="tag-list compact">
                      {(campaign.target_seasons || []).map((item) => (
                        <span key={item} className="soft-tag">
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${campaign.status}`}>{campaign.status}</span>
                  </td>
                  <td>{dateTime(campaign.created_at)}</td>
                  <td>
                    <button className="ghost-button" onClick={() => dispatchCampaign(campaign.id)} disabled={dispatchingId === campaign.id}>
                      <Send size={14} />
                      {dispatchingId === campaign.id ? 'Enviando...' : 'Disparar'}
                    </button>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5}>Nenhuma campanha cadastrada ainda.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
