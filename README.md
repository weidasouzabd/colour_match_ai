# Color Sales AI — SaaS Multitenant Premium

Versão SaaS premium do sistema inteligente de vendas por coloração pessoal.

## Esta versão adiciona

- arquitetura multi-tenant reforçada
- planos e assinaturas
- configurações por tenant
- instâncias WhatsApp por loja
- uso diário por tenant
- logs de auditoria
- convites para equipe
- workflow inbound da Evolution API
- documentação de deploy online

## Estrutura adicional

```bash
.
├── database/
│   ├── schema.sql
│   ├── demo_seed.sql
│   └── migrations/
│       ├── 001_saas_premium.sql
│       └── 002_seed_plans.sql
├── deployment/
│   ├── .env.production.example
│   ├── docker-compose.saas.yml
│   ├── caddy/Caddyfile
│   └── nginx/app.conf.example
├── docs/
│   ├── 01-arquitetura-saas.md
│   ├── 02-como-hospedar-online.md
│   └── 03-evolution-api-inicial.md
└── n8n/workflows/
    ├── 01-selfie-analysis.json
    ├── 02-campaign-dispatch.json
    ├── 03-product-intake.json
    └── 04-evolution-inbound-router.json
```

## Ordem de implantação

1. Subir Supabase Cloud
2. Aplicar SQL base + migrações premium
3. Subir n8n + Evolution API em VPS
4. Publicar frontend na Vercel
5. Importar workflows no n8n
6. Configurar webhooks da Evolution
7. Testar onboarding, selfie e campanhas

## Frontend

O painel permanece em React/Vite e já está pronto para uso como admin panel por tenant.

## Recomendação prática

Para começar rápido e vender cedo:

- **Supabase Cloud** em vez de self-host
- **Vercel** para frontend
- **1 VPS** para n8n + Evolution API

Depois, conforme a base crescer, você separa n8n e Evolution em máquinas diferentes.
