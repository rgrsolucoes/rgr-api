# 🔧 Guia de Configuração - RGR-API

## Passo 1: Configurar Variáveis de Ambiente no Replit

A API precisa se conectar ao seu servidor MySQL externo. Siga os passos abaixo:

### 1.1 Abrir Secrets no Replit

1. No Replit, clique no ícone de **"Tools"** (🔧) no menu lateral esquerdo
2. Selecione **"Secrets"**
3. Adicione as seguintes variáveis:

### 1.2 Variáveis Obrigatórias

| Variável | Valor de Exemplo | Descrição |
|----------|------------------|-----------|
| `DB_HOST` | `mysql.seuservidor.com` | Host do servidor MySQL |
| `DB_PORT` | `3306` | Porta do MySQL (padrão: 3306) |
| `DB_USER` | `seu_usuario` | Usuário do banco de dados |
| `DB_PASSWORD` | `sua_senha_segura` | Senha do banco de dados |
| `DB_NAME` | `rgr_db` | Nome do banco de dados |

### 1.3 Variáveis Opcionais

| Variável | Valor Padrão | Descrição |
|----------|--------------|-----------|
| `JWT_SECRET` | `SESSION_SECRET` | Secret para assinar tokens JWT |
| `JWT_EXPIRES_IN` | `24h` | Tempo de expiração do token |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Tempo de expiração do refresh token |
| `BCRYPT_ROUNDS` | `12` | Rounds do bcrypt para hash de senhas |
| `PORT` | `5000` | Porta do servidor (sempre 5000 no Replit) |
| `NODE_ENV` | `development` | Ambiente de execução |

## Passo 2: Configurar o Banco de Dados MySQL

### 2.1 Criar o Banco de Dados

No seu servidor MySQL, execute:

```sql
CREATE DATABASE IF NOT EXISTS rgr_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 Criar a Tabela de Usuários

Execute o script completo que está no arquivo `database-schema.sql`:

```bash
# Via linha de comando
mysql -h SEU_HOST -u SEU_USUARIO -p rgr_db < database-schema.sql

# Ou copie e cole o conteúdo no seu cliente MySQL
```

### 2.3 Criar Usuário de Teste (Opcional)

O script SQL já inclui um usuário de teste:
- **Login:** `admin`
- **Senha:** `Test@123`
- **Empresa:** `1`

## Passo 3: Testar a Conexão

### 3.1 Verificar Logs do Servidor

Após configurar as variáveis e reiniciar o servidor, verifique os logs:

✅ **Conexão bem-sucedida:**
```
[INFO] RGR-API server running on http://0.0.0.0:5000
[INFO] Database connection established successfully
```

❌ **Erro de conexão:**
```
[ERROR] Database connection failed: ECONNREFUSED
```

Se você ver o erro acima, verifique:
1. Credenciais do MySQL estão corretas
2. Servidor MySQL está acessível externamente
3. Firewall permite conexões na porta 3306
4. O host MySQL aceita conexões remotas

### 3.2 Testar a API

Execute um teste de login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin",
    "password": "Test@123"
  }'
```

**Resposta esperada:**
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

## Passo 4: Configurar MySQL para Aceitar Conexões Remotas

Se você estiver tendo problemas de conexão, pode ser necessário configurar o MySQL para aceitar conexões remotas.

### 4.1 No servidor MySQL

1. Edite o arquivo de configuração do MySQL:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

2. Encontre e comente a linha:
```
# bind-address = 127.0.0.1
```

3. Reinicie o MySQL:
```bash
sudo systemctl restart mysql
```

### 4.2 Criar Usuário com Acesso Remoto

```sql
-- Criar usuário que pode se conectar de qualquer lugar
CREATE USER 'seu_usuario'@'%' IDENTIFIED BY 'sua_senha_segura';

-- Dar permissões no banco rgr_db
GRANT ALL PRIVILEGES ON rgr_db.* TO 'seu_usuario'@'%';

-- Aplicar mudanças
FLUSH PRIVILEGES;
```

## Passo 5: Endpoints Disponíveis

Após configurar tudo, você terá acesso aos seguintes endpoints:

### Públicos
- `GET /health` - Health check
- `GET /api` - Informações da API
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/verify` - Verificar token

### Protegidos (requerem token)
- `GET /api/users/me` - Dados do usuário atual
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:login` - Buscar usuário
- `PUT /api/users/:login` - Atualizar usuário
- `DELETE /api/users/:login` - Deletar usuário
- `POST /api/auth/logout` - Logout

## Troubleshooting Comum

### Erro: "Database connection failed"
**Solução:** Verifique as credenciais do MySQL nas Secrets do Replit

### Erro: "Invalid credentials"
**Solução:** Verifique se o usuário existe no banco de dados e a senha está correta

### Erro: "Access token is required"
**Solução:** Inclua o header `Authorization: Bearer {seu_token}` na requisição

### Erro: "Validation failed"
**Solução:** Verifique se os dados enviados atendem às regras de validação:
- Login: 3-50 caracteres
- Senha: mínimo 6 caracteres, com maiúscula, minúscula e número
- ID Empresa: número inteiro positivo

## Segurança em Produção

Quando for colocar em produção, certifique-se de:

1. ✅ Alterar `NODE_ENV` para `production`
2. ✅ Usar um `JWT_SECRET` forte e único
3. ✅ Configurar CORS apenas para origens confiáveis
4. ✅ Usar HTTPS
5. ✅ Implementar rate limiting
6. ✅ Monitorar logs de acesso
7. ✅ Fazer backup regular do banco de dados

## Próximos Passos

Agora que a API está funcionando, você pode:

1. Criar mais usuários via endpoint `/api/users`
2. Implementar módulos adicionais de gestão
3. Adicionar sistema de permissões
4. Criar frontend para consumir a API
5. Implementar auditoria de ações
6. Adicionar mais empresas ao sistema

---

**Precisa de ajuda?** Verifique o arquivo `README.md` para documentação completa da API.
