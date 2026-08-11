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

## How It Works
 
### Authentication
Requests from the Mini App include Telegram init data, which is verified against the bot token to authenticate the user. On success, the backend issues a short-lived JWT access token plus a refresh token. Role-based checks gate access to admin-only routes.
 
### Price Updates
A cron job runs every minute and:
1. Fetches the current TON/IRR rate from the Navasan API
2. Recalculates prices for Telegram Premium plans and Star packages
3. Broadcasts the updated prices to connected clients over WebSocket
### WebSocket
The `lib/websocket` manager tracks active connections and pushes live updates (e.g. price changes) to the admin dashboard without requiring a page refresh or polling.
 
### Telegram Bot
A Grammy.js-based bot handles basic commands and receives updates via webhook, alongside the Mini App itself.

## API Documentation
Detailed route documentation is available at `/docs`.

# Setup
 
### 1. Environment Variables
Copy `.env.example` to `.env` and fill in the required values.
 
### 2. Start Services
```bash
docker compose up -d
```
This starts the backend and database containers.
 
### 3. Run Database Migrations
```bash
pnpm db:push
```
 
The API will be available on port `7319` by default, with docs at `/docs`.
