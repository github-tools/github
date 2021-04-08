#!/bin/bash
# This is the automated release script

# guard against stupid
if [ -z "$1" ]; then
   echo "You must specify a new version level: [patch, minor, major]";
   exit 1;
fi

# make sure all our dependencies are installed so we can publish docs
npm install

# try to build to make sure we don't publish something really broken
npm run build

# bump the version
echo "npm version $1"
npm version $1
git push
git push --tags

# start from a clean state
rm -rf docs/ out/
mkdir out

# build the docs
npm run make-docs
VERSION=`ls docs/github-api`

# switch to gh-pages and add the docs
mv docs/github-api/* out/
rm -rf docs/

git checkout gh-pages
mv out/* docs/
echo $VERSION >> _data/versions.csv
git add .
git commit -m "adding docs for v$VERSION"
git push
