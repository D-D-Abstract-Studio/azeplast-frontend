#!/bin/bash

declare -A users=(
  ["glpi"]="admin"
  ["post-only"]="user"
  ["tech"]="user"
  ["normal"]="user"
  ["glpi-system"]="user"
  ["Compras"]="user"
  ["Fiscal"]="user"
  ["Financeiro"]="user"
)

for name in "${!users[@]}"; do
  permissions=${users[$name]}

  curl --location 'http://localhost:8000/users' \
  --header 'Content-Type: application/json' \
  --data "{
    \"name\": \"$name\",
    \"permissions\": \"$permissions\"
  }"
done
