import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dateTime } from '../lib/format';
import { Analysis, Customer } from '../types/database';
import { SeasonBadge } from '../components/SeasonBadge';

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [customersRes, analysesRes] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('analyses').select('*').order('created_at', { ascending: false }),
      ]);
      setCustomers((customersRes.data ?? []) as Customer[]);
      setAnalyses((analysesRes.data ?? []) as Analysis[]);
      setLoading(false);
    };

    void load();
  }, []);

  const latestAnalysisByCustomer = useMemo(() => {
    return analyses.reduce<Record<string, Analysis>>((acc, analysis) => {
      if (!acc[analysis.customer_id]) acc[analysis.customer_id] = analysis;
      return acc;
    }, {});
  }, [analyses]);

  const seasons = useMemo(() => {
    return Array.from(new Set(analyses.map((item) => item.season).filter(Boolean))) as string[];
  }, [analyses]);

  const filteredCustomers = customers.filter((customer) => {
    const latest = latestAnalysisByCustomer[customer.id];
    const text = `${customer.full_name} ${customer.phone || ''} ${customer.email || ''}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesSeason = !selectedSeason || latest?.season === selectedSeason;
    return matchesSearch && matchesSeason;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="pill">CRM cromático</span>
          <h1>Clientes</h1>
          <p>Filtre clientes por cartela, canal de origem e recência de atendimento.</p>
        </div>
      </div>

      <div className="card filters-row">
        <label className="search-field">
          <Search size={16} />
          <input placeholder="Buscar por nome, telefone ou email" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>

        <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
          <option value="">Todas as cartelas</option>
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? <p>Carregando clientes...</p> : null}
        {!loading && filteredCustomers.length === 0 ? <p>Nenhum cliente encontrado.</p> : null}

        {!loading ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Origem</th>
                  <th>Cartela</th>
                  <th>Última análise</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const analysis = latestAnalysisByCustomer[customer.id];
                  return (
                    <tr key={customer.id}>
                      <td>
                        <strong>{customer.full_name}</strong>
                        <div className="muted">{customer.style_profile || 'Sem estilo definido'}</div>
                      </td>
                      <td>
                        <div>{customer.phone || '—'}</div>
                        <div className="muted">{customer.email || '—'}</div>
                      </td>
                      <td>{customer.source_channel || '—'}</td>
                      <td>
                        <SeasonBadge season={analysis?.season} />
                      </td>
                      <td>{dateTime(analysis?.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
