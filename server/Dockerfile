FROM node:16.9.1-slim

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build
RUN rm -rf node_modules
RUN npm install --only=prod --no-shrinkwrap

CMD ["npm", "start"]