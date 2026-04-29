#!/bin/sh
git pull
docker build -f ./dockerfiles/dockerfile.web.prod.ssr -t chuhung-angular16-web-v1:latest .
docker ps -a -q --filter "name=chuhung-angular16-web-v1" | grep -q . && docker rm -f chuhung-angular16-web-v1
docker run --detach \
    --name chuhung-angular16-web-v1 \
    --env "VIRTUAL_HOST=zhuhong.com.tw,www.zhuhong.com.tw" \
    --env "VIRTUAL_PORT=80" \
    --env "LETSENCRYPT_HOST=zhuhong.com.tw,www.zhuhong.com.tw" \
    --env "LETSENCRYPT_EMAIL=sysalert@bonbondi.com" \
    --restart unless-stopped \
    chuhung-angular16-web-v1:latest
docker image prune -f
