FROM node:7-alpine

ADD . /app
WORKDIR /app
VOLUME /app/data

ENV NODE_ENV=production

RUN npm install && npm cache clean

CMD ["node", "--harmony", "bot.js"]