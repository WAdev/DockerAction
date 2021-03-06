#
# Dockerfile for building a blackbox container with a nodejs server interfacing to a client binary.
#
FROM ubuntu:14.04

ENV DEBIAN_FRONTEND noninteractive

# Initial update and some basics.
# This odd double update seems necessary to get curl to download without 404 errors.
RUN apt-get update --fix-missing && \
apt-get install -y wget && \
apt-get update && \
apt-get install -y curl && \
apt-get update

# Get gcc
RUN apt-get update --fix-missing && \
apt-get -y install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++

# install nodejs and npm
RUN curl -sL https://deb.nodesource.com/setup_0.12 | bash - && \
apt-get install -y nodejs

# install common packages
RUN npm install -g body-parser@1.12.0 \
btoa@1.1.2 \
commander@2.7.0 \
cookie-parser@1.3.4 \
cradle@0.6.7 \
errorhandler@1.3.5 \
express@4.12.2 \
express-session@1.11.1 \
jade@1.9.2 \
log4js@0.6.25 \
merge@1.2.0 \
moment@2.8.1 \
nano@5.10.0 \
node-uuid@1.4.2 \
oauth2-server@2.4.0 \
process@0.11.0 \
request@2.60.0 \
semver@4.3.6 \
serve-favicon@2.2.0 \
socket.io@1.3.5 \
swagger-tools@0.8.7 \
mustache@2.1.3 \
when@3.7.3 \
superagent@1.3.0 \
yauzl@2.3.1 \
nchart \
canvas@1.3.12 \
nchart@1.0.1 \ 
dateformat@1.0.12

RUN mkdir /logs

ADD . /blackbox
RUN cd /blackbox/server; rm -rf build.xml Dockerfile README node_modules logs && ln -s /usr/lib/node_modules node_modules
RUN cd /blackbox/server; npm install . 

# Final steps
EXPOSE 8080
CMD ["/bin/bash", "-c", "cd blackbox/server && node ./app.js"]
