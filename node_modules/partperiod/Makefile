COFFEE = $(wildcard *.coffee)
JS = $(COFFEE:.coffee=.js)

all: $(JS)

.coffee.js:
	coffee -cmb $^

clean:
	rm *.js *.map

test:
	mocha test

doc: doc/index.html
doc/index.html: $(COFFEE)
	codo --title "PartPeriod Documentation" .

.SUFFIXES: .coffee .js

.PHONY: test doc
