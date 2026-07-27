FROM node:20-alpine

# Firebase CLI ke liye Java required hota hai
RUN apk add --no-cache openjdk21-jre bash

# Firebase CLI install karen
RUN npm install -g firebase-tools

# Copy package files
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

WORKDIR /usr/src/app

ARG NODE_ENV=development

ENV NODE_ENV=$NODE_ENV

# Emulators ki ports expose karen
EXPOSE 5000 8080 9099 5001

CMD ["npm", "start", "firebase", "emulators:start", "--project", "crud-firebase-api", "--host", "0.0.0.0"]