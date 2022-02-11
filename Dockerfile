# Base Image
FROM node:16.13-alpine AS base

# Initialize working directory
WORKDIR /usr/src/app

# Prepare for installing dependencies
COPY ["package.json", "yarn.lock", "./"]

# Install dependencies
RUN yarn --frozen-lockfile

# Build Image
FROM base AS build

# Copy File from source to workdir
COPY . .

# Build application
RUN yarn build
ENV NODE_ENV production

# Expose listening port
EXPOSE 8000

# Starting scripts
CMD yarn typeorm:prod | yarn start:prod