FROM node:10-jessie-slim

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

CMD ["npm", "run", "test"]
