#!/bin/bash
echo '*****************************************************'
echo  'Make sure you are on dev with a clean repo.  Ready?'
echo '*****************************************************'
read -n1 -r -p "Press any key to continue..." key
echo 'Make sure you have the latest NPM:'
npm install -g npm
echo 'Install Prettier:'
npm install --save-dev --save-exact prettier
echo 'Installing Husky hooks:'
npm install --save-dev husky lint-staged
npx husky install
npm set-script prepare "husky install"
npx husky add .husky/pre-commit "npx lint-staged"
npx mrm@2 lint-staged
git update-index --chmod=+x .husky/pre-commit
echo 'Undoing pending changes:'
echo '*****************************************************'
read -n1 -r -p "Press any key to continue..." key
git checkout . . 
echo 'Done!  You must have pending changes by now, make sure to undo them, '
echo '*****************************************************'
