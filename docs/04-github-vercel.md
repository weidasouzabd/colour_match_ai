# Subir para GitHub e publicar na Vercel

## O que enviar para o GitHub

Suba o projeto inteiro, mas na Vercel você vai publicar **somente a pasta `frontend/`**.

## Estrutura importante

- raiz do repositório: projeto completo SaaS
- pasta publicada na Vercel: `frontend`
- backend/automação ficam fora da Vercel: VPS + n8n + Evolution API

## Passo 1 — criar repositório no GitHub

Exemplo:

```bash
git init
git branch -M main
git add .
git commit -m "feat: color sales ai saas premium"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

## Passo 2 — importar na Vercel

Na Vercel:

1. clique em **Add New Project**
2. conecte o GitHub
3. selecione o repositório
4. em **Root Directory**, escolha `frontend`
5. framework preset: **Vite**
6. build command: `npm run build`
7. output directory: `dist`

## Passo 3 — variáveis da Vercel

Cadastre estas variáveis:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_N8N_BASE_URL`
- `VITE_N8N_DISPATCH_WEBHOOK`

## Valores sugeridos

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
VITE_N8N_BASE_URL=https://n8n.seudominio.com
VITE_N8N_DISPATCH_WEBHOOK=campanha-disparo
```

## Passo 4 — deploy

Depois de salvar as variáveis, clique em **Deploy**.

## Observação importante

Como o frontend usa React Router, o arquivo `frontend/vercel.json` já foi incluído para garantir o rewrite de SPA.
