FROM keymetrics/pm2:8-alpine
#FROM node:8.11.3-stretch

#RUN echo "Installing zeroMQ" && \
#		apt-get update && \
# 		apt-get install -y libczmq-dev

# for alpine images
RUN apk --no-cache add --virtual builds-deps build-base python
RUN apk add --update bash && rm -rf /var/cache/apk/*

# Bundle APP files
WORKDIR /bmattest
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# compile bcrypt for alpine images
RUN npm rebuild bcrypt --build-from-source

# copy rest of code
COPY . .
COPY ./docker/wait-for-it.sh .

EXPOSE 8080

RUN pm2 install pm2-logrotate

CMD [ "pm2-runtime", "start", "pm2-start.json" ]
