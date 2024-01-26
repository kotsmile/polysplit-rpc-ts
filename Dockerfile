FROM node:18 as build

WORKDIR /app
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn build

FROM build as release
COPY --from=build ./app/dist/index.js .

CMD ["node", "index.js"]
