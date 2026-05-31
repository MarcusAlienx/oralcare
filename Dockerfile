# Production image
FROM node:24-slim AS runner
WORKDIR /app

# Copy the pre-built files from local dist
COPY dist ./dist
COPY package.json ./package.json
COPY node_modules ./node_modules

# Default env vars
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.mjs"]
