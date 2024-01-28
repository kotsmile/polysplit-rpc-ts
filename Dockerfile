FROM node:18 as build

WORKDIR /app
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn build
CMD ["yarn", "serve"]
