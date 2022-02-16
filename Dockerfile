FROM node:14.16.1-stretch-slim

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build
RUN rm -rf node_modules
RUN npm install --only=prod --no-shrinkwrap

CMD ["npm", "start"]