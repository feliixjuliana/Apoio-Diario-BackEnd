# 🧩 Apoio Diário - Backend (TEA)

Este é o backend da aplicação **Apoio Diário**, um gerenciador de rotinas para crianças com TEA. Ele permite que pais/profissionais gerenciem múltiplos perfis de crianças, cada um com suas próprias preferências sensoriais (som, vibração e animações).

## 🚀 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **Docker Desktop** (ativo e rodando)
- **Postman** (para testar as rotas)

---

## 🛠️ Passo a Passo para Rodar

### 1. Clonar e Instalar

Abra o terminal na pasta do projeto e execute:

```bash
npm install

```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo chamado `.env` na raiz do projeto e cole as configurações que definimos:

```env
PORT=3000
JWT_SECRET=seu_jwt_secret

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_HOST=
POSTGRES_PORT=

DATABASE_URL=

# Se for usar Google Login/Email futuramente:
GOOGLE_CLIENT_ID=seu_id
EMAIL_USER=seu_email
EMAIL_PASS=sua_senha_app

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
```

### 3. Subir o Banco de Dados (Docker)

Certifique-se de que o **Docker Desktop** está aberto. No terminal, execute:

```bash
docker compose up -d
```

### 4. Rodar o Prisma

Caso dê erro algum erro do Prisma ao rodar a aplicação, é bom resetar o banco. Caso não aconteça, pode só pular para o 2º ponto.

1. Rode primeiro:

```
npx prisma migrate reset
```

2. depois rode:

```
npx prisma migrate dev
```

> Esse comando vai fazer rodar as migrations e gerar o banco atualizado.

```bash
npx prisma generate
```

> Esse comando vai gerar o Prisma Client.

### 5. Rodar a Aplicação

Com o Docker rodando em segundo plano, inicie o servidor NestJS:

```bash
npm run start:dev
```

---

## 📡 Testando no Postman

A API utiliza o prefixo `/api`. Aqui está o fluxo para testar:

### A. Criar Conta e Login

1. **Registrar**: `POST http://localhost:3000/api/auth/register` (envie email e password).

{
"email": "exemplo@email.com",
"password": "senha_segura_123"
}

2. **Logar**: `POST http://localhost:3000/api/auth/login`.
3. **Copiar Token**: Copie o `token` recebido na resposta do login.

### B. Gerenciar Perfis de Crianças

> **Importante**: Em todas as rotas abaixo, vá na aba **Auth** do Postman, selecione **Bearer Token** e cole o seu token.

- **Cadastrar Criança**: `POST http://localhost:3000/api/children`

```json
{
  "nome": "João",
  "idade": 7,
  "sonsAtivos": true,
  "vibracaoAtiva": true,
  "animacoesAtivas": true
}
```

- **Listar minhas crianças**: `GET http://localhost:3000/api/children`
- **Editar perfil**: `PUT http://localhost:3000/api/children/{id_da_crianca}`
- **Deletar perfil**: `DELETE http://localhost:3000/api/children/{id_da_crianca}`

---

## 📂 Estrutura de Pastas Úteis

- `src/auth`: Guarda e lógica de autenticação JWT.
- `src/users`: Gerenciamento dos pais/responsáveis.
- `src/children`: Gerenciamento dos perfis das crianças.
- `src/routines`: Gerenciamento das atividades.
- `src/subtasks`: Gerenciamento das sub-atividades.
- `database/init.sql`: Script de criação automática das tabelas.
