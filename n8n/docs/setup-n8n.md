# Setup dos workflows n8n

## Workflow 01 - Selfie Analysis

### Entrada esperada

Webhook `POST /webhook/selfie-analysis`

Payload sugerido:

```json
{
  "store_id": "uuid-da-loja",
  "customer": {
    "full_name": "Nome da cliente",
    "phone": "+5511999999999",
    "email": "cliente@exemplo.com"
  },
  "image_url": "https://.../selfie.jpg",
  "source_channel": "whatsapp"
}
```

### O que o fluxo faz

- normaliza dados
- envia a selfie para a OpenAI
- recebe JSON estruturado com análise cromática
- upsert cliente no Supabase
- salva análise
- grava log da mensagem
- responde com texto pronto para WhatsApp

## Workflow 02 - Campaign Dispatch

Webhook `POST /webhook/campanha-disparo`

Payload sugerido:

```json
{
  "campaign_id": "uuid-da-campanha"
}
```

O fluxo busca a campanha, encontra clientes compatíveis e dispara mensagens pelo provider configurado.

## Workflow 03 - Product Intake

Webhook `POST /webhook/product-intake`

Permite cadastrar peça nova via n8n e disparar segmentações futuras.

## Adaptação para outros provedores

Troque apenas os nodes HTTP responsáveis por envio. O restante do fluxo pode permanecer igual.
