FROM node:carbon

WORKDIR /app

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
