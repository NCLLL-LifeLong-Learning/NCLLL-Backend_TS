# ============================
# Build stage
# ============================
FROM node:20.18-alpine AS builder
WORKDIR /builder
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# ============================
# Production stage
# ============================
FROM node:20.18-alpine AS production
WORKDIR /app

RUN apk add --no-cache curl

COPY package.json yarn.lock ./
RUN yarn install --production

# Copy build and other necessary files
COPY --from=builder /builder/dist ./dist
COPY --from=builder /builder/locales ./locales

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl --fail http://localhost:3000/health-check || exit 1

CMD ["yarn", "start"]