#!/bin/sh
# This now breaks becaus of bad Directory Names.
#
#  This is what I ended up doing,
#  on dirac:  (find dirs of recent JPG's
#
#    find -mtime -100 -name \*JPG -exec dirname '{}' \;|sort|uniq -c|sort -n
#
#  on cantor, copy by hand as below, but one dir at a time
#   replacing 2007-* by actual dir names
#
#
# -a == -rlptgoD we only want -rt and not lpgoD
#
# of for example
# rsync -n -e ssh -rtvz --progress --exclude Thumbs.db "dirac:catouPictures/2008-0[45678]-??*" /archive/media/photo/catou/
#
rsync -e ssh -rtvz --progress --exclude Thumbs.db "dirac:catouPictures/2008-??-??*" /archive/media/photo/catou/



