TEST_DIR = test

LIB_SOURCES = $(wildcard *.coffee)
LIB_TARGETS = $(LIB_SOURCES:.coffee=.js)
TEST_SOURCES_COFFEE = $(wildcard $(TEST_DIR)/*.coffee)
TEST_TARGETS_JS = $(TEST_SOURCES_COFFEE:.coffee=.js)
TEST_SOURCES_JADE = $(wildcard $(TEST_DIR)/*.jade)
TEST_TARGETS_HTML = $(TEST_SOURCES_JADE:.jade=.html)
COFFEE := node_modules/.bin/coffee
ifeq ($(OS), Windows_NT)
COFFEE := $(subst /,\,$(COFFEE))
endif
MOCHA := node_modules/.bin/mocha
ifeq ($(OS), Windows_NT)
MOCHA := $(subst /,\,$(MOCHA))
endif
MOCHA_PHANTOMJS := node_modules/.bin/mocha-phantomjs
ifeq ($(OS), Windows_NT)
MOCHA_PHANTOMJS := $(subst /,\,$(MOCHA_PHANTOMJS))
endif
ISTANBUL := node_modules/.bin/istanbul
ifeq ($(OS), Windows_NT)
ISTANBUL := $(subst /,\,$(ISTANBUL))
endif
JADE := node_modules/.bin/jade
ifeq ($(OS), Windows_NT)
JADE := $(subst /,\,$(JADE))
endif

all: $(LIB_TARGETS)

clean :
ifeq ($(OS), Windows_NT)
	del $(subst /,\,$(LIB_TARGETS) $(TEST_TARGETS_JS) $(TEST_TARGETS_HTML))
else
	rm $(LIB_TARGETS) $(TEST_TARGETS_JS) $(TEST_TARGETS_HTML)
endif

test: $(LIB_TARGETS) test_node test_browser

test_node: $(TEST_TARGETS_JS)
	$(MOCHA) $(TEST_DIR)

test_browser: $(TEST_TARGETS_HTML) $(TEST_TARGETS_JS)
ifeq ($(OS), Windows_NT)
	for %%H in ($(TEST_TARGETS_HTML)) do $(MOCHA_PHANTOMJS) -R spec %%H
else
	for html in $(TEST_TARGETS_HTML); do $(MOCHA_PHANTOMJS) -R spec $$html; done
endif

cov: $(LIB_TARGETS) $(TEST_TARGETS_JS)
	$(ISTANBUL) cover node_modules/mocha/bin/_mocha

.PHONY: test doc

.SUFFIXES: .coffee .js .jade .html

.coffee.js:
	$(COFFEE) -c $^

.jade.html:
	$(JADE) -P $^
