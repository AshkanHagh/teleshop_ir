# Backend

Fastify-based backend API for the Teleshop.ir Telegram Mini App.

## Overview

This backend serves the Telegram Mini App and admin dashboard. It handles authentication, payments via Zarinpal, product management, realtime price updates, and WebSocket broadcasting.

## Features

- Telegram init data verification and user management
- JWT-based authentication with refresh tokens
- Zarinpal payment gateway integration
- Realtime TON price updates and product price recalculation via cron job
- WebSocket support for live admin dashboard updates
- PostgreSQL with Drizzle ORM
- Structured error handling and logging
- Environment-based configuration

## Folder Structure

```text
src/
├── modules/                 # Business logic organized by domain
│   ├── auth/                # Authentication services and DTOs
│   ├── payments/            # Payment processing (Zarinpal) and admin tools
│   ├── products/            # Product management and price scheduling
│   └── telegram/            # Telegram-specific services
├── lib/                     # Shared utilities and core libraries
│   ├── errors/              # Custom error types and exception handling
│   ├── fastify/             # Fastify constants
│   ├── traces/              # Observability (Sentry)
│   └── websocket/           # WebSocket connection management
├── database/                # Database configuration and models
│   ├── schemas/             # Drizzle table schemas
│   └── seed/                # Seed data and initialization
├── routes/                  # API route definitions
├── plugins/                 # Fastify plugins (DB, auth, error handling, etc.)
└── app.ts                   # Application entry point
```

## Key Directories

### modules/

Contains domain-specific services such as:

- `product.service.ts`
- `payment.service.ts`
- Authentication services
- Telegram integrations

### database/schemas/

Defines tables for:

- Users
- Premium plans
- Star packages
- Transactions
- Categories

### routes/

API endpoints for:

- Authentication
- Payments
- Products
- Telegram integrations
- WebSocket communication

### plugins/

Reusable Fastify plugins including:

- CORS
- Helmet
- Database connection
- Authentication
- Zarinpal integration
- Error handling

### lib/

Core infrastructure and shared utilities:

- Error handling
- WebSocket manager
- Tracing and monitoring
- Shared helpers

## API Documentation

Detailed route documentation is available in the `/docs` directory as a Postman collection.

## Main Components

### Authentication

- Telegram init data verification
- JWT access tokens
- Refresh token support
- Role-based authorization

### Payments

- Zarinpal payment gateway integration
- Payment verification callbacks
- Admin payment management tools

### Products

- Telegram Premium plans
- Telegram Star packages
- Automatic IRR price updates based on TON exchange rate from Navasan API

### Realtime Updates

A scheduled cron job runs every minute to:

1. Fetch the latest TON price
2. Recalculate product prices
3. Broadcast updates through WebSockets

### Telegram Bot

- Basic command handling
- Webhook support
- Telegram ecosystem integrations

## Technology Stack

- Fastify
- TypeScript
- PostgreSQL
- Drizzle ORM
- Zod
- Grammy.js
- WebSockets
- Sentry
- Docker
- Caddy Reverse Proxy

## Setup

### 1. Environment Variables

Copy:

```bash
.env.example
```

to:

```bash
.env
```

and fill in the required values.

### 2. Start Services

```bash
docker compose -f docker-compose.dev.yaml up -d
```

```bash
pnpm dev
```

The API will be available on the configured port (default: `7319`).
