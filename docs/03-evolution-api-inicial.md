# Evolution API inicial

## Como você vai usar no início

Para o seu cenário inicial, mantenha **uma instância Evolution por loja**.

## Padrão recomendado de nome

`tenant-{slug-da-loja}`

Exemplo:

- `tenant-boutique-lux`
- `tenant-closet-prime`

## Registro sugerido no banco

Tabela: `whatsapp_instances`

Campos principais:

- `store_id`
- `provider = evolution`
- `instance_name`
- `base_url`
- `status`
- `connected_phone`

## Fluxo recomendado

1. Criar tenant no painel
2. Criar registro da instância
3. Criar a instância na Evolution
4. Ler QR code
5. Ativar webhook global para o n8n
6. Receber mensagens
7. Roteá-las pela instância

## Boas práticas

- não compartilhe a mesma instância entre lojas
- gere API key forte
- mantenha webhook HTTPS
- use Redis persistente
- use Postgres dedicado para Evolution
- monitore desconexões e re-login
