FROM node:16.13-alpine AS development

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn add glob rimraf
# Installs all dependencies
RUN yarn --frozen-lockfile

COPY . .
# Build
RUN yarn build

FROM node:16.13-alpine as production

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/package.json ./package.json
COPY --from=development /usr/src/app/yarn.lock ./yarn.lock

# Install only required dependencies for production
RUN yarn install --prod=true && yarn cache clean

COPY . .
# Copy built 
COPY --from=development /usr/src/app/dist ./dist
EXPOSE 8000

CMD ["node", "dist/main"]