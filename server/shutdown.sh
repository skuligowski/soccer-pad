#!/bin/bash
NODEPID=`ps -ef | grep 'node' | grep '9999' | awk '{ print $2}'`
kill `pstree -p $NODEPID | sed 's/(/\n(/g' | grep '(' | sed 's/(\(.*\)).*/\1/' | tr "\n" " "`
