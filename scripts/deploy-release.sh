#!/bin/sh
set -e

echo "Running Prisma db push for MongoDB..."

node /opt/prisma/node_modules/prisma/build/index.js db push --skip-generate

echo "Database schema sync complete"
