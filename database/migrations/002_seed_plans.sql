insert into public.plans (code, name, price_monthly, price_yearly, max_team_members, max_whatsapp_instances, max_ai_analyses_per_month, max_campaign_messages_per_month, features)
values
  ('starter', 'Starter', 297.00, 2970.00, 2, 1, 300, 3000, '{"crm":true,"campaigns":true,"dashboard":true}'),
  ('growth', 'Growth', 697.00, 6970.00, 5, 2, 1500, 15000, '{"crm":true,"campaigns":true,"dashboard":true,"recommendations":true,"priority_support":true}'),
  ('premium', 'Premium', 1497.00, 14970.00, 15, 5, 5000, 50000, '{"crm":true,"campaigns":true,"dashboard":true,"recommendations":true,"priority_support":true,"custom_domain":true,"white_label":true}')
on conflict (code) do update set
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  max_team_members = excluded.max_team_members,
  max_whatsapp_instances = excluded.max_whatsapp_instances,
  max_ai_analyses_per_month = excluded.max_ai_analyses_per_month,
  max_campaign_messages_per_month = excluded.max_campaign_messages_per_month,
  features = excluded.features,
  active = true;
