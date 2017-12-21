#!/usr/bin/env bash
docker build -t auth0-javascript-05-token-renewal .
docker run -p 3000:3000 -p 3001:3001 -it auth0-javascript-05-token-renewal
