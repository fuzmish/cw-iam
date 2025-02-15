#!/bin/bash
set -euxo pipefail

cd "$(dirname $0)"

if [ -d ./iam-dataset ]; then
  rm -fr ./iam-dataset
fi

git clone --depth=1 --no-checkout --filter=tree:0 https://github.com/iann0036/iam-dataset.git
cd iam-dataset
git sparse-checkout set --no-cone \
  'gcp/role_permissions.json'
git checkout
