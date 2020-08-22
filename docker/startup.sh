#!/bin/ash
# shellcheck shell=dash

cd /app || exit 1
# TODO: Replace with prod run
nohup /usr/bin/npm run dev > /dev/stdout 2>&1 &
cd /

nginx

pgrep node
node=$?
pgrep nginx
nginx=$?

while sleep 60; do
  if [ "0" != "$node" ]; then exit 1; fi;
  if [ "0" != "$nginx" ]; then exit 1; fi;
done

