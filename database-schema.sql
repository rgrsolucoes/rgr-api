-- RGR-API Database Schema
-- MySQL 5.6+ compatible

-- Criar database
CREATE DATABASE IF NOT EXISTS rgr_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rgr_db;

-- Tabela de usuários (Tb004)
CREATE TABLE IF NOT EXISTS Tb004 (
  cp050 VARCHAR(50) NOT NULL COMMENT 'Login do usuário',
  cp064 VARCHAR(255) NOT NULL COMMENT 'Senha (hash bcrypt)',
  cp010 INT UNSIGNED NOT NULL COMMENT 'ID da empresa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cp050, cp010),
  INDEX idx_company (cp010),
  INDEX idx_login (cp050)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exemplo de inserção de usuário de teste (senha: Test@123)
-- IMPORTANTE: Este é apenas um exemplo para desenvolvimento
INSERT INTO Tb004 (cp050, cp064, cp010) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVpLzjfKEZO', 1);

-- Comentários sobre a estrutura:
-- cp050: Login único por empresa
-- cp064: Senha criptografada com bcrypt (rounds=12)
-- cp010: ID da empresa para multi-tenancy
-- A chave primária composta (cp050, cp010) garante que cada login seja único dentro de cada empresa
