FILENAME=$1.script
yarn tsup --config ./tsup.config.script.ts
shift 1
node ./scripts_dist/scripts/$FILENAME.js $*
