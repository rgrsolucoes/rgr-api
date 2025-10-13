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

-- Tabela de blacklist de tokens (para logout)
CREATE TABLE IF NOT EXISTS token_blacklist (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL,
  user_login VARCHAR(50) NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_token (token(255)),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS Tb003 (
  cp010 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID da empresa',
  cp020 VARCHAR(100) NOT NULL COMMENT 'Razão social',
  cp030 VARCHAR(100) COMMENT 'Nome fantasia',
  cp040 VARCHAR(20) COMMENT 'CNPJ',
  cp050 VARCHAR(100) COMMENT 'Email',
  cp060 VARCHAR(20) COMMENT 'Telefone',
  cp070 TEXT COMMENT 'Endereço completo',
  cp080 BOOLEAN DEFAULT TRUE COMMENT 'Ativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cnpj (cp040),
  INDEX idx_active (cp080)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir empresa de exemplo
INSERT INTO Tb003 (cp010, cp020, cp030, cp040, cp080) VALUES 
(1, 'Empresa Exemplo LTDA', 'Empresa Exemplo', '12.345.678/0001-90', TRUE);

-- Exemplo de inserção de usuário de teste (senha: Test@123)
-- IMPORTANTE: Este é apenas um exemplo para desenvolvimento
INSERT INTO Tb004 (cp050, cp064, cp010) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVpLzjfKEZO', 1);

-- Tabela de roles/permissões
CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nome do role',
  description VARCHAR(255) COMMENT 'Descrição do role',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resource VARCHAR(50) NOT NULL COMMENT 'Recurso (users, companies, etc)',
  action VARCHAR(50) NOT NULL COMMENT 'Ação (create, read, update, delete)',
  description VARCHAR(255) COMMENT 'Descrição da permissão',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_permission (resource, action),
  INDEX idx_resource (resource)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de relacionamento role-permissões
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT UNSIGNED NOT NULL,
  permission_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar coluna role_id na tabela de usuários
ALTER TABLE Tb004 ADD COLUMN role_id INT UNSIGNED DEFAULT 1 AFTER cp010;
ALTER TABLE Tb004 ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id);

-- Inserir roles padrão
INSERT INTO roles (name, description) VALUES 
('user', 'Usuário padrão com permissões básicas'),
('admin', 'Administrador com todas as permissões'),
('manager', 'Gerente com permissões de gestão');

-- Inserir permissões padrão
INSERT INTO permissions (resource, action, description) VALUES 
('users', 'create', 'Criar usuários'),
('users', 'read', 'Visualizar usuários'),
('users', 'update', 'Atualizar usuários'),
('users', 'delete', 'Deletar usuários'),
('companies', 'create', 'Criar empresas'),
('companies', 'read', 'Visualizar empresas'),
('companies', 'update', 'Atualizar empresas'),
('companies', 'delete', 'Deletar empresas');

-- Atribuir todas as permissões ao role admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions;

-- Atribuir permissões de leitura ao role user
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE action = 'read';

-- Atribuir permissões de gestão ao role manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE action IN ('read', 'update', 'create');

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_login VARCHAR(50) NOT NULL COMMENT 'Usuário que realizou a ação',
  company_id INT UNSIGNED NOT NULL COMMENT 'ID da empresa',
  action VARCHAR(50) NOT NULL COMMENT 'Ação realizada (create, update, delete, login, etc)',
  resource VARCHAR(50) NOT NULL COMMENT 'Recurso afetado (users, companies, etc)',
  resource_id VARCHAR(100) COMMENT 'ID do recurso afetado',
  details TEXT COMMENT 'Detalhes da ação em JSON',
  ip_address VARCHAR(45) COMMENT 'Endereço IP do usuário',
  user_agent VARCHAR(255) COMMENT 'User agent do navegador',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_login),
  INDEX idx_company (company_id),
  INDEX idx_action (action),
  INDEX idx_resource (resource),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentários sobre a estrutura:
-- cp050: Login único por empresa
-- cp064: Senha criptografada com bcrypt (rounds=12)
-- cp010: ID da empresa para multi-tenancy
-- A chave primária composta (cp050, cp010) garante que cada login seja único dentro de cada empresa
