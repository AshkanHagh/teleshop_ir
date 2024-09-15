#!/bin/bash
set -e

echo "Migrating database schema"
bun run db:migrate & PID=$!

wait $PID

echo "Starting development server"
bun run dev & PID=$!

wait $PID