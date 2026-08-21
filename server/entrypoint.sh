#!/bin/sh
set -e

echo "======================================"
echo " Running database seed..."
echo "======================================"

npm run seed

echo "======================================"
echo " Seed completed successfully"
echo " Starting server..."
echo "======================================"

exec node src/server.js