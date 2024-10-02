#!/bin/bash

declare -A users=(
  ["glpi"]="admin"
  ["adm - gianluca"]="admin"
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

  curl --location 'https://backend-plugin-kanban-production.up.railway.app/users' \
  --header 'Content-Type: application/json' \
  --data "{
    \"name\": \"$name\",
    \"permissions\": \"$permissions\"
  }"
done
