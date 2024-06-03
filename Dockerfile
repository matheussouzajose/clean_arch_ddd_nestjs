FROM node:20.9.0-slim

RUN npm install -g @nestjs/cli@10.1.17

RUN apt-get update && apt-get install -y procps

RUN chmod +x /bin/ps

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]