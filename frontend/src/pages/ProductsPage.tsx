import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { currency } from '../lib/format';
import { Product, Store } from '../types/database';

type Props = {
  store: Store;
};

const initialForm = {
  sku: '',
  name: '',
  description: '',
  color_name: '',
  color_hex: '#111111',
  dominant_season: '',
  undertone_match: '',
  style_tags: '',
  fabric: '',
  occasion_tags: '',
  price: 0,
  stock: 0,
  image_url: '',
};

export function ProductsPage({ store }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts((data ?? []) as Product[]);
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      store_id: store.id,
      sku: form.sku || null,
      name: form.name,
      description: form.description || null,
      color_name: form.color_name || null,
      color_hex: form.color_hex || null,
      dominant_season: form.dominant_season.split(',').map((item) => item.trim()).filter(Boolean),
      undertone_match: form.undertone_match.split(',').map((item) => item.trim()).filter(Boolean),
      style_tags: form.style_tags.split(',').map((item) => item.trim()).filter(Boolean),
      fabric: form.fabric || null,
      occasion_tags: form.occasion_tags.split(',').map((item) => item.trim()).filter(Boolean),
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url || null,
      active: true,
    };

    const { error } = await supabase.from('products').insert(payload);
    if (!error) {
      setForm(initialForm);
      setShowForm(false);
      await loadProducts();
    }

    setSaving(false);
  };

  return (
    <div className="page">
      <div className="page-header between">
        <div>
          <span className="pill">Catálogo inteligente</span>
          <h1>Produtos</h1>
          <p>Cadastre peças com tags cromáticas para alimentar recomendações e campanhas.</p>
        </div>
        <button className="primary-button" onClick={() => setShowForm((value) => !value)}>
          <Plus size={16} />
          {showForm ? 'Fechar' : 'Novo produto'}
        </button>
      </div>

      {showForm ? (
        <form className="card grid-form" onSubmit={submit}>
          <label>
            SKU
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </label>
          <label>
            Nome
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="span-2">
            Descrição
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </label>
          <label>
            Cor
            <input value={form.color_name} onChange={(e) => setForm({ ...form, color_name: e.target.value })} />
          </label>
          <label>
            HEX
            <input value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} />
          </label>
          <label>
            Cartelas
            <input value={form.dominant_season} onChange={(e) => setForm({ ...form, dominant_season: e.target.value })} placeholder="Inverno Profundo, Primavera Clara" />
          </label>
          <label>
            Subtons
            <input value={form.undertone_match} onChange={(e) => setForm({ ...form, undertone_match: e.target.value })} placeholder="frio, quente" />
          </label>
          <label>
            Estilos
            <input value={form.style_tags} onChange={(e) => setForm({ ...form, style_tags: e.target.value })} placeholder="elegante, romântico" />
          </label>
          <label>
            Tecido
            <input value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} />
          </label>
          <label>
            Ocasiões
            <input value={form.occasion_tags} onChange={(e) => setForm({ ...form, occasion_tags: e.target.value })} placeholder="trabalho, festa" />
          </label>
          <label>
            Preço
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </label>
          <label>
            Estoque
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </label>
          <label className="span-2">
            URL da imagem
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </label>

          <button className="primary-button span-2" type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar produto'}
          </button>
        </form>
      ) : null}

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="card product-card">
            {product.image_url ? <img src={product.image_url} alt={product.name} className="product-image" /> : <div className="product-image placeholder" />}
            <div className="product-body">
              <strong>{product.name}</strong>
              <p>{product.description || 'Sem descrição'}</p>
              <div className="tag-list">
                {(product.dominant_season || []).map((tag) => (
                  <span key={tag} className="soft-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="product-footer">
                <strong>{currency(product.price)}</strong>
                <span>Estoque: {product.stock}</span>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 ? <div className="card">Nenhum produto cadastrado ainda.</div> : null}
      </div>
    </div>
  );
}
