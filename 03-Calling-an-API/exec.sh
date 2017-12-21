#!/usr/bin/env bash
docker build -t auth0-javascript-03-calling-an-api .
docker run -p 5000:5000 -p 3001:3001 -it auth0-javascript-03-calling-an-api
