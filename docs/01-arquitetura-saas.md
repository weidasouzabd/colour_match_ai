# Arquitetura SaaS Multitenant Premium

## Recomendação inicial

Para seu cenário inicial, a melhor arquitetura é:

- **Frontend React**: Vercel
- **Banco/Auth/Storage**: Supabase Cloud
- **Automações**: n8n self-host em VPS
- **WhatsApp**: Evolution API self-host em VPS
- **TLS / proxy reverso**: Caddy ou Coolify
- **DNS**: Cloudflare

## Por que essa arquitetura é a melhor para começar

Ela reduz complexidade operacional onde não há vantagem competitiva direta e mantém sob seu controle os componentes críticos do negócio:

- Supabase hospedado poupa tempo com manutenção de banco, backups e observabilidade
- n8n e Evolution ficam sob seu controle, o que facilita webhooks, QR code, persistência e troubleshooting
- frontend em Vercel reduz custo e simplifica deploy contínuo

## Multi-tenant no projeto

O isolamento entre lojistas já está baseado em `store_id` com RLS no Supabase.

Cada loja possui:

- cadastro próprio
- usuários próprios
- clientes próprios
- campanhas próprias
- produtos próprios
- instâncias WhatsApp próprias
- uso e auditoria próprios

## Novas camadas premium adicionadas

- `plans`
- `subscriptions`
- `tenant_settings`
- `whatsapp_instances`
- `tenant_usage_daily`
- `audit_logs`
- `store_invitations`

## Fluxo premium recomendado

1. Loja cria conta
2. Onboarding cria `store`, `profile` e `tenant_settings`
3. Loja conecta instância Evolution
4. Webhook inbound da Evolution entra no n8n
5. n8n resolve a loja pela instância
6. Se houver selfie, roda análise IA
7. Resultados salvam em clientes, análises, preferências e uso diário
8. Campanhas filtram por cartela + estilo + histórico
9. Painel mostra métricas por tenant
