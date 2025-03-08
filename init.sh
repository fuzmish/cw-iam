#!/bin/sh

cd "$(dirname "$0")"
curl -o public/role_permissions.json https://raw.githubusercontent.com/iann0036/iam-dataset/refs/heads/main/gcp/role_permissions.json
