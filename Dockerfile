FROM ubuntu:20.04 as base
USER root
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_14.x  | bash -
RUN apt-get -y install nodejs
RUN npm install -g yarn

WORKDIR /home
COPY yarn.lock yarn.lock
COPY package.json package.json
RUN yarn install

FROM base as dev
WORKDIR /home
COPY yarn.lock yarn.lock
COPY package.json package.json
RUN yarn install
ADD . .
CMD ["yarn", "start:dev"]

FROM base as prod 
WORKDIR /home
COPY yarn.lock yarn.lock
COPY package.json package.json
RUN yarn install
ADD . .
RUN yarn build
CMD [ "yarn", "start:prod" ]