#!/usr/bin/env bash
docker build -t auth0-javascript-01-login .
docker run -p 3000:3000 -it auth0-javascript-01-login
