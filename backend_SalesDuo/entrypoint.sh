#!/bin/sh
# This script ensures the database schema is applied before starting the server.
# The 'set -e' command will make the script exit immediately if any command fails.
set -e

# The waiting loop has been removed. Docker Compose's 'depends_on' with 'service_healthy'
# now handles waiting for the database to be ready before this script even runs.

echo "Database is confirmed healthy. Pushing Drizzle schema..."
# Run the database schema migration command defined in your package.json.
npm run db:push

echo "Schema push complete. Starting the development server..."
# Start the application's development server.
exec npm run dev

