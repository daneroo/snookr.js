#!/bin/sh
# pull copy of dad on goedel: a.k.a. sulbalcon
echo "rsync -n -e ssh -avz --progress goedel:/home/jean-guy/public_html/photo/albums/ /archive/media/photo/dadSulbalcon/"
rsync -e ssh -avz --progress goedel:/home/jean-guy/public_html/photo/albums/ /archive/media/photo/dadSulbalcon/



