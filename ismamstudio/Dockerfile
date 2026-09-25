# ১. বেইজ ইমেজ সেট করা
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# ২. শুধুমাত্র প্যাকেজ ফাইলগুলো আগে কপি করা (ডকার ক্যাশ ব্যবহারের জন্য)
COPY package*.json ./

# ৩. ডিপেন্ডেন্সি ইনস্টল করা
RUN npm ci

# ৪. প্রিজমা স্কিমা ফাইলটি কপি করা (CRITICAL STEP)
# আপনার প্রিজমা ফোল্ডারটি যেখানে আছে সেটি কপি করুন
COPY prisma ./prisma/

# ৫. ডকার বিল্ডের ভেতরেই প্রিজমা ক্লায়েন্ট জেনারেট করা
# Build-time env stubs — real values are injected by Railway at runtime via Variables tab
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
ENV DIRECT_URL="postgresql://postgres:postgres@localhost:5432/postgres"
# NEXT_PUBLIC_ keys are embedded in the browser bundle — safe to set at build time
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsua2RwYWdlLmNvbSQ"
ENV NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="live_0d6de0aa54c86f518c3a693c0ae"
ENV NEXT_PUBLIC_PADDLE_ENVIRONMENT="production"
ENV NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTHLY="pri_01kyf7xm55g1es1gjw2sd5h64s"
ENV NEXT_PUBLIC_PADDLE_PRICE_STARTER_ANNUAL="pri_01kyf7zcb04s6yv124gc9cqyp2"
ENV NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY="pri_01kyf83bjbj4gnk80mt50j0ba6"
ENV NEXT_PUBLIC_PADDLE_PRICE_PRO_ANNUAL="pri_01kyf86kqfrqxmhbbw0sj3kc9x"
ENV NEXT_PUBLIC_PADDLE_PRICE_AGENCY_MONTHLY="pri_01kzexp93jyfwe6fe2ks00v3gc"
ENV NEXT_PUBLIC_PADDLE_PRICE_AGENCY_ANNUAL="pri_01kyf8kzxeqjsxns6pc6x9a4k3"
ENV NEXT_PUBLIC_PADDLE_PRICE_PRO_DIRECT_MONTHLY="pri_01kyf83bjbj4gnk80mt50j0ba6"
ENV NEXT_PUBLIC_PADDLE_PRICE_AGENCY_DIRECT_MONTHLY="pri_01kzexp93jyfwe6fe2ks00v3gc"
ENV NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN="phc_AZuzMVLVXietKCedPnVtBUJDfzrREAkBQge9vjavCeHb"
ENV NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
ENV SKIP_ENV_VALIDATION="true"
ENV NODE_OPTIONS="--max-old-space-size=4096"


RUN npx prisma generate

# ৬. প্রজেক্টের বাকি সব কোড কপি করা
COPY . .

# ৭. এবার নেক্সট জেএস বিল্ড রান করা
RUN npm run build

# --- রানটাইম স্টেজ (Production Stage) ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# প্রোডাকশনের জন্য প্রয়োজনীয় ফাইলগুলো কপি করা
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start"]
