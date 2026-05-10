FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Build এর জন্য devDependencies সহ সব dependency লাগবে
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Run stage এ শুধু production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Build output + public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Next runtime config (যদি থাকে)
COPY --from=builder /app/next.config.* ./

ENV PORT=8080
EXPOSE 8080
CMD ["npm", "run", "start"]
