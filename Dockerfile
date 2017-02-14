FROM node:7-alpine

ADD . /app
WORKDIR /app
VOLUME /app/data

RUN npm install && npm cache clean

CMD ["node", "--harmony", "bot.js"]