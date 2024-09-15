#!/bin/bash

# clean previous logs
rm -f ./**/*.log

for filename in ./**/*.*js; do
    echo "[1] Running $filename"
    node --allow-natives-syntax "./$filename" | sed "s,\x1B\[[0-9;]*m,,g" >>"$filename.log"
    echo -e "----------------------------------------------------------------------------" >>"$filename.log"

    echo "[2] Running $filename"
    node --allow-natives-syntax "./$filename" | sed "s,\x1B\[[0-9;]*m,,g" >>"$filename.log"
    echo -e "----------------------------------------------------------------------------" >>"$filename.log"

    echo "[3] Running $filename"
    node --allow-natives-syntax "./$filename" | sed "s,\x1B\[[0-9;]*m,,g" >>"$filename.log"
    echo -e "----------------------------------------------------------------------------" >>"$filename.log"
done
