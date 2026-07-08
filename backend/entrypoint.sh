#!/bin/sh
set -e
npx prisma db push --accept-data-loss
node dist/index.js
