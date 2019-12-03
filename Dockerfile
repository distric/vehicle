FROM node:alpine

# Create app directory
WORKDIR /usr/app

# Install app dependencies
COPY package*.json ./
RUN npm install && \
    npm cache clean --force

# Bundle app source
COPY index.js index.js
COPY ./routes/* ./routes/
COPY ./config/*.js ./config/

EXPOSE 8080
CMD [ "npm", "start" ]