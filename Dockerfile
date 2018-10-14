FROM node:8-slim
WORKDIR /typechain
COPY . /typechain
RUN npm install
CMD [ "npm", "run", "build" ]
ENTRYPOINT ["npm", "run", "exe"]
