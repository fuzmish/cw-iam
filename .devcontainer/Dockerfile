FROM node:23-bookworm

# setup pnpm
ARG PNPM_VERSION

RUN npm -g install pnpm@$PNPM_VERSION \
  && npm cache clean --force \
  && pnpm config set store-dir /opt/pnpm/store
