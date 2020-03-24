#!/bin/sh
# createLink.sh
# args file_name_with_spaces

# invoke as 
# find dad -type f -exec /archive/media/photo/createLink.sh {} \;

md5dir="/archive/media/photo/md5dir"
filename=$1;
md5=`md5sum "$filename"|awk '{print $1}'`

echo link "$filename" to md5: $md5dir/$md5
ln "$filename" $md5dir/$md5 