# Build Frontend SSR & static assets
FROM node:20.10.0 as frontend-build
WORKDIR /app/skalarly-frontend
COPY skalarly-frontend/package*.json ./

RUN npm install --omit=dev
COPY skalarly-frontend/ ./
RUN npm run build

# Build Backend
FROM node:20.10.0 as backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./

# Set up the production environment
FROM node:20.10.0
WORKDIR /app
# Copy backend
COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /app/backend/node_modules /app/backend/node_modules
#Copy SSR
COPY --from=frontend-build /app/skalarly-frontend/dist /app/backend/public
COPY --from=frontend-build /app/skalarly-frontend/dist/skalarly-frontend /app/backend/dist

EXPOSE 4200

ENV NODE_ENV production

# Start the unified server 
CMD ["node", "server.ts"]
