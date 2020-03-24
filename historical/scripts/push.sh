#!/bin/sh

#see readme for orig exclusion...
#### dont delete cmd='rsync -e ssh --delete -avz --progress --exclude=orig'
# delete but don't run
#cmd='rsync -e ssh -n --delete -avz --progress --exclude=orig'
cmd='rsync -e ssh -avz --progress --exclude=orig'

# 2008-01-15
# moved /var/www/html/catou /var/www/hosts/sulbalcon.net/catou
# 2008-01-20
# moved rack2:/var/www/hosts/sulbalcon.net/catou
#   to cantor:/var/www/hosts/sulbalcon.net/catou


#ownership of theese directories is daniel!
# /var/www/hosts/sulbalcon.net/catou/photo/albums, 
# /var/www/hosts/sulbalcon.net/catou/yaye/albums, 
# /var/www/hosts/sologlobe.org/photo/albums

#$cmd sologlobe/ sologlobe.com:/var/www/hosts/sologlobe.org/photo/albums
#$cmd catou/ sologlobe.com:/var/www/hosts/sulbalcon.net/catou/photo/albums
#$cmd yaye/ sologlobe.com:/var/www/hosts/sulbalcon.net/catou/yaye/albums

# temp remove
#$cmd catou/ goedel:/var/www/hosts/sulbalcon.net/catou/photo/albums
#$cmd yaye/ goedel:/var/www/hosts/sulbalcon.net/catou/yaye/albums
echo "Temp location till goedel is restored: /goedel/var/www..."

$cmd catou/ goedel:/goedel/var/www/hosts/sulbalcon.net/catou/photo/albums
$cmd yaye/ goedel:/goedel/var/www/hosts/sulbalcon.net/catou/yaye/albums

