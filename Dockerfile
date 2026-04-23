FROM node:12
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run bootstrap
EXPOSE 3001
CMD ["npm", "run", "watch:server"]
