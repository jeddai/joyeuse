#!/bin/bash
export PWD=$(pwd)
docker network create --driver bridge joyeuse || true
docker run --name redis --network joyeuse -d -v $PWD/server/data/redis:/data -p 6379:6379 --restart unless-stopped redis:latest --save 60 1 --loglevel warning
docker run --name redisinsight --network joyeuse -d -v $PWD/server/data/redisinsight:/db -p 6380:8001 --restart unless-stopped redislabs/redisinsight:latest