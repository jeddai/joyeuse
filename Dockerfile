FROM node:16.14.0-slim as app

WORKDIR /app
COPY app .

RUN npm install
RUN npm run build -- --output-hashing all

FROM node:16.14.0-slim as server

WORKDIR /app
COPY server .

RUN npm install
RUN npm run build

FROM node:16.14.0-slim

WORKDIR /app
COPY --from=server /app/package.json .
COPY --from=server /app/dist dist
RUN mkdir locale
COPY --from=server /app/locale/*.yaml locale
COPY --from=app /app/dist static

RUN npm install --only=prod --no-shrinkwrap
RUN rm package.json

CMD ["node", "--experimental-specifier-resolution=node", "dist/app.js"]