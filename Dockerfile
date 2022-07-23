FROM node:17
COPY . .
RUN npm install
CMD ["node", "./app.js"]
