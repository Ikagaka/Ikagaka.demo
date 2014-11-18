.SUFFIXES: .coffee .js
.PHONY: test doc
COFFEE = $(wildcard *.coffee)
JS = $(COFFEE:.coffee=.js)
all: $(JS)
.coffee.js:
	coffee -cmb $^
clean:
	rm *.js *.map
test:
	mocha test
cov:
	istanbul.cmd cover --report html c:\usr\nodist\bin\node_modules\mocha\bin\_mocha
