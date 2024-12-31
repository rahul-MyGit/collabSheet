FROM node:alpine

WORKDIR /app

RUN npm install -g pnpm

COPY ./package.json .
COPY ./pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json .
COPY packages ./packages
COPY apps/docs ./apps/docs
COPY index.js .

RUN pnpm install
RUN pnpm build

CMD [ "pnpm", "start:web" ]