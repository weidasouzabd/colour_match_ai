-- 1) Crie sua conta no painel e faça login.
-- 2) Descubra o store_id criado no onboarding.
-- 3) Substitua {{STORE_ID}} abaixo e execute este script.

insert into public.customers (store_id, full_name, phone, email, source_channel, style_profile, budget_range, notes, last_interaction_at)
values
  ('{{STORE_ID}}', 'Marina Costa', '+5511999991111', 'marina@example.com', 'whatsapp', 'elegante', '250-500', 'Gosta de peças clássicas', now()),
  ('{{STORE_ID}}', 'Ana Ribeiro', '+5511999992222', 'ana@example.com', 'instagram', 'romântico', '150-300', 'Ama tons suaves', now()),
  ('{{STORE_ID}}', 'Juliana Melo', '+5511999993333', 'juju@example.com', 'loja_fisica', 'moderno', '300-700', 'Compra para eventos', now());

with c as (
  select id, full_name from public.customers where store_id = '{{STORE_ID}}'
)
insert into public.analyses (store_id, customer_id, undertone, depth, contrast_level, season, best_colors, avoid_colors, metals, hair_suggestions, style_notes, confidence_score)
select '{{STORE_ID}}', id,
  case full_name
    when 'Marina Costa' then 'frio'
    when 'Ana Ribeiro' then 'quente'
    else 'frio'
  end,
  case full_name
    when 'Marina Costa' then 'profunda'
    when 'Ana Ribeiro' then 'clara'
    else 'profunda'
  end,
  case full_name
    when 'Marina Costa' then 'alto'
    when 'Ana Ribeiro' then 'baixo'
    else 'alto'
  end,
  case full_name
    when 'Marina Costa' then 'Inverno Profundo'
    when 'Ana Ribeiro' then 'Primavera Clara'
    else 'Inverno Frio'
  end,
  case full_name
    when 'Marina Costa' then array['preto','vinho','azul petróleo']
    when 'Ana Ribeiro' then array['coral','pêssego','verde água']
    else array['azul royal','magenta','branco óptico']
  end,
  array['bege acinzentado','mostarda opaca'],
  case full_name
    when 'Ana Ribeiro' then array['dourado suave']
    else array['prata','ródio']
  end,
  array['castanho frio','luzes sutis'],
  'Perfil de compra alinhado com peças de impacto visual.',
  0.92
from c;

insert into public.customer_preferences (store_id, customer_id, favorite_colors, avoided_colors, preferred_styles, favorite_fabrics, preferred_occasions, price_min, price_max, notes)
select
  '{{STORE_ID}}',
  id,
  case full_name
    when 'Marina Costa' then array['preto','vinho']
    when 'Ana Ribeiro' then array['coral','verde água']
    else array['azul royal','prata']
  end,
  array['mostarda'],
  case full_name
    when 'Marina Costa' then array['alfaiataria','minimalista']
    when 'Ana Ribeiro' then array['romântico','casual chic']
    else array['festa','elegante']
  end,
  array['viscose','crepe'],
  case full_name
    when 'Juliana Melo' then array['festa','casamento']
    else array['trabalho','casual']
  end,
  150,
  700,
  'Seed demo'
from c;

insert into public.products (store_id, sku, name, description, color_name, color_hex, dominant_season, undertone_match, style_tags, fabric, occasion_tags, price, stock, active)
values
  ('{{STORE_ID}}', 'VEST-001', 'Vestido Midi Azul Petróleo', 'Vestido elegante para eventos e jantar especial', 'azul petróleo', '#1C3D5A', array['Inverno Profundo','Inverno Frio'], array['frio'], array['elegante','festa'], 'crepe', array['festa','jantar'], 389.90, 8, true),
  ('{{STORE_ID}}', 'BLAZ-001', 'Blazer Preto Premium', 'Blazer estruturado com caimento sofisticado', 'preto', '#111111', array['Inverno Profundo'], array['frio'], array['alfaiataria','minimalista'], 'alfaiataria', array['trabalho','evento'], 459.90, 5, true),
  ('{{STORE_ID}}', 'CAMI-001', 'Camisa Coral Fresh', 'Camisa leve perfeita para primavera', 'coral', '#FF7F66', array['Primavera Clara'], array['quente'], array['romântico','casual chic'], 'viscose', array['casual','trabalho'], 179.90, 11, true),
  ('{{STORE_ID}}', 'SAIA-001', 'Saia Verde Água', 'Saia fluida com cintura alta', 'verde água', '#7FD9C6', array['Primavera Clara'], array['quente'], array['romântico','casual chic'], 'viscose', array['casual','viagem'], 159.90, 10, true);
