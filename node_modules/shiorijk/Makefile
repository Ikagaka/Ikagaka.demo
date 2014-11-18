LIB = lib
SRC = src
LIB_SOURCES = $(SRC)/$(LIB)/shiorijk.coffee $(SRC)/$(LIB)/shiorijk-container.coffee $(SRC)/$(LIB)/shiorijk-shiori-parser.coffee
TARGETS = $(LIB)/shiorijk.js

all: $(TARGETS)

clean :
	rm  $(TARGETS)

$(LIB)/shiorijk.js: $(LIB_SOURCES)
	cat $^ | coffee -cb --stdio > $@

test:
	mocha test

cov:
	istanbul.cmd cover --report html c:\usr\nodist\bin\node_modules\mocha\bin\_mocha

doc: ../gh-pages/doc/index.html
../gh-pages/doc/index.html:  $(LIB_SOURCES)
	codo --name "ShioriJK" --title "ShioriJK Documentation" -o ../gh-pages/doc src

.PHONY: test doc
