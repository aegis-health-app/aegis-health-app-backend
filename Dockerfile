FROM node:16.13-alpine AS development

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn add glob rimraf

RUN yarn --frozen-lockfile

COPY . .

RUN yarn build

FROM node:16.13-alpine as production

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/package.json ./package.json
COPY --from=development /usr/src/app/yarn.lock ./yarn.lock


RUN yarn install --prod=true && yarn cache clean

COPY . .

COPY --from=development /usr/src/app/dist ./dist
EXPOSE 8000

CMD ["node", "dist/main"]