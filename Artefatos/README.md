# Artefatos do projeto

Este diretório reúne os modelos acadêmicos do banco de dados do Financial Controller.

## Conteúdo

| Arquivo | Representação |
| --- | --- |
| `Modelos Diagrama BD's/Modelo Peter Chen.jpeg` | modelo entidade-relacionamento na notação de Peter Chen |
| `Modelos Diagrama BD's/Modelo Pé de Galinha.jpeg` | modelo relacional na notação pé de galinha |
| `Modelos Diagrama BD's/Estrutura de Dados.jpeg` | visão estrutural dos dados |

Os diagramas registram etapas da evolução do projeto e podem não refletir isoladamente todas as mudanças posteriores. A fonte de verdade executável do banco é o arquivo [`Codigo/back-end/database/schema.sql`](../Codigo/back-end/database/schema.sql), derivado das consultas utilizadas pelos DAOs.

O schema atual contém as entidades de usuários, sessões, contas, categorias, lançamentos, metas, conversas e mensagens, além da extensão pgvector para busca semântica.

Para aplicá-lo manualmente:

```bash
psql "$DB_URL" -f Codigo/back-end/database/schema.sql
```
