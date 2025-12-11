# -------- BUILD --------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    # 1) Cài deps
    COPY package.json yarn.lock ./
    # Ensure Yarn v1 is available (corepack in Node 20 may not activate it by default)
    RUN corepack enable && corepack prepare yarn@1.22.22 --activate
    RUN yarn install --frozen-lockfile
    
    # 2) Copy code và prisma
    COPY prisma ./prisma
    COPY tsconfig*.json ./
    COPY src ./src
    
    # 3) Cho Prisma generate (cần DATABASE_URL chỉ để validate)
    ARG DUMMY_DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
    ENV DATABASE_URL=${DUMMY_DATABASE_URL}
    RUN npx prisma generate
    
    # 4) Build Nest
    RUN yarn build
    
    # -------- RUN --------
    FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    
    # Chỉ mang những thứ cần thiết sang runtime
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/prisma ./prisma
    COPY --from=build /app/dist ./dist
    COPY package.json ./
    
    EXPOSE 3000
    CMD ["node", "dist/src/main.js"]
    
