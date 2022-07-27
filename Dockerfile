FROM node:16.3.0-alpine AS build

RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
COPY . ./
RUN npm install && npm install typescript -g
RUN npm run build

FROM node:16.3.0-alpine AS production
RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
COPY --from=build /app/build ./
RUN npm install
ENV NODE_ENV=production
EXPOSE 3000

CMD [ "node", "app.js"]