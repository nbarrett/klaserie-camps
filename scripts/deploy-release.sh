#!/bin/sh
set -e

echo "Running Prisma db push for MongoDB..."

# MongoDB uses db push instead of migrate deploy
node node_modules/prisma/build/index.js db push --skip-generate

echo "Database schema sync complete"
