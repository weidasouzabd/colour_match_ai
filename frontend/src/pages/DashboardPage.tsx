import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Megaphone, ShoppingBag, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '../lib/supabase';
import { compactNumber, currency, dateTime } from '../lib/format';
import { Analysis, Campaign, Customer, Product, Store } from '../types/database';
import { KpiCard } from '../components/KpiCard';
import { SeasonBadge } from '../components/SeasonBadge';

type Props = {
  store: Store;
};

const palette = ['#364fc7', '#ff922b', '#12b886', '#e64980', '#6f42c1', '#1c7ed6'];

export function DashboardPage({ store }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [customersRes, analysesRes, productsRes, campaignsRes] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('analyses').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      setCustomers((customersRes.data ?? []) as Customer[]);
      setAnalyses((analysesRes.data ?? []) as Analysis[]);
      setProducts((productsRes.data ?? []) as Product[]);
      setCampaigns((campaignsRes.data ?? []) as Campaign[]);
      setLoading(false);
    };

    void load();
  }, [store.id]);

  const seasonDistribution = useMemo(() => {
    const counts = analyses.reduce<Record<string, number>>((acc, analysis) => {
      const key = analysis.season || 'Sem análise';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length],
    }));
  }, [analyses]);

  const stockBySeason = useMemo(() => {
    const counts = products.reduce<Record<string, number>>((acc, product) => {
      (product.dominant_season || []).forEach((season) => {
        acc[season] = (acc[season] || 0) + product.stock;
      });
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([season, stock]) => ({ season, stock }))
      .slice(0, 8);
  }, [products]);

  const revenuePotential = products.reduce((acc, product) => acc + product.price * product.stock, 0);
  const recentAnalyses = analyses.slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="pill">Visão geral</span>
          <h1>{store.name}</h1>
          <p>Central de inteligência comercial para coloração pessoal, campanhas e catálogo.</p>
        </div>
      </div>

      {loading ? <div className="card">Carregando dashboard...</div> : null}

      <section className="grid kpis">
        <KpiCard title="Clientes" value={compactNumber(customers.length)} helper="Base ativa da loja" icon={<Users size={20} />} />
        <KpiCard title="Análises IA" value={compactNumber(analyses.length)} helper="Selfies já processadas" icon={<BarChart3 size={20} />} />
        <KpiCard title="Produtos" value={compactNumber(products.length)} helper="Itens cadastrados" icon={<ShoppingBag size={20} />} />
        <KpiCard title="Potencial em estoque" value={currency(revenuePotential)} helper="Preço x estoque atual" icon={<Megaphone size={20} />} />
      </section>

      <section className="grid charts">
        <div className="card chart-card">
          <div className="section-title">
            <h2>Distribuição de cartelas</h2>
            <p>Segmentação pronta para campanhas.</p>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={seasonDistribution} dataKey="value" nameKey="name" outerRadius={100} label>
                  {seasonDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="section-title">
            <h2>Estoque por cartela</h2>
            <p>Ajuda a identificar oportunidades de disparo.</p>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stockBySeason}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-list">
            {stockBySeason.map((item) => (
              <div key={item.season} className="legend-row">
                <SeasonBadge season={item.season} />
                <strong>{item.stock} un.</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid split-2">
        <div className="card">
          <div className="section-title">
            <h2>Últimas análises</h2>
            <p>Clientes mais recentes identificadas pela IA.</p>
          </div>
          <div className="table-like">
            {recentAnalyses.length === 0 ? <p>Nenhuma análise ainda.</p> : null}
            {recentAnalyses.map((analysis) => {
              const customer = customers.find((item) => item.id === analysis.customer_id);
              return (
                <div className="row-card" key={analysis.id}>
                  <div>
                    <strong>{customer?.full_name || 'Cliente'}</strong>
                    <p>{dateTime(analysis.created_at)}</p>
                  </div>
                  <div className="row-end">
                    <SeasonBadge season={analysis.season} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Campanhas recentes</h2>
            <p>Acompanhe o histórico de disparos e rascunhos.</p>
          </div>
          <div className="table-like">
            {campaigns.length === 0 ? <p>Nenhuma campanha criada ainda.</p> : null}
            {campaigns.slice(0, 5).map((campaign) => (
              <div className="row-card" key={campaign.id}>
                <div>
                  <strong>{campaign.title}</strong>
                  <p>{dateTime(campaign.created_at)}</p>
                </div>
                <div className="row-end">
                  <span className={`status-pill ${campaign.status}`}>{campaign.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
