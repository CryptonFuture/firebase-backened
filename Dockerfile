FROM node:20-alpine

# Firebase CLI ke liye Java required hota hai
RUN apk add --no-cache openjdk11-jre bash

# Firebase CLI install karen
RUN npm install -g firebase-tools

WORKDIR /usr/src/app

# Emulators ki ports expose karen
EXPOSE 4000 8080 9099 5001

CMD ["firebase", "emulators:start", "--project", "crud-firebase-api"]