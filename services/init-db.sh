#!/bin/bash
# init-db.sh — runs inside the Postgres container on first start.
# Creates one database per service so each service is fully isolated.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE auth_db;
  CREATE DATABASE post_db;
  CREATE DATABASE comment_db;
  CREATE DATABASE like_db;
EOSQL

echo "Databases auth_db, post_db, comment_db, like_db created."
