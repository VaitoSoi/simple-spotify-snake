FROM oven/bun

WORKDIR /game

COPY ./package.json /game/package.json
RUN bun add .

COPY . /game

CMD ["bun", "start"]