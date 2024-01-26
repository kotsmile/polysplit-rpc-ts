# FROM oven/bun:1 as base
# WORKDIR /usr/src/app
#
# RUN cd /usr/src/app
# COPY . .
# RUN bun install --frozen-lockfile
# RUN bun run build
#
# FROM base AS release
# COPY --from=base /usr/src/app/dist/index.js .
#
# USER bun
# EXPOSE 3000
# ENTRYPOINT [ "bun", "run", "./index.js" ]
#
# #
# # FROM oven/bun:1 as base
# # WORKDIR /usr/src/app
# #
# # RUN cd /usr/src/app
# # COPY . .
# # RUN bun install --frozen-lockfile
# # RUN bun run build
# # EXPOSE 3000
# # ENTRYPOINT [ "bun", "run", "./dist/index.js" ]

FROM oven/bun:1
COPY . .
# COPY package.json build.ts bun.lockb tsconfig.json .
# COPY src/ .
RUN bun install
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "./dist/index"]
