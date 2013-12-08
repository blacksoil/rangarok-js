#!/bin/bash

# Sometimes you will get your data folder from a windows env, so the file enconding from the files should come as ISO LATIN 1, you need to convert to UTF-8
# for propper file serving from most webservers.
# iconv should do just fine.

for file in ../data/*.txt; do
    iconv -f ISO-8859-1 -t utf-8 "$file" -o "${file%.txt}.txt"
done
