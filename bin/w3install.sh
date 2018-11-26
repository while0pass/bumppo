#!/bin/bash

REPO=/path/to/bumppo/repository
W3DST=/var/www/www/data/www/multidiscourse.ru/search
W3USR=www

cd $REPO
git reset --hard master
git pull origin master
yarn install --check-files --frozen-lockfile
yarn run production
sudo rsync -av --delete $REPO/build/ $W3DST/
sudo chown -R $W3USR:$W3USR $W3DST
