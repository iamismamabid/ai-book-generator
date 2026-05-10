FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Install deps (including devDependencies) needed to build
COPY package.json package-lock.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build output and required assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# If these exist in the project root, Next may read them at runtime.
COPY --from=builder /app/next.config.* ./

ENV PORT=8080
EXPOSE 8080
CMD ["npm", "run", "start"]
