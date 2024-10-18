#!/bin/bash
set -e

echo "Migrating database schema..."
bunx drizzle-kit migrate & PROCESSID=$!

wait $PROCESSID

if [ $? -eq 0 ]; then
  echo "Database migrated successfully."
else
  echo "Failed to migrate database schema." >&2
  exit 1
fi

echo "Start seeding"
bun run db:seed & PROCESSID=$!

wait $PROCESSID

if [ $? -eq 0 ]; then
  echo "seed successfully."
else
  echo "Failed to seed." >&2
  exit 1
fi

echo "Starting development server..."
bun start & PROCESSID=$!

wait $PROCESSID

if [ $? -eq 0 ]; then
  echo "Development server started successfully."
else
  echo "Failed to start development server." >&2
  exit 1
fi