# Apoio-Diario-BackEnd

Backend do projeto **Apoio Diário**, responsável pela autenticação de usuários.

## 🚀 Tecnologias utilizadas

* **Node.js**
* **Express**
* **PostgreSQL**
* **JWT (JSON Web Token)**
* **Nodemailer** (envio de e-mail)
* **Google OAuth** (se utilizado)

---

## 📦 Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/feliixjuliana/Apoio-Diario-BackEnd.git
cd Apoio-Diario-BackEnd
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar o arquivo `.env`

Na raiz do projeto, crie um arquivo `.env` com:

```
PORT=

JWT_SECRET=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_HOST=
POSTGRES_PORT=5433

GOOGLE_CLIENT_ID=

EMAIL_USER=
EMAIL_PASS=
```

### 4. Rodar a aplicação

```bash
npm run dev
```

A API ficará disponível em:
**[http://localhost:PORT/api/](http://localhost:PORT/api/)**


## 🗄 Banco de Dados (PostgreSQL)

O backend usa as variáveis:

* `POSTGRES_USER`
* `POSTGRES_PASSWORD`
* `POSTGRES_DB`
* `POSTGRES_HOST`
* `POSTGRES_PORT`

Certifique-se de que o banco está rodando e acessível.

---

## 📧 Sistema de E-mail (Nodemailer)

Usado para envio de notificações ou recuperação de senha, caso implementado.

Variáveis:

* `EMAIL_USER`
* `EMAIL_PASS`

---

## 🔑 Login com Google OAuth

Requer apenas:

* `GOOGLE_CLIENT_ID`

---

## ✔ Pronto!

Após configurar o `.env`, basta iniciar com:

```bash
npm run dev
```

Se quiser, posso gerar um **README.md final exatamente pronto**, com estilização mais bonita, badges, tabela de rotas, ou uma versão em inglês também. Quer que eu gere o arquivo definitivo?
