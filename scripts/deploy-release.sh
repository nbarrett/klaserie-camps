#!/bin/sh
set -e

echo "Running Prisma db push for MongoDB..."

# MongoDB uses db push instead of migrate deploy
npx prisma db push --skip-generate

echo "Database schema sync complete"
