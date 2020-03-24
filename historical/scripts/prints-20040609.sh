#!/bin/bash
# copy into /tmp/prints directory:

PRINTSDIR=/tmp/prints

copyPrints() { #srcdir copies imagearray
 echo Running test $1;
 wget --tries 1 --timeout 0 -q -O -  "$URLBASE/test?case=$1"  >/dev/null 2>&1
}

PRINTS="711 712 713 717 718 719 \
722 725 724 727 730 732 733 736 737 \ 
741 742 744 747 749 751 752 755 757 758 760 761 762 763 765 766 770 777 781 \
785 788 791 \
798 \
800 801 803 804 806 807 808 811 812 815 816 818 820 822 823 \
828 831 832 833 835 837 838 842 844 849 851 854 861 \
864 865 840 873 \
876 881 882 884 886 887 890 891 897 899 \
";

#for i in $PRINTS; do echo $i;done

mkdir -p $PRINTSDIR
for i in $PRINTS; do 
    find /home/daniel/graphics/photo/catou/2004* -name \*$i\* -exec scp -p {} $PRINTSDIR \;
done
