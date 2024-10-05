FROM node:22-bookworm

# setup pnpm
ARG PNPM_VERSION=9.12.0
ARG PNPM_ENV_FILE=/etc/profile.d/pnpm.sh
ARG PNPM_STORE_DIR=/opt/pnpm/store

RUN curl -fsSL https://get.pnpm.io/install.sh \
  | ENV="$PNPM_ENV_FILE" SHELL="$(which sh)" PNPM_VERSION="$PNPM_VERSION" sh - \
  && . "$PNPM_ENV_FILE" \
  && pnpm config set store-dir "$PNPM_STORE_DIR"
