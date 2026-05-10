FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "run", "start"]
