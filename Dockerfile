FROM node:8.12.0-alpine

RUN mkdir /server
ADD index.js /server/index.js

CMD node /server/index.js
