# Escola do Movimento

App web (para telemóvel) para planear e registar as sessões da Escola do Movimento: horário semanal e alterações, registo rápido das sessões, exercícios com vídeo, avaliações (gatinhar e saltar), pessoas e contactos, e relatórios semanais e mensais.

- **Site:** página estática (`index.html`), publicada no GitHub Pages.
- **Dados e login:** Supabase. As regras de acesso estão em `supabase/schema.sql`.
- **Configuração:** `config.js` (URL do projeto Supabase e chave pública "anon").

## Acessos

| Quem | Como entra | O que pode fazer |
|---|---|---|
| Coordenação | Email + password | Tudo, incluindo dar e retirar acessos |
| Preparação física | Email + password | Registar sessões, notas, avaliações e ajustar horários |
| Pais, treinadores, direção | Só o link, sem conta | Ver plano, exercícios, horário e resumo das sessões |

Contactos, notas internas e avaliações individuais nunca são públicos.

## Testar localmente

```
python3 -m http.server 8000
```

Sem `config.js` preenchido, a app abre em modo demonstração com os dados fictícios de `simulacao.js` (uma época simulada com vários escalões, alterações, avaliações e reuniões).
