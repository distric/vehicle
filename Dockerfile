FROM node:10

ARG BUILD_DEVELOPMENT

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

RUN if [ "x$BUILD_DEVELOPMENT" = "0" ] ; then npm ci --only=production ; fi

# if --build-arg BUILD_DEVELOPMENT=1, set NODE_ENV to 'development' or set to null otherwise.
ENV NODE_ENV=${BUILD_DEVELOPMENT:+development}
# if NODE_ENV is null, set it to 'production' (or leave as is otherwise).
ENV NODE_ENV=${NODE_ENV:-production}

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "index.js" ]