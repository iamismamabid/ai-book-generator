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
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
ENV DIRECT_URL="postgresql://postgres:postgres@localhost:5432/postgres"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_dummy"
ENV CLERK_SECRET_KEY="sk_test_dummy"

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
