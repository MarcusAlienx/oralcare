# Production image
FROM node:22-slim AS runner
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y python3 make g++ curl && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/integrations-openai-ai-server/package.json ./lib/integrations-openai-ai-server/

# Install dependencies using pnpm
# We use --no-frozen-lockfile because of some catalog: issues during build
# and we explicitly approve builds for required packages
RUN pnpm config set side-effects-cache false && \
    pnpm install --prod --no-frozen-lockfile

# Copy source code
COPY artifacts/api-server ./artifacts/api-server
COPY lib ./lib
COPY build.mjs ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Run using tsx
CMD ["npx", "tsx", "artifacts/api-server/src/index.ts"]
