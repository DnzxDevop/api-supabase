
Este projeto é uma API simples em Node.js com Express que interage com o Supabase para verificar e registrar endereços IP.

## 🛠️ Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Supabase](https://supabase.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [crypto](https://nodejs.org/api/crypto.html)

## ⚙️ Como Funciona

### 1. Verificação de IP permitido

Rota: `POST /check-ip`

Verifica se o IP informado está permitido no banco de dados `allowed_ips`.

**Exemplo de body:**

```json
{
  "ip": "192.168.1.1"
}
