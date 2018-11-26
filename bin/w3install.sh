#!/bin/bash

REPO=/home/nurono/repogitories/bumppo
W3DST=/home/nurono/repogitories/temp/wwwbumppo
W3USR=www-data
ROLLUP=$REPO/node_modules/.bin/rollup

cd $REPO
git reset --hard master
git pull origin master
yarn install --check-files --frozen-lockfile
env BUMPPO_ENV=production $ROLLUP -c
sudo rsync -av --delete $REPO/build/ $W3DST/
sudo chown -R $W3USR:$W3USR $W3DST
