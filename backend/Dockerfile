FROM node:20.10.0

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

EXPOSE 4200

CMD ["node", "server.js"]