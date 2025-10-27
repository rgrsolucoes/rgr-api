# RGR-API

## Overview

RGR-API is a REST API for a SaaS management system designed for small and medium businesses. It provides multi-tenant architecture with company-based data isolation, user authentication and authorization, and role-based access control. The system is built with Node.js, Express, TypeScript, and MySQL, offering a robust foundation for enterprise resource management.

## Recent Changes

### October 27, 2025
- **Person Management Module**: Complete CRUD for physical and legal persons (Tb007 table with 60+ fields). Includes CPF/CNPJ validation with checksum verification, document type enforcement (CPF for física, CNPJ for jurídica), duplicate prevention, activation/deactivation, and advanced filtering (search, person type, status, sorting, pagination). Multi-tenant isolation enforced by stripping CP010/CP018 from updates.

### October 13, 2025
- **Token Blacklist System**: Implemented proper logout functionality with database-backed token blacklist (Tb_Token_Blacklist table). Middleware now validates tokens against blacklist on each request.
- **Company Management Module**: Complete CRUD operations for companies (Tb003/Tb_Empresa table) with activation/deactivation features. Service layer enforces business logic.
- **Roles and Permissions System**: Full role-based access control with roles, permissions, and role_permissions tables. Middleware wrapper (requirePermission) protects routes based on user permissions.
- **Audit Logging System**: Comprehensive audit trail (Tb_Audit_Log table) tracking all CREATE, UPDATE, DELETE operations with user context, IP addresses, and sanitized data changes.
- **Advanced Filtering**: Enhanced listing endpoints with pagination, search, and sorting capabilities for both users and companies. SQL injection vulnerability in sortOrder parameter identified and fixed with whitelist validation (ASC|DESC only).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Framework
- **Technology**: Node.js with TypeScript and Express.js 5.x
- **Rationale**: TypeScript provides type safety and better developer experience, while Express offers a mature, lightweight web framework
- **Structure**: Layered architecture separating routes, controllers, services, and models for clear separation of concerns

### Authentication & Authorization
- **Method**: JWT-based authentication with refresh tokens
- **Security**: Bcrypt password hashing with configurable rounds (default: 12)
- **Token Management**: Token blacklisting system for logout functionality
- **Multi-factor**: Role-based permissions system with granular resource/action controls
- **Rationale**: JWT provides stateless authentication suitable for APIs; refresh tokens enable secure long-term sessions; role-based permissions allow flexible access control

### Multi-Tenancy
- **Approach**: Shared database with company_id (cp010) field for data isolation
- **Implementation**: All data models include company context; middleware enforces tenant boundaries
- **Rationale**: Shared database reduces operational complexity while maintaining logical separation between companies

### Data Layer
- **ORM**: Custom model classes using raw SQL queries with mysql2
- **Connection**: Connection pooling for efficient database resource management
- **Rationale**: Direct SQL provides maximum control and performance; connection pooling prevents resource exhaustion

### Middleware Architecture
- **Authentication**: Token verification middleware for protected routes
- **Audit Logging**: Automatic tracking of all user actions with IP and user agent
- **Validation**: express-validator for request validation
- **Error Handling**: Centralized error handler with structured error responses
- **Security**: Helmet for HTTP headers, CORS for cross-origin requests

### API Design
- **Pattern**: RESTful resource-based endpoints
- **Response Format**: Standardized JSON responses with success/error structure
- **Pagination**: Built-in pagination support for list endpoints
- **Versioning**: API version included in response metadata

### Logging
- **Implementation**: Custom logger utility with structured log formatting
- **Levels**: info, warn, error, debug (debug only in development)
- **Format**: Timestamp, level, message, and optional metadata

## External Dependencies

### Database
- **MySQL 5.6+**: Primary data store (external server required)
- **Connection**: Configured via environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
- **Tables**: Tb003 (companies), Tb004 (users), plus roles, permissions, audit_logs, and token_blacklist tables

### NPM Packages
- **express**: Web framework
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing
- **mysql2**: MySQL client with promise support
- **helmet**: Security headers middleware
- **cors**: CORS middleware
- **express-validator**: Request validation
- **dotenv**: Environment variable management

### Environment Configuration
Required variables:
- Database: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- JWT: JWT_SECRET (falls back to SESSION_SECRET)
- Server: PORT (default: 5000), NODE_ENV

Optional variables:
- JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
- BCRYPT_ROUNDS
- RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
- ALLOWED_ORIGINS

### Deployment Platform
- **Replit**: Primary deployment platform
- **Considerations**: Always listens on 0.0.0.0:5000; secrets management via Replit Secrets