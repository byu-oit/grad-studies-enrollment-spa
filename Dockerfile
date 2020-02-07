FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY client ./client
COPY server ./server
COPY config.js nuxt.config.js WebResource.js ./

# Build the application
RUN npm run build

EXPOSE 8460

# Development mode
# CMD [ "npm", "run", "devMac" ]

# Production mode
CMD [ "npm", "start" ]
