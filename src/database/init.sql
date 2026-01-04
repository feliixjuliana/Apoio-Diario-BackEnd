CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários :)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255),
    reset_expires TIMESTAMP
);

-- Tabela de Crianças :)
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    nome VARCHAR(255) NOT NULL,
    idade INTEGER NOT NULL,
    sons_ativos BOOLEAN DEFAULT TRUE,
    vibracao_ativa BOOLEAN DEFAULT TRUE,
    animacoes_ativas BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);