FROM node:18

WORKDIR /app
COPY . .

RUN yarn install --frozen-lockfile

ENV PORT=3000
RUN yarn build

EXPOSE 3000

CMD yarn serve
