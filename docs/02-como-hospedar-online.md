# Como hospedar online

## Opção recomendada para você

### Stack online

- **Frontend**: Vercel
- **Supabase**: Cloud oficial
- **n8n + Evolution API**: uma VPS Ubuntu 22.04/24.04 com Docker Compose
- **DNS/SSL**: Cloudflare + Caddy

## Requisitos mínimos iniciais

### MVP comercial

- 1 VPS com 4 vCPU
- 8 GB RAM
- 120 GB SSD

### Escala inicial confortável

- 1 VPS com 8 vCPU
- 16 GB RAM
- 200 GB SSD

## Domínios sugeridos

- `app.seudominio.com` → frontend React
- `n8n.seudominio.com` → n8n
- `wa.seudominio.com` → Evolution API

## Passo a passo

### 1. Criar DNS

No Cloudflare, crie os registros:

- `app` apontando para a Vercel
- `n8n` apontando para o IP da VPS
- `wa` apontando para o IP da VPS

### 2. Preparar VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Subir n8n + Evolution

```bash
cd deployment
cp .env.production.example .env
nano .env
sudo docker compose -f docker-compose.saas.yml --env-file .env up -d
```

### 4. Subir frontend na Vercel

Você pode usar GitHub + import na Vercel.

Variáveis do frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_N8N_BASE_URL=https://n8n.seudominio.com`
- `VITE_N8N_DISPATCH_WEBHOOK=campanha-disparo`

### 5. Aplicar banco

No SQL Editor do Supabase rode, nesta ordem:

1. `database/schema.sql`
2. `database/migrations/001_saas_premium.sql`
3. `database/migrations/002_seed_plans.sql`

### 6. Importar workflows no n8n

Importe:

- `01-selfie-analysis.json`
- `02-campaign-dispatch.json`
- `03-product-intake.json`
- `04-evolution-inbound-router.json`

### 7. Configurar webhook global da Evolution

Use o endpoint público:

`https://n8n.seudominio.com/webhook/evolution-inbound`

### 8. Primeiro go-live

- criar conta admin
- concluir onboarding
- inserir loja em `tenant_settings`
- cadastrar instância em `whatsapp_instances`
- conectar QR code da Evolution
- testar selfie
- testar campanha

## Escalando depois

Quando crescer, separe em:

- VPS 1: n8n
- VPS 2: Evolution API
- Frontend na Vercel
- Supabase mantido no cloud oficial

## Backups recomendados

- export diário do schema do banco
- backup de workflows do n8n
- snapshot semanal da VPS
- export das sessões da Evolution quando aplicável
