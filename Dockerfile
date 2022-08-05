FROM node:16.3.0-alpine AS build

RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
COPY . ./
RUN yarn install && yarn global add typescript
RUN yarn run build

FROM node:16.3.0-alpine AS production
RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
COPY --from=build /app/build ./
RUN yarn
ENV NODE_ENV=production
EXPOSE 3000

CMD [ "node", "app.js"]