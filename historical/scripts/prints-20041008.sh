#!/bin/bash
# copy into /tmp/prints directory:

PRINTSDIR=/tmp/prints

copyPrints() { #srcdir copies imagearray
 echo Running test $1;
 wget --tries 1 --timeout 0 -q -O -  "$URLBASE/test?case=$1"  >/dev/null 2>&1
}

PRINTS="561 564 567 568 570 573 588 \
589 591 598 602 604 608 609 610 623 624 625 626 \
627 629 630 631 633 639 647 \
649 650 651 652 653 655 656 658 659 660 662 663 666 669 \
680 682 685 693 695 698 701 702 705 707 708 710 \
798 799 \
865 \
902 903 907 \
908 909 912 915 916 917 919 920 921 922 923 924 926 927 928 930 \
934 935 936 937 940 942 945 947 950 \
953 954 956 957 959 962 966 975 978 \
980 981 984 985 989 991 993 994 996 998 999 1001 1004 1005 1006 1007 1008 1009 1010 1011 1013 1014 1016 1017 1022 1024 1025 1028 1029 1030 1031 1032 \
1033 1034 1040 1041 1042 1045 \
1049 1052 1056 1057 1059 1061 1063 1064 1065 1069 1070 1071 1078 1080 1081 1082 \
1084 1088 1092 1096 1100 1102 1104 1108 1107 1109 1111 1112 1114 \
1117 1118 1125 1130 1137 1141 1143 1145 \
1149 1151 1153 1156 1159 1165 1168 1169 1170 1171 1174 \
1176 1175 1179 1181 1183 \
1187 1189 1194 1195 \
1198 1200 1205 1204 1208 1209 1211 \
1215 1216 1217 1219 1220 1221 1222 1224 1225 1227 1230 1234 1237 1245 \
";

DOUBLES="629 631 682 707 708 710 907 927 930 981 994 998 999 1001 \
1063 1064 1130 1149 1165 1168 1169 1170 1176 1187 1224 1230";

#for i in $PRINTS; do echo $i;done

mkdir -p $PRINTSDIR

echo SINGLES
for i in $PRINTS; do 
    echo $i `find /home/daniel/graphics/photo/catou/2004* -name \*$i\*|wc -l`
#    echo `find /home/daniel/graphics/photo/catou/2004* -name \*$i\*` `find /home/daniel/graphics/photo/catou/2004* -name \*$i\*|wc -l`
#    find /home/daniel/graphics/photo/catou/2004* -name \*$i\* -exec scp -p {} $PRINTSDIR \;

done

echo DOUBLES
for i in $DOUBLES; do 
#    echo $i `find /home/daniel/graphics/photo/catou/2004* -name \*$i\*|wc -l`
    full=`find /home/daniel/graphics/photo/catou/2004* -name \*$i\*`
    base=`basename $full .JPG`.b.JPG
    echo  $full $PRINTSDIR/$base;
    scp -p  $full $PRINTSDIR/$base;
done