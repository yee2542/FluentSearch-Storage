FROM ubuntu:20.04 as base
RUN apt update
RUN printf 'y\n1\n\1n' | apt install nodejs
RUN apt install -y npm
RUN apt install -y ffmpeg
RUN npm install --global yarn

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