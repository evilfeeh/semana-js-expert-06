FROM node:17-slim

WORKDIR /spotify-radio/

RUN apt-get update \
  && apt-get install -y sox libsox-fmt-mp3

COPY package.json package-lock.json /spotify-radio/

RUN npm ci --silent

COPY . .

USER node

EXPOSE 3000

CMD npm run live-reload