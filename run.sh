#!/bin/bash

# clean previous logs
rm -f ./examples/**/*.log

for filename in examples/**/*.*js; do
    echo "[1] Running $filename"
    node "./$filename" | sed "s,\x1B\[[0-9;]*m,,g" >>"$filename.log"
    echo -e "----------------------------------------------------------------------------" >>"$filename.log"

    echo "[2] Running $filename"
    node "./$filename" | sed "s,\x1B\[[0-9;]*m,,g" >>"$filename.log"
    echo -e "----------------------------------------------------------------------------" >>"$filename.log"

    echo "[3] Running $filename"
    node "./$filename" | sed "s,\x1B\[[0-9;]*m,,g" >>"$filename.log"
    echo -e "----------------------------------------------------------------------------" >>"$filename.log"
done
