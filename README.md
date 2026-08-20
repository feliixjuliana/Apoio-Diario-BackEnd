# 🧩 Apoio Diário - Backend (TEA)

Este é o backend da aplicação **Apoio Diário**, um gerenciador de rotinas para crianças com TEA. Ele permite que pais/profissionais gerenciem múltiplos perfis de crianças, cada um com suas próprias preferências sensoriais (som, vibração e animações).

## 🚀 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **Docker Desktop** (ativo e rodando)
- **Postman** (para testar as rotas)

---

## 🛠️ Passo a Passo para Rodar

### 1. Instalar as dependências

Na raiz do projeto, instale exatamente as versões registradas no lockfile:

```powershell
npm ci
```

### 2. Configurar o ambiente local

Crie um `.env` local, nunca versionado, e mantenha a conexão de produção fora da
estação de desenvolvimento. Os valores abaixo são apenas exemplos; a senha usada
em `POSTGRES_PASSWORD` deve ser a mesma codificada dentro de `DATABASE_URL`.

```env
PORT=3000
JWT_SECRET=<segredo-exclusivo-de-desenvolvimento>

POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_USER=apoio_local
POSTGRES_PASSWORD=<senha-exclusivamente-local>
POSTGRES_DB=apoio_diario_local

DATABASE_URL=postgresql://apoio_local:<senha-local-url-encoded>@127.0.0.1:5433/apoio_diario_local?schema=public
```

Complete as demais integrações somente quando o fluxo exercitado precisar delas:

```env
GOOGLE_CLIENT_ID=
EMAIL_USER=
EMAIL_PASS=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
```

### 3. Subir o PostgreSQL local

Com o Docker Desktop aberto, suba apenas o banco e aguarde o estado `healthy`:

```powershell
docker compose up -d db
docker compose ps
docker compose exec db pg_isready -U apoio_local -d apoio_diario_local
```

O PostgreSQL fica disponível somente em `127.0.0.1:5433` e persiste os dados em
um volume local do Docker.

### 4. Aplicar as migrations existentes

Confirme primeiro que `DATABASE_URL` aponta para `127.0.0.1:5433`. Em seguida,
aplique o histórico versionado e gere o Prisma Client:

```powershell
npm run prisma:local -- migrate status
npm run prisma:local -- migrate deploy
npm run prisma:local -- migrate status
npx prisma generate
```

O script `prisma:local` valida host, porta e nome do banco antes de iniciar o
Prisma. Use `npm run prisma:local -- migrate dev --name <nome-da-migration>`
somente quando uma task aprovada alterar o `schema.prisma`. O comando protegido
bloqueia `migrate reset`, pois ele apaga os dados do schema.

### 5. Rodar a aplicação

```powershell
npm run start:dev
```

Valide a API em outro PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/api
```

### 6. Executar o E2E em banco isolado

Crie uma vez o banco de testes dentro do mesmo container:

```powershell
docker compose exec db createdb -U apoio_local apoio_diario_test
```

Em um PowerShell separado, defina uma `DATABASE_URL` temporária para o banco de
testes, aplique as migrations e execute o E2E:

```powershell
$env:DATABASE_URL = "postgresql://apoio_local:<senha-local-url-encoded>@127.0.0.1:5433/apoio_diario_test?schema=public"
npm run prisma:local -- migrate deploy
npm run test:e2e -- --runInBand
```

O teste possui uma trava e será interrompido se a URL não apontar para
`apoio_diario_test` em `127.0.0.1:5433`.

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
