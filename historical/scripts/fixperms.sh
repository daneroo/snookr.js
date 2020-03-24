#!/bin/sh
# rename .jpg and .avi
# paste : fails if no .jpg or .avi files... $i becomes "*.jpg"
# for i in *.jpg; do mv ${i} `basename ${i} jpg`JPG; done
# for i in *.avi; do mv ${i} `basename ${i} avi`AVI; done
DIRS="sologlobe catou yaye dad";
find $DIRS -type d -not -perm 755 -exec chmod 755 {} \;
#find -type f -name \*JPG -not -perm 644 -exec chmod 644 {} \;
find $DIRS -type f -not -perm 644 -exec chmod 644 {} \;



