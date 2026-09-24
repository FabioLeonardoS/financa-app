# Stage 1: Base image
FROM node:20-alpine AS base
# Instalar pnpm
RUN npm install -g pnpm@latest
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 3: Builder
FROM base AS builder
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Geração do cliente do Prisma (precisamos do schema para isso)
RUN npx prisma generate
# Build da aplicação Next.js
RUN pnpm run build

# Stage 4: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar os arquivos públicos e de configuração
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar a saída "standalone" do build e os assets estáticos gerados
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar o schema do prisma e o utilitário de migration
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
