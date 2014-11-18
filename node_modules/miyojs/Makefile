LIB_SOURCE_DIR = lib
LIB_TARGET_DIR = lib
BIN_SOURCE_DIR = bin
BIN_TARGET_DIR = bin
SRC_DIR = src
DOC_SOURCE_DIR = doc
DOC_TARGET_DIR = codoc
TEST_DIR = test
DOC_TITLE = MiyoJS
LIB_NAME = miyo
BIN_NAME = miyo-shiolink

#LIB_SOURCES = $(wildcard $(SRC_DIR)/$(LIB_SOURCE_DIR)/*.coffee)
LIB_SOURCES = $(SRC_DIR)/$(LIB_SOURCE_DIR)/miyo.coffee $(SRC_DIR)/$(LIB_SOURCE_DIR)/miyo-dictionaryloader.coffee
LIB_TARGET = $(LIB_TARGET_DIR)/$(LIB_NAME).js
BIN_SOURCES = $(wildcard $(SRC_DIR)/$(BIN_SOURCE_DIR)/*.coffee)
BIN_TARGET = $(BIN_TARGET_DIR)/$(BIN_NAME).js
DOC_SOURCES = $(wildcard $(SRC_DIR)/$(DOC_SOURCE_DIR)/*.coffee)
TEST_SOURCES_COFFEE = $(wildcard $(TEST_DIR)/*.coffee)
TEST_TARGETS_JS = $(TEST_SOURCES_COFFEE:.coffee=.js)
TEST_SOURCES_JADE = $(wildcard $(TEST_DIR)/*.jade)
TEST_TARGETS_HTML = $(TEST_SOURCES_JADE:.jade=.html)

all: $(LIB_TARGET) $(BIN_TARGET)

clean :
	rm $(LIB_TARGET) $(BIN_TARGET) $(TEST_TARGETS_JS) $(TEST_TARGETS_HTML)

$(BIN_TARGET): $(BIN_SOURCES)
ifneq ("$(BIN_NAME)", "")
	cat $^ | coffee -c --stdio > $@
	node -e "fs=require('fs');c='#!/usr/bin/env node\n'+fs.readFileSync('$@');fs.writeFileSync('$@', c)"
endif

$(LIB_TARGET): $(LIB_SOURCES)
ifneq ("$(LIB_NAME)", "")
	cat $^ | coffee -c --stdio > $@
endif

test: $(LIB_TARGET) $(BIN_TARGET) test_node test_browser

test_node: $(TEST_TARGETS_JS)
	mocha $(TEST_DIR)

test_browser: $(TEST_TARGETS_HTML) $(TEST_TARGETS_JS)
	mocha-phantomjs -R spec $(TEST_DIR)/*.html

cov: $(LIB_TARGET) $(BIN_TARGET) $(TEST_TARGETS_JS)
	istanbul cover node_modules/mocha/bin/_mocha

doc: $(DOC_TARGET_DIR)/index.html

$(DOC_TARGET_DIR)/index.html:  $(LIB_SOURCES) $(DOC_SOURCES)
	codo --name "$(DOC_TITLE)" --title "$(DOC_TITLE) Documentation" -o $(DOC_TARGET_DIR) $^

.PHONY: test doc

.SUFFIXES: .coffee .js .jade .html

.coffee.js:
	cat $^ | coffee -c --stdio > $@

.jade.html:
	cat $^ | jade -P > $@
