#!/usr/bin/env bash
set -euo pipefail

# Simple helper to create an admin Funcionario and print the JWT token
# Usage: ./create_admin.sh [senha] [login] [nome] [email]

API_URL="http://localhost:3000/api"
SENHA="${1:?Informe a senha como primeiro argumento}"
LOGIN="${2:-admin}"
NOME="${3:-Admin}"
EMAIL="${4:-admin@local}"

echo "Creating funcionario: $LOGIN"
curl -S --fail -X POST "$API_URL/funcionarios" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"$NOME\",\"login\":\"$LOGIN\",\"senha\":\"$SENHA\",\"email\":\"$EMAIL\"}"

echo -e "\nLogging in to get token..."
curl -S --fail -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"login\":\"$LOGIN\",\"senha\":\"$SENHA\"}"

echo -e "\nDone."
