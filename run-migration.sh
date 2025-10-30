#!/bin/bash

# Backup current DATABASE_URL
BACKUP_DATABASE_URL="$DATABASE_URL"

# Set DATABASE_URL to direct connection for migrations
export DATABASE_URL="$DATABASE_URL_DIRECT"

echo "📦 Running Prisma migrations with direct database connection..."

# Run the migration
cd packages/core
npx prisma migrate deploy

# Restore original DATABASE_URL
export DATABASE_URL="$BACKUP_DATABASE_URL"

echo "✅ Migration complete. DATABASE_URL restored."
