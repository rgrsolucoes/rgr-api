# RGR-API

API REST para sistema SaaS de gestão de pequenas e médias empresas. Desenvolvida com Node.js, Express, TypeScript e MySQL.

## 🚀 Funcionalidades

- 🔐 Autenticação JWT com refresh tokens
- 👥 Gestão completa de usuários (CRUD)
- 🏢 Arquitetura multi-tenant (isolamento por empresa)
- 🔒 Hash de senhas com bcrypt
- ✅ Validação de requisições
- 🛡️ Middleware de segurança (CORS, Helmet)
- 📝 Sistema de logs centralizado
- 🚫 Tratamento de erros centralizado
- 📊 Suporte a paginação
- 🔄 Endpoint de health check

## 🛠️ Stack Tecnológica

- **Runtime:** Node.js com TypeScript
- **Framework:** Express.js 5.x
- **Banco de Dados:** MySQL 5.6+
- **Autenticação:** JWT (jsonwebtoken)
- **Segurança:** bcrypt, helmet, cors
- **Validação:** express-validator

## 📋 Pré-requisitos

- Node.js 16+ e npm
- MySQL 5.6+ (servidor externo)
- Credenciais do banco de dados MySQL

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Replit (Secrets):

```bash
# Servidor
PORT=5000
NODE_ENV=development

# JWT (opcional - usa SESSION_SECRET se não configurado)
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# MySQL - OBRIGATÓRIO
DB_HOST=seu_host_mysql
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=rgr_db
DB_CONNECTION_LIMIT=10

# Segurança
BCRYPT_ROUNDS=12
```

### 2. Configurar Banco de Dados MySQL

Execute o script SQL fornecido (`database-schema.sql`) no seu servidor MySQL:

```bash
mysql -h SEU_HOST -u SEU_USUARIO -p < database-schema.sql
```

### 3. Iniciar Servidor

O servidor iniciará automaticamente na porta 5000. Você pode acessar:

- **Health Check:** `GET /health`
- **API Info:** `GET /api`

## 📚 Documentação da API

### Autenticação

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "login": "admin",
  "password": "Test@123"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "cp050": "admin",
      "cp010": 1
    }
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Verificar Token
```http
GET /api/auth/verify
Authorization: Bearer {token}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Gestão de Usuários

**Todos os endpoints de usuários requerem autenticação via Bearer token.**

#### Criar Usuário
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "cp050": "novo.usuario",
  "cp064": "SenhaForte@123",
  "cp010": 1
}
```

**Validações:**
- Login: 3-50 caracteres, apenas letras, números, pontos, hífens e underscores
- Senha: 6-100 caracteres, deve conter maiúscula, minúscula e número
- ID Empresa: inteiro positivo

#### Listar Usuários
```http
GET /api/users?page=1&limit=50
Authorization: Bearer {token}
```

#### Buscar Usuário
```http
GET /api/users/{login}
Authorization: Bearer {token}
```

#### Usuário Atual
```http
GET /api/users/me
Authorization: Bearer {token}
```

#### Atualizar Usuário
```http
PUT /api/users/{login}
Authorization: Bearer {token}
Content-Type: application/json

{
  "cp064": "NovaSenha@456"
}
```

#### Deletar Usuário
```http
DELETE /api/users/{login}
Authorization: Bearer {token}
```

**Nota:** Usuários não podem deletar a si mesmos.

## 🏗️ Estrutura do Projeto

```
src/
├── config/          # Configurações (env, database, jwt)
├── controllers/     # Controladores da API
├── middleware/      # Middlewares (auth, validation, errors)
├── models/          # Models de banco de dados
├── routes/          # Definição de rotas
├── services/        # Lógica de negócio
├── types/           # Definições TypeScript
├── utils/           # Utilitários (logger, response)
├── app.ts           # Configuração do Express
└── server.ts        # Entry point

database-schema.sql  # Schema do banco de dados
tsconfig.json        # Configuração TypeScript
```

## 🔒 Segurança

- Senhas são hasheadas com bcrypt (12 rounds)
- Autenticação via JWT com tokens de acesso e refresh
- Validação de entrada em todos os endpoints
- Headers de segurança com Helmet
- CORS configurável
- Isolamento multi-tenant por empresa

## 📊 Estrutura do Banco de Dados

### Tabela Tb004 (Usuários)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| cp050 | VARCHAR(50) | Login do usuário |
| cp064 | VARCHAR(255) | Senha (hash bcrypt) |
| cp010 | INT UNSIGNED | ID da empresa |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

**Chave Primária:** (cp050, cp010) - Garante login único por empresa

## 🚀 Próximos Passos

Após configurar o módulo de autenticação e usuários, você pode adicionar:

- Módulo de gestão de empresas
- Sistema de permissões e roles
- Módulos específicos de gestão empresarial
- Auditoria e logs de ações
- Rate limiting
- Blacklist de tokens (logout real)

## 📝 Notas Importantes

1. **Conexão MySQL Externa:** Esta API está configurada para conectar a um servidor MySQL externo. Configure as variáveis de ambiente com as credenciais corretas.

2. **Ambiente de Desenvolvimento:** O servidor está rodando em modo de desenvolvimento. Para produção, ajuste as variáveis NODE_ENV e outras configurações de segurança.

3. **JWT Secret:** Use o SESSION_SECRET do Replit ou configure um JWT_SECRET personalizado nas variáveis de ambiente.

## 🐛 Troubleshooting

### Erro de Conexão com MySQL
- Verifique se as credenciais estão corretas nas variáveis de ambiente
- Confirme que o servidor MySQL está acessível externamente
- Verifique se o firewall permite conexões na porta 3306

### Token Inválido
- Verifique se o token JWT não expirou
- Confirme que está enviando o header: `Authorization: Bearer {token}`

## 📄 Licença

ISC
