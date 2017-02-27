ifndef JAKETS__INCLUDE_BARRIER_
JAKETS__INCLUDE_BARRIER_ = 1

# The following code will be use in almost all of the project makefiles
# before we include any new makefile, the current makefile will be the last
# item in the MAKEFILE_LIST variable. However, the $(dir ) function always
# adds / at the end of the result.
# to make the usage of this variable mroe readable and elegant, we add
# and extra / at the end to differentiate it from / in the middle of the path
# thre relpace // with nothing.
JAKETS__DIR := $(subst //,,$(dir $(lastword $(MAKEFILE_LIST)))/)
CURRENT__DIR := $(subst //,,$(dir $(firstword $(MAKEFILE_LIST)))/)

#overwritable values
LOG_LEVEL?=0
EXPECTED_NODE_VERSION?=v6.9.1
# NODE__DIR?=$(JAKETS__DIR)/node_modules/nodejs
NODE__DIR?=./build/nodejs

###################################################################################################
# setup platform dependent variables
#
SHELL := /bin/bash
UNAME := $(shell uname)
NULL = /dev/null

ifeq ($(UNAME), Linux)
	NODE_DIST__NAME = node-$(EXPECTED_NODE_VERSION)-linux-x64.tar.gz
else ifeq ($(UNAME), Darwin)
	NODE_DIST__NAME = node-$(EXPECTED_NODE_VERSION)-darwin-x64.tar.gz
else 
# ifeq($(UNAME), MINGW32_NT-6.2)
	# NULL = $$null
	NODE_DIST__NAME = node-$(EXPECTED_NODE_VERSION)-win-x64.zip
endif
NODE_DIST_LOCAL__FILE = $(NODE__DIR)/$(NODE_DIST__NAME)
NODE_DIST_REMOTE__FILE = https://nodejs.org/dist/$(EXPECTED_NODE_VERSION)/$(NODE_DIST__NAME)

#
###################################################################################################


NODE := node
NPM := npm

NODE_BIN__FILE =
INSTALLED_NODE_VERSION = $(shell $(NODE) --version 2>$(NULL))
ifneq "$(INSTALLED_NODE_VERSION)" "$(EXPECTED_NODE_VERSION)"
  # INSTALLED_NODE_VERSION = $(EXPECTED_NODE_VERSION)
  # IS_NEWER_NODE_VERSION := $(shell $(NODE) -e "console.log(require('semver').satisfies('$(INSTALLED_NODE_VERSION)','$(EXPECTED_NODE_VERSION)'))" 2>$(NULL))
  IS_NEWER_NODE_VERSION := $(shell $(NODE) -e "console.log(require('semver').gt('$(INSTALLED_NODE_VERSION)','$(EXPECTED_NODE_VERSION)'))" 2>$(NULL))
  ifeq "$(IS_NEWER_NODE_VERSION)" "true"
    $(info using installed node $(INSTALLED_NODE_VERSION))
  else
    $(info using local node $(EXPECTED_NODE_VERSION))
    NODE_BIN__DIR = $(NODE__DIR)/bin
    NODE_BIN__FILE = $(NODE_BIN__DIR)/$(NODE)
    export PATH := $(PWD)/$(NODE_BIN__DIR):$(PATH)
  endif
else
  $(info using installed node $(INSTALLED_NODE_VERSION))
endif


# NODE_MODULES__DIR=$(JAKETS__DIR)/node_modules
NODE_MODULES__DIR=$(CURRENT__DIR)/node_modules
NODE_MODULES__UPDATE_INDICATOR=$(NODE_MODULES__DIR)/.node_modules_updated
JAKE = $(NODE_MODULES__DIR)/.bin/jake
JAKE__PARAMS += logLevel=$(LOG_LEVEL)
TS_NODE = $(NODE_MODULES__DIR)/.bin/ts-node

#One can use the following local file to overwrite the above settings
-include LocalPaths.mk

###################################################################################################
# setup and rules in the current working directory
#

# default: run_jake

JAKETS_JAKEFILE__JS=$(JAKETS__DIR)/Jakefile.js
ifneq ($(JAKETS__DIR),$(CURRENT__DIR))
  LOCAL_JAKEFILE__JS=Jakefile.js
endif

jts_run_jake: jts_compile_jake
	$(JAKE) $(JAKE__PARAMS)

j-%: jts_compile_jake
	$(JAKE) $* $(JAKE__PARAMS)

#The following is auto generated to make sure local Jakefile.ts dependencies are captured properly
-include Jakefile.dep.mk

$(JAKE_TASKS):%: j-%

jts_setup: jts_compile_jake

jts_compile_jake: $(JAKETS_JAKEFILE__JS) $(LOCAL_JAKEFILE__JS)

#
###################################################################################################


###################################################################################################
# setup in jakets directory
#

$(LOCAL_JAKEFILE__JS): $(JAKE) $(TS_NODE) $(JAKETS_JAKEFILE__JS) $(wildcard package.json) $(filter-out Jakefile.dep.mk, $(MAKEFILE_LIST))
	$(JAKE) --jakefile $(JAKETS_JAKEFILE__JS) jts:setup $(JAKE__PARAMS)
	# $(TS_NODE) $(NODE_MODULES__DIR)/jake/bin/cli.js --jakefile Jakefile.ts jts:setup $(JAKE__PARAMS)

$(JAKETS_JAKEFILE__JS): $(JAKE) $(wildcard $(JAKETS__DIR)/*.ts $(JAKETS__DIR)/bootstrap/*.js)
	cd $(JAKETS__DIR) && \
	cp bootstrap/*.js .
	# $(JAKE) --jakefile $(JAKETS_JAKEFILE__JS) jts:setup $(JAKE__PARAMS)
	touch $@
	# echo ************** MAKE SURE YOU CALL make jts_update_bootstrap **************

jts_update_bootstrap: $(JAKETS_JAKEFILE__JS)
	$(JAKE) --jakefile $(JAKETS_JAKEFILE__JS) jts:setup $(JAKE__PARAMS)
	cp $(JAKETS__DIR)/*.js $(JAKETS__DIR)/bootstrap/

$(JAKE): $(NODE_MODULES__UPDATE_INDICATOR)
	if [ ! -f $@ ]; then $(NPM) install jake; fi
	@echo found jake @ `node -e "console.log(require.resolve('jake'))"`
	touch $@

$(TS_NODE): $(NODE_MODULES__UPDATE_INDICATOR)
	if [ ! -f $@ ]; then $(NPM) install ts-node; fi
	@echo found ts-node @ `node -e "console.log(require.resolve('ts-node'))"`
	touch $@

$(NODE_MODULES__UPDATE_INDICATOR): $(NODE_BIN__FILE)
	$(NPM) install
	touch $@

_jts_get_node: $(NODE_BIN__FILE)

$(NODE_BIN__FILE): $(NODE_DIST_LOCAL__FILE) $(CURRENT__DIR)/Makefile
	cd $(NODE__DIR) && \
	tar xvf $(NODE_DIST__NAME) --strip-components=1
	touch $@

$(NODE_DIST_LOCAL__FILE):
	mkdir -p $(NODE__DIR)
	wget --directory-prefix=$(NODE__DIR) $(NODE_DIST_REMOTE__FILE)
	touch $@

#
###################################################################################################



###################################################################################################
# Rules for debugging/validation
#

# Each makefile that wants to show the variables of the makefile can do the following
# Create a phony target that depends on the print-% where % is replaced by the name of variables
# Example:
.PHONY: show_vars
show_vars: $(patsubst %,print-%, \
          JAKETS__DIR \
          CURRENT__DIR \
          JAKETS_JAKEFILE__JS \
          LOCAL_JAKEFILE__JS \
          AUTOGEN_MODULES \
          UNAME \
          NULL \
          EXPECTED_NODE_VERSION \
          INSTALLED_NODE_VERSION \
          NODE__DIR \
          NODE_BIN__FILE \
          NODE_DIST__NAME \
          NODE_DIST_LOCAL__FILE \
          NODE_DIST_REMOTE__FILE \
          NODE \
          NPM \
          JAKE \
          PATH \
          )
	@echo --------------------------------------------------------------------------------^^^jakets^^^

print-%:
	$(info --------------------------------------------------------------------------------)
	$(info  $* = $($*))
#
###################################################################################################
endif
