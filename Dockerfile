FROM node:alpine

RUN apk add --no-cache bash

# Create app directory
WORKDIR /usr/app

# Install app dependencies
COPY package*.json ./
RUN npm install && \
    npm cache clean --force

RUN if [ "$NODE_ENV" = "production" ] ; then npm install --only=production ; else npm install ; fi

# Bundle app source
COPY src/* src/

EXPOSE 8080
CMD [ "npm", "start" ]