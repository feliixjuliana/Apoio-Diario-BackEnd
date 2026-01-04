# 🧩 Apoio Diário - Backend (TEA)

Este é o backend da aplicação **Apoio Diário**, um gerenciador de rotinas para crianças com TEA. Ele permite que pais/profissionais gerenciem múltiplos perfis de crianças, cada um com suas próprias preferências sensoriais (som, vibração e animações).

## 🚀 Pré-requisitos

* **Node.js** (versão 18 ou superior)
* **Docker Desktop** (ativo e rodando)
* **Postman** (para testar as rotas)

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
JWT_SECRET=JubisDandanApoioDiario

POSTGRES_USER=admin
POSTGRES_PASSWORD=adminsJujuDandanRoro
POSTGRES_DB=app_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

# Se for usar Google Login/Email futuramente:
GOOGLE_CLIENT_ID=seu_id
EMAIL_USER=seu_email
EMAIL_PASS=sua_senha_app

```

### 3. Subir o Banco de Dados (Docker)

Certifique-se de que o **Docker Desktop** está aberto. No terminal, execute:

```bash
docker compose down -v
docker compose up -d

```

> O comando `-v` garante que os volumes antigos sejam apagados e o banco seja criado do zero com o arquivo `init.sql` (contendo as tabelas `users` e `children`).

### 4. Rodar a Aplicação

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

* **Cadastrar Criança**: `POST http://localhost:3000/api/children`
```json
{
  "nome": "João",
  "idade": 7,
  "sonsAtivos": true,
  "vibracaoAtiva": true,
  "animacoesAtivas": true
}

```


* **Listar minhas crianças**: `GET http://localhost:3000/api/children`
* **Editar perfil**: `PUT http://localhost:3000/api/children/{id_da_crianca}`
* **Deletar perfil**: `DELETE http://localhost:3000/api/children/{id_da_crianca}`

---

## 📂 Estrutura de Pastas Úteis

* `src/auth`: Guarda e lógica de autenticação JWT.
* `src/users`: Gerenciamento dos pais/responsáveis.
* `src/children`: Gerenciamento dos perfis das crianças.
* `database/init.sql`: Script de criação automática das tabelas.
