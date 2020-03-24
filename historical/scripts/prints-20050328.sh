#!/bin/bash
# copy into /tmp/prints directory:

PRINTSDIR=/tmp/prints
mkdir -p $PRINTSDIR

#ln -s /archive/dad/dad/My\ Documents/My\ Pictures coco
PRINTS="0233 0250 0254 0255 0260 0299 0320 0322 \
0326 0331 0355 0374 0375 0383 0386 0388 0427 0439 \
0435 0437 0458 0464 0467 0470 0476";
for i in $PRINTS; do 
    #echo $i `find coco/2005_03_07 -name \*$i\*|wc -l`
    #find coco/2005_03_07 -name \*$i\* -exec scp -p {} $PRINTSDIR \;
    echo;
done

PRINTS="0060 0066 0073 0100 0131 0134 0135 0136 0145 0147 0151 0152 0153";
for i in $PRINTS; do 
    #echo $i `find yaye -name DSC\*$i\*|wc -l`
    #find yaye -name DSC\*$i\* -exec scp -p {} $PRINTSDIR \;
    echo;
done

PRINTS="5270 5271 5275 5277 5279 5280";
for i in $PRINTS; do 
    echo $i `find catou/2005_02_27 -name \*$i\*|wc -l`
    find catou/2005_02_27 -name \*$i\* -exec scp -p {} $PRINTSDIR \;
done

